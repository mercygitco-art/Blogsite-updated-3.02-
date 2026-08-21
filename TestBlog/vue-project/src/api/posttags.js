import api from './client.js'

export const postTagsAPI = {
  // Get tags for a post
  async getPostTags(postId) {
    const response = await api.get(`/posts/${postId}/tags`)
    return response.data
  },

  // Add tag to post
  async addTagToPost(postId, tagId) {
    const response = await api.post(`/posts/${postId}/tags`, { tagId })
    return response.data
  },

  // Remove tag from post
  async removeTagFromPost(postId, tagId) {
    const response = await api.delete(`/posts/${postId}/tags/${tagId}`)
    return response.data
  },

  // Update post tags (replace all)
  async updatePostTags(postId, tagIds) {
    const response = await api.put(`/posts/${postId}/tags`, { tagIds })
    return response.data
  }
}