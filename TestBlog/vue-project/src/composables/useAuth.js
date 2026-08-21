import { ref, computed } from 'vue'
import { authAPI } from '../api/index.js'

export function useAuth() {
    // State
    const currentUser = ref(null)
    const loginLoading = ref(false)
    const registerLoading = ref(false)
    const error = ref(null)
    const showLoginModal = ref(false)
    const showRegisterModal = ref(false)

    // Constants
    const STORAGE_KEYS = {
        USERS: 'blogsphere_users',
        CURRENT_USER: 'blogsphere_current_user'
    }

    // Initialize mock database from localStorage or create default users
    const initializeMockDatabase = () => {
        try {
            const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS)
            if (storedUsers) {
                return JSON.parse(storedUsers)
            }
            
            // Default users for demo
            const defaultUsers = [
                {
                    id: 1,
                    name: "Admin User",
                    email: "admin@blogsphere.com",
                    username: "admin",
                    password: "Admin123!",
                    role: "admin",
                    joinDate: "January 2022",
                    bio: "Platform administrator and content moderator",
                    website: "https://blogsphere.com",
                    location: "San Francisco, CA",
                    occupation: "Platform Administrator",
                    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
                    interests: ["technology", "business"],
                    newsletter: true,
                    createdAt: new Date('2022-01-01').toISOString()
                },
                {
                    id: 2,
                    name: "Jane Doe",
                    email: "janedoe@example.com",
                    username: "janedoe",
                    password: "JaneDoe123!",
                    role: "user",
                    joinDate: "March 2023",
                    bio: "Technology enthusiast and web developer passionate about sharing knowledge through blogging.",
                    website: "https://janedoe.dev",
                    location: "San Francisco, CA",
                    occupation: "Web Developer",
                    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
                    interests: ["technology", "lifestyle"],
                    newsletter: true,
                    createdAt: new Date('2023-03-15').toISOString()
                }
            ]
            
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers))
            return defaultUsers
        } catch (error) {
            console.error('Error initializing mock database:', error)
            return []
        }
    }

    // Get mock users
    const getMockUsers = () => {
        return initializeMockDatabase()
    }

    // Save mock users
    const saveMockUsers = (users) => {
        try {
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
            return true
        } catch (error) {
            console.error('Error saving users:', error)
            return false
        }
    }

    // Save current user to localStorage for persistence
    const saveCurrentUser = (user) => {
        try {
            if (user) {
                localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
            } else {
                localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
            }
        } catch (error) {
            console.error('Error saving current user:', error)
        }
    }

    // Load current user from localStorage on app start
    const loadCurrentUser = () => {
        try {
            const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
            if (storedUser) {
                currentUser.value = JSON.parse(storedUser)
            }
        } catch (error) {
            console.error('Error loading current user:', error)
            currentUser.value = null
        }
    }

    // Initialize on import
    loadCurrentUser()

    // Validation helpers
    const validateEmail = (email) => {
        if (!email || typeof email !== 'string') return false
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email.trim())
    }

    const validatePasswordStrength = (password) => {
        if (!password || typeof password !== 'string') {
            return {
                requirements: {
                    length: false,
                    lowercase: false,
                    uppercase: false,
                    number: false,
                    special: false
                },
                strength: 'very-weak',
                passed: 0
            }
        }

        const requirements = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*]/.test(password)
        }
        
        const passed = Object.values(requirements).filter(Boolean).length
        let strength = 'very-weak'
        
        if (passed >= 4) strength = 'strong'
        else if (passed >= 3) strength = 'medium'
        else if (passed >= 2) strength = 'weak'
        
        return { requirements, strength, passed }
    }

    const validateRegistration = (userData) => {
        if (!userData || typeof userData !== 'object') {
            throw new Error('Invalid user data.')
        }

        if (!userData.name?.trim()) {
            throw new Error('Full name is required.')
        }
        if (userData.name.trim().length < 2) {
            throw new Error('Name must be at least 2 characters long.')
        }
        if (!userData.email?.trim()) {
            throw new Error('Email address is required.')
        }
        if (!validateEmail(userData.email)) {
            throw new Error('Please enter a valid email address.')
        }
        if (!userData.password) {
            throw new Error('Password is required.')
        }
        
        const passwordValidation = validatePasswordStrength(userData.password)
        if (passwordValidation.passed < 3) {
            throw new Error('Password is too weak. Please include uppercase, lowercase letters and numbers.')
        }
        
        if (userData.username) {
            if (userData.username.length < 3) {
                throw new Error('Username must be at least 3 characters long.')
            }
            if (!/^[a-zA-Z0-9_]+$/.test(userData.username)) {
                throw new Error('Username can only contain letters, numbers, and underscores.')
            }
        }
    }

    // Check if email/username is available
    const checkEmailAvailability = async (email) => {
        if (!email || !validateEmail(email)) {
            return false
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                try {
                    const users = getMockUsers()
                    const isAvailable = !users.some(user => 
                        user.email.toLowerCase() === email.toLowerCase().trim()
                    )
                    resolve(isAvailable)
                } catch (error) {
                    console.error('Error checking email availability:', error)
                    resolve(false)
                }
            }, 800)
        })
    }

    const checkUsernameAvailability = async (username) => {
        if (!username || username.length < 3) {
            return false
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                try {
                    const users = getMockUsers()
                    const isAvailable = !users.some(user => 
                        user.username.toLowerCase() === username.toLowerCase().trim()
                    )
                    resolve(isAvailable)
                } catch (error) {
                    console.error('Error checking username availability:', error)
                    resolve(false)
                }
            }, 600)
        })
    }

    // Authentication methods
    const login = async (credentials) => {
        if (!credentials || typeof credentials !== 'object') {
            error.value = 'Invalid credentials provided.'
            return { success: false, error: error.value }
        }

        error.value = null
        loginLoading.value = true
        
        try {
            // Try API first
            const response = await authAPI.login(credentials)
            const { user, token } = response
            
            if (token) {
                localStorage.setItem('auth_token', token)
            }
            
            currentUser.value = user
            saveCurrentUser(user)
            
            hideModals()
            return { success: true, user }
        } catch (apiError) {
            console.warn('API login failed, falling back to mock:', apiError.message)
            
            // Fallback to mock authentication
            try {
                const result = await new Promise((resolve, reject) => {
                    setTimeout(() => {
                        try {
                            if (!credentials.email || !credentials.password) {
                                reject(new Error('Please enter both email and password.'))
                                return
                            }

                            if (!validateEmail(credentials.email)) {
                                reject(new Error('Please enter a valid email address.'))
                                return
                            }

                            const users = getMockUsers()
                            const user = users.find(u => 
                                u.email.toLowerCase() === credentials.email.toLowerCase().trim() && 
                                u.password === credentials.password
                            )

                            if (!user) {
                                reject(new Error('Invalid email or password.'))
                                return
                            }

                            // Create a copy without the password
                            const { password, ...userWithoutPassword } = user
                            resolve({ success: true, user: userWithoutPassword })
                        } catch (err) {
                            reject(err)
                        }
                    }, 1000)
                })
                
                currentUser.value = result.user
                saveCurrentUser(result.user)
                
                hideModals()
                return { success: true, user: result.user }
            } catch (mockError) {
                error.value = mockError.message
                return { success: false, error: mockError.message }
            }
        } finally {
            loginLoading.value = false
        }
    }

    const register = async (userData) => {
        if (!userData || typeof userData !== 'object') {
            error.value = 'Invalid user data provided.'
            return { success: false, error: error.value }
        }

        error.value = null
        registerLoading.value = true
        
        try {
            // Try API first
            const response = await authAPI.register(userData)
            const { user, token } = response
            
            if (token) {
                localStorage.setItem('auth_token', token)
            }
            
            currentUser.value = user
            saveCurrentUser(user)
            
            hideModals()
            return { success: true, user }
        } catch (apiError) {
            console.warn('API register failed, falling back to mock:', apiError.message)
            
            // Fallback to mock registration
            try {
                const result = await new Promise(async (resolve, reject) => {
                    setTimeout(async () => {
                        try {
                            // Validate input
                            validateRegistration(userData)

                            // Check if email already exists
                            const emailAvailable = await checkEmailAvailability(userData.email)
                            if (!emailAvailable) {
                                reject(new Error('Email address is already registered.'))
                                return
                            }

                            // Check username availability if provided
                            if (userData.username) {
                                const usernameAvailable = await checkUsernameAvailability(userData.username)
                                if (!usernameAvailable) {
                                    reject(new Error('Username is already taken.'))
                                    return
                                }
                            }

                            // Create new user
                            const newUser = {
                                id: Date.now(),
                                name: userData.name.trim(),
                                email: userData.email.trim().toLowerCase(),
                                username: userData.username?.trim() || userData.email.split('@')[0],
                                password: userData.password,
                                role: "user",
                                joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                                bio: userData.bio || "",
                                website: userData.website || "",
                                location: userData.location || "",
                                occupation: userData.occupation || "",
                                avatar: userData.avatar || "",
                                interests: userData.interests || [],
                                newsletter: userData.newsletter !== false,
                                createdAt: new Date().toISOString()
                            }

                            // Add to mock database
                            const users = getMockUsers()
                            users.push(newUser)
                            const saveSuccess = saveMockUsers(users)
                            
                            if (!saveSuccess) {
                                reject(new Error('Failed to save user data.'))
                                return
                            }

                            // Set as current user (without password)
                            const { password, ...userWithoutPassword } = newUser
                            currentUser.value = userWithoutPassword
                            saveCurrentUser(userWithoutPassword)
                            
                            resolve({ success: true, user: userWithoutPassword })
                        } catch (err) {
                            reject(err)
                        }
                    }, 1200)
                })
                
                currentUser.value = result.user
                saveCurrentUser(result.user)
                
                hideModals()
                return { success: true, user: result.user }
            } catch (mockError) {
                error.value = mockError.message
                return { success: false, error: mockError.message }
            }
        } finally {
            registerLoading.value = false
        }
    }

    const logout = async () => {
        try {
            await authAPI.logout()
        } catch (error) {
            console.warn('API logout failed:', error.message)
        }
        
        // Clear local state regardless of API success
        currentUser.value = null
        error.value = null
        localStorage.removeItem('auth_token')
        saveCurrentUser(null)
    }

    const updateProfile = async (profileData) => {
        if (!profileData || typeof profileData !== 'object') {
            return { success: false, error: 'Invalid profile data.' }
        }

        if (!currentUser.value) {
            return { success: false, error: 'No user is currently logged in.' }
        }

        try {
            const result = await new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        // Update user in mock database
                        const users = getMockUsers()
                        const userIndex = users.findIndex(u => u.id === currentUser.value.id)
                        
                        if (userIndex === -1) {
                            reject(new Error('User not found in database.'))
                            return
                        }

                        // Keep the password from existing user
                        const existingPassword = users[userIndex].password
                        
                        // Update user data (excluding password and critical fields)
                        const { password, id, role, createdAt, email, ...safeProfileData } = profileData
                        
                        users[userIndex] = {
                            ...users[userIndex],
                            ...safeProfileData,
                            password: existingPassword // Don't overwrite password
                        }
                        
                        const saveSuccess = saveMockUsers(users)
                        
                        if (!saveSuccess) {
                            reject(new Error('Failed to update user data.'))
                            return
                        }
                        
                        // Update current user (without password)
                        const { password: _, ...updatedUser } = users[userIndex]
                        currentUser.value = updatedUser
                        saveCurrentUser(updatedUser)
                        
                        resolve({ success: true, user: updatedUser })
                    } catch (err) {
                        reject(err)
                    }
                }, 800)
            })
            
            return { success: true, user: result.user, message: 'Profile updated successfully!' }
        } catch (err) {
            error.value = err.message
            return { success: false, error: err.message }
        }
    }

    const changePassword = async (currentPassword, newPassword) => {
        if (!currentUser.value) {
            return { success: false, error: 'No user is currently logged in.' }
        }

        if (!currentPassword || !newPassword) {
            return { success: false, error: 'Both current and new password are required.' }
        }

        try {
            const result = await new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        const users = getMockUsers()
                        const userIndex = users.findIndex(u => u.id === currentUser.value.id)
                        
                        if (userIndex === -1) {
                            reject(new Error('User not found.'))
                            return
                        }

                        // Verify current password
                        if (users[userIndex].password !== currentPassword) {
                            reject(new Error('Current password is incorrect.'))
                            return
                        }

                        // Validate new password
                        const passwordValidation = validatePasswordStrength(newPassword)
                        if (passwordValidation.passed < 3) {
                            reject(new Error('New password is too weak. Please include uppercase, lowercase letters and numbers.'))
                            return
                        }

                        // Update password
                        users[userIndex].password = newPassword
                        const saveSuccess = saveMockUsers(users)
                        
                        if (!saveSuccess) {
                            reject(new Error('Failed to update password.'))
                            return
                        }
                        
                        resolve({ success: true })
                    } catch (err) {
                        reject(err)
                    }
                }, 800)
            })
            
            return { success: true, message: 'Password changed successfully!' }
        } catch (err) {
            return { success: false, error: err.message }
        }
    }

    const socialLogin = async (provider) => {
        if (!provider || typeof provider !== 'string') {
            return { success: false, error: 'Invalid social provider.' }
        }

        loginLoading.value = true
        error.value = null

        try {
            const result = await new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        // Simulate social login - create a new user or find existing
                        const socialEmail = `user_${Date.now()}@${provider}.com`
                        const socialUsername = `${provider}user_${Date.now()}`
                        
                        const socialUser = {
                            id: Date.now(),
                            name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
                            email: socialEmail,
                            username: socialUsername,
                            role: "user",
                            joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                            bio: `Joined via ${provider} authentication`,
                            website: "",
                            location: "",
                            occupation: "",
                            avatar: "",
                            interests: [],
                            newsletter: false,
                            isSocialLogin: true,
                            createdAt: new Date().toISOString()
                        }

                        // Add to database
                        const users = getMockUsers()
                        users.push({ ...socialUser, password: 'social_login' })
                        const saveSuccess = saveMockUsers(users)

                        if (!saveSuccess) {
                            reject(new Error('Failed to save social login user.'))
                            return
                        }

                        // Set as current user
                        currentUser.value = socialUser
                        saveCurrentUser(socialUser)
                        
                        resolve({ success: true, user: socialUser })
                    } catch (err) {
                        reject(err)
                    }
                }, 1500)
            })
            
            hideModals()
            return { success: true, user: result.user }
        } catch (err) {
            error.value = `Social login with ${provider} failed. Please try again.`
            return { success: false, error: error.value }
        } finally {
            loginLoading.value = false
        }
    }

    // Utility methods
    const hideModals = () => {
        showLoginModal.value = false
        showRegisterModal.value = false
        error.value = null
    }

    const showLogin = () => {
        showRegisterModal.value = false
        showLoginModal.value = true
        error.value = null
    }

    const showRegister = () => {
        showLoginModal.value = false
        showRegisterModal.value = true
        error.value = null
    }

    const resetPassword = async (email) => {
        if (!email || !validateEmail(email)) {
            return { success: false, error: 'Please enter a valid email address.' }
        }

        // Simulate password reset (in real app, this would send an email)
        return new Promise((resolve) => {
            setTimeout(() => {
                try {
                    const users = getMockUsers()
                    const userExists = users.some(user => user.email.toLowerCase() === email.toLowerCase().trim())
                    resolve({ 
                        success: true, 
                        message: userExists 
                            ? 'Password reset instructions have been sent to your email.' 
                            : 'If an account with that email exists, reset instructions have been sent.'
                    })
                } catch (error) {
                    resolve({ 
                        success: true, 
                        message: 'If an account with that email exists, reset instructions have been sent.'
                    })
                }
            }, 1000)
        })
    }

    // Computed properties
    const isAuthenticated = computed(() => !!currentUser.value)
    const isAdmin = computed(() => currentUser.value?.role === 'admin')
    const userInitials = computed(() => {
        if (!currentUser.value?.name) return ''
        return currentUser.value.name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2)
    })

    const userDisplayName = computed(() => {
        return currentUser.value?.name || currentUser.value?.username || 'User'
    })

    return {
        // State
        currentUser: computed(() => currentUser.value),
        loginLoading: computed(() => loginLoading.value),
        registerLoading: computed(() => registerLoading.value),
        error: computed(() => error.value),
        showLoginModal: computed(() => showLoginModal.value),
        showRegisterModal: computed(() => showRegisterModal.value),
        
        // Computed
        isAuthenticated,
        isAdmin,
        userInitials,
        userDisplayName,
        
        // Methods
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
        hideModals,
        showLogin,
        showRegister
    }
}

// Export a singleton instance
export const authService = useAuth()