const mongoose = require('mongoose');
const dns = require('dns');

// Set DNS servers to resolve SRV queries properly on Windows
dns.setServers(['8.8.8.8', '8.8.4.4']); // Google DNS

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4  // Force IPv4
    };

    console.log('Attempting MongoDB connection...');
    await mongoose.connect(uri, opts);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    // Don't exit, allow server to run without DB for now
    console.log('Server running but MongoDB unavailable - will retry');
    throw error;
  }
};

module.exports = connectDB;
