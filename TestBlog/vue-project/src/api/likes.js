import api from './client.js'

export const likesAPI = {
  // Get likes for a post
  async getPostLikes(postId) {
    const response = await api.get(`/likes/post/${postId}`)
    return response.data
  },

  // Like/unlike a post
  async togglePostLike(postId) {
    const response = await api.post('/likes', { postId })
    return response.data
  },

  async isPostLiked(userId, postId) {
    const response = await api.get(`/likes/check/${userId}/${postId}`)
    return response.data
  },

  async unlikePost(userId, postId) {
    const response = await api.delete(`/likes/${userId}/${postId}`)
    return response.data
  }
}