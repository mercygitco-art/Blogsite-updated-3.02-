<template>
  <div class="account-settings">
    <!-- Settings Sections -->
    <div class="settings-sections">
      <!-- Preferences Section -->
      <div class="settings-section">
        <h3 class="section-title">
          <i class="fas fa-sliders-h"></i>
          Preferences
        </h3>

        <div class="preferences-grid">
          <div class="preference-item">
            <div class="preference-info">
              <label class="preference-label">Email Notifications</label>
              <p class="preference-description">Receive email updates about your account activity</p>
            </div>
            <label class="toggle-switch">
              <input
                v-model="preferences.emailNotifications"
                type="checkbox"
                @change="savePreferences"
              >
              <span class="slider"></span>
            </label>
          </div>

          <div class="preference-item">
            <div class="preference-info">
              <label class="preference-label">Push Notifications</label>
              <p class="preference-description">Get notified about new features and updates</p>
            </div>
            <label class="toggle-switch">
              <input
                v-model="preferences.pushNotifications"
                type="checkbox"
                @change="savePreferences"
              >
              <span class="slider"></span>
            </label>
          </div>

          <div class="preference-item">
            <div class="preference-info">
              <label class="preference-label">Marketing Emails</label>
              <p class="preference-description">Receive promotional emails and special offers</p>
            </div>
            <label class="toggle-switch">
              <input
                v-model="preferences.marketingEmails"
                type="checkbox"
                @change="savePreferences"
              >
              <span class="slider"></span>
            </label>
          </div>

          <div class="preference-item">
            <div class="preference-info">
              <label class="preference-label">Public Profile</label>
              <p class="preference-description">Allow others to view your profile</p>
            </div>
            <label class="toggle-switch">
              <input
                v-model="preferences.publicProfile"
                type="checkbox"
                @change="savePreferences"
              >
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Security Section -->
      <div class="settings-section">
        <h3 class="section-title">
          <i class="fas fa-shield-alt"></i>
          Security
        </h3>

        <div class="security-actions">
          <div class="security-item">
            <div class="security-info">
              <h4>Two-Factor Authentication</h4>
              <p>Add an extra layer of security to your account</p>
              <span class="security-status" :class="security.twoFactorEnabled ? 'enabled' : 'disabled'">
                {{ security.twoFactorEnabled ? 'Enabled' : 'Disabled' }}
              </span>
            </div>
            <button
              class="btn btn-outline"
              @click="toggleTwoFactor"
            >
              {{ security.twoFactorEnabled ? 'Disable' : 'Enable' }} 2FA
            </button>
          </div>

          <div class="security-item">
            <div class="security-info">
              <h4>Change Password</h4>
              <p>Update your password regularly to keep your account secure</p>
              <div v-if="passwordLastChanged" class="password-info">
                Last changed: {{ formatDate(passwordLastChanged) }}
              </div>
            </div>
            <button
              class="btn btn-primary"
              @click="showChangePassword = true"
            >
              Change Password
            </button>
          </div>

          <div class="security-item">
            <div class="security-info">
              <h4>Active Sessions</h4>
              <p>Manage your active login sessions across devices</p>
              <span class="session-count">{{ activeSessions.length }} active session(s)</span>
            </div>
            <button
              class="btn btn-outline"
              @click="showSessionsModal = true"
            >
              View Sessions
            </button>
          </div>
        </div>
      </div>

      <!-- Privacy Section -->
      <div class="settings-section">
        <h3 class="section-title">
          <i class="fas fa-user-secret"></i>
          Privacy
        </h3>

        <div class="privacy-actions">
          <div class="privacy-item">
            <div class="privacy-info">
              <h4>Data Export</h4>
              <p>Download a copy of all your personal data</p>
            </div>
            <button
              class="btn btn-outline"
              @click="exportData"
              :disabled="exportingData"
            >
              <i v-if="exportingData" class="fas fa-spinner fa-spin"></i>
              {{ exportingData ? 'Exporting...' : 'Export Data' }}
            </button>
          </div>

          <div class="privacy-item">
            <div class="privacy-info">
              <h4>Clear Search History</h4>
              <p>Remove all your search queries and history</p>
            </div>
            <button
              class="btn btn-outline"
              @click="clearSearchHistory"
            >
              Clear History
            </button>
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="settings-section danger-zone">
        <h3 class="section-title">
          <i class="fas fa-exclamation-triangle"></i>
          Danger Zone
        </h3>

        <div class="danger-actions">
          <div class="danger-item">
            <div class="danger-info">
              <h4>Deactivate Account</h4>
              <p>Temporarily disable your account. You can reactivate it anytime by logging in.</p>
            </div>
            <button
              class="btn btn-warning"
              @click="showDeactivateConfirmation = true"
            >
              Deactivate Account
            </button>
          </div>

          <div class="danger-item">
            <div class="danger-info">
              <h4>Delete Account</h4>
              <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
            </div>
            <button
              class="btn btn-danger"
              @click="showDeleteConfirmation = true"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="success-message">
      <i class="fas fa-check-circle"></i>
      {{ successMessage }}
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      {{ errorMessage }}
    </div>

    <!-- Change Password Modal -->
    <div v-if="showChangePassword" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Change Password</h3>
          <button class="modal-close" @click="closeChangePasswordModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="changePassword">
            <div class="form-group">
              <label for="currentPassword">Current Password *</label>
              <div class="password-input">
                <input
                  id="currentPassword"
                  v-model="password.current"
                  :type="showCurrentPassword ? 'text' : 'password'"
                  placeholder="Enter your current password"
                  :class="{ 'error': fieldErrors.currentPassword }"
                  @blur="validateField('currentPassword')"
                >
                <button
                  type="button"
                  class="password-toggle"
                  @click="showCurrentPassword = !showCurrentPassword"
                  :aria-label="showCurrentPassword ? 'Hide password' : 'Show password'"
                >
                  <i :class="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <div v-if="fieldErrors.currentPassword" class="error-message">
                {{ fieldErrors.currentPassword }}
              </div>
            </div>

            <div class="form-group">
              <label for="newPassword">New Password *</label>
              <div class="password-input">
                <input
                  id="newPassword"
                  v-model="password.new"
                  :type="showNewPassword ? 'text' : 'password'"
                  placeholder="Enter your new password"
                  :class="{ 'error': fieldErrors.newPassword }"
                  @blur="validateField('newPassword')"
                  @input="checkPasswordStrength"
                >
                <button
                  type="button"
                  class="password-toggle"
                  @click="showNewPassword = !showNewPassword"
                  :aria-label="showNewPassword ? 'Hide password' : 'Show password'"
                >
                  <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <div v-if="passwordStrength" class="password-strength">
                <div class="strength-meter">
                  <div
                    class="strength-bar"
                    :class="passwordStrength.scoreClass"
                  ></div>
                </div>
                <span class="strength-text">{{ passwordStrength.text }}</span>
              </div>
              <div v-if="fieldErrors.newPassword" class="error-message">
                {{ fieldErrors.newPassword }}
              </div>
              <div class="form-hint">
                Password must be at least 8 characters long and include uppercase, lowercase, numbers, and symbols
              </div>
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirm New Password *</label>
              <div class="password-input">
                <input
                  id="confirmPassword"
                  v-model="password.confirm"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Confirm your new password"
                  :class="{ 'error': fieldErrors.confirmPassword }"
                  @blur="validateField('confirmPassword')"
                >
                <button
                  type="button"
                  class="password-toggle"
                  @click="showConfirmPassword = !showConfirmPassword"
                  :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
                >
                  <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <div v-if="fieldErrors.confirmPassword" class="error-message">
                {{ fieldErrors.confirmPassword }}
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="closeChangePasswordModal">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="!isPasswordValid || changingPassword">
                <i v-if="changingPassword" class="fas fa-spinner fa-spin"></i>
                {{ changingPassword ? 'Changing...' : 'Change Password' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Sessions Modal -->
    <div v-if="showSessionsModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Active Sessions</h3>
          <button class="modal-close" @click="showSessionsModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="sessions-list">
            <div v-for="session in activeSessions" :key="session.id" class="session-item">
              <div class="session-info">
                <div class="session-device">
                  <i :class="getDeviceIcon(session.device)"></i>
                  <div>
                    <strong>{{ session.device }}</strong>
                    <span class="session-location">{{ session.location }}</span>
                  </div>
                </div>
                <div class="session-meta">
                  <span class="session-time">Last active: {{ formatTime(session.lastActive) }}</span>
                  <span v-if="session.current" class="current-session">Current Session</span>
                </div>
              </div>
              <button
                v-if="!session.current"
                class="btn btn-danger btn-sm"
                @click="terminateSession(session.id)"
              >
                Terminate
              </button>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="terminateAllSessions">
            Terminate All Other Sessions
          </button>
        </div>
      </div>
    </div>

    <!-- Deactivate Account Modal -->
    <div v-if="showDeactivateConfirmation" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Deactivate Account</h3>
          <button class="modal-close" @click="showDeactivateConfirmation = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to deactivate your account?</p>
          <ul>
            <li>Your profile will be hidden from other users</li>
            <li>You won't receive any notifications</li>
            <li>You can reactivate anytime by logging in</li>
            <li>Your data will be preserved</li>
          </ul>
          <p>To confirm, please type your password:</p>
          <input
            v-model="deactivateConfirmationPassword"
            type="password"
            placeholder="Enter your password"
            class="form-control"
          >
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showDeactivateConfirmation = false">
            Cancel
          </button>
          <button
            class="btn btn-warning"
            @click="deactivateAccount"
            :disabled="!deactivateConfirmationPassword || deactivatingAccount"
          >
            <i v-if="deactivatingAccount" class="fas fa-spinner fa-spin"></i>
            {{ deactivatingAccount ? 'Deactivating...' : 'Deactivate Account' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Account Modal -->
    <div v-if="showDeleteConfirmation" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Delete Account</h3>
          <button class="modal-close" @click="showDeleteConfirmation = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p class="warning-text">
            <i class="fas fa-exclamation-triangle"></i>
            This action cannot be undone!
          </p>
          <p>Are you sure you want to delete your account? This will:</p>
          <ul>
            <li>Permanently delete all your data</li>
            <li>Remove all your posts and comments</li>
            <li>Cancel any active subscriptions</li>
            <li>Delete your profile information</li>
          </ul>
          <p>To confirm, please type <strong>DELETE MY ACCOUNT</strong> below:</p>
          <input
            v-model="deleteConfirmationText"
            type="text"
            placeholder="Type DELETE MY ACCOUNT to confirm"
            class="form-control"
          >
          <p class="confirmation-hint">You must type exactly: DELETE MY ACCOUNT</p>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showDeleteConfirmation = false">
            Cancel
          </button>
          <button
            class="btn btn-danger"
            @click="deleteAccount"
            :disabled="!isDeleteConfirmed || deletingAccount"
          >
            <i v-if="deletingAccount" class="fas fa-spinner fa-spin"></i>
            {{ deletingAccount ? 'Deleting...' : 'Permanently Delete Account' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

const emit = defineEmits(['update-account'])

// State
const preferences = ref({
  emailNotifications: true,
  pushNotifications: true,
  marketingEmails: false,
  publicProfile: true
})

const security = ref({
  twoFactorEnabled: false,
  loginAlerts: true
})

const activeSessions = ref([])
const passwordLastChanged = ref(null)

// UI State
const showChangePassword = ref(false)
const showSessionsModal = ref(false)
const showDeactivateConfirmation = ref(false)
const showDeleteConfirmation = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const exportingData = ref(false)
const deactivatingAccount = ref(false)
const deletingAccount = ref(false)
const changingPassword = ref(false)

// Password visibility
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Form data
const password = ref({
  current: '',
  new: '',
  confirm: ''
})

const deactivateConfirmationPassword = ref('')
const deleteConfirmationText = ref('')

// Validation
const fieldErrors = ref({})
const passwordStrength = ref(null)

// Computed properties
const isPasswordValid = computed(() => {
  return password.value.current &&
         password.value.new &&
         password.value.confirm &&
         password.value.new === password.value.confirm &&
         passwordStrength.value?.score >= 3
})

const isDeleteConfirmed = computed(() => {
  return deleteConfirmationText.value === 'DELETE MY ACCOUNT'
})

// Methods
const initializeData = () => {
  console.log('Initializing AccountSettings with user:', props.user)
  
  if (props.user.preferences) {
    preferences.value = { ...preferences.value, ...props.user.preferences }
  }
  
  if (props.user.security) {
    security.value = { ...security.value, ...props.user.security }
  }
  
  if (props.user.passwordLastChanged) {
    passwordLastChanged.value = props.user.passwordLastChanged
  } else {
    passwordLastChanged.value = new Date()
  }
  
  loadActiveSessions()
}

const loadActiveSessions = () => {
  // Mock data - replace with actual API call
  activeSessions.value = [
    {
      id: '1',
      device: 'Chrome on Windows',
      location: 'New York, US',
      lastActive: new Date(),
      current: true,
      ip: '192.168.1.1'
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      location: 'San Francisco, US',
      lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      current: false,
      ip: '192.168.1.2'
    },
    {
      id: '3',
      device: 'Firefox on Mac',
      location: 'London, UK',
      lastActive: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      current: false,
      ip: '192.168.1.3'
    }
  ]
}

const savePreferences = async () => {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    emit('update-account', { 
      type: 'preferences',
      data: preferences.value 
    })
    showSuccess('Preferences updated successfully!')
  } catch (error) {
    showError('Failed to update preferences')
  }
}

const toggleTwoFactor = async () => {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    security.value.twoFactorEnabled = !security.value.twoFactorEnabled
    emit('update-account', { 
      type: 'security',
      data: security.value 
    })
    showSuccess(`Two-factor authentication ${security.value.twoFactorEnabled ? 'enabled' : 'disabled'}`)
  } catch (error) {
    showError('Failed to update security settings')
  }
}

const changePassword = async () => {
  if (!isPasswordValid.value) return
  
  changingPassword.value = true
  try {
    // Validate fields
    validateField('currentPassword')
    validateField('newPassword')
    validateField('confirmPassword')
    
    if (Object.keys(fieldErrors.value).length > 0) {
      throw new Error('Please fix the validation errors')
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Update last changed date
    passwordLastChanged.value = new Date()
    
    showSuccess('Password changed successfully!')
    closeChangePasswordModal()
    
    // Reset form
    password.value = { current: '', new: '', confirm: '' }
    passwordStrength.value = null
    
    emit('update-account', { 
      type: 'password',
      data: { lastChanged: passwordLastChanged.value }
    })
    
  } catch (error) {
    showError(error.message || 'Failed to change password')
  } finally {
    changingPassword.value = false
  }
}

const closeChangePasswordModal = () => {
  showChangePassword.value = false
  password.value = { current: '', new: '', confirm: '' }
  fieldErrors.value = {}
  passwordStrength.value = null
}

const validateField = (field) => {
  const errors = {}
  
  switch (field) {
    case 'currentPassword':
      if (!password.value.current) {
        errors.currentPassword = 'Current password is required'
      } else if (password.value.current.length < 6) {
        errors.currentPassword = 'Password is too short'
      }
      break
      
    case 'newPassword':
      if (!password.value.new) {
        errors.newPassword = 'New password is required'
      } else if (password.value.new.length < 8) {
        errors.newPassword = 'Password must be at least 8 characters long'
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password.value.new)) {
        errors.newPassword = 'Password must include uppercase, lowercase, numbers, and symbols'
      }
      break
      
    case 'confirmPassword':
      if (password.value.new !== password.value.confirm) {
        errors.confirmPassword = 'Passwords do not match'
      }
      break
  }
  
  fieldErrors.value = { ...fieldErrors.value, ...errors }
}

const checkPasswordStrength = () => {
  const pass = password.value.new
  if (!pass) {
    passwordStrength.value = null
    return
  }

  let score = 0
  let text = 'Very Weak'
  let scoreClass = 'very-weak'

  // Length check
  if (pass.length >= 8) score++
  if (pass.length >= 12) score++

  // Complexity checks
  if (/[a-z]/.test(pass)) score++
  if (/[A-Z]/.test(pass)) score++
  if (/[0-9]/.test(pass)) score++
  if (/[^a-zA-Z0-9]/.test(pass)) score++

  // Determine strength
  if (score >= 5) {
    text = 'Very Strong'
    scoreClass = 'very-strong'
  } else if (score >= 4) {
    text = 'Strong'
    scoreClass = 'strong'
  } else if (score >= 3) {
    text = 'Good'
    scoreClass = 'good'
  } else if (score >= 2) {
    text = 'Weak'
    scoreClass = 'weak'
  }

  passwordStrength.value = { score, text, scoreClass }
}

const terminateSession = async (sessionId) => {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    activeSessions.value = activeSessions.value.filter(s => s.id !== sessionId)
    showSuccess('Session terminated successfully')
  } catch (error) {
    showError('Failed to terminate session')
  }
}

const terminateAllSessions = async () => {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    activeSessions.value = activeSessions.value.filter(s => s.current)
    showSuccess('All other sessions terminated')
    showSessionsModal.value = false
  } catch (error) {
    showError('Failed to terminate sessions')
  }
}

const exportData = async () => {
  exportingData.value = true
  try {
    // Simulate API export
    await new Promise(resolve => setTimeout(resolve, 3000))
    showSuccess('Data export started. You will receive an email when your data is ready to download.')
  } catch (error) {
    showError('Failed to export data')
  } finally {
    exportingData.value = false
  }
}

const clearSearchHistory = async () => {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    showSuccess('Search history cleared successfully')
  } catch (error) {
    showError('Failed to clear search history')
  }
}

const deactivateAccount = async () => {
  if (!deactivateConfirmationPassword.value) return
  
  deactivatingAccount.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    showSuccess('Account deactivated successfully')
    showDeactivateConfirmation.value = false
    deactivateConfirmationPassword.value = ''
    
    // Emit event for parent to handle
    emit('update-account', { type: 'deactivate' })
    
  } catch (error) {
    showError('Failed to deactivate account')
  } finally {
    deactivatingAccount.value = false
  }
}

const deleteAccount = async () => {
  if (!isDeleteConfirmed.value) return
  
  deletingAccount.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    showSuccess('Account deletion initiated. You will receive a confirmation email.')
    showDeleteConfirmation.value = false
    deleteConfirmationText.value = ''
    
    // Emit event for parent to handle
    emit('update-account', { type: 'delete' })
    
  } catch (error) {
    showError('Failed to delete account')
  } finally {
    deletingAccount.value = false
  }
}

const getDeviceIcon = (device) => {
  if (device.includes('Chrome')) return 'fab fa-chrome'
  if (device.includes('Safari')) return 'fab fa-safari'
  if (device.includes('Firefox')) return 'fab fa-firefox'
  if (device.includes('iPhone') || device.includes('Android')) return 'fas fa-mobile-alt'
  if (device.includes('Mac')) return 'fab fa-apple'
  if (device.includes('Windows')) return 'fab fa-windows'
  return 'fas fa-desktop'
}

const formatTime = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const showSuccess = (message) => {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = ''
  }, 5000)
}

const showError = (message) => {
  errorMessage.value = message
  setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}

// Initialize when component mounts or user prop changes
onMounted(() => {
  initializeData()
})

watch(() => props.user, initializeData, { deep: true })
</script>

<style scoped>
.account-settings {
  padding: 0;
}

.settings-sections {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.settings-section {
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  padding: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #dee2e6;
}

.section-title i {
  color: #3498db;
}

.danger-zone .section-title i {
  color: #e74c3c;
}

/* Preferences Grid */
.preferences-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.preference-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.preference-item:hover {
  border-color: #3498db;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.1);
}

.preference-info {
  flex: 1;
}

.preference-label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
  display: block;
}

.preference-description {
  margin: 0;
  color: #6c757d;
  font-size: 0.875rem;
  line-height: 1.4;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  margin-left: 1rem;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #3498db;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

/* Security Actions */
.security-actions,
.privacy-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.security-item,
.privacy-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.security-item:hover,
.privacy-item:hover {
  border-color: #3498db;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.1);
}

.security-info h4,
.privacy-info h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.security-info p,
.privacy-info p {
  margin: 0 0 0.5rem 0;
  color: #6c757d;
  font-size: 0.875rem;
  line-height: 1.4;
}

.password-info {
  font-size: 0.8rem;
  color: #6c757d;
  font-style: italic;
}

.security-status {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 600;
}

.security-status.enabled {
  background: #d4edda;
  color: #155724;
}

.security-status.disabled {
  background: #f8d7da;
  color: #721c24;
}

.session-count {
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;
}

/* Danger Zone */
.danger-zone {
  border-left: 4px solid #e74c3c;
  background: #fff5f5;
}

.danger-actions {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.danger-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #f1f3f4;
  transition: all 0.2s ease;
}

.danger-item:hover {
  border-color: #e74c3c;
  box-shadow: 0 2px 8px rgba(231, 76, 60, 0.1);
}

.danger-info h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.danger-info p {
  margin: 0;
  color: #6c757d;
  max-width: 500px;
  line-height: 1.4;
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
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-primary {
  background: #3498db;
  color: white;
  border: 2px solid #3498db;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
  border-color: #2980b9;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #95a5a6;
  color: white;
  border: 2px solid #95a5a6;
}

.btn-secondary:hover:not(:disabled) {
  background: #7f8c8d;
  border-color: #7f8c8d;
}

.btn-outline {
  background: transparent;
  color: #6c757d;
  border: 2px solid #dee2e6;
}

.btn-outline:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.btn-warning {
  background: #f39c12;
  color: white;
  border: 2px solid #f39c12;
}

.btn-warning:hover:not(:disabled) {
  background: #e67e22;
  border-color: #e67e22;
  transform: translateY(-1px);
}

.btn-danger {
  background: #e74c3c;
  color: white;
  border: 2px solid #e74c3c;
}

.btn-danger:hover:not(:disabled) {
  background: #c0392b;
  border-color: #c0392b;
  transform: translateY(-1px);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
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
  gap: 0.5rem;
  z-index: 1000;
  animation: slideInUp 0.3s ease;
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
  gap: 0.5rem;
  z-index: 1000;
  animation: slideInUp 0.3s ease;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.modal-close:hover {
  background: #f8f9fa;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.modal-body li {
  margin-bottom: 0.5rem;
  color: #6c757d;
}

.warning-text {
  color: #e74c3c;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.confirmation-hint {
  font-size: 0.875rem;
  color: #6c757d;
  font-style: italic;
  margin-top: 0.5rem;
}

/* Form Styles */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-control:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-control.error {
  border-color: #e74c3c;
}

.password-input {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input input {
  padding-right: 3rem;
  width: 100%;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.password-toggle:hover {
  background: #f8f9fa;
}

.password-strength {
  margin-top: 0.5rem;
}

.strength-meter {
  height: 4px;
  background: #f1f3f4;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.strength-bar {
  height: 100%;
  transition: width 0.3s ease;
}

.strength-bar.very-weak { width: 20%; background: #e74c3c; }
.strength-bar.weak { width: 40%; background: #e67e22; }
.strength-bar.good { width: 60%; background: #f1c40f; }
.strength-bar.strong { width: 80%; background: #2ecc71; }
.strength-bar.very-strong { width: 100%; background: #27ae60; }

.strength-text {
  font-size: 0.875rem;
  color: #6c757d;
}

.form-hint {
  font-size: 0.875rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.error-message {
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Sessions List */
.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  background: #f8f9fa;
}

.session-info {
  flex: 1;
}

.session-device {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.session-device i {
  font-size: 1.25rem;
  color: #6c757d;
  width: 20px;
}

.session-device strong {
  color: #2c3e50;
}

.session-location {
  display: block;
  color: #6c757d;
  font-size: 0.875rem;
}

.session-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6c757d;
}

.current-session {
  color: #27ae60;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid #e9ecef;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .settings-sections {
    padding: 1.5rem;
  }
  
  .preferences-grid {
    grid-template-columns: 1fr;
  }
  
  .preference-item,
  .security-item,
  .privacy-item,
  .danger-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .toggle-switch {
    align-self: flex-start;
    margin-left: 0;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .success-message,
  .error-message {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
  }
  
  .session-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .settings-section {
    padding: 1rem;
  }
  
  .modal-content {
    margin: 0.5rem;
  }
  
  .modal-header,
  .modal-body {
    padding: 1rem;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>