const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const { authenticate } = require('../middleware/auth');

// GET /api/posts/:id/comments  (this router will be mounted at /api/posts)
router.get('/:id/comments', async (req, res) => {
  try {
    const postId = req.params.id;
    const comments = await Comment.find({ postId, status: 'approved' }).sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, comments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching comments', error: err.message });
  }
});

// POST /api/posts/:id/comments
router.post('/:id/comments', async (req, res) => {
  try {
    const postId = req.params.id;
    const { authorId, authorName, content } = req.body;
    if (!content) return res.status(400).json({ success: false, message: 'Content required' });
    const comment = new Comment({ postId, authorId, authorName: authorName || 'Guest', content, status: 'pending' });
    await comment.save();
    res.status(201).json({ success: true, comment });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding comment', error: err.message });
  }
});

// PUT /api/comments/:id (author or admin)
router.put('/comment/:id', authenticate, async (req, res) => {
  try {
    const c = await Comment.findById(req.params.id);
    if (!c) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (c.authorId && c.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
    c.content = req.body.content ?? c.content;
    c.status = req.body.status ?? c.status;
    await c.save();
    res.status(200).json({ success: true, comment: c });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating comment', error: err.message });
  }
});

// DELETE /api/comments/:id (author or admin)
router.delete('/comment/:id', authenticate, async (req, res) => {
  try {
    const c = await Comment.findById(req.params.id);
    if (!c) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (c.authorId && c.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
    await c.remove();
    res.status(200).json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting comment', error: err.message });
  }
});

module.exports = router;
