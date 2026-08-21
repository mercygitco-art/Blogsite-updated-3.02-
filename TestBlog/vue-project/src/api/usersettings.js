import api from './client.js'

export const userSettingsAPI = {
  // Get user settings
  async getUserSettings(userId) {
    const response = await api.get(`/users/${userId}/settings`)
    return response.data
  },

  // Update user settings
  async updateUserSettings(userId, settingsData) {
    const response = await api.put(`/users/${userId}/settings`, settingsData)
    return response.data
  },

  // Get current user's settings (convenience method)
  async getMySettings() {
    const response = await api.get('/user/settings')
    return response.data
  },

  // Update current user's settings (convenience method)
  async updateMySettings(settingsData) {
    const response = await api.put('/user/settings', settingsData)
    return response.data
  }
}