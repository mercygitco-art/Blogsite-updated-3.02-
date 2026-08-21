import api from './client.js'

export const tagsAPI = {
  // Get all tags
  async getTags(params = {}) {
    const response = await api.get('/tags', { params })
    return response.data
  },

  // Get single tag by ID
  async getTag(id) {
    const response = await api.get(`/tags/${id}`)
    return response.data
  },

  // Create new tag
  async createTag(tagData) {
    const response = await api.post('/tags', tagData)
    return response.data
  },

  // Update tag
  async updateTag(id, tagData) {
    const response = await api.put(`/tags/${id}`, tagData)
    return response.data
  },

  // Delete tag
  async deleteTag(id) {
    const response = await api.delete(`/tags/${id}`)
    return response.data
  },

  // Get popular tags
  async getPopularTags(limit = 10) {
    const response = await api.get('/tags/popular', { params: { limit } })
    return response.data
  }
}