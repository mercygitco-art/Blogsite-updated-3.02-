import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

let csrfToken = null

api.interceptors.request.use(async (config) => {
  if (import.meta.env.PROD && !['get', 'head', 'options'].includes(config.method?.toLowerCase()) && !csrfToken) {
    const response = await api.get('/auth/csrf')
    csrfToken = response.data.token
  }
  if (csrfToken) config.headers['X-CSRF-Token'] = csrfToken
  return config
})

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('blogsphere_current_user')
    }
    return Promise.reject(error)
  }
)

export default api