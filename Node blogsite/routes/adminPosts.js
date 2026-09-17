const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { authenticate, requireAdmin } = require('../middleware/auth');
const slugify = require('slugify');
const sanitizeHtml = require('sanitize-html');

const cleanPostHtml = (content) => sanitizeHtml(content, {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ['src', 'alt', 'width', 'height']
  },
  allowedSchemes: ['http', 'https']
});

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

// POST /api/admin/posts
router.post('/', async (req, res) => {
  try {
    const body = req.body;
    if (!body.title || !body.content) return res.status(400).json({ success: false, message: 'Title and content required' });
    const post = new Post({
      title: body.title,
      excerpt: body.excerpt || (body.content || '').substring(0, 150),
      content: cleanPostHtml(body.content),
      categoryId: body.categoryId,
      image: body.image,
      authorId: req.user.id || undefined,
      authorName: req.user.name || 'Admin',
      status: body.status || 'draft',
      slug: body.slug || slugify(body.title, { lower: true, strict: true }),
      views: body.views || 0,
      featured: !!body.featured
    });
    await post.save();
    res.status(201).json({ success: true, post, message: 'Post created' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Create error', error: err.message });
  }
});

// PUT /api/admin/posts/:id
router.put('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const body = req.body;
    Object.assign(post, {
      title: body.title ?? post.title,
      excerpt: body.excerpt ?? post.excerpt,
      content: body.content === undefined ? post.content : cleanPostHtml(body.content),
      categoryId: body.categoryId ?? post.categoryId,
      image: body.image ?? post.image,
      status: body.status ?? post.status,
      slug: body.slug ?? post.slug,
      views: body.views ?? post.views,
      featured: body.featured ?? post.featured
    });
    await post.save();
    res.status(200).json({ success: true, post, message: 'Post updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update error', error: err.message });
  }
});

// DELETE /api/admin/posts/:id
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.status(200).json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Delete error', error: err.message });
  }
});

module.exports = router;
