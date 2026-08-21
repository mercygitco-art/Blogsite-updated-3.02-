<template>
  <div class="settings-container">
    <!-- Header -->
    <div class="settings-header">
      <h1>Account Settings</h1>
      <p>Manage your profile, preferences, and account security</p>
    </div>

    <!-- Settings Layout -->
    <div class="settings-layout">
      <!-- Sidebar Navigation -->
      <div class="settings-sidebar">
        <nav class="settings-nav">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="['nav-item', { active: activeTab === tab.id }]"
            @click="setActiveTab(tab.id)"
          >
            <i :class="tab.icon"></i>
            <span>{{ tab.name }}</span>
            <i v-if="tab.badge" class="nav-badge">{{ tab.badge }}</i>
          </button>
        </nav>

        <!-- User Summary -->
        <div class="user-summary" v-if="currentUser">
          <div class="user-avatar">
            <img 
              v-if="currentUser.avatar" 
              :src="currentUser.avatar" 
              :alt="currentUser.name"
              @error="handleAvatarError"
            >
            <div v-else class="avatar-fallback">
              {{ currentUser.name?.charAt(0)?.toUpperCase() || 'U' }}
            </div>
          </div>
          <div class="user-info">
            <h4>{{ currentUser.name || 'User' }}</h4>
            <p>{{ currentUser.email || 'No email provided' }}</p>
            <span class="user-role" :class="currentUser.role || 'user'">
              {{ (currentUser.role || 'user').toUpperCase() }}
            </span>
          </div>
          <div class="account-stats">
            <div class="stat-item">
              <span class="stat-number">{{ currentUser.postCount || 0 }}</span>
              <span class="stat-label">Posts</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ currentUser.followers || 0 }}</span>
              <span class="stat-label">Followers</span>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <button class="btn btn-outline btn-sm" @click="refreshData">
            <i class="fas fa-sync-alt"></i> Refresh Data
          </button>
          <button class="btn btn-outline btn-sm" @click="handleHelp">
            <i class="fas fa-question-circle"></i> Get Help
          </button>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="settings-content">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading settings...</p>
        </div>

        <!-- Profile Tab -->
        <div v-else class="tab-content">
          <ProfileSettings 
            :user="currentUser"
            @update-profile="handleProfileUpdate"
          />
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <transition name="slide-up">
      <div v-if="successMessage" class="success-message">
        <i class="fas fa-check-circle"></i>
        {{ successMessage }}
        <button class="close-btn" @click="successMessage = ''">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </transition>

    <!-- Error Message -->
    <transition name="slide-up">
      <div v-if="errorMessage" class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        {{ errorMessage }}
        <button class="close-btn" @click="errorMessage = ''">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import ProfileSettings from '../settings/ProfileSettings.vue'

const props = defineProps({
  currentUser: {
    type: Object,
    required: true,
    default: () => ({
      name: '',
      email: '',
      avatar: '',
      role: 'user',
      postCount: 0,
      followers: 0,
      preferences: {},
      security: {},
      billing: {}
    })
  }
})

const emit = defineEmits([
  'settings-updated',
  'logout',
  'refresh-data'
])

// State
const activeTab = ref('profile')
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Tabs configuration - Only profile tab remains
const tabs = [
  { id: 'profile', name: 'Profile', icon: 'fas fa-user' }
]

// Computed
const userStats = computed(() => {
  return {
    posts: props.currentUser.postCount || 0,
    followers: props.currentUser.followers || 0,
    following: props.currentUser.following || 0
  }
})

// Methods
const setActiveTab = (tabId) => {
  activeTab.value = tabId
  // Clear messages when switching tabs
  successMessage.value = ''
  errorMessage.value = ''
}

const handleProfileUpdate = async (profileData) => {
  loading.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    emit('settings-updated', { type: 'profile', data: profileData })
    showSuccess('Profile updated successfully!')
  } catch (error) {
    showError('Failed to update profile. Please try again.')
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loading.value = true
  emit('refresh-data')
  setTimeout(() => {
    loading.value = false
    showSuccess('Data refreshed successfully!')
  }, 1000)
}

const handleHelp = () => {
  showSuccess('Redirecting to help center...')
  // In a real app, this would open help documentation or contact support
}

const handleAvatarError = (event) => {
  console.warn('Avatar image failed to load, using fallback')
  event.target.style.display = 'none'
}

const showSuccess = (message) => {
  successMessage.value = message
  setTimeout(() => {
    if (successMessage.value === message) {
      successMessage.value = ''
    }
  }, 5000)
}

const showError = (message) => {
  errorMessage.value = message
  setTimeout(() => {
    if (errorMessage.value === message) {
      errorMessage.value = ''
    }
  }, 5000)
}

// Initialize component
onMounted(() => {
  console.log('Settings component mounted with user:', props.currentUser)
  
  // Set initial tab based on URL hash or default to profile
  const hash = window.location.hash.replace('#', '')
  if (hash && tabs.some(tab => tab.id === hash)) {
    activeTab.value = hash
  }
})

// Watch for URL hash changes
watch(() => window.location.hash, (newHash) => {
  const tabId = newHash.replace('#', '')
  if (tabId && tabs.some(tab => tab.id === tabId)) {
    activeTab.value = tabId
  }
})

// Update URL when tab changes
watch(activeTab, (newTab) => {
  window.history.replaceState(null, null, `#${newTab}`)
})
</script>

<style scoped>
.settings-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  background: #f8f9fa;
}

.settings-header {
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.settings-header h1 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 2.5rem;
  font-weight: 700;
}

.settings-header p {
  margin: 0;
  color: #6c757d;
  font-size: 1.1rem;
}

.settings-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  align-items: start;
}

/* Sidebar Styles */
.settings-sidebar {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  position: sticky;
  top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.settings-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: none;
  border: none;
  border-radius: 8px;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
  font-weight: 500;
  position: relative;
  text-align: left;
}

.nav-item:hover {
  background: #f8f9fa;
  color: #495057;
  transform: translateX(4px);
}

.nav-item.active {
  background: #007bff;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
}

.nav-item i:first-child {
  width: 20px;
  text-align: center;
  font-size: 0.9rem;
}

.nav-badge {
  position: absolute;
  right: 1rem;
  background: #ff6b6b;
  color: white;
  border-radius: 10px;
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
  font-weight: 600;
}

/* User Summary */
.user-summary {
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  text-align: center;
  color: white;
  margin-top: 1rem;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 1rem;
  border: 3px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.user-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.user-info p {
  margin: 0 0 0.5rem 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

.user-role {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.user-role.admin {
  background: #ffd700;
  color: #000;
}

.user-role.user {
  background: rgba(255, 255, 255, 0.3);
  color: white;
}

.account-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  opacity: 0.8;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.quick-actions .btn {
  justify-content: center;
  width: 100%;
}

/* Content Area */
.settings-content {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  min-height: 600px;
}

.tab-content {
  padding: 0;
  height: 100%;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-state p {
  margin: 0;
  font-size: 1rem;
}

/* Messages */
.success-message {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #27ae60;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 1000;
  max-width: 400px;
}

.error-message {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #e74c3c;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 1000;
  max-width: 400px;
}

.close-btn {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  margin-left: auto;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.close-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  line-height: 1;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-outline {
  background: transparent;
  color: #6c757d;
  border: 2px solid #dee2e6;
}

.btn-outline:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #adb5bd;
  color: #495057;
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .settings-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .settings-sidebar {
    position: static;
    order: 2;
  }
  
  .settings-content {
    order: 1;
  }
  
  .settings-nav {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
  
  .nav-item {
    white-space: nowrap;
    flex-shrink: 0;
  }
  
  .user-summary {
    margin-top: 0;
  }
}

@media (max-width: 768px) {
  .settings-container {
    padding: 1rem;
  }
  
  .settings-header h1 {
    font-size: 2rem;
  }
  
  .settings-header p {
    font-size: 1rem;
  }
  
  .settings-nav {
    gap: 0.25rem;
  }
  
  .nav-item {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
  
  .user-summary {
    padding: 1rem;
  }
  
  .user-avatar {
    width: 60px;
    height: 60px;
  }
  
  .avatar-fallback {
    font-size: 1.5rem;
  }
  
  .success-message,
  .error-message {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: none;
  }
}

@media (max-width: 480px) {
  .settings-header h1 {
    font-size: 1.75rem;
  }
  
  .account-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .stat-item {
    flex-direction: row;
    justify-content: space-between;
  }
  
  .quick-actions {
    flex-direction: row;
  }
  
  .quick-actions .btn {
    flex: 1;
  }
}
</style>