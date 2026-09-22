const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Category = require('../models/Category');
const { authenticate, requireAdmin } = require('../middleware/auth');
const slugify = require('slugify');
const sanitizeHtml = require('sanitize-html');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const cleanPostHtml = (content) => sanitizeHtml(content, {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ['src', 'alt', 'width', 'height']
  },
  allowedSchemes: ['http', 'https']
});

const populatePost = (query) => query
  .populate('categoryId', 'name slug')
  .populate('authorId', 'name avatar');

// Authenticated users create drafts; admins may publish directly.
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }
    if (title.trim().length > 160 || content.length > 200000) {
      return res.status(400).json({ success: false, message: 'Post title or content is too long' });
    }

    const isAdmin = req.user.role === 'admin';
    const post = await Post.create({
      title: title.trim(),
      excerpt: req.body.excerpt || content.replace(/<[^>]*>/g, '').substring(0, 150),
      content: cleanPostHtml(content),
      categoryId: req.body.categoryId,
      image: req.body.image,
      authorId: req.user.id,
      authorName: req.user.name,
      status: isAdmin && ['draft', 'published', 'archived'].includes(req.body.status)
        ? req.body.status
        : 'draft',
      slug: req.body.slug || slugify(title, { lower: true, strict: true }),
      featured: isAdmin && Boolean(req.body.featured)
    });

    res.status(201).json({ success: true, post: await populatePost(Post.findById(post._id)), message: 'Post created' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Unable to create post', error: error.message });
  }
});

router.put('/:id', authenticate, async (req, res, next) => {
  if (req.user.role === 'admin') return next();

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (!post.authorId || post.authorId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only edit your own posts' });
    }

    const updates = {};
    for (const field of ['title', 'excerpt', 'categoryId', 'image']) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (req.body.content !== undefined) updates.content = cleanPostHtml(req.body.content);
    if (updates.title) updates.slug = slugify(updates.title, { lower: true, strict: true });
    updates.status = 'draft';

    const updated = await populatePost(Post.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }));
    res.json({ success: true, post: updated, message: 'Post updated and saved as draft' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Unable to update post', error: error.message });
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  if (req.user.role === 'admin') return next();

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (!post.authorId || post.authorId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only delete your own posts' });
    }
    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Unable to delete post', error: error.message });
  }
});

// Admin-only continuation for the PUT/DELETE routes above.
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const updates = {};
    for (const field of ['title', 'excerpt', 'categoryId', 'image', 'slug', 'featured']) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (req.body.content !== undefined) updates.content = cleanPostHtml(req.body.content);
    if (req.body.status !== undefined && ['draft', 'published', 'archived'].includes(req.body.status)) {
      updates.status = req.body.status;
    }
    const updated = await populatePost(Post.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }));
    res.json({ success: true, post: updated, message: 'Post updated' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Unable to update post', error: error.message });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
  res.json({ success: true, message: 'Post deleted' });
});

// GET /api/posts?page=&limit=&q=&tag=&category=
router.get('/', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const tag = req.query.tag;
    const category = req.query.category;

    const filter = { status: 'published' };
    if (q) filter.$or = [
      { title: { $regex: escapeRegex(q), $options: 'i' } },
      { excerpt: { $regex: escapeRegex(q), $options: 'i' } },
      { content: { $regex: escapeRegex(q), $options: 'i' } }
    ];
    if (tag) filter.tags = tag;
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category }).select('_id');

      if (!categoryDoc) {
        return res.status(200).json({ success: true, posts: [], total: 0, page });
      }

      filter.categoryId = categoryDoc._id;
    }

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
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (!q) return res.status(400).json({ success: false, message: 'Search query is required' });
    const search = escapeRegex(q);
    const filter = { $or: [
      { title: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } }
    ], status: 'published' };
    const posts = await Post.find(filter).populate('categoryId', 'name slug').populate('authorId', 'name').sort({ createdAt: -1 }).limit(20);
    res.status(200).json({ success: true, posts, total: posts.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Search error', error: error.message });
  }
});

// Get single post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await populatePost(Post.findOne({ _id: req.params.id, status: 'published' })).lean();
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.status(200).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching post', error: error.message });
  }
});

module.exports = router;
