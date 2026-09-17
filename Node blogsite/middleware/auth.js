const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getTokenFromHeader = (req) => {
  if (req.cookies?.auth_token) return req.cookies.auth_token;
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth) return null;
  const parts = auth.split(' ');
  if (parts.length === 2 && /^Bearer$/i.test(parts[0])) return parts[1];
  return null;
};

const authenticate = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // attach user minimal info
    req.user = decoded.user || decoded;
    // if token contains id and not full user, attempt to load user
    if (req.user && req.user.id && !req.user.role) {
      const u = await User.findById(req.user.id).select('-password');
      if (u) req.user = { id: u._id.toString(), name: u.name, email: u.email, role: u.role };
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token', error: err.message });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

module.exports = { authenticate, requireAdmin };
