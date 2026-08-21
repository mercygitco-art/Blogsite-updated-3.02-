const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// GET /api/posts?page=&limit=&q=&tag=&category=
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const q = req.query.q || '';
    const tag = req.query.tag;
    const category = req.query.category;

    const filter = { status: 'published' };
    if (q) filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { excerpt: { $regex: q, $options: 'i' } },
      { content: { $regex: q, $options: 'i' } }
    ];
    if (tag) filter.tags = tag;
    if (category) filter.category = category;

    const total = await Post.countDocuments(filter);
    const posts = await Post.find(filter)
      .populate('categoryId', 'name slug')
      .populate('authorId', 'name')
      .sort({ featured: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({ success: true, posts, total, page });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching posts', error: error.message });
  }
});

// GET /api/posts/search?q=
router.get('/search', async (req, res) => {
  try {
    const q = req.query.q || '';
    const filter = { $or: [
      { title: { $regex: q, $options: 'i' } },
      { excerpt: { $regex: q, $options: 'i' } },
      { content: { $regex: q, $options: 'i' } }
    ] };
    const posts = await Post.find(filter).populate('categoryId', 'name slug').populate('authorId', 'name').sort({ createdAt: -1 }).limit(20);
    res.status(200).json({ success: true, posts, total: posts.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Search error', error: error.message });
  }
});

// Get single post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).lean();
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.status(200).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching post', error: error.message });
  }
});

module.exports = router;
