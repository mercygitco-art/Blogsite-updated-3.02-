import { computed } from 'vue'
import { useAuth } from './useAuth'
import { usePosts } from './usePosts'
import { useDarkMode } from './useDarkMode'
import { useToast, normalizeToastPayload, normalizeErrorState } from './useToast'

export function getCategoryView(categoryId, currentView = 'home') {
  if (categoryId === 'all') {
    return 'home'
  }

  return currentView === 'home' ? 'home' : currentView
}

export function canAccessProtectedArea(user) {
  return Boolean(user)
}

export function useAppState() {
  const auth = useAuth()
  const posts = usePosts(auth.currentUser)
  const { darkMode, toggleDarkMode } = useDarkMode()
  const { toasts, showToast, closeToast } = useToast()

  const notify = (message, type = 'info') => {
    showToast(normalizeToastPayload(message, type))
  }

  const notifyError = (error, fallback = 'Something went wrong') => {
    const payload = normalizeErrorState(error, fallback)
    showToast(payload)
    return payload
  }

  const setCategory = (categoryId) => {
    posts.setCategory(categoryId)
    const nextView = getCategoryView(categoryId, posts.currentView.value)

    if (nextView === 'home') {
      posts.showHomeView()
    }
  }

  const showSettings = () => {
    if (!canAccessProtectedArea(auth.currentUser.value)) {
      auth.showLogin()
      notify('Please log in to access your profile', 'info')
      return
    }

    posts.currentView.value = 'settings'
  }

  const handleUserAvatarClick = () => {
    showSettings()
  }

  const handleProfileClick = () => {
    showSettings()
  }

  const handleSettingsClick = () => {
    showSettings()
  }

  const handleAdminClick = () => {
    if (!canAccessProtectedArea(auth.currentUser.value)) {
      auth.showLogin()
      notify('Please log in to access admin panel', 'info')
      return
    }

    if (auth.currentUser.value.role !== 'admin') {
      notifyError('Access denied. Admin privileges required.')
      return
    }

    posts.currentView.value = 'admin'
    notify('Opening admin panel...', 'info')
  }

  const handleLogoutClick = async () => {
    await auth.logout()
    posts.showHomeView()
    notify('Logged out successfully', 'success')
  }

  const handleLogin = async (credentials) => {
    const result = await auth.login(credentials)

    if (result.success) {
      notify('Login successful!', 'success')
      posts.showHomeView()
    } else {
      notifyError(result.error || 'Unable to sign in')
    }

    return result
  }

  const handleRegister = async (userData) => {
    const result = await auth.register(userData)

    if (result.success) {
      notify('Registration successful!', 'success')
      posts.showHomeView()
    } else {
      notifyError(result.error || 'Unable to create your account')
    }

    return result
  }

  const handleSocialLogin = async (provider) => {
    const result = await auth.socialLogin(provider)

    if (result.success) {
      notify(`Signed in with ${provider}`, 'success')
      posts.showHomeView()
    } else {
      notifyError(result.error || 'Unable to sign in with social provider')
    }

    return result
  }

  const handleSocialRegister = async (provider) => {
    return handleSocialLogin(provider)
  }

  const handleWritePost = () => {
    if (!canAccessProtectedArea(auth.currentUser.value)) {
      auth.showLogin()
      notify('Please log in to write a post', 'info')
      return
    }

    const opened = posts.writePost()
    if (opened) {
      notify('Editor opened', 'success')
    }
  }

  const handleSearch = (query) => {
    if (!query || !query.trim()) {
      notify('Enter a search term', 'info')
      return
    }

    posts.setSearchQuery(query)
    notify(`Searching for: ${query}`, 'info')
  }

  const handleSocialClick = (platform) => {
    notify(`Opening ${platform}...`, 'info')
  }

  const handleLinkClick = (link) => {
    notify(`Navigating to ${link}...`, 'info')
  }

  const handleForgotPassword = (email) => {
    notify(`Password reset link sent to ${email}`, 'success')
  }

  const handleTermsClick = () => {
    notify('Opening Terms of Service', 'info')
  }

  const handlePrivacyClick = () => {
    notify('Opening Privacy Policy', 'info')
  }

  const handleEditProfile = () => {
    notify('Edit profile clicked', 'info')
  }

  const handleSettingsUpdated = (section) => {
    notify(`${section} settings updated!`, 'success')
  }

  const handleUpdateProfile = async (profileData) => {
    const result = await auth.updateProfile(profileData)

    if (result.success) {
      notify('Profile updated successfully!', 'success')
    } else {
      notifyError(result.error || 'Unable to update your profile')
    }

    return result
  }

  const handleUpdateAccount = (accountData) => {
    notify('Account settings updated!', 'success')
    return accountData
  }

  const handleLogout = async () => {
    await auth.logout()
    posts.showHomeView()
    notify('Logged out successfully', 'success')
  }

  const showAllPosts = () => {
    posts.currentView.value = 'all-posts'
  }

  const loginEmail = computed(() => auth.currentUser.value?.email || '')
  const isPostLiked = computed(() => {
    return posts.currentPost.value ? posts.isLiked(posts.currentPost.value.id) : false
  })

  return {
    ...auth,
    ...posts,
    darkMode,
    toggleDarkMode,
    toasts,
    showToast,
    closeToast,
    setCategory,
    showSettings,
    handleUserAvatarClick,
    handleProfileClick,
    handleSettingsClick,
    handleAdminClick,
    handleLogoutClick,
    handleLogin,
    handleRegister,
    handleSocialLogin,
    handleSocialRegister,
    handleWritePost,
    handleSearch,
    handleSocialClick,
    handleLinkClick,
    handleForgotPassword,
    handleTermsClick,
    handlePrivacyClick,
    handleEditProfile,
    handleSettingsUpdated,
    handleUpdateProfile,
    handleUpdateAccount,
    handleLogout,
    showAllPosts,
    loginEmail,
    isPostLiked
  }
}
