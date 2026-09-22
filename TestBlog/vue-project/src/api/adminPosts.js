import api from './client.js'

export const adminPostsAPI = {
  async getPosts(params = {}) {
    const response = await api.get('/admin/posts', { params })
    return response.data
  }
}
