const mongoose = require('mongoose');

const postTagSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    tagId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tag', required: true }
  },
  { timestamps: true }
);

// Compound index to ensure unique post-tag pairs
postTagSchema.index({ postId: 1, tagId: 1 }, { unique: true });

module.exports = mongoose.model('PostTag', postTagSchema);