import api from './client.js'

export const authAPI = {
  // Login user
  async login(credentials) {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  // Register user
  async register(userData) {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  // Logout user
  async logout() {
    const response = await api.post('/auth/logout')
    return response.data
  },

  // Get current user profile
  async getProfile() {
    const response = await api.get('/auth/profile')
    return response.data
  },

  // Update user profile
  async updateProfile(userData) {
    const response = await api.put('/auth/profile', userData)
    return response.data
  },

  // Change password
  async changePassword(passwordData) {
    const response = await api.put('/auth/change-password', passwordData)
    return response.data
  }
}