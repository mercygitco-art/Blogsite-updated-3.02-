import api from './client.js'

export const savedPostsAPI = {
  // Get user's saved posts
  async getSavedPosts(userId) {
    const response = await api.get(`/users/${userId}/saved-posts`)
    return response.data
  },

  // Save a post
  async savePost(postId) {
    const response = await api.post(`/posts/${postId}/save`)
    return response.data
  },

  // Unsave a post
  async unsavePost(postId) {
    const response = await api.delete(`/posts/${postId}/save`)
    return response.data
  },

  // Check if post is saved by user
  async isPostSaved(postId) {
    const response = await api.get(`/posts/${postId}/saved`)
    return response.data
  }
}