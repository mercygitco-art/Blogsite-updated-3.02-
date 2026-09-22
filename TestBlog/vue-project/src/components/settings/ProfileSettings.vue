<template>
  <div class="profile-settings">
    <!-- Header -->
    <div class="settings-header">
      <h2>Profile Information</h2>
      <p>Update your personal information and how others see you on the platform</p>
    </div>

    <!-- Avatar Section -->
    <div class="avatar-section">
      <div class="avatar-container">
        <div class="avatar-preview" :class="{ 'has-avatar': formData.avatar }">
          <img 
            v-if="formData.avatar" 
            :src="formData.avatar" 
            :alt="formData.name" 
            @error="handleImageError"
          />
          <div v-else class="avatar-fallback">
            <span>{{ formData.name?.charAt(0)?.toUpperCase() || 'U' }}</span>
          </div>
          <div v-if="avatarUploading" class="avatar-loading">
            <div class="loading-spinner"></div>
          </div>
        </div>
        
        <div class="avatar-info">
          <h3>Profile Picture</h3>
          <p>Recommended: Square JPG, PNG, or GIF, at least 400x400 pixels</p>
          
          <div class="avatar-actions">
            <input
              ref="avatarInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="onAvatarChange"
            />
            <button 
              class="btn btn-primary btn-sm" 
              @click="triggerAvatarUpload"
              :disabled="avatarUploading"
            >
              <i class="fas fa-upload"></i> 
              {{ avatarUploading ? 'Uploading...' : 'Upload Photo' }}
            </button>
            <button
              class="btn btn-outline btn-sm"
              :disabled="!formData.avatar || avatarUploading"
              @click="removeAvatar"
            >
              <i class="fas fa-trash"></i> Remove
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Form -->
    <form class="settings-form" @submit.prevent="saveProfile">
      <div class="form-grid">
        <!-- Personal Information -->
        <div class="form-section">
          <h3 class="section-title">
            <i class="fas fa-user"></i>
            Personal Information
          </h3>
          
          <div class="form-group">
            <label for="fullName" class="form-label">
              Full Name *
              <span class="required-indicator"></span>
            </label>
            <input
              type="text"
              id="fullName"
              v-model.trim="formData.name"
              :class="['form-control', { 'error': fieldErrors.name }]"
              required
              maxlength="50"
              autocomplete="name"
              placeholder="Enter your full name"
              @blur="validateField('name')"
            />
            <div v-if="fieldErrors.name" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ fieldErrors.name }}
            </div>
            <div class="form-hint">
              Your name as you'd like it to appear on your profile
            </div>
          </div>

          <div class="form-group">
            <label for="username" class="form-label">
              Username *
              <span class="required-indicator"></span>
            </label>
            <div class="input-with-validation">
              <input
                type="text"
                id="username"
                v-model.trim="formData.username"
                :class="['form-control', { 
                  'error': fieldErrors.username,
                  'valid': isUsernameValid && formData.username
                }]"
                required
                pattern="^[a-zA-Z0-9_]{3,20}$"
                autocomplete="username"
                placeholder="Choose a username"
                @input="debouncedCheckUsername"
                @blur="validateField('username')"
              />
              <div v-if="usernameChecking" class="validation-loading">
                <i class="fas fa-spinner fa-spin"></i>
              </div>
              <i v-else-if="isUsernameValid && formData.username" class="fas fa-check validation-valid"></i>
            </div>
            <div v-if="fieldErrors.username" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ fieldErrors.username }}
            </div>
            <div class="form-hint">
              3-20 characters, letters, numbers, and underscores only
            </div>
          </div>

          <div class="form-group">
            <label for="email" class="form-label">
              Email Address *
              <span class="required-indicator"></span>
            </label>
            <div class="input-with-validation">
              <input
                type="email"
                id="email"
                v-model.trim="formData.email"
                :class="['form-control', { 
                  'error': fieldErrors.email,
                  'valid': isEmailValid && formData.email
                }]"
                required
                autocomplete="email"
                placeholder="your.email@example.com"
                @blur="validateField('email')"
              />
              <i v-if="isEmailValid && formData.email" class="fas fa-check validation-valid"></i>
            </div>
            <div v-if="fieldErrors.email" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ fieldErrors.email }}
            </div>
            <div v-if="formData.emailVerified" class="verified-badge">
              <i class="fas fa-check-circle"></i>
              Email verified
            </div>
            <div v-else class="verification-prompt">
              <i class="fas fa-exclamation-triangle"></i>
              Email not verified. 
              <button type="button" class="btn-link" @click="verifyEmail">
                Send verification email
              </button>
            </div>
          </div>
        </div>

        <!-- Professional Information -->
        <div class="form-section">
          <h3 class="section-title">
            <i class="fas fa-briefcase"></i>
            Professional Information
          </h3>

          <div class="form-group">
            <label for="occupation" class="form-label">Occupation</label>
            <input
              type="text"
              id="occupation"
              v-model.trim="formData.occupation"
              class="form-control"
              maxlength="50"
              placeholder="Your profession or job title"
            />
            <div class="form-hint">
              What you do for a living
            </div>
          </div>

          <div class="form-group">
            <label for="company" class="form-label">Company</label>
            <input
              type="text"
              id="company"
              v-model.trim="formData.company"
              class="form-control"
              maxlength="50"
              placeholder="Your company or organization"
            />
          </div>

          <div class="form-group">
            <label for="location" class="form-label">Location</label>
            <input
              type="text"
              id="location"
              v-model.trim="formData.location"
              class="form-control"
              maxlength="50"
              placeholder="City, Country"
            />
            <div class="form-hint">
              Where you're based
            </div>
          </div>

          <div class="form-group">
            <label for="website" class="form-label">Website</label>
            <div class="input-with-validation">
              <input
                type="url"
                id="website"
                v-model.trim="formData.website"
                :class="['form-control', { 'error': fieldErrors.website }]"
                placeholder="https://example.com"
                @blur="validateField('website')"
              />
              <i v-if="isWebsiteValid && formData.website" class="fas fa-check validation-valid"></i>
            </div>
            <div v-if="fieldErrors.website" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ fieldErrors.website }}
            </div>
          </div>
        </div>

        <!-- Bio Section -->
        <div class="form-section form-section-full">
          <h3 class="section-title">
            <i class="fas fa-edit"></i>
            About Me
          </h3>

          <div class="form-group">
            <label for="bio" class="form-label">Bio</label>
            <textarea
              id="bio"
              v-model.trim="formData.bio"
              class="form-control"
              rows="4"
              maxlength="200"
              placeholder="Tell us about yourself, your interests, or your work..."
            ></textarea>
            <div class="form-meta">
              <div class="char-counter" :class="{ 'near-limit': formData.bio.length > 180 }">
                {{ formData.bio.length }}/200
              </div>
            </div>
            <div class="form-hint">
              A brief introduction about yourself
            </div>
          </div>
        </div>

        <!-- Social Links -->
        <div class="form-section form-section-full">
          <h3 class="section-title">
            <i class="fas fa-share-alt"></i>
            Social Links
          </h3>

          <div class="social-links-grid">
            <div class="social-link-input" v-for="social in socialPlatforms" :key="social.key">
              <label :for="social.key" class="form-label">
                <i :class="social.icon"></i>
                {{ social.label }}
              </label>
              <div class="input-with-prefix">
                <span class="input-prefix">{{ social.prefix }}</span>
                <input
                  :id="social.key"
                  type="text"
                  v-model.trim="formData.socialLinks[social.key]"
                  class="form-control"
                  :placeholder="social.placeholder"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <div class="action-left">
          <button
            class="btn btn-secondary"
            type="button"
            @click="resetForm"
            :disabled="!isDirty || saving"
          >
            <i class="fas fa-undo"></i> 
            Discard Changes
          </button>
        </div>
        
        <div class="action-right">
          <div v-if="successMessage" class="success-message">
            <i class="fas fa-check-circle"></i>
            {{ successMessage }}
          </div>
          
          <button
            class="btn btn-primary"
            type="submit"
            :disabled="!isFormValid || !isDirty || saving"
          >
            <i v-if="saving" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-save"></i>
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { authAPI } from '../../api/auth.js'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update-profile'])

// Form data
const formData = ref({
  name: '',
  username: '',
  email: '',
  occupation: '',
  company: '',
  location: '',
  website: '',
  bio: '',
  avatar: '',
  emailVerified: false,
  socialLinks: {
    twitter: '',
    github: '',
    linkedin: '',
    facebook: '',
    instagram: ''
  }
})

// Original data for comparison
const originalData = ref({})

// UI State
const avatarInput = ref(null)
const avatarUploading = ref(false)
const saving = ref(false)
const successMessage = ref('')
const usernameChecking = ref(false)

// Validation
const fieldErrors = ref({})
const usernameTimeout = ref(null)

// Social platforms configuration
const socialPlatforms = [
  {
    key: 'twitter',
    label: 'Twitter',
    icon: 'fab fa-twitter',
    prefix: 'twitter.com/',
    placeholder: 'username'
  },
  {
    key: 'github',
    label: 'GitHub',
    icon: 'fab fa-github',
    prefix: 'github.com/',
    placeholder: 'username'
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    icon: 'fab fa-linkedin',
    prefix: 'linkedin.com/in/',
    placeholder: 'profile-name'
  },
  {
    key: 'facebook',
    label: 'Facebook',
    icon: 'fab fa-facebook',
    prefix: 'facebook.com/',
    placeholder: 'username'
  },
  {
    key: 'instagram',
    label: 'Instagram',
    icon: 'fab fa-instagram',
    prefix: 'instagram.com/',
    placeholder: 'username'
  }
]

// Computed Properties
const isDirty = computed(() => {
  return JSON.stringify(formData.value) !== JSON.stringify(originalData.value)
})

const isFormValid = computed(() => {
  const { name, username, email } = formData.value
  return (
    name?.length >= 2 &&
    username?.length >= 3 &&
    /^[a-zA-Z0-9_]{3,20}$/.test(username) &&
    email &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    Object.keys(fieldErrors.value).length === 0
  )
})

const isUsernameValid = computed(() => {
  return formData.value.username && 
         /^[a-zA-Z0-9_]{3,20}$/.test(formData.value.username) &&
         !fieldErrors.value.username
})

const isEmailValid = computed(() => {
  return formData.value.email && 
         /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email) &&
         !fieldErrors.value.email
})

const isWebsiteValid = computed(() => {
  if (!formData.value.website) return true
  try {
    new URL(formData.value.website)
    return true
  } catch {
    return false
  }
})

// Methods
const initializeData = () => {
  const userData = { ...props.user }
  
  // Ensure socialLinks object exists
  if (!userData.socialLinks) {
    userData.socialLinks = {}
  }
  
  // Initialize all social platform keys
  socialPlatforms.forEach(platform => {
    if (!userData.socialLinks[platform.key]) {
      userData.socialLinks[platform.key] = ''
    }
  })
  
  formData.value = userData
  originalData.value = JSON.parse(JSON.stringify(userData))
}

const validateField = (field) => {
  const errors = {}
  
  switch (field) {
    case 'name':
      if (!formData.value.name || formData.value.name.length < 2) {
        errors.name = 'Name must be at least 2 characters long'
      }
      break
      
    case 'username':
      if (!formData.value.username) {
        errors.username = 'Username is required'
      } else if (formData.value.username.length < 3) {
        errors.username = 'Username must be at least 3 characters long'
      } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.value.username)) {
        errors.username = 'Username can only contain letters, numbers, and underscores'
      }
      break
      
    case 'email':
      if (!formData.value.email) {
        errors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
        errors.email = 'Please enter a valid email address'
      }
      break
      
    case 'website':
      if (formData.value.website && !isWebsiteValid.value) {
        errors.website = 'Please enter a valid URL (including http:// or https://)'
      }
      break
  }
  
  fieldErrors.value = { ...fieldErrors.value, ...errors }
}

const debouncedCheckUsername = () => {
  clearTimeout(usernameTimeout.value)
  usernameTimeout.value = setTimeout(() => {
    validateField('username')
    checkUsernameAvailability()
  }, 500)
}

const checkUsernameAvailability = async () => {
  if (!formData.value.username || fieldErrors.value.username) return
  
  usernameChecking.value = true
  try {
    fieldErrors.value.username = 'Username availability cannot be checked until backend support is available'
  } catch (error) {
    fieldErrors.value.username = 'Unable to check username availability'
  } finally {
    usernameChecking.value = false
  }
}

const saveProfile = async () => {
  if (!isFormValid.value || !isDirty.value) return
  
  saving.value = true
  successMessage.value = ''
  
  try {
    // Validate all fields
    validateField('name')
    validateField('username')
    validateField('email')
    validateField('website')
    
    if (Object.keys(fieldErrors.value).length > 0) {
      throw new Error('Please fix the validation errors')
    }
    
    const updatedProfile = await authAPI.updateProfile(JSON.parse(JSON.stringify(formData.value)))
    
    // Emit update event
    emit('update-profile', updatedProfile || JSON.parse(JSON.stringify(formData.value)))
    
    // Update original data
    originalData.value = JSON.parse(JSON.stringify(formData.value))
    
    successMessage.value = 'Profile updated successfully!'
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
    
  } catch (error) {
    successMessage.value = error.message || 'Failed to save profile. Please try again.'
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  formData.value = JSON.parse(JSON.stringify(originalData.value))
  fieldErrors.value = {}
  successMessage.value = ''
}

const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

const onAvatarChange = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // Validate file type and size
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB
  
  if (!validTypes.includes(file.type)) {
    alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
    return
  }
  
  if (file.size > maxSize) {
    alert('Image size must be less than 5MB')
    return
  }
  
  avatarUploading.value = true
  
  const reader = new FileReader()
  reader.onload = (e) => {
    formData.value.avatar = e.target.result
    avatarUploading.value = false
    event.target.value = '' // Reset input
  }
  reader.onerror = () => {
    avatarUploading.value = false
    alert('Error reading file. Please try again.')
  }
  reader.readAsDataURL(file)
}

const removeAvatar = () => {
  formData.value.avatar = ''
}

const handleImageError = () => {
  formData.value.avatar = '' // Fallback to default avatar
}

const verifyEmail = () => {
  successMessage.value = 'Email verification is unavailable because the backend does not support it yet.'
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

// Lifecycle
onMounted(() => {
  initializeData()
})

onUnmounted(() => {
  clearTimeout(usernameTimeout.value)
})

// Watchers
watch(() => props.user, initializeData, { immediate: true, deep: true })
</script>

<style scoped>
.profile-settings {
  padding: 0;
}

.settings-header {
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 0;
}

.settings-header h2 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.8rem;
  font-weight: 600;
}

.settings-header p {
  margin: 0;
  color: #6c757d;
  font-size: 1rem;
}

/* Avatar Section */
.avatar-section {
  padding: 2rem;
  border-bottom: 1px solid #e9ecef;
}

.avatar-container {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.avatar-preview {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  border: 4px solid #fff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.avatar-preview.has-avatar {
  background: #f8f9fa;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  font-size: 3rem;
  font-weight: 600;
  color: #fff;
  text-transform: uppercase;
}

.avatar-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.avatar-info h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.avatar-info p {
  margin: 0 0 1.5rem 0;
  color: #6c757d;
  font-size: 0.95rem;
}

.avatar-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Form Styles */
.settings-form {
  padding: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.form-section {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.form-section-full {
  grid-column: 1 / -1;
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

/* Form Groups */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.required-indicator {
  color: #e74c3c;
  font-size: 0.8em;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #fff;
  box-sizing: border-box;
}

.form-control:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-control.error {
  border-color: #e74c3c;
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
}

.form-control.valid {
  border-color: #27ae60;
}

/* Input with Validation */
.input-with-validation {
  position: relative;
  display: flex;
  align-items: center;
}

.validation-loading,
.validation-valid {
  position: absolute;
  right: 1rem;
  color: #6c757d;
}

.validation-valid {
  color: #27ae60;
}

/* Input with Prefix */
.input-with-prefix {
  display: flex;
  align-items: center;
}

.input-prefix {
  padding: 0.75rem 1rem;
  background: #e9ecef;
  border: 2px solid #e9ecef;
  border-right: none;
  border-radius: 6px 0 0 6px;
  color: #6c757d;
  font-size: 0.9rem;
}

.input-with-prefix .form-control {
  border-radius: 0 6px 6px 0;
  flex: 1;
}

/* Social Links Grid */
.social-links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.social-link-input .form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.social-link-input .form-label i {
  width: 16px;
  color: #6c757d;
}

/* Messages and Hints */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.form-hint {
  color: #6c757d;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.form-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.char-counter {
  font-size: 0.875rem;
  color: #6c757d;
}

.char-counter.near-limit {
  color: #e67e22;
  font-weight: 500;
}

/* Verification */
.verified-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #27ae60;
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: rgba(39, 174, 96, 0.1);
  border-radius: 4px;
}

.verification-prompt {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e67e22;
  font-size: 0.875rem;
  margin-top: 0.5rem;
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

.btn-link {
  background: none;
  border: none;
  color: #3498db;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  font-size: inherit;
}

.btn-link:hover {
  color: #2980b9;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid #e9ecef;
}

.action-left,
.action-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #27ae60;
  font-weight: 500;
  padding: 0.75rem 1rem;
  background: rgba(39, 174, 96, 0.1);
  border-radius: 6px;
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .settings-form {
    padding: 1.5rem;
  }
  
  .avatar-container {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
  
  .avatar-actions {
    justify-content: center;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .action-left,
  .action-right {
    justify-content: center;
  }
  
  .social-links-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .settings-header {
    padding: 1.5rem 1rem 1rem;
  }
  
  .settings-header h2 {
    font-size: 1.5rem;
  }
  
  .avatar-section {
    padding: 1.5rem;
  }
  
  .avatar-preview {
    width: 100px;
    height: 100px;
  }
  
  .avatar-fallback {
    font-size: 2.5rem;
  }
  
  .form-section {
    padding: 1rem;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
  
  .avatar-actions {
    flex-direction: column;
    width: 100%;
  }
}
</style>