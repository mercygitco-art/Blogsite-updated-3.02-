const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorName: { type: String },
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
    // Comments use a separate moderation lifecycle from posts:
    // pending -> approved. Post statuses are draft/published/archived.
    status: { type: String, enum: ['approved', 'pending'], default: 'pending' },
    isEdited: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
