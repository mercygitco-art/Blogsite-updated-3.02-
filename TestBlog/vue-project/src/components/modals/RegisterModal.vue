<template>
  <div class="modal-overlay" @click.self="handleOverlayClick">
    <div class="modal-container" role="dialog" aria-labelledby="register-title" aria-modal="true">
      <!-- Background Effects -->
      <div class="modal-backdrop" :style="backdropStyle"></div>
      
      <div class="modal-content" :class="contentClasses">
        <!-- Enhanced Header -->
        <div class="modal-header">
          <div class="header-content">
            <div class="title-section">
              <div class="modal-icon">
                <i class="fas fa-user-plus"></i>
              </div>
              <div class="title-wrapper">
                <h1 id="register-title" class="modal-title">Join BlogSphere Pro</h1>
                <p class="modal-subtitle">Create your account and start writing</p>
              </div>
            </div>
            <button 
              class="close-button" 
              @click="handleClose"
              :disabled="loading"
              aria-label="Close registration modal"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <!-- Progress Steps -->
          <div class="registration-progress">
            <div class="progress-steps">
              <div 
                v-for="step in steps" 
                :key="step.id"
                class="progress-step" 
                :class="{ 
                  'active': currentStep === step.id,
                  'completed': currentStep > step.id,
                  'disabled': currentStep < step.id
                }"
              >
                <div class="step-indicator">
                  <span v-if="currentStep > step.id" class="step-check">
                    <i class="fas fa-check"></i>
                  </span>
                  <span v-else class="step-number">{{ step.number }}</span>
                </div>
                <span class="step-label">{{ step.label }}</span>
              </div>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: progressPercentage + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Multi-step Form -->
        <div class="modal-body">
          <form 
            @submit.prevent="handleRegister" 
            class="registration-form"
            novalidate
            ref="registerForm"
          >
            <!-- Step 1: Personal Information -->
            <div v-if="currentStep === 1" class="form-step" data-step="1">
              <div class="step-header">
                <h3>Personal Information</h3>
                <p>Tell us a bit about yourself</p>
              </div>

              <!-- Name Field -->
              <div class="form-group" :class="{ 'has-error': errors.name }">
                <label for="registerName" class="form-label">
                  Full Name
                  <span class="required-asterisk">*</span>
                </label>
                <div class="input-wrapper">
                  <i class="input-icon fas fa-user"></i>
                  <input
                    type="text"
                    id="registerName"
                    v-model.trim="formData.name"
                    class="form-control"
                    placeholder="Enter your full name"
                    :class="{ 
                      'is-invalid': errors.name, 
                      'is-valid': fieldsTouched.name && !errors.name 
                    }"
                    autocomplete="name"
                    required
                    @blur="handleFieldBlur('name')"
                    @input="handleNameInput"
                    :disabled="loading"
                    aria-describedby="name-error"
                  >
                  <div v-if="fieldsTouched.name && !errors.name && formData.name" class="valid-feedback">
                    <i class="fas fa-check"></i>
                  </div>
                </div>
                <div v-if="errors.name" id="name-error" class="error-message" role="alert">
                  <i class="fas fa-exclamation-circle"></i>
                  {{ errors.name }}
                </div>
              </div>

              <!-- Email Field -->
              <div class="form-group" :class="{ 'has-error': errors.email }">
                <label for="registerEmail" class="form-label">
                  Email Address
                  <span class="required-asterisk">*</span>
                </label>
                <div class="input-wrapper">
                  <i class="input-icon fas fa-envelope"></i>
                  <input
                    type="email"
                    id="registerEmail"
                    v-model.trim="formData.email"
                    class="form-control"
                    placeholder="Enter your email address"
                    :class="{ 
                      'is-invalid': errors.email, 
                      'is-valid': fieldsTouched.email && !errors.email && isEmailUnique 
                    }"
                    autocomplete="email"
                    required
                    @blur="handleEmailBlur"
                    @input="handleEmailInput"
                    :disabled="loading || checkingEmail"
                    aria-describedby="email-error email-status"
                  >
                  <div v-if="checkingEmail" class="loading-indicator">
                    <i class="fas fa-spinner fa-spin"></i>
                  </div>
                  <div v-else-if="fieldsTouched.email && !errors.email && formData.email" class="valid-feedback">
                    <i class="fas fa-check"></i>
                  </div>
                </div>
                <div v-if="errors.email" id="email-error" class="error-message" role="alert">
                  <i class="fas fa-exclamation-circle"></i>
                  {{ errors.email }}
                </div>
                <div v-if="fieldsTouched.email && !errors.email && formData.email" id="email-status" class="email-status">
                  <span v-if="checkingEmail" class="status-checking">
                    <i class="fas fa-spinner fa-spin"></i> Checking availability...
                  </span>
                  <span v-else-if="isEmailUnique === true" class="status-available">
                    <i class="fas fa-check-circle"></i> Email is available
                  </span>
                  <span v-else-if="isEmailUnique === false" class="status-taken">
                    <i class="fas fa-times-circle"></i> Email is already registered
                  </span>
                </div>
              </div>

              <!-- Username Field -->
              <div class="form-group" :class="{ 'has-error': errors.username }">
                <label for="registerUsername" class="form-label">
                  Username
                  <span class="required-asterisk">*</span>
                </label>
                <div class="input-wrapper">
                  <i class="input-icon fas fa-at"></i>
                  <input
                    type="text"
                    id="registerUsername"
                    v-model.trim="formData.username"
                    class="form-control"
                    placeholder="Choose a username"
                    :class="{ 
                      'is-invalid': errors.username, 
                      'is-valid': fieldsTouched.username && !errors.username && isUsernameUnique 
                    }"
                    autocomplete="username"
                    required
                    @blur="handleFieldBlur('username')"
                    @input="handleUsernameInput"
                    :disabled="loading || checkingUsername"
                    aria-describedby="username-error username-status"
                  >
                  <div v-if="checkingUsername" class="loading-indicator">
                    <i class="fas fa-spinner fa-spin"></i>
                  </div>
                  <div v-else-if="fieldsTouched.username && !errors.username && formData.username" class="valid-feedback">
                    <i class="fas fa-check"></i>
                  </div>
                </div>
                <div v-if="errors.username" id="username-error" class="error-message" role="alert">
                  <i class="fas fa-exclamation-circle"></i>
                  {{ errors.username }}
                </div>
                <div v-if="fieldsTouched.username && !errors.username && formData.username" id="username-status" class="username-status">
                  <span v-if="checkingUsername" class="status-checking">
                    <i class="fas fa-spinner fa-spin"></i> Checking availability...
                  </span>
                  <span v-else-if="isUsernameUnique === true" class="status-available">
                    <i class="fas fa-check-circle"></i> Username is available
                  </span>
                  <span v-else-if="isUsernameUnique === false" class="status-taken">
                    <i class="fas fa-times-circle"></i> Username is taken
                  </span>
                </div>
              </div>
            </div>

            <!-- Step 2: Security -->
            <div v-if="currentStep === 2" class="form-step" data-step="2">
              <div class="step-header">
                <h3>Account Security</h3>
                <p>Create a strong password to protect your account</p>
              </div>

              <!-- Password Field -->
              <div class="form-group" :class="{ 'has-error': errors.password }">
                <label for="registerPassword" class="form-label">
                  Password
                  <span class="required-asterisk">*</span>
                </label>
                <div class="input-wrapper">
                  <i class="input-icon fas fa-lock"></i>
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    id="registerPassword"
                    v-model="formData.password"
                    class="form-control"
                    placeholder="Create a strong password"
                    :class="{ 
                      'is-invalid': errors.password, 
                      'is-valid': fieldsTouched.password && !errors.password 
                    }"
                    autocomplete="new-password"
                    required
                    @blur="handleFieldBlur('password')"
                    @input="handlePasswordInput"
                    :disabled="loading"
                    aria-describedby="password-error password-requirements password-strength"
                  >
                  <button 
                    type="button" 
                    class="toggle-password" 
                    @click="togglePasswordVisibility"
                    :disabled="loading"
                    :aria-label="showPassword ? 'Hide password' : 'Show password'"
                    tabindex="0"
                  >
                    <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                  <div v-if="fieldsTouched.password && !errors.password && formData.password" class="valid-feedback">
                    <i class="fas fa-check"></i>
                  </div>
                </div>

                <!-- Password Strength -->
                <div v-if="formData.password" class="password-strength" id="password-strength">
                  <div class="strength-meter">
                    <div 
                      class="strength-bar" 
                      :class="passwordStrength.class"
                      :style="{ width: passwordStrength.percentage + '%' }"
                    ></div>
                  </div>
                  <span class="strength-text">{{ passwordStrength.text }}</span>
                </div>

                <!-- Password Requirements -->
                <div class="password-requirements" id="password-requirements">
                  <p class="requirements-title">Password must contain:</p>
                  <ul class="requirements-list">
                    <li v-for="req in passwordRequirements" :key="req.id" :class="{ 'met': req.met }">
                      <i :class="req.met ? 'fas fa-check' : 'fas fa-times'"></i>
                      {{ req.text }}
                    </li>
                  </ul>
                </div>

                <div v-if="errors.password" id="password-error" class="error-message" role="alert">
                  <i class="fas fa-exclamation-circle"></i>
                  {{ errors.password }}
                </div>
              </div>

              <!-- Confirm Password -->
              <div class="form-group" :class="{ 'has-error': errors.confirmPassword }">
                <label for="registerConfirmPassword" class="form-label">
                  Confirm Password
                  <span class="required-asterisk">*</span>
                </label>
                <div class="input-wrapper">
                  <i class="input-icon fas fa-lock"></i>
                  <input
                    :type="showConfirmPassword ? 'text' : 'password'"
                    id="registerConfirmPassword"
                    v-model="formData.confirmPassword"
                    class="form-control"
                    placeholder="Confirm your password"
                    :class="{ 
                      'is-invalid': errors.confirmPassword, 
                      'is-valid': fieldsTouched.confirmPassword && !errors.confirmPassword && formData.confirmPassword 
                    }"
                    autocomplete="new-password"
                    required
                    @blur="handleFieldBlur('confirmPassword')"
                    @input="handleConfirmPasswordInput"
                    :disabled="loading"
                    aria-describedby="confirm-password-error"
                  >
                  <button 
                    type="button" 
                    class="toggle-password" 
                    @click="toggleConfirmPasswordVisibility"
                    :disabled="loading"
                    :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
                    tabindex="0"
                  >
                    <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                  <div v-if="fieldsTouched.confirmPassword && !errors.confirmPassword && formData.confirmPassword" class="valid-feedback">
                    <i class="fas fa-check"></i>
                  </div>
                </div>
                <div v-if="errors.confirmPassword" id="confirm-password-error" class="error-message" role="alert">
                  <i class="fas fa-exclamation-circle"></i>
                  {{ errors.confirmPassword }}
                </div>
              </div>
            </div>

            <!-- Step 3: Preferences & Terms -->
            <div v-if="currentStep === 3" class="form-step" data-step="3">
              <div class="step-header">
                <h3>Preferences & Terms</h3>
                <p>Complete your registration</p>
              </div>

              <!-- Newsletter Subscription -->
              <div class="form-group">
                <label class="checkbox-label large">
                  <input 
                    type="checkbox" 
                    v-model="formData.newsletter" 
                    :disabled="loading"
                    class="checkbox-input"
                  >
                  <span class="checkmark"></span>
                  <span class="checkbox-content">
                    <strong>Subscribe to newsletter</strong>
                    <span class="checkbox-description">
                      Get weekly updates about new features, writing tips, and community news
                    </span>
                  </span>
                </label>
              </div>

              <!-- Writing Interests -->
              <div class="form-group">
                <label class="form-label">Writing Interests (Optional)</label>
                <div class="interests-grid">
                  <label 
                    v-for="interest in writingInterests" 
                    :key="interest.id"
                    class="interest-option"
                    :class="{ 'selected': formData.interests.includes(interest.id) }"
                  >
                    <input 
                      type="checkbox" 
                      :value="interest.id"
                      v-model="formData.interests"
                      :disabled="loading"
                      class="interest-input"
                    >
                    <span class="interest-content">
                      <i :class="interest.icon"></i>
                      <span>{{ interest.name }}</span>
                    </span>
                  </label>
                </div>
              </div>

              <!-- Terms Agreement -->
              <div class="form-group" :class="{ 'has-error': errors.agreeTerms }">
                <label class="checkbox-label large">
                  <input 
                    type="checkbox" 
                    v-model="formData.agreeTerms" 
                    :disabled="loading"
                    class="checkbox-input"
                    required
                  >
                  <span class="checkmark"></span>
                  <span class="checkbox-content">
                    <strong>I agree to the Terms of Service and Privacy Policy</strong>
                    <span class="checkbox-description">
                      By creating an account, you agree to our 
                      <button type="button" class="text-link" @click="handleTermsClick">Terms of Service</button>
                      and 
                      <button type="button" class="text-link" @click="handlePrivacyClick">Privacy Policy</button>
                    </span>
                  </span>
                </label>
                <div v-if="errors.agreeTerms" class="error-message" role="alert">
                  <i class="fas fa-exclamation-circle"></i>
                  {{ errors.agreeTerms }}
                </div>
              </div>

              <!-- Final Review -->
              <div class="review-section">
                <h4>Account Summary</h4>
                <div class="review-details">
                  <div class="review-item">
                    <span class="review-label">Name:</span>
                    <span class="review-value">{{ formData.name }}</span>
                  </div>
                  <div class="review-item">
                    <span class="review-label">Email:</span>
                    <span class="review-value">{{ formData.email }}</span>
                  </div>
                  <div class="review-item">
                    <span class="review-label">Username:</span>
                    <span class="review-value">@{{ formData.username }}</span>
                  </div>
                  <div v-if="formData.interests.length > 0" class="review-item">
                    <span class="review-label">Interests:</span>
                    <span class="review-value">{{ selectedInterestsText }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Error Display -->
            <transition name="slide-down">
              <div v-if="registerError" class="error-banner" role="alert">
                <div class="error-content">
                  <i class="fas fa-exclamation-triangle"></i>
                  <div class="error-details">
                    <strong>Registration Failed</strong>
                    <p>{{ registerError }}</p>
                  </div>
                  <button 
                    type="button" 
                    class="error-close" 
                    @click="registerError = ''"
                    aria-label="Dismiss error"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </transition>

            <!-- Form Navigation -->
            <div class="form-navigation">
              <button 
                v-if="currentStep > 1"
                type="button" 
                class="btn btn-outline"
                @click="previousStep"
                :disabled="loading"
              >
                <i class="fas fa-arrow-left"></i>
                Back
              </button>
              
              <button 
                v-if="currentStep < totalSteps"
                type="button" 
                class="btn btn-primary"
                @click="nextStep"
                :disabled="!canProceedToNextStep || loading"
              >
                Continue
                <i class="fas fa-arrow-right"></i>
              </button>
              
              <button 
                v-if="currentStep === totalSteps"
                type="submit" 
                class="btn btn-success"
                :class="{ loading: loading, shake: submitError }"
                :disabled="!canSubmit || loading"
                @animationend="submitError = false"
              >
                <span class="button-content">
                  <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                  <i v-else class="fas fa-user-plus"></i>
                  <span>{{ loading ? 'Creating Account...' : 'Create Account' }}</span>
                </span>
                <div v-if="loading" class="button-progress"></div>
              </button>
            </div>
          </form>

          <!-- Social Registration -->
          <div class="social-registration-section">
            <div class="divider">
              <span class="divider-text">or sign up with</span>
            </div>
            <div class="social-buttons">
              <button 
                v-for="provider in socialProviders" 
                :key="provider.name"
                type="button" 
                class="social-button"
                :class="`social-${provider.name}`"
                @click="handleSocialRegister(provider.name)"
                :disabled="loading"
              >
                <i :class="provider.icon"></i>
                <span>{{ provider.label }}</span>
              </button>
            </div>
          </div>

          <!-- Login Prompt -->
          <div class="login-prompt">
            <p>Already have an account? 
              <button 
                type="button" 
                class="login-link" 
                @click="handleShowLogin"
                :disabled="loading"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>

        <!-- Security Footer -->
        <div class="modal-footer">
          <div class="security-notice">
            <i class="fas fa-shield-alt"></i>
            <span>Your data is protected with end-to-end encryption</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, nextTick } from 'vue'

export default {
  name: 'AdvancedRegisterModal',
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    initialEmail: {
      type: String,
      default: ''
    },
    theme: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'dark', 'modern'].includes(value)
    }
  },
  emits: ['register', 'close', 'show-login', 'terms-click', 'privacy-click', 'social-register'],
  setup(props, { emit }) {
    // Multi-step form state
    const currentStep = ref(1)
    const totalSteps = 3

    // Form data with additional fields
    const formData = ref({
      name: '',
      email: props.initialEmail,
      username: '',
      password: '',
      confirmPassword: '',
      newsletter: true,
      interests: [],
      agreeTerms: false
    })

    // Validation state
    const errors = reactive({
      name: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      agreeTerms: ''
    })

    const fieldsTouched = reactive({
      name: false,
      email: false,
      username: false,
      password: false,
      confirmPassword: false
    })

    // UI state
    const registerError = ref('')
    const showPassword = ref(false)
    const showConfirmPassword = ref(false)
    const submitError = ref(false)
    const checkingEmail = ref(false)
    const checkingUsername = ref(false)
    const isEmailUnique = ref(null)
    const isUsernameUnique = ref(null)

    // Steps configuration
    const steps = [
      { id: 1, number: 1, label: 'Personal' },
      { id: 2, number: 2, label: 'Security' },
      { id: 3, number: 3, label: 'Review' }
    ]

    // Writing interests
    const writingInterests = [
      { id: 'technology', name: 'Technology', icon: 'fas fa-laptop-code' },
      { id: 'lifestyle', name: 'Lifestyle', icon: 'fas fa-heart' },
      { id: 'business', name: 'Business', icon: 'fas fa-chart-line' },
      { id: 'travel', name: 'Travel', icon: 'fas fa-plane' },
      { id: 'food', name: 'Food', icon: 'fas fa-utensils' },
      { id: 'health', name: 'Health', icon: 'fas fa-heartbeat' }
    ]

    // Social providers
    const socialProviders = [
      { name: 'google', label: 'Google', icon: 'fab fa-google' },
      { name: 'github', label: 'GitHub', icon: 'fab fa-github' },
      { name: 'twitter', label: 'Twitter', icon: 'fab fa-twitter' }
    ]

    // Computed properties
    const progressPercentage = computed(() => {
      return ((currentStep.value - 1) / (totalSteps - 1)) * 100
    })

    const passwordStrength = computed(() => {
      const password = formData.value.password
      if (!password) return { class: '', text: '', percentage: 0 }

      let strength = 0
      let text = 'Very Weak'
      let className = 'very-weak'

      // Length check
      if (password.length >= 8) strength += 20
      // Lowercase check
      if (/[a-z]/.test(password)) strength += 20
      // Uppercase check
      if (/[A-Z]/.test(password)) strength += 20
      // Number check
      if (/[0-9]/.test(password)) strength += 20
      // Special char check
      if (/[!@#$%^&*]/.test(password)) strength += 20

      if (strength >= 80) {
        text = 'Very Strong'
        className = 'very-strong'
      } else if (strength >= 60) {
        text = 'Strong'
        className = 'strong'
      } else if (strength >= 40) {
        text = 'Medium'
        className = 'medium'
      } else if (strength >= 20) {
        text = 'Weak'
        className = 'weak'
      }

      return {
        class: className,
        text: text,
        percentage: strength
      }
    })

    const passwordRequirements = computed(() => {
      const password = formData.value.password
      return [
        {
          id: 'length',
          text: 'At least 8 characters',
          met: password.length >= 8
        },
        {
          id: 'lowercase',
          text: 'One lowercase letter',
          met: /[a-z]/.test(password)
        },
        {
          id: 'uppercase',
          text: 'One uppercase letter',
          met: /[A-Z]/.test(password)
        },
        {
          id: 'number',
          text: 'One number',
          met: /[0-9]/.test(password)
        },
        {
          id: 'special',
          text: 'One special character',
          met: /[!@#$%^&*]/.test(password)
        }
      ]
    })

    const selectedInterestsText = computed(() => {
      return formData.value.interests
        .map(interestId => {
          const interest = writingInterests.find(i => i.id === interestId)
          return interest ? interest.name : ''
        })
        .filter(Boolean)
        .join(', ')
    })

    const canProceedToNextStep = computed(() => {
      switch (currentStep.value) {
        case 1:
          return formData.value.name && 
                 formData.value.email && 
                 formData.value.username && 
                 !errors.name && 
                 !errors.email && 
                 !errors.username &&
                 isEmailUnique === true &&
                 isUsernameUnique === true
        case 2:
          return formData.value.password && 
                 formData.value.confirmPassword && 
                 !errors.password && 
                 !errors.confirmPassword
        default:
          return true
      }
    })

    const canSubmit = computed(() => {
      return canProceedToNextStep.value && formData.value.agreeTerms
    })

    const contentClasses = computed(() => ({
      [`theme-${props.theme}`]: true,
      'loading': props.loading
    }))

    const backdropStyle = computed(() => ({
      backdropFilter: `blur(${props.loading ? '8px' : '4px'})`
    }))

    // Validation methods
    const validateName = () => {
      const name = formData.value.name.trim()
      if (!name) {
        errors.name = 'Full name is required'
      } else if (name.length < 2) {
        errors.name = 'Name must be at least 2 characters'
      } else if (name.length > 50) {
        errors.name = 'Name must be less than 50 characters'
      } else {
        errors.name = ''
      }
    }

    const validateEmail = () => {
      const email = formData.value.email.trim()
      if (!email) {
        errors.email = 'Email address is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Please enter a valid email address'
      } else {
        errors.email = ''
      }
    }

    const validateUsername = () => {
      const username = formData.value.username.trim()
      if (!username) {
        errors.username = 'Username is required'
      } else if (username.length < 3) {
        errors.username = 'Username must be at least 3 characters'
      } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        errors.username = 'Username can only contain letters, numbers, and underscores'
      } else {
        errors.username = ''
      }
    }

    const validatePassword = () => {
      const password = formData.value.password
      if (!password) {
        errors.password = 'Password is required'
      } else if (password.length < 8) {
        errors.password = 'Password must be at least 8 characters'
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        errors.password = 'Password must include uppercase, lowercase letters and numbers'
      } else {
        errors.password = ''
      }
    }

    const validateConfirmPassword = () => {
      const confirm = formData.value.confirmPassword
      if (!confirm) {
        errors.confirmPassword = 'Please confirm your password'
      } else if (confirm !== formData.value.password) {
        errors.confirmPassword = 'Passwords do not match'
      } else {
        errors.confirmPassword = ''
      }
    }

    // Field handlers
    const handleFieldBlur = (field) => {
      fieldsTouched[field] = true
      switch (field) {
        case 'name': validateName(); break
        case 'email': validateEmail(); break
        case 'username': validateUsername(); break
        case 'password': validatePassword(); break
        case 'confirmPassword': validateConfirmPassword(); break
      }
    }

    const handleNameInput = () => {
      if (fieldsTouched.name) validateName()
    }

    const handleEmailInput = () => {
      if (fieldsTouched.email) {
        validateEmail()
        if (!errors.email && formData.value.email) {
          checkEmailAvailability()
        }
      }
    }

    const handleUsernameInput = () => {
      if (fieldsTouched.username) {
        validateUsername()
        if (!errors.username && formData.value.username) {
          checkUsernameAvailability()
        }
      }
    }

    const handlePasswordInput = () => {
      if (fieldsTouched.password) validatePassword()
      if (fieldsTouched.confirmPassword) validateConfirmPassword()
    }

    const handleConfirmPasswordInput = () => {
      if (fieldsTouched.confirmPassword) validateConfirmPassword()
    }

    const handleEmailBlur = () => {
      handleFieldBlur('email')
      if (!errors.email && formData.value.email) {
        checkEmailAvailability()
      }
    }

    // Availability checks (simulated)
    const checkEmailAvailability = async () => {
      checkingEmail.value = true
      isEmailUnique.value = null
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate check - in real app, this would be an API call
      const takenEmails = ['test@example.com', 'user@gmail.com']
      isEmailUnique.value = !takenEmails.includes(formData.value.email.toLowerCase())
      checkingEmail.value = false
    }

    const checkUsernameAvailability = async () => {
      checkingUsername.value = true
      isUsernameUnique.value = null
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Simulate check - in real app, this would be an API call
      const takenUsernames = ['admin', 'testuser', 'demo']
      isUsernameUnique.value = !takenUsernames.includes(formData.value.username.toLowerCase())
      checkingUsername.value = false
    }

    // Step navigation
    const nextStep = () => {
      if (currentStep.value < totalSteps && canProceedToNextStep.value) {
        currentStep.value++
      }
    }

    const previousStep = () => {
      if (currentStep.value > 1) {
        currentStep.value--
      }
    }

    // UI handlers
    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value
    }

    const toggleConfirmPasswordVisibility = () => {
      showConfirmPassword.value = !showConfirmPassword.value
    }

    const handleClose = () => {
      if (!props.loading) {
        emit('close')
      }
    }

    const handleOverlayClick = (event) => {
      if (event.target === event.currentTarget && !props.loading) {
        emit('close')
      }
    }

    const handleShowLogin = () => {
      if (!props.loading) {
        emit('show-login')
      }
    }

    const handleTermsClick = () => {
      emit('terms-click')
    }

    const handlePrivacyClick = () => {
      emit('privacy-click')
    }

    const handleSocialRegister = (provider) => {
      if (!props.loading) {
        emit('social-register', provider)
      }
    }

    // Form submission
    const handleRegister = () => {
      // Validate all fields
      Object.keys(fieldsTouched).forEach(field => {
        fieldsTouched[field] = true
      })
      validateName()
      validateEmail()
      validateUsername()
      validatePassword()
      validateConfirmPassword()

      if (!formData.value.agreeTerms) {
        errors.agreeTerms = 'You must agree to the terms and conditions'
        submitError.value = true
        return
      }

      if (Object.values(errors).some(error => error)) {
        submitError.value = true
        return
      }

      const registrationData = {
        name: formData.value.name.trim(),
        email: formData.value.email.trim(),
        username: formData.value.username.trim(),
        password: formData.value.password,
        newsletter: formData.value.newsletter,
        interests: formData.value.interests
      }

      emit('register', registrationData)
    }

    // Watch for email changes to reset availability status
    watch(() => formData.value.email, (newEmail, oldEmail) => {
      if (newEmail !== oldEmail) {
        isEmailUnique.value = null
        if (checkingEmail.value) {
          // In a real app, you might want to cancel the previous request
        }
      }
    })

    // Watch for username changes to reset availability status
    watch(() => formData.value.username, (newUsername, oldUsername) => {
      if (newUsername !== oldUsername) {
        isUsernameUnique.value = null
        if (checkingUsername.value) {
          // In a real app, you might want to cancel the previous request
        }
      }
    })

    return {
      // State
      currentStep,
      totalSteps,
      formData,
      errors,
      fieldsTouched,
      registerError,
      showPassword,
      showConfirmPassword,
      submitError,
      checkingEmail,
      checkingUsername,
      isEmailUnique,
      isUsernameUnique,
      
      // Data
      steps,
      writingInterests,
      socialProviders,
      
      // Computed
      progressPercentage,
      passwordStrength,
      passwordRequirements,
      selectedInterestsText,
      canProceedToNextStep,
      canSubmit,
      contentClasses,
      backdropStyle,
      
      // Methods
      handleFieldBlur,
      handleNameInput,
      handleEmailInput,
      handleUsernameInput,
      handlePasswordInput,
      handleConfirmPasswordInput,
      handleEmailBlur,
      nextStep,
      previousStep,
      togglePasswordVisibility,
      toggleConfirmPasswordVisibility,
      handleClose,
      handleOverlayClick,
      handleShowLogin,
      handleTermsClick,
      handlePrivacyClick,
      handleSocialRegister,
      handleRegister
    }
  }
}
</script>

<style scoped>
/* Base modal styles (similar to login modal) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
  animation: overlay-fade 0.3s ease;
}

.modal-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  animation: modal-slide-up 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-backdrop {
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  border-radius: 20px;
  z-index: -1;
}

.modal-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  position: relative;
}

/* Progress Steps */
.registration-progress {
  padding: 1.5rem 2rem 0;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin-bottom: 0.75rem;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  position: relative;
  z-index: 2;
}

.progress-step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 1rem;
  left: 60%;
  right: -40%;
  height: 2px;
  background: #e9ecef;
  z-index: -1;
}

.progress-step.completed:not(:last-child)::after {
  background: #28a745;
}

.step-indicator {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 2px solid #e9ecef;
  background: white;
}

.progress-step.active .step-indicator {
  border-color: #007bff;
  background: #007bff;
  color: white;
}

.progress-step.completed .step-indicator {
  border-color: #28a745;
  background: #28a745;
  color: white;
}

.step-check {
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #666;
  text-align: center;
}

.progress-step.active .step-label {
  color: #007bff;
  font-weight: 600;
}

.progress-step.completed .step-label {
  color: #28a745;
}

.progress-bar {
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #28a745);
  transition: width 0.3s ease;
  border-radius: 2px;
}

/* Step-specific styles */
.form-step {
  animation: slide-in 0.3s ease;
}

.step-header {
  text-align: center;
  margin-bottom: 2rem;
}

.step-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #333;
}

.step-header p {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}

/* Enhanced form styles */
.registration-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Email and Username status */
.email-status,
.username-status {
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.status-checking {
  color: #6c757d;
}

.status-available {
  color: #28a745;
}

.status-taken {
  color: #dc3545;
}

.loading-indicator {
  position: absolute;
  right: 3rem;
  color: #6c757d;
}

/* Password requirements */
.password-requirements {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #007bff;
}

.requirements-title {
  font-size: 0.8rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #333;
}

.requirements-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.25rem;
}

.requirements-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #666;
}

.requirements-list li.met {
  color: #28a745;
}

.requirements-list li:not(.met) {
  color: #dc3545;
}

/* Interests grid */
.interests-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.interest-option {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.interest-option:hover {
  border-color: #007bff;
  background: #f8f9ff;
}

.interest-option.selected {
  border-color: #007bff;
  background: #007bff;
  color: white;
}

.interest-input {
  display: none;
}

.interest-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.interest-option.selected .interest-content {
  color: white;
}

/* Large checkbox */
.checkbox-label.large {
  align-items: flex-start;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.2s ease;
}

.checkbox-label.large:hover {
  border-color: #007bff;
  background: #f8f9ff;
}

.checkbox-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.checkbox-description {
  font-size: 0.8rem;
  color: #666;
  font-weight: normal;
  line-height: 1.4;
}

.text-link {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  font-size: inherit;
}

.text-link:hover {
  color: #0056b3;
}

/* Review section */
.review-section {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.review-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #333;
}

.review-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.review-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e9ecef;
}

.review-item:last-child {
  border-bottom: none;
}

.review-label {
  font-weight: 500;
  color: #666;
  font-size: 0.875rem;
}

.review-value {
  font-weight: 600;
  color: #333;
  font-size: 0.875rem;
}

/* Form navigation */
.form-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.form-navigation .btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  justify-content: center;
}

.btn-success {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  border: none;
}

.btn-success:hover:not(:disabled) {
  background: linear-gradient(135deg, #218838, #1ea085);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(40, 167, 69, 0.3);
}

/* Social registration */
.social-registration-section {
  margin: 2rem 0 1rem;
}

/* Login prompt */
.login-prompt {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.login-prompt p {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
}

.login-link {
  background: none;
  border: none;
  color: #007bff;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s ease;
}

.login-link:hover:not(:disabled) {
  color: #0056b3;
  text-decoration: underline;
}

/* Animations */
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes overlay-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modal-slide-up {
  from { 
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .modal-container {
    max-width: 100%;
  }
  
  .progress-steps {
    gap: 0.5rem;
  }
  
  .step-label {
    font-size: 0.7rem;
  }
  
  .interests-grid {
    grid-template-columns: 1fr;
  }
  
  .form-navigation {
    flex-direction: column;
  }
  
  .form-navigation .btn {
    width: 100%;
  }
}

/* Theme variants */
.modal-content.theme-dark {
  background: #1a1a1a;
  color: white;
}

.modal-content.theme-dark .step-header h3,
.modal-content.theme-dark .step-header p,
.modal-content.theme-dark .form-label,
.modal-content.theme-dark .review-label,
.modal-content.theme-dark .review-value,
.modal-content.theme-dark .requirements-title {
  color: #ccc;
}

.modal-content.theme-dark .interest-option {
  background: #2d2d2d;
  border-color: #444;
  color: #ccc;
}

.modal-content.theme-dark .review-section,
.modal-content.theme-dark .password-requirements {
  background: #2d2d2d;
  border-color: #444;
}

.modal-content.theme-dark .checkbox-label.large {
  background: #2d2d2d;
  border-color: #444;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>