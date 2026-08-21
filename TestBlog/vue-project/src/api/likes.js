import api from './client.js'

export const likesAPI = {
  // Get likes for a post
  async getPostLikes(postId) {
    const response = await api.get(`/posts/${postId}/likes`)
    return response.data
  },

  // Like/unlike a post
  async togglePostLike(postId) {
    const response = await api.post(`/posts/${postId}/like`)
    return response.data
  },

  // Like/unlike a comment
  async toggleCommentLike(commentId) {
    const response = await api.post(`/comments/${commentId}/like`)
    return response.data
  },

  // Get user's likes
  async getUserLikes(userId) {
    const response = await api.get(`/users/${userId}/likes`)
    return response.data
  }
}