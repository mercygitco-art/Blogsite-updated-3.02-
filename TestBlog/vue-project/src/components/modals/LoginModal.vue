<template>
  <div class="modal-overlay" @click.self="handleOverlayClick">
    <div class="modal-container" role="dialog" aria-labelledby="login-title" aria-modal="true">
      <!-- Background Effects -->
      <div class="modal-backdrop" :style="backdropStyle"></div>
      
      <div class="modal-content" :class="contentClasses">
        <!-- Enhanced Header -->
        <div class="modal-header">
          <div class="header-content">
            <div class="title-section">
              <div class="modal-icon">
                <i class="fas fa-user-shield"></i>
              </div>
              <div class="title-wrapper">
                <h1 id="login-title" class="modal-title">Welcome Back</h1>
                <p class="modal-subtitle">Sign in to your account to continue</p>
              </div>
            </div>
            <button 
              class="close-button" 
              @click="handleClose"
              :disabled="loading"
              aria-label="Close login modal"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <!-- Progress Bar -->
          <div v-if="loading" class="modal-progress">
            <div class="progress-bar indeterminate"></div>
          </div>
        </div>

        <!-- Enhanced Body -->
        <div class="modal-body">
          <form 
            @submit.prevent="handleLogin" 
            class="login-form"
            autocomplete="on" 
            novalidate
            ref="loginForm"
          >
            <!-- Email Field -->
            <div class="form-group" :class="{ 'has-error': errors.email }">
              <label for="loginEmail" class="form-label">
                Email Address
                <span class="required-asterisk">*</span>
              </label>
              <div class="input-wrapper">
                <i class="input-icon fas fa-envelope"></i>
                <input
                  type="email"
                  id="loginEmail"
                  v-model.trim="formData.email"
                  class="form-control"
                  placeholder="Enter your email address"
                  :class="{ 'is-invalid': errors.email, 'is-valid': fieldsTouched.email && !errors.email }"
                  required
                  autocomplete="email"
                  @blur="handleFieldBlur('email')"
                  @input="handleEmailInput"
                  :disabled="loading"
                  aria-describedby="email-error"
                >
                <div v-if="fieldsTouched.email && !errors.email && formData.email" class="valid-feedback">
                  <i class="fas fa-check"></i>
                </div>
              </div>
              <div v-if="errors.email" id="email-error" class="error-message" role="alert">
                <i class="fas fa-exclamation-circle"></i>
                {{ errors.email }}
              </div>
            </div>

            <!-- Password Field -->
            <div class="form-group" :class="{ 'has-error': errors.password }">
              <label for="loginPassword" class="form-label">
                Password
                <span class="required-asterisk">*</span>
              </label>
              <div class="input-wrapper">
                <i class="input-icon fas fa-lock"></i>
                <input
                  :type="showPassword ? 'text' : 'password'"
                  id="loginPassword"
                  v-model="formData.password"
                  class="form-control"
                  placeholder="Enter your password"
                  :class="{ 'is-invalid': errors.password, 'is-valid': fieldsTouched.password && !errors.password }"
                  required
                  autocomplete="current-password"
                  @blur="handleFieldBlur('password')"
                  @input="handlePasswordInput"
                  :disabled="loading"
                  aria-describedby="password-error password-strength"
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
              
              <!-- Password Strength Indicator -->
              <div v-if="formData.password && fieldsTouched.password" class="password-strength" id="password-strength">
                <div class="strength-meter">
                  <div 
                    class="strength-bar" 
                    :class="passwordStrength.class"
                    :style="{ width: passwordStrength.percentage + '%' }"
                  ></div>
                </div>
                <span class="strength-text">{{ passwordStrength.text }}</span>
              </div>
              
              <div v-if="errors.password" id="password-error" class="error-message" role="alert">
                <i class="fas fa-exclamation-circle"></i>
                {{ errors.password }}
              </div>
            </div>

            <!-- Options Row -->
            <div class="form-options">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="formData.rememberMe" 
                  :disabled="loading"
                  class="checkbox-input"
                >
                <span class="checkmark"></span>
                <span class="checkbox-text">Remember me for 30 days</span>
              </label>
              <button 
                type="button" 
                class="forgot-password-link" 
                @click="handleForgotPassword"
                :disabled="loading"
              >
                Forgot password?
              </button>
            </div>

            <!-- Error Display -->
            <transition name="slide-down">
              <div v-if="loginError" class="error-banner" role="alert">
                <div class="error-content">
                  <i class="fas fa-exclamation-triangle"></i>
                  <div class="error-details">
                    <strong>Login Failed</strong>
                    <p>{{ loginError }}</p>
                  </div>
                  <button 
                    type="button" 
                    class="error-close" 
                    @click="loginError = ''"
                    aria-label="Dismiss error"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </transition>

            <!-- Submit Button -->
            <button 
              type="submit" 
              class="submit-button" 
              :class="{ loading: loading, shake: submitError }"
              :disabled="loading || hasErrors"
              @animationend="submitError = false"
            >
              <span class="button-content">
                <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-sign-in-alt"></i>
                <span>{{ loading ? 'Signing In...' : 'Sign In' }}</span>
              </span>
              <div v-if="loading" class="button-progress"></div>
            </button>
          </form>

          <!-- Social Login -->
          <div class="social-login-section">
            <div class="divider">
              <span class="divider-text">or continue with</span>
            </div>
            <div class="social-buttons">
              <button 
                v-for="provider in socialProviders" 
                :key="provider.name"
                type="button" 
                class="social-button"
                :class="`social-${provider.name}`"
                @click="handleSocialLogin(provider.name)"
                :disabled="loading"
              >
                <i :class="provider.icon"></i>
                <span>{{ provider.label }}</span>
              </button>
            </div>
          </div>

          <!-- Registration Prompt -->
          <div class="registration-prompt">
            <p>Don't have an account? 
              <button 
                type="button" 
                class="registration-link" 
                @click="handleShowRegister"
                :disabled="loading"
              >
                Create an account
              </button>
            </p>
          </div>
        </div>

        <!-- Security Footer -->
        <div class="modal-footer">
          <div class="security-notice">
            <i class="fas fa-shield-alt"></i>
            <span>Your login is secured with SSL encryption</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, nextTick } from 'vue'

export default {
  name: 'AdvancedLoginModal',
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    initialEmail: {
      type: String,
      default: ''
    },
    autoFocus: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'dark', 'modern'].includes(value)
    }
  },
  emits: ['login', 'close', 'show-register', 'forgot-password', 'social-login'],
  setup(props, { emit }) {
    // Reactive Data
    const formData = ref({
      email: props.initialEmail,
      password: '',
      rememberMe: false
    })

    const errors = reactive({
      email: '',
      password: ''
    })

    const fieldsTouched = reactive({
      email: false,
      password: false
    })

    const loginError = ref('')
    const showPassword = ref(false)
    const submitError = ref(false)
    const loginForm = ref(null)

    // Computed Properties
    const hasErrors = computed(() => {
      return Object.values(errors).some(error => error !== '') || 
             !formData.value.email || 
             !formData.value.password
    })

    const passwordStrength = computed(() => {
      const password = formData.value.password
      if (!password) return { class: '', text: '', percentage: 0 }

      let strength = 0
      let text = 'Very Weak'
      let className = 'very-weak'

      // Length check
      if (password.length >= 8) strength += 25
      // Lowercase check
      if (/[a-z]/.test(password)) strength += 25
      // Uppercase check
      if (/[A-Z]/.test(password)) strength += 25
      // Number/Special char check
      if (/[0-9!@#$%^&*]/.test(password)) strength += 25

      if (strength >= 75) {
        text = 'Strong'
        className = 'strong'
      } else if (strength >= 50) {
        text = 'Medium'
        className = 'medium'
      } else if (strength >= 25) {
        text = 'Weak'
        className = 'weak'
      }

      return {
        class: className,
        text: text,
        percentage: strength
      }
    })

    const contentClasses = computed(() => ({
      [`theme-${props.theme}`]: true,
      'loading': props.loading,
      'has-error': loginError.value
    }))

    const backdropStyle = computed(() => ({
      backdropFilter: `blur(${props.loading ? '8px' : '4px'})`
    }))

    // Social Login Providers
    const socialProviders = [
      { name: 'google', label: 'Google', icon: 'fab fa-google' },
      { name: 'github', label: 'GitHub', icon: 'fab fa-github' },
      { name: 'twitter', label: 'Twitter', icon: 'fab fa-twitter' },
      { name: 'microsoft', label: 'Microsoft', icon: 'fab fa-microsoft' }
    ]

    // Methods
    const validateEmail = () => {
      const email = formData.value.email
      if (!email) {
        errors.email = 'Email address is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Please enter a valid email address'
      } else {
        errors.email = ''
      }
    }

    const validatePassword = () => {
      const password = formData.value.password
      if (!password) {
        errors.password = 'Password is required'
      } else if (password.length < 8) {
        errors.password = 'Password must be at least 8 characters'
      } else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
        errors.password = 'Password must contain both uppercase and lowercase letters'
      } else {
        errors.password = ''
      }
    }

    const handleFieldBlur = (field) => {
      fieldsTouched[field] = true
      if (field === 'email') validateEmail()
      if (field === 'password') validatePassword()
    }

    const handleEmailInput = () => {
      if (fieldsTouched.email) {
        validateEmail()
      }
      // Clear login error when user starts typing
      if (loginError.value) {
        loginError.value = ''
      }
    }

    const handlePasswordInput = () => {
      if (fieldsTouched.password) {
        validatePassword()
      }
      // Clear login error when user starts typing
      if (loginError.value) {
        loginError.value = ''
      }
    }

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value
    }

    const handleLogin = async () => {
      // Mark all fields as touched
      fieldsTouched.email = true
      fieldsTouched.password = true

      validateEmail()
      validatePassword()

      if (errors.email || errors.password) {
        submitError.value = true
        return
      }

      const loginData = {
        email: formData.value.email,
        password: formData.value.password,
        rememberMe: formData.value.rememberMe
      }

      emit('login', loginData)
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

    const handleForgotPassword = () => {
      if (!props.loading) {
        emit('forgot-password', formData.value.email)
      }
    }

    const handleShowRegister = () => {
      if (!props.loading) {
        emit('show-register')
      }
    }

    const handleSocialLogin = (provider) => {
      if (!props.loading) {
        emit('social-login', provider)
      }
    }

    const focusFirstField = () => {
      nextTick(() => {
        const firstInput = loginForm.value?.querySelector('input:not([type="hidden"])')
        if (firstInput) {
          firstInput.focus()
        }
      })
    }

    // Watch for loading state changes to handle errors
    watch(() => props.loading, (newLoading, oldLoading) => {
      if (oldLoading && !newLoading && loginError.value) {
        // Trigger shake animation when loading stops with error
        submitError.value = true
      }
    })

    // Initialize
    if (props.autoFocus) {
      focusFirstField()
    }
    //refresh all data all login refresh

    return {
      formData,
      errors,
      fieldsTouched,
      loginError,
      showPassword,
      submitError,
      loginForm,
      socialProviders,
      hasErrors,
      passwordStrength,
      contentClasses,
      backdropStyle,
      validateEmail,
      validatePassword,
      handleFieldBlur,
      handleEmailInput,
      handlePasswordInput,
      togglePasswordVisibility,
      handleLogin,
      handleClose,
      handleOverlayClick,
      handleForgotPassword,
      handleShowRegister,
      handleSocialLogin
    }
  }
}
</script>

<style scoped>
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
  max-width: 440px;
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
  transition: backdrop-filter 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  position: relative;
}

.modal-content.theme-dark {
  background: #1a1a1a;
  color: white;
}

.modal-content.theme-modern {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* Header Styles */
.modal-header {
  position: relative;
  padding: 2rem 2rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.theme-dark .modal-header {
  border-bottom-color: #333;
}

.theme-modern .modal-header {
  border-bottom-color: rgba(255, 255, 255, 0.2);
}

.header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.title-section {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  flex: 1;
}

.modal-icon {
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #007bff, #0056b3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.theme-modern .modal-icon {
  background: rgba(255, 255, 255, 0.2);
}

.title-wrapper {
  flex: 1;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
}

.modal-subtitle {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

.theme-dark .modal-subtitle {
  color: #ccc;
}

.theme-modern .modal-subtitle {
  color: rgba(255, 255, 255, 0.8);
}

.close-button {
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.close-button:hover:not(:disabled) {
  background: #e9ecef;
  color: #333;
}

.close-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.theme-dark .close-button {
  background: #333;
  color: #ccc;
}

.theme-dark .close-button:hover:not(:disabled) {
  background: #444;
  color: white;
}

.theme-modern .close-button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Progress Bar */
.modal-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #f0f0f0;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  animation: progress-indeterminate 1.5s infinite linear;
}

@keyframes progress-indeterminate {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Body Styles */
.modal-body {
  padding: 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Form Group Styles */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 0.25rem;
}

.theme-dark .form-label {
  color: #ccc;
}

.theme-modern .form-label {
  color: rgba(255, 255, 255, 0.9);
}

.required-asterisk {
  color: #dc3545;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: #999;
  z-index: 2;
  font-size: 1rem;
}

.theme-dark .input-icon {
  color: #666;
}

.theme-modern .input-icon {
  color: rgba(255, 255, 255, 0.7);
}

.form-control {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background: white;
  color: #333;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-control.is-invalid {
  border-color: #dc3545;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

.form-control.is-valid {
  border-color: #28a745;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
}

.form-control:disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.theme-dark .form-control {
  background: #2d2d2d;
  border-color: #444;
  color: white;
}

.theme-dark .form-control:focus {
  border-color: #007bff;
}

.theme-modern .form-control {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.theme-modern .form-control:focus {
  border-color: rgba(255, 255, 255, 0.4);
}

.theme-modern .form-control::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

/* Password Toggle */
.toggle-password {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  z-index: 2;
}

.toggle-password:hover:not(:disabled) {
  color: #666;
  background: #f8f9fa;
}

.toggle-password:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.theme-dark .toggle-password:hover:not(:disabled) {
  background: #333;
  color: #ccc;
}

/* Valid Feedback */
.valid-feedback {
  position: absolute;
  right: 3rem;
  color: #28a745;
  font-size: 0.9rem;
}

/* Password Strength */
.password-strength {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.strength-meter {
  flex: 1;
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
}

.strength-bar {
  height: 100%;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.strength-bar.very-weak { background: #dc3545; }
.strength-bar.weak { background: #fd7e14; }
.strength-bar.medium { background: #ffc107; }
.strength-bar.strong { background: #28a745; }

.strength-text {
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
  min-width: 60px;
}

.theme-dark .strength-text {
  color: #999;
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #dc3545;
  margin-top: 0.25rem;
}

/* Form Options */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #555;
}

.theme-dark .checkbox-label {
  color: #ccc;
}

.checkbox-input {
  display: none;
}

.checkmark {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;
}

.checkbox-input:checked + .checkmark {
  background: #007bff;
  border-color: #007bff;
}

.checkbox-input:checked + .checkmark::after {
  content: '✓';
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
}

.checkbox-input:disabled + .checkmark {
  opacity: 0.5;
  cursor: not-allowed;
}

.forgot-password-link {
  background: none;
  border: none;
  color: #007bff;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s ease;
}

.forgot-password-link:hover:not(:disabled) {
  color: #0056b3;
  text-decoration: underline;
}

.forgot-password-link:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Error Banner */
.error-banner {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  padding: 1rem;
  animation: slide-down 0.3s ease;
}

.theme-dark .error-banner {
  background: #2c1a1d;
  border-color: #842029;
}

.error-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.error-content i {
  color: #dc3545;
  font-size: 1.1rem;
  margin-top: 0.1rem;
}

.error-details {
  flex: 1;
}

.error-details strong {
  display: block;
  margin-bottom: 0.25rem;
  color: #721c24;
}

.theme-dark .error-details strong {
  color: #f8d7da;
}

.error-details p {
  margin: 0;
  font-size: 0.9rem;
  color: #721c24;
}

.theme-dark .error-details p {
  color: #f8d7da;
}

.error-close {
  background: none;
  border: none;
  color: #721c24;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.error-close:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* Submit Button */
.submit-button {
  position: relative;
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 123, 255, 0.3);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.submit-button.loading {
  pointer-events: none;
}

.submit-button.shake {
  animation: shake 0.5s ease-in-out;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  position: relative;
  z-index: 2;
}

.button-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  animation: button-progress 2s infinite;
}

@keyframes button-progress {
  0% { width: 0%; }
  50% { width: 100%; }
  100% { width: 0%; }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Social Login */
.social-login-section {
  margin: 2rem 0 1rem;
}

.divider {
  position: relative;
  text-align: center;
  margin: 1.5rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e9ecef;
}

.theme-dark .divider::before {
  background: #444;
}

.divider-text {
  background: white;
  padding: 0 1rem;
  color: #666;
  font-size: 0.9rem;
  position: relative;
  z-index: 1;
}

.theme-dark .divider-text {
  background: #1a1a1a;
  color: #999;
}

.theme-modern .divider-text {
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
}

.social-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.social-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: white;
  color: #333;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.social-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.social-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.social-google { border-color: #db4437; color: #db4437; }
.social-github { border-color: #333; color: #333; }
.social-twitter { border-color: #1da1f2; color: #1da1f2; }
.social-microsoft { border-color: #f25022; color: #f25022; }

.theme-dark .social-button {
  background: #2d2d2d;
  border-color: #444;
  color: #ccc;
}

/* Registration Prompt */
.registration-prompt {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.theme-dark .registration-prompt {
  border-top-color: #333;
}

.registration-prompt p {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
}

.theme-dark .registration-prompt p {
  color: #999;
}

.registration-link {
  background: none;
  border: none;
  color: #007bff;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s ease;
}

.registration-link:hover:not(:disabled) {
  color: #0056b3;
  text-decoration: underline;
}

.registration-link:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Footer */
.modal-footer {
  padding: 1.5rem 2rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.theme-dark .modal-footer {
  background: #2d2d2d;
  border-top-color: #444;
}

.security-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #666;
}

.theme-dark .security-notice {
  color: #999;
}

/* Animations */
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

@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 480px) {
  .modal-overlay {
    padding: 0.5rem;
  }
  
  .modal-header {
    padding: 1.5rem 1.5rem 1rem;
  }
  
  .modal-body {
    padding: 1.5rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .title-section {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .social-buttons {
    grid-template-columns: 1fr;
  }
  
  .modal-footer {
    padding: 1rem 1.5rem;
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>