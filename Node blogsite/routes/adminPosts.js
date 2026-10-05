const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validateRequest, adminPostSchema, adminPostUpdateSchema } = require('../middleware/validate');
const { buildErrorResponse, buildSuccessResponse } = require('../utils/http');
const { createPost, updatePost, cleanPostHtml } = require('../services/postService');

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

// GET /api/admin/posts
router.get('/', async (req, res) => {
  try {
    const status = ['draft', 'published', 'archived'].includes(req.query.status)
      ? req.query.status
      : undefined;
    const filter = status ? { status } : {};
    const posts = await Post.find(filter)
      .populate('categoryId', 'name slug')
      .populate('authorId', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, posts, total: posts.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to load admin posts' });
  }
});

// POST /api/admin/posts
router.post('/', validateRequest(adminPostSchema), async (req, res) => {
  try {
    const postQuery = await createPost({ user: req.user, body: req.body });
    const post = await postQuery;
    res.status(201).json(buildSuccessResponse({ post }, 'Post created', 201));
  } catch (err) {
    const status = err.statusCode || 400;
    res.status(status).json(buildErrorResponse(status === 400 ? 'Unable to create post' : err.message, status === 400 ? err.message : null, status));
  }
});

// PUT /api/admin/posts/:id
router.put('/:id', validateRequest(adminPostUpdateSchema), async (req, res) => {
  try {
    const updatedPost = await updatePost({ id: req.params.id, payload: req.body });
    res.status(200).json(buildSuccessResponse({ post: updatedPost }, 'Post updated', 200));
  } catch (err) {
    const status = err.statusCode || 400;
    res.status(status).json(buildErrorResponse(status === 400 ? 'Unable to update post' : err.message, status === 400 ? err.message : null, status));
  }
});

// DELETE /api/admin/posts/:id
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.status(200).json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Unable to delete post' });
  }
});

module.exports = router;