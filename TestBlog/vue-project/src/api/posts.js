import api from './client.js'

export const postsAPI = {
  // Get all posts with optional filters
  async getPosts(params = {}) {
    const response = await api.get('/posts', { params })
    return response.data
  },

  // Get single post by ID
  async getPost(id) {
    const response = await api.get(`/posts/${id}`)
    return response.data
  },

  // Create new post
  async createPost(postData, isAdmin = false) {
    const response = await api.post(isAdmin ? '/admin/posts' : '/posts', postData)
    return response.data
  },

  // Update post
  async updatePost(id, postData, isAdmin = false) {
    const response = await api.put(`${isAdmin ? '/admin/posts' : '/posts'}/${id}`, postData)
    return response.data
  },

  // Delete post
  async deletePost(id, isAdmin = false) {
    const response = await api.delete(`${isAdmin ? '/admin/posts' : '/posts'}/${id}`)
    return response.data
  },

  // Search posts
  async searchPosts(query) {
    const response = await api.get('/posts/search', { params: { q: query } })
    return response.data
  }
}