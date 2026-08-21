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
  async createPost(postData) {
    const response = await api.post('/posts', postData)
    return response.data
  },

  // Update post
  async updatePost(id, postData) {
    const response = await api.put(`/posts/${id}`, postData)
    return response.data
  },

  // Delete post
  async deletePost(id) {
    const response = await api.delete(`/posts/${id}`)
    return response.data
  },

  // Like/unlike post
  async toggleLike(id) {
    const response = await api.post(`/posts/${id}/like`)
    return response.data
  },

  // Get posts by category
  async getPostsByCategory(category) {
    const response = await api.get(`/posts/category/${category}`)
    return response.data
  },

  // Search posts
  async searchPosts(query) {
    const response = await api.get('/posts/search', { params: { q: query } })
    return response.data
  }
}