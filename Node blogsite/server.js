require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const { normalizeConfig } = require('./config/env');
const { authenticate, requireAdmin } = require('./middleware/auth');
const { issueCsrfToken, requireCsrf } = require('./middleware/csrf');
const { requestLogger, writeLog } = require('./middleware/logger');
const connectDB = require('./config/database');
const postRoutes = require('./routes/posts');
const authRoutes = require('./routes/auth');
const adminPostRoutes = require('./routes/adminPosts');
const commentsRoutes = require('./routes/comments');
const categoryRoutes = require('./routes/categories');
const tagRoutes = require('./routes/tags');
const likeRoutes = require('./routes/likes');
const savedPostRoutes = require('./routes/savedPosts');
const reactionRoutes = require('./routes/reactions');
const Category = require('./models/Category');

const config = normalizeConfig(process.env);
const app = express();
const PORT = config.PORT;

const startServer = async () => {
  try {
    await connectDB(config.MONGODB_URI);

    const result = await Category.updateOne(
      { slug: 'news' },
      {
        $setOnInsert: {
          name: 'News',
          slug: 'news',
          icon: 'fas fa-newspaper',
          description: 'Latest news and current events'
        }
      },
      { upsert: true }
    );
    writeLog('info', 'news_category_ready', { created: Boolean(result.upsertedCount) });
  } catch (err) {
    writeLog('error', 'database_connection_failed', { message: err.message });
    throw err;
  }
};

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Gzip compression
app.use(requestLogger);
const configuredOrigin = config.FRONTEND_URL;
app.use(cors({
  origin: (origin, callback) => {
    const developmentOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
    const allowed = config.isProduction
      ? origin === configuredOrigin
      : developmentOrigins.includes(origin) || !origin;
    callback(allowed ? null : new Error('Origin is not allowed by CORS'), allowed);
  },
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));
app.get('/api/auth/csrf', issueCsrfToken);
app.use('/api', requireCsrf);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Try again later.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/admin/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/upload', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many uploads. Try again later.' }
}));

// Multer config for file uploads
const uploadDirectory = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });
const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${extension}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'));
    }
    cb(null, true);
  }
});

// File upload endpoint
app.post('/api/upload', authenticate, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  res.json({ success: true, url: `/api/uploads/${req.file.filename}` });
});
app.get('/api/uploads/:filename', authenticate, (req, res) => {
  if (!/^[a-f0-9-]+\.(jpg|jpeg|png|webp|gif)$/i.test(req.params.filename)) {
    return res.status(400).json({ success: false, message: 'Invalid filename' });
  }
  res.sendFile(path.join(uploadDirectory, req.params.filename));
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const statusCode = dbStatus === 'connected' ? 200 : 503;

  res.status(statusCode).json({
    success: dbStatus === 'connected',
    message: dbStatus === 'connected' ? 'Server is running' : 'Database not ready',
    environment: config.NODE_ENV,
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/posts', postRoutes);
app.use('/api/posts', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many comment requests. Try again later.' }
}), commentsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin/posts', adminPostRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/saved-posts', savedPostRoutes);
app.use('/api/reactions', reactionRoutes);

// Global error handler
app.use((err, req, res, next) => {
  writeLog('error', 'unhandled_request_error', {
    requestId: req.requestId,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const startApp = async () => {
  try {
    await startServer();

    const server = app.listen(PORT, () => {
      writeLog('info', 'server_started', { port: PORT, environment: config.NODE_ENV });
    });

    const shutdown = async (signal) => {
      writeLog('info', 'server_shutdown_started', { signal });
      server.close(() => {
        writeLog('info', 'server_shutdown_complete', { signal });
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    writeLog('error', 'startup_failed', { message: error.message, stack: error.stack });
    process.exit(1);
  }
};

startApp();
