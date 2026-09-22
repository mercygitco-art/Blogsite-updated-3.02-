const express = require('express');
const router = express.Router();
const Like = require('../models/Like');
const SavedPost = require('../models/SavedPost');
const { authenticate } = require('../middleware/auth');

router.get('/me', authenticate, async (req, res) => {
  try {
    const [likes, savedPosts] = await Promise.all([
      Like.find({ userId: req.user.id }).select('postId').lean(),
      SavedPost.find({ userId: req.user.id }).select('postId').lean()
    ]);
    res.json({
      success: true,
      likedPostIds: likes.map(item => item.postId.toString()),
      savedPostIds: savedPosts.map(item => item.postId.toString())
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to load reaction state' });
  }
});

module.exports = router;
