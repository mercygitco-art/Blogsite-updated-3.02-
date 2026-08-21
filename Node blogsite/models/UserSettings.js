const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    newsletter: { type: Boolean, default: true },
    notifications: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserSettings', userSettingsSchema);