import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ref } from 'vue'

const mockShowToast = vi.fn()
const mockAuth = {
  currentUser: ref(null),
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  socialLogin: vi.fn(),
  updateProfile: vi.fn(),
  showLogin: vi.fn(),
  showRegister: vi.fn()
}

const mockPosts = {
  currentView: ref('home'),
  currentPost: ref(null),
  setCategory: vi.fn(),
  showHomeView: vi.fn(),
  writePost: vi.fn(() => true),
  setSearchQuery: vi.fn(),
  isLiked: vi.fn(() => false)
}

vi.mock('../useAuth', () => ({
  useAuth: () => mockAuth
}))

vi.mock('../usePosts', () => ({
  usePosts: () => mockPosts
}))

vi.mock('../useDarkMode', () => ({
  useDarkMode: () => ({ darkMode: ref(false), toggleDarkMode: vi.fn() })
}))

vi.mock('../useToast', () => ({
  useToast: () => ({
    toasts: ref([]),
    showToast: mockShowToast,
    closeToast: vi.fn()
  }),
  normalizeToastPayload: (message, type = 'info') => ({ message, type }),
  normalizeErrorState: (error, fallback = 'Something went wrong') => {
    if (error && typeof error === 'object' && error.message) {
      return { message: error.message, type: 'error' }
    }

    const message = typeof error === 'string' ? error : fallback
    return { message, type: 'error' }
  }
}))

const { useAppState } = await import('../useAppState')

describe('app state integration', () => {
  beforeEach(() => {
    mockShowToast.mockClear()
    mockAuth.login.mockReset()
    mockPosts.showHomeView.mockClear()
    mockPosts.setCategory.mockClear()
  })

  it('normalizes failed login errors into a consistent toast payload', async () => {
    mockAuth.login.mockResolvedValue({ success: false, error: 'Invalid credentials' })

    const app = useAppState()
    await app.handleLogin({ email: 'a@example.com', password: 'bad' })

    expect(mockShowToast).toHaveBeenCalledWith({ message: 'Invalid credentials', type: 'error' })
  })

  it('routes category resets back to the home view', () => {
    const app = useAppState()
    app.setCategory('all')

    expect(mockPosts.setCategory).toHaveBeenCalledWith('all')
    expect(mockPosts.showHomeView).toHaveBeenCalled()
  })
})
