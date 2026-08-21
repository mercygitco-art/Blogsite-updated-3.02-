import api from './client.js'

export const categoriesAPI = {
  // Get all categories
  async getCategories() {
    const response = await api.get('/categories')
    return response.data
  },

  // Get single category by ID
  async getCategory(id) {
    const response = await api.get(`/categories/${id}`)
    return response.data
  },

  // Create new category
  async createCategory(categoryData) {
    const response = await api.post('/categories', categoryData)
    return response.data
  },

  // Update category
  async updateCategory(id, categoryData) {
    const response = await api.put(`/categories/${id}`, categoryData)
    return response.data
  },

  // Delete category
  async deleteCategory(id) {
    const response = await api.delete(`/categories/${id}`)
    return response.data
  }
}