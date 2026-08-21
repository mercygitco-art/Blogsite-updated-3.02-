const mongoose = require('mongoose');

const postStatusHistorySchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    oldStatus: { type: String, enum: ['draft', 'published', 'archived'], required: true },
    newStatus: { type: String, enum: ['draft', 'published', 'archived'], required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PostStatusHistory', postStatusHistorySchema);