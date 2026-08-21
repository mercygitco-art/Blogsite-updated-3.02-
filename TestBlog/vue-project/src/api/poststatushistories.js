import api from './client.js'

export const postStatusHistoriesAPI = {
  // Get status history for a post
  async getPostStatusHistory(postId) {
    const response = await api.get(`/posts/${postId}/status-history`)
    return response.data
  },

  // Create new status history entry
  async createStatusHistory(postId, statusData) {
    const response = await api.post(`/posts/${postId}/status-history`, statusData)
    return response.data
  },

  // Get all status histories (admin)
  async getAllStatusHistories(params = {}) {
    const response = await api.get('/post-status-histories', { params })
    return response.data
  }
}