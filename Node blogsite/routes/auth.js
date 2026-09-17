const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Missing fields' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed });
    await user.save();
    const out = user.toObject(); delete out.password;
    res.status(201).json({ success: true, user: out });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Registration error', error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Missing fields' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = jwt.sign({ user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role } }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const out = user.toObject(); delete out.password;
    res.cookie('auth_token', token, sessionCookieOptions);
    res.status(200).json({ success: true, user: out });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login error', error: err.message });
  }
});

// POST /api/auth/admin/login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // If email provided, authenticate that user and ensure role admin
    if (email) {
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
      const match = await bcrypt.compare(password, user.password);
      if (!match || user.role !== 'admin') return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
      const token = jwt.sign({ user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role } }, process.env.JWT_SECRET, { expiresIn: '7d' });
      const out = user.toObject(); delete out.password;
      res.cookie('auth_token', token, sessionCookieOptions);
      return res.status(200).json({ success: true, user: out });
    }

    res.status(401).json({ success: false, message: 'Invalid admin credentials' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Admin login error', error: err.message });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('auth_token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
  res.json({ success: true });
});

router.get('/profile', authenticate, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user });
});

router.put('/profile', authenticate, async (req, res) => {
  const updates = {};
  for (const field of ['name', 'bio', 'website', 'avatar']) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true
  }).select('-password');

  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user });
});

router.put('/change-password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
  }

  const user = await User.findById(req.user.id);
  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect' });
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();
  res.json({ success: true, message: 'Password changed successfully' });
});

module.exports = router;
