const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { authenticate } = require('../middleware/auth');
const {
  validateRequest,
  registerSchema,
  loginSchema,
  adminLoginSchema,
  profileSchema,
  changePasswordSchema
} = require('../middleware/validate');
const { buildErrorResponse, buildSuccessResponse } = require('../utils/http');
const {
  registerUser,
  loginUser,
  adminLoginUser,
  getProfile,
  updateProfile,
  changePassword: changePasswordUser
} = require('../services/authService');

const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

// POST /api/auth/register
router.post('/register', validateRequest(registerSchema), async (req, res) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(buildSuccessResponse({ user: result.user }, 'User registered successfully', 201));
  } catch (err) {
    const status = err.statusCode || 500;
    const payload = buildErrorResponse(status === 500 ? 'Registration error' : err.message, status === 500 ? err.message : null, status);
    res.status(status).json(payload);
  }
});

// POST /api/auth/login
router.post('/login', validateRequest(loginSchema), async (req, res) => {
  try {
    const { user, token } = await loginUser(req.body);
    res.cookie('auth_token', token, sessionCookieOptions);
    res.status(200).json(buildSuccessResponse({ user }, 'Login successful', 200));
  } catch (err) {
    const status = err.statusCode || 500;
    const payload = buildErrorResponse(status === 500 ? 'Login error' : err.message, status === 500 ? err.message : null, status);
    res.status(status).json(payload);
  }
});

// POST /api/auth/admin/login
router.post('/admin/login', validateRequest(adminLoginSchema), async (req, res) => {
  try {
    const { user, token } = await adminLoginUser(req.body);
    res.cookie('auth_token', token, sessionCookieOptions);
    return res.status(200).json(buildSuccessResponse({ user }, 'Admin login successful', 200));
  } catch (err) {
    const status = err.statusCode || 500;
    const payload = buildErrorResponse(status === 500 ? 'Admin login error' : err.message, status === 500 ? err.message : null, status);
    res.status(status).json(payload);
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('auth_token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
  res.json({ success: true });
});

router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await getProfile(req.user.id);
    res.json(buildSuccessResponse({ user }, 'Profile loaded', 200));
  } catch (err) {
    const status = err.statusCode || 500;
    const payload = buildErrorResponse(status === 500 ? 'Unable to load profile' : err.message, status === 500 ? err.message : null, status);
    res.status(status).json(payload);
  }
});

router.put('/profile', authenticate, validateRequest(profileSchema), async (req, res) => {
  try {
    const updates = {};
    for (const field of ['name', 'bio', 'website', 'avatar']) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const user = await updateProfile(req.user.id, updates);
    res.json(buildSuccessResponse({ user }, 'Profile updated', 200));
  } catch (err) {
    const status = err.statusCode || 500;
    const payload = buildErrorResponse(status === 500 ? 'Unable to update profile' : err.message, status === 500 ? err.message : null, status);
    res.status(status).json(payload);
  }
});

router.put('/change-password', authenticate, validateRequest(changePasswordSchema), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await changePasswordUser(req.user.id, currentPassword, newPassword);
    res.json(buildSuccessResponse(result, result.message, 200));
  } catch (err) {
    const status = err.statusCode || 500;
    const payload = buildErrorResponse(status === 500 ? 'Unable to update password' : err.message, status === 500 ? err.message : null, status);
    res.status(status).json(payload);
  }
});

module.exports = router;