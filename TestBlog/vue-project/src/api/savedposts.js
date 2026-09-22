import api from './client.js'

export const savedPostsAPI = {
  // Get user's saved posts
  async getSavedPosts(userId) {
    const response = await api.get(`/saved-posts/user/${userId}`)
    return response.data
  },

  // Save a post
  async savePost(postId) {
    const response = await api.post('/saved-posts', { postId })
    return response.data
  },

  // Unsave a post
  async unsavePost(userId, postId) {
    const response = await api.delete(`/saved-posts/${userId}/${postId}`)
    return response.data
  },

  // Check if post is saved by user
  async isPostSaved(userId, postId) {
    const response = await api.get(`/saved-posts/check/${userId}/${postId}`)
    return response.data
  }
}