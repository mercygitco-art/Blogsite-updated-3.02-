const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const buildUserPayload = (user) => {
  const out = user.toObject ? user.toObject() : { ...user };
  delete out.password;
  return out;
};

const signToken = (user) => jwt.sign(
  {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    }
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

async function registerUser({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 400;
    throw err;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashed });
  await user.save();

  return {
    user: buildUserPayload(user),
    token: null
  };
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  return {
    user: buildUserPayload(user),
    token: signToken(user)
  };
}

async function adminLoginUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error('Invalid admin credentials');
    err.statusCode = 401;
    throw err;
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match || user.role !== 'admin') {
    const err = new Error('Invalid admin credentials');
    err.statusCode = 401;
    throw err;
  }

  return {
    user: buildUserPayload(user),
    token: signToken(user)
  };
}

async function getProfile(userId) {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
}

async function updateProfile(userId, updates) {
  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true
  }).select('-password');

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  return user;
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    const err = new Error('Current password is incorrect');
    err.statusCode = 401;
    throw err;
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  return { message: 'Password changed successfully' };
}

module.exports = {
  registerUser,
  loginUser,
  adminLoginUser,
  getProfile,
  updateProfile,
  changePassword
};
