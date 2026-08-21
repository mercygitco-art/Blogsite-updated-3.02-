import api from './client.js'

export const usersAPI = {
  // Get all users (admin)
  async getUsers(params = {}) {
    const response = await api.get('/users', { params })
    return response.data
  },

  // Get single user by ID
  async getUser(id) {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  // Update user (admin or self)
  async updateUser(id, userData) {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  },

  // Delete user (admin)
  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },

  // Get user's posts
  async getUserPosts(userId, params = {}) {
    const response = await api.get(`/users/${userId}/posts`, { params })
    return response.data
  },

  // Get user's comments
  async getUserComments(userId, params = {}) {
    const response = await api.get(`/users/${userId}/comments`, { params })
    return response.data
  }
}