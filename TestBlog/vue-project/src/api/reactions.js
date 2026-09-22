import api from './client.js'

export const reactionsAPI = {
  async getMine() {
    const response = await api.get('/reactions/me')
    return response.data
  }
}
