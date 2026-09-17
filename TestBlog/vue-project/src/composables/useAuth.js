import { computed, ref } from 'vue'
import { authAPI } from '../api/index.js'

export function useAuth() {
    const currentUser = ref(null)
    const loginLoading = ref(false)
    const registerLoading = ref(false)
    const error = ref(null)
    const showLoginModal = ref(false)
    const showRegisterModal = ref(false)

    // Remove credentials written by the old mock-auth implementation.
    localStorage.removeItem('blogsphere_users')

    const saveCurrentUser = (user) => {
        if (user) {
            localStorage.setItem('blogsphere_current_user', JSON.stringify(user))
        } else {
            localStorage.removeItem('blogsphere_current_user')
        }
    }

    const loadCurrentUser = async () => {
        try {
            const response = await authAPI.getProfile()
            currentUser.value = response.user
            saveCurrentUser(response.user)
        } catch {
            currentUser.value = null
            saveCurrentUser(null)
        }
    }

    void loadCurrentUser()

    const completeAuth = (response) => {
        currentUser.value = response.user
        saveCurrentUser(response.user)
        showLoginModal.value = false
        showRegisterModal.value = false
        return { success: true, user: response.user }
    }

    const login = async (credentials) => {
        loginLoading.value = true
        error.value = null
        try {
            return completeAuth(await authAPI.login(credentials))
        } catch (requestError) {
            error.value = requestError.response?.data?.message || 'Unable to sign in. Please try again.'
            return { success: false, error: error.value }
        } finally {
            loginLoading.value = false
        }
    }

    const register = async (userData) => {
        registerLoading.value = true
        error.value = null
        try {
            return completeAuth(await authAPI.register(userData))
        } catch (requestError) {
            error.value = requestError.response?.data?.message || 'Unable to create your account. Please try again.'
            return { success: false, error: error.value }
        } finally {
            registerLoading.value = false
        }
    }

    const logout = async () => {
        try {
            await authAPI.logout()
        } finally {
            currentUser.value = null
            error.value = null
            saveCurrentUser(null)
        }
    }

    const updateProfile = async (profileData) => {
        try {
            return completeAuth(await authAPI.updateProfile(profileData))
        } catch (requestError) {
            const message = requestError.response?.data?.message || 'Unable to update your profile.'
            error.value = message
            return { success: false, error: message }
        }
    }

    const changePassword = async (currentPassword, newPassword) => {
        try {
            const response = await authAPI.changePassword({ currentPassword, newPassword })
            return { success: true, message: response.message }
        } catch (requestError) {
            return {
                success: false,
                error: requestError.response?.data?.message || 'Unable to change your password.'
            }
        }
    }

    const socialLogin = async () => ({
        success: false,
        error: 'Social login is not configured.'
    })

    const resetPassword = async () => ({
        success: false,
        error: 'Password reset is not configured.'
    })

    const checkEmailAvailability = async () => true
    const checkUsernameAvailability = async () => true
    const validatePasswordStrength = (password = '') => {
        const requirements = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*]/.test(password)
        }
        return {
            requirements,
            passed: Object.values(requirements).filter(Boolean).length
        }
    }

    return {
        currentUser: computed(() => currentUser.value),
        loginLoading: computed(() => loginLoading.value),
        registerLoading: computed(() => registerLoading.value),
        error: computed(() => error.value),
        showLoginModal: computed(() => showLoginModal.value),
        showRegisterModal: computed(() => showRegisterModal.value),
        isAuthenticated: computed(() => Boolean(currentUser.value)),
        isAdmin: computed(() => currentUser.value?.role === 'admin'),
        userInitials: computed(() => (currentUser.value?.name || 'U').split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()),
        userDisplayName: computed(() => currentUser.value?.name || 'User'),
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        socialLogin,
        checkEmailAvailability,
        checkUsernameAvailability,
        validatePasswordStrength,
        resetPassword,
        hideModals: () => {
            showLoginModal.value = false
            showRegisterModal.value = false
        },
        showLogin: () => {
            showRegisterModal.value = false
            showLoginModal.value = true
        },
        showRegister: () => {
            showLoginModal.value = false
            showRegisterModal.value = true
        }
    }
}

export const authService = useAuth()
