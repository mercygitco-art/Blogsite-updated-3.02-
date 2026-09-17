<template>
  <div id="app" :class="{ 'dark-mode': darkMode }">
    <Header 
      :current-category="currentCategory"
      :current-user="currentUser"
      :dark-mode="darkMode"
      @set-category="setCategory"
      @toggle-dark-mode="toggleDarkMode"
      @write-post="handleWritePost"
      @user-avatar-click="handleUserAvatarClick"
      @search="handleSearch"
      @show-login="showLogin"
      @show-register="showRegister"
      @profile-click="handleProfileClick"
      @settings-click="handleSettingsClick"
      @admin-click="handleAdminClick"
      @logout-click="handleLogoutClick"
      @view-all-posts="showAllPosts"
    />
    
    <main id="main-content">
      <Home 
        v-if="currentView === 'home'"
        :posts="filteredPosts"
        :current-category="currentCategory"
        @view-post="viewPost"
        @start-writing="startWriting"
        @toggle-like="toggleLike"
        @toggle-save="toggleSave"
      />
      
      <AllPosts 
        v-else-if="currentView === 'all-posts'"
        :posts="posts"
        @view-post="viewPost"
        @toggle-like="toggleLike"
        @toggle-save="toggleSave"
        @view-author="viewAuthorPosts"
        @go-home="showHomeView"
      />
      
      <BlogPost 
        v-else-if="currentView === 'post' && currentPost"
        :post="currentPost"
        :comments="postComments"
        :is-liked="isPostLiked"
        @toggle-like="toggleLike"
        @add-comment="addComment"
        @share-post="sharePost"
        @back-to-home="showHomeView"
      />
      
      <BlogEditor 
        v-else-if="currentView === 'editor'"
        :post="editingPost"
        @save-post="savePost"
        @cancel="showHomeView"
      />


      <Settings 
        v-else-if="currentView === 'settings'"
        :current-user="currentUser"
        @edit-profile="handleEditProfile"
        @settings-updated="handleSettingsUpdated"
        @logout="handleLogout"
      >
        <template #profile>
          <ProfileSettings :user="currentUser" @update-profile="updateProfile" />
        </template>
        <template #account>
          <AccountSettings :user="currentUser" @update-account="updateAccount" />
        </template>
      </Settings>

      <AdminPanel 
        v-else-if="currentView === 'admin' && currentUser && currentUser.role === 'admin'"
        @approve-post="approvePost"
        @reject-post="rejectPost"
        @edit-post="editPost"
        @delete-post="deletePost"
      />

      <!-- Loading State -->
      <div v-else-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i> Loading...
      </div>
    </main>
    
    <Footer 
      @social-click="handleSocialClick"
      @link-click="handleLinkClick"
      @toggle-save ="toggleSave"
    />
    
    <!-- Modals -->
    <LoginModal 
      v-if="showLoginModal"
      :loading="loginLoading"
      :initial-email="loginEmail"
      @login="handleLogin"
      @close="hideModals"
      @show-register="showRegister"
      @forgot-password="handleForgotPassword"
      @social-login="handleSocialLogin"
    />
    
    <RegisterModal 
      v-if="showRegisterModal"
      :loading="registerLoading"
      @register="handleRegister"
      @close="hideModals"
      @show-login="showLogin"
      @terms-click="handleTermsClick"
      @privacy-click="handlePrivacyClick"
      @social-register="handleSocialRegister"
    />
    
    <!-- Toast Container -->
    <ToastContainer 
      :toasts="toasts" 
      @close-toast="closeToast"
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import Header from './components/common/Header.vue'
import Footer from './components/common/Footer.vue'
import Home from './components/views/Home.vue'
import BlogPost from './components/views/BlogPost.vue'
import BlogEditor from './components/views/BlogEditor.vue'
import Settings from './components/views/Settings.vue'
import ProfileSettings from './components/settings/ProfileSettings.vue'
import AccountSettings from './components/settings/AccountSettings.vue'
import LoginModal from './components/modals/LoginModal.vue'
import RegisterModal from './components/modals/RegisterModal.vue'
import ToastContainer from './components/common/ToastContainer.vue'
import { useAuth } from './composables/useAuth'
import { usePosts } from './composables/usePosts'
import AdminPanel from './components/views/AdminPanel.vue'
import AllPosts from './components/views/AllPosts.vue'
import { useDarkMode } from './composables/useDarkMode'
import { useToast } from './composables/useToast'

export default {
  name: 'App',
  components: {
    Header,
    Footer,
    Home,
    BlogPost,
    BlogEditor,
    Settings,
    ProfileSettings,
    AccountSettings,
    LoginModal,
    RegisterModal,
    ToastContainer,
    AdminPanel,
    AllPosts
  },
  setup() {
    // Composables
    const { 
      currentUser, 
      login, 
      register, 
      logout,
      loginLoading, 
      registerLoading,
      showLoginModal,
      showRegisterModal,
      hideModals,
      showLogin,
      showRegister,
      socialLogin,
      updateProfile
    } = useAuth()
    
    const {
      posts,
      currentView,
      currentCategory,
      currentPost,
      editingPost,
      filteredPosts,
      postComments,
      isLiked,
      loading,
      error,
      notification,
      setCategory: setCategoryBase,
      showHomeView,
      showSettingsView,
      viewPost,
      writePost,
      savePost,
      editPost,
      deletePost,
      approvePost,
      rejectPost,
      toggleLike,
      addComment,
      sharePost,
      startWriting,
      clearNotification
    } = usePosts(currentUser)

    // Ensure Home button always sets view to home
    const setCategory = (categoryId) => {
      setCategoryBase(categoryId)
      if (categoryId === 'all') {
        currentView.value = 'home'
      }
    }
    
    const { darkMode, toggleDarkMode } = useDarkMode()
    const { toasts, showToast, closeToast } = useToast()

    // View management methods
    const showHome = () => {
      currentView.value = 'home'
    }

    const showSettings = () => {
      currentView.value = 'settings'
    }

    const showAllPosts = () => {
      currentView.value = 'all-posts'
    }

    // User avatar click handler - fixed
    const handleUserAvatarClick = () => {
      if (!currentUser.value) {
        showLogin()
        showToast('Please log in to access your profile', 'info')
        return
      }
      showSettings()
    }

    // Profile click handler from dropdown
    const handleProfileClick = () => {
      if (!currentUser.value) {
        showLogin()
        showToast('Please log in to access your profile', 'info')
        return
      }
      showSettings()
    }

    // Settings click handler from dropdown
    const handleSettingsClick = () => {
      if (!currentUser.value) {
        showLogin()
        showToast('Please log in to access settings', 'info')
        return
      }
      showSettings()
    }

    // Admin click handler
    const handleAdminClick = () => {
      if (!currentUser.value) {
        showLogin()
        showToast('Please log in to access admin panel', 'info')
        return
      }
      if (currentUser.value.role !== 'admin') {
        showToast('Access denied. Admin privileges required.', 'error')
        return
      }
      currentView.value = 'admin'
      showToast('Opening admin panel...', 'info')
    }

    // Logout handler
    const handleLogoutClick = () => {
      logout()
      showHome()
      showToast('Logged out successfully', 'success')
    }

    // Computed
    const isPostLiked = computed(() => {
      return currentPost.value ? isLiked(currentPost.value.id) : false
    })

    const loginEmail = computed(() => {
      return currentUser.value?.email || ''
    })

    // Methods
    const handleLogin = async (credentials) => {
      const result = await login(credentials)
      if (result.success) {
        showToast('Login successful!', 'success')
        showHome()
      } else {
        showToast(result.error, 'error')
      }
    }

    const handleRegister = async (userData) => {
      const result = await register(userData)
      if (result.success) {
        showToast('Registration successful!', 'success')
        showHome()
      } else {
        showToast(result.error, 'error')
      }
    }

    const handleSocialLogin = async (provider) => {
      const result = await socialLogin(provider)
      if (result.success) {
        showToast(`Signed in with ${provider}`, 'success')
        showHome()
      } else {
        showToast(result.error, 'error')
      }
    }

    const handleSocialRegister = async (provider) => {
      // For now, treat social register same as login
      await handleSocialLogin(provider)
    }

    const handleWritePost = () => {
      if (!currentUser.value) {
        showLogin()
        showToast('Please log in to write a post', 'info')
        return
      }
      if (writePost()) {
        showToast('Editor opened', 'success')
      }
    }

    const handleSavePost = async (postData) => {
      await savePost(postData)
      if (error.value) {
        showToast(error.value, 'error')
      } else if (notification.value) {
        showToast(notification.value, 'success')
        clearNotification()
      }
    }

    const handleSearch = (query) => {
      showToast(`Searching for: ${query}`, 'info')
      // Implement search functionality
    }

    const handleSocialClick = (platform) => {
      showToast(`Opening ${platform}...`, 'info')
    }

    const handleLinkClick = (link) => {
      showToast(`Navigating to ${link}...`, 'info')
    }

    const toggleSave = (postId) => {
      showToast('Post saved to favorites', 'success')
    }

    const handleForgotPassword = (email) => {
      showToast(`Password reset link sent to ${email}`, 'success')
    }

    const handleTermsClick = () => {
      showToast('Opening Terms of Service', 'info')
    }

    const handlePrivacyClick = () => {
      showToast('Opening Privacy Policy', 'info')
    }

    const handleEditProfile = () => {
      showToast('Edit profile clicked', 'info')
    }

    const handleSettingsUpdated = (section) => {
      showToast(`${section} settings updated!`, 'success')
    }

    const handleUpdateProfile = async (profileData) => {
      const result = await updateProfile(profileData)
      if (result.success) {
        showToast('Profile updated successfully!', 'success')
      } else {
        showToast(result.error, 'error')
      }
    }

    const handleUpdateAccount = (accountData) => {
      showToast('Account settings updated!', 'success')
    }

    const handleLogout = () => {
      logout()
      showHome()
      showToast('Logged out successfully', 'success')
    }

    const AccountSettings = {
      props: ['user'],
      emits: ['update-account'],
      template: `<div>
        <h2>Account Settings</h2>
        <!-- Account settings form goes here -->
        <button @click="$emit('update-account', { /* account data */ })">Update Account</button>
      </div>`
    }
    

    return {
      // Auth
      currentUser,
      loginLoading,
      registerLoading,
      showLoginModal,
      showRegisterModal,
      hideModals,
      showLogin,
      showRegister,
      loginEmail,
      
      // Posts
      posts,
      currentView,
      currentCategory,
      currentPost,
      editingPost,
      filteredPosts,
      postComments,
      isPostLiked,
      loading,
      setCategory,
      showHomeView: showHome,
      viewPost,
      handleWritePost,
      savePost: handleSavePost,
      editPost,
      deletePost,
      approvePost,
      rejectPost,
      toggleLike,
      toggleSave,
      addComment,
      sharePost,
      startWriting,
      
      // UI
      darkMode,
      toggleDarkMode,
      toasts,
      closeToast,
      showToast,
      handleSearch,
      handleSocialClick,
      handleLinkClick,
      handleForgotPassword,
      handleTermsClick,
      handlePrivacyClick,
      handleLogin,
      handleRegister,
      handleSocialLogin,
      handleSocialRegister,
      updateProfile: handleUpdateProfile,
      updateAccount: handleUpdateAccount,
      handleEditProfile,
      handleSettingsUpdated,
      handleLogout,
      
      // Header event handlers
      handleUserAvatarClick,
      handleProfileClick,
      handleSettingsClick,
      handleAdminClick,
      handleLogoutClick,
      showAllPosts
      
    }
  }
}
</script>

<style>
@import './styles/main.css';

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

#main-content {
  flex: 1;
}

/* Dark mode transitions */
#app.dark-mode {
  background: #1a1a1a;
  color: #f0f0f0;
}

/* Smooth page transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Loading states */
.loading {
  opacity: 0.7;
  pointer-events: none;
}

.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #666;
}

.loading-state i {
  margin-right: 0.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive main content */
@media (max-width: 768px) {
  #main-content {
    padding-top: 60px;
  }
}
</style>