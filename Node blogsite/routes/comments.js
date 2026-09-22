const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const { authenticate } = require('../middleware/auth');
const sanitizeHtml = require('sanitize-html');

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
router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;
    if (!content || content.trim().length > 5000) {
      return res.status(400).json({ success: false, message: 'Comment must be between 1 and 5000 characters' });
    }
    const comment = new Comment({
      postId,
      authorId: req.user.id,
      authorName: req.user.name,
      content: sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} }),
      status: 'pending'
    });
    await comment.save();
    res.status(201).json({ success: true, comment });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding comment', error: err.message });
  }
});

// PUT /api/comments/:id (author or admin)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const c = await Comment.findById(req.params.id);
    if (!c) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (c.authorId && c.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
    if (req.body.content !== undefined) {
      c.content = sanitizeHtml(req.body.content, { allowedTags: [], allowedAttributes: {} });
    }
    if (req.user.role === 'admin' && req.body.status !== undefined) {
      c.status = req.body.status;
    }
    await c.save();
    res.status(200).json({ success: true, comment: c });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating comment', error: err.message });
  }
});

// DELETE /api/comments/:id (author or admin)
router.delete('/:id', authenticate, async (req, res) => {
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
