const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
    const token = jwt.sign({ user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role } }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    const out = user.toObject(); delete out.password;
    res.status(200).json({ success: true, token, user: out });
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
      const token = jwt.sign({ user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role } }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      const out = user.toObject(); delete out.password;
      return res.status(200).json({ success: true, token, user: out });
    }

    // If no email provided, allow ADMIN_PASSWORD env fallback
    const { password: pwd } = req.body;
    if (process.env.ADMIN_PASSWORD && pwd === process.env.ADMIN_PASSWORD) {
      const adminUser = { id: 'admin', name: 'Admin', email: '', role: 'admin' };
      const token = jwt.sign({ user: adminUser }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      return res.status(200).json({ success: true, token, user: adminUser });
    }

    res.status(401).json({ success: false, message: 'Invalid admin credentials' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Admin login error', error: err.message });
  }
});

module.exports = router;
