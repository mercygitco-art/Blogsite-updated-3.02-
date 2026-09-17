const express = require('express');
const router = express.Router();
const SavedPost = require('../models/SavedPost');
const { authenticate } = require('../middleware/auth');

// All saved post routes require authentication
router.use(authenticate);

// Get saved posts for a user
router.get('/user/:userId', async (req, res) => {
  try {
    if (req.params.userId !== req.user.id) return res.status(403).json({ message: 'Not allowed' });
    const savedPosts = await SavedPost.find({ userId: req.user.id }).populate('postId');
    res.json(savedPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if post is saved by user
router.get('/check/:userId/:postId', async (req, res) => {
  try {
    if (req.params.userId !== req.user.id) return res.status(403).json({ message: 'Not allowed' });
    const saved = await SavedPost.findOne({ userId: req.user.id, postId: req.params.postId });
    res.json({ saved: !!saved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Save a post
router.post('/', async (req, res) => {
  const savedPost = new SavedPost({
    userId: req.user.id,
    postId: req.body.postId
  });
  try {
    const newSavedPost = await savedPost.save();
    res.status(201).json(newSavedPost);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Already saved' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

// Unsave a post
router.delete('/:userId/:postId', async (req, res) => {
  try {
    if (req.params.userId !== req.user.id) return res.status(403).json({ message: 'Not allowed' });
    const savedPost = await SavedPost.findOneAndDelete({ userId: req.user.id, postId: req.params.postId });
    if (!savedPost) return res.status(404).json({ message: 'Saved post not found' });
    res.json({ message: 'Post unsaved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;