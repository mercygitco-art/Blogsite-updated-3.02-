const express = require('express');
const router = express.Router();
const Like = require('../models/Like');
const { authenticate } = require('../middleware/auth');

// All like routes require authentication
router.use(authenticate);

// Get likes for a post
router.get('/post/:postId', async (req, res) => {
  try {
    const likes = await Like.find({ postId: req.params.postId }).populate('userId', 'name');
    res.json(likes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if user liked a post
router.get('/check/:userId/:postId', async (req, res) => {
  try {
    const like = await Like.findOne({ userId: req.params.userId, postId: req.params.postId });
    res.json({ liked: !!like, type: like ? like.type : null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like a post
router.post('/', async (req, res) => {
  const like = new Like({
    userId: req.body.userId,
    postId: req.body.postId,
    type: req.body.type
  });
  try {
    const newLike = await like.save();
    res.status(201).json(newLike);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Already liked' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

// Update like type
router.put('/:id', async (req, res) => {
  try {
    const like = await Like.findByIdAndUpdate(req.params.id, { type: req.body.type }, { new: true });
    if (!like) return res.status(404).json({ message: 'Like not found' });
    res.json(like);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Unlike a post
router.delete('/:userId/:postId', async (req, res) => {
  try {
    const like = await Like.findOneAndDelete({ userId: req.params.userId, postId: req.params.postId });
    if (!like) return res.status(404).json({ message: 'Like not found' });
    res.json({ message: 'Like removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;