import api from './client.js'

export const commentsAPI = {
  // Get comments for a post
  async getComments(postId) {
    const response = await api.get(`/posts/${postId}/comments`)
    return response.data
  },

  // Create new comment
  async createComment(postId, commentData) {
    const response = await api.post(`/posts/${postId}/comments`, commentData)
    return response.data
  },

  // Update comment
  async updateComment(commentId, commentData) {
    const response = await api.put(`/comments/${commentId}`, commentData)
    return response.data
  },

  // Delete comment
  async deleteComment(commentId) {
    const response = await api.delete(`/comments/${commentId}`)
    return response.data
  },

  // Like/unlike comment
  async toggleLike(commentId) {
    const response = await api.post(`/comments/${commentId}/like`)
    return response.data
  }
}