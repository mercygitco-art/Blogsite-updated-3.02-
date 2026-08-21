<template>
  <teleport to="body">
    <transition-group 
      :name="transitionName" 
      :tag="containerTag"
      :class="containerClasses"
      @enter="onToastEnter"
      @leave="onToastLeave"
      ref="containerRef"
    >
      <div
        v-for="toast in visibleToasts"
        :key="toast.id"
        class="toast"
        :class="getToastClasses(toast)"
        :style="getToastStyles(toast)"
        @mouseenter="pauseToast(toast.id)"
        @mouseleave="resumeToast(toast.id)"
        @click="handleToastClick(toast)"
        @focusin="pauseToast(toast.id)"
        @focusout="resumeToast(toast.id)"
        role="alert"
        :aria-live="getAriaLive(toast.type)"
        :aria-atomic="true"
        :aria-describedby="`toast-message-${toast.id}`"
        :aria-labelledby="toast.title ? `toast-title-${toast.id}` : null"
        tabindex="0"
        ref="toastRefs"
      >
        <!-- Toast Icon -->
        <div class="toast-icon" :class="getIconClasses(toast)">
          <i :class="getToastIcon(toast.type)"></i>
          <div v-if="toast.loading" class="loading-spinner"></div>
        </div>

        <!-- Toast Content -->
        <div class="toast-content">
          <div class="toast-header" v-if="toast.title || toast.action">
            <strong :id="`toast-title-${toast.id}`" class="toast-title">{{ toast.title }}</strong>
            <button 
              v-if="toast.action" 
              class="toast-action-btn"
              @click.stop="handleActionClick(toast)"
              :aria-label="toast.action.label || 'Action'"
              :disabled="toast.loading"
            >
              {{ toast.action.label }}
            </button>
          </div>
          <div 
            :id="`toast-message-${toast.id}`" 
            class="toast-message" 
            v-html="renderMessage(toast.message)"
          ></div>
          <div v-if="toast.subtext" class="toast-subtext">{{ toast.subtext }}</div>
        </div>

        <!-- Toast Controls -->
        <div class="toast-controls">
          <button 
            v-if="toast.duration && showPauseButton"
            class="control-btn pause-btn"
            @click.stop="togglePause(toast.id)"
            :aria-label="isPaused(toast.id) ? 'Resume timer' : 'Pause timer'"
            :disabled="toast.loading"
          >
            <i :class="isPaused(toast.id) ? 'fas fa-play' : 'fas fa-pause'"></i>
          </button>
          <button 
            class="control-btn close-btn"
            @click.stop="closeToast(toast.id)"
            :aria-label="toast.closeLabel || 'Close notification'"
            :disabled="toast.loading"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Progress Bar -->
        <div 
          v-if="toast.duration && showProgressBar" 
          class="toast-progress"
          :class="getProgressClasses(toast)"
          role="progressbar"
          :aria-valuenow="getProgressValue(toast)"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div 
            class="progress-bar" 
            :style="getProgressStyle(toast)"
          ></div>
        </div>

        <!-- Countdown for time-sensitive toasts -->
        <div v-if="toast.countdown && toast.duration" class="toast-countdown">
          {{ formatCountdown(toast) }}
        </div>

        <!-- Custom content slot -->
        <div v-if="toast.customContent" class="toast-custom-content">
          <component 
            :is="toast.customContent.component" 
            v-bind="toast.customContent.props"
            v-on="toast.customContent.events"
          />
        </div>
      </div>
    </transition-group>
  </teleport>
</template>

<script>
import { nextTick, ref } from 'vue'

export default {
  name: 'AdvancedToastContainer',
  props: {
    toasts: {
      type: Array,
      default: () => []
    },
    position: {
      type: String,
      default: 'top-right',
      validator: (value) => [
        'top-right', 'top-left', 'bottom-right', 'bottom-left',
        'top-center', 'bottom-center', 'center'
      ].includes(value)
    },
    limit: {
      type: Number,
      default: 5
    },
    transition: {
      type: String,
      default: 'slide',
      validator: (value) => ['slide', 'fade', 'scale', 'bounce', 'zoom'].includes(value)
    },
    showProgressBar: {
      type: Boolean,
      default: true
    },
    showPauseButton: {
      type: Boolean,
      default: true
    },
    pauseOnHover: {
      type: Boolean,
      default: true
    },
    pauseOnFocusLoss: {
      type: Boolean,
      default: true
    },
    newestOnTop: {
      type: Boolean,
      default: true
    },
    containerTag: {
      type: String,
      default: 'div'
    },
    rtl: {
      type: Boolean,
      default: false
    },
    theme: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'dark', 'minimal', 'material', 'glass'].includes(value)
    },
    maxToasts: {
      type: Number,
      default: 10
    },
    autoRemove: {
      type: Boolean,
      default: true
    },
    removeDelay: {
      type: Number,
      default: 5000
    }
  },
  emits: ['close-toast', 'toast-click', 'action-click', 'toast-added', 'toast-removed', 'toast-paused', 'toast-resumed'],
  setup(props, { emit }) {
    const containerRef = ref(null)
    const toastRefs = ref([])
    
    return {
      containerRef,
      toastRefs
    }
  },
  data() {
    return {
      timers: {},
      pausedToasts: new Set(),
      toastHeights: {},
      toastStates: {},
      toastQueue: [],
      updateInterval: null
    }
  },
  computed: {
    visibleToasts() {
      const toasts = this.toasts.slice(0, this.limit)
      return this.newestOnTop ? toasts.reverse() : toasts
    },
    containerClasses() {
      return [
        'toast-container',
        `position-${this.position}`,
        `theme-${this.theme}`,
        {
          'rtl': this.rtl,
          'interactive': this.pauseOnHover,
          'has-toasts': this.visibleToasts.length > 0
        }
      ]
    },
    transitionName() {
      return `toast-${this.transition}`
    }
  },
  watch: {
    toasts: {
      handler(newToasts, oldToasts = []) {
        // Handle new toasts
        newToasts.forEach(toast => {
          if (!oldToasts.find(t => t.id === toast.id)) {
            this.setupToast(toast)
            this.$emit('toast-added', toast)
          }
        })

        // Clean up removed toasts
        oldToasts.forEach(toast => {
          if (!newToasts.find(t => t.id === toast.id)) {
            this.cleanupToast(toast.id)
            this.$emit('toast-removed', toast)
          }
        })
      },
      immediate: true,
      deep: true
    },
    position() {
      this.$nextTick(() => {
        this.updateContainerPosition()
      })
    }
  },
  mounted() {
    if (this.pauseOnFocusLoss) {
      document.addEventListener('visibilitychange', this.handleVisibilityChange)
    }
    window.addEventListener('beforeunload', this.cleanupAllToasts)
    window.addEventListener('resize', this.handleResize)
    
    // Start update interval for progress bars and countdowns
    this.updateInterval = setInterval(() => {
      this.$forceUpdate()
    }, 100)
  },
  beforeUnmount() {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    window.removeEventListener('beforeunload', this.cleanupAllToasts)
    window.removeEventListener('resize', this.handleResize)
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }
    
    this.cleanupAllToasts()
  },
  methods: {
    getToastClasses(toast) {
      return [
        `type-${toast.type}`,
        `variant-${toast.variant || 'default'}`,
        {
          'interactive': toast.clickable,
          'loading': toast.loading,
          'paused': this.isPaused(toast.id),
          'has-action': !!toast.action,
          'has-title': !!toast.title,
          'has-subtext': !!toast.subtext,
          'has-custom-content': !!toast.customContent,
          'dismissed': toast.dismissed
        }
      ]
    },

    getToastStyles(toast) {
      const styles = {
        '--toast-index': this.getToastIndex(toast.id)
      }
      
      if (toast.backgroundColor) {
        styles.backgroundColor = toast.backgroundColor
      }
      if (toast.color) {
        styles.color = toast.color
      }
      if (toast.width) {
        styles.width = toast.width
      }
      if (toast.height) {
        styles.height = toast.height
      }
      if (toast.zIndex) {
        styles.zIndex = toast.zIndex
      }
      
      return styles
    },

    getToastIndex(id) {
      return this.visibleToasts.findIndex(toast => toast.id === id)
    },

    getToastIcon(type) {
      const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle',
        warning: 'fas fa-exclamation-triangle',
        loading: 'fas fa-circle-notch fa-spin'
      }
      return icons[type] || icons.info
    },

    getIconClasses(toast) {
      return [
        `icon-${toast.type}`,
        {
          'pulse': toast.pulse && !toast.loading,
          'spin': toast.loading,
          'animated': toast.animateIcon
        }
      ]
    },

    getProgressClasses(toast) {
      return [
        `progress-${toast.type}`,
        {
          'paused': this.isPaused(toast.id),
          'indeterminate': toast.loading
        }
      ]
    },

    getProgressValue(toast) {
      const timer = this.timers[toast.id]
      if (!timer || !toast.duration) return 0

      let progress
      if (this.isPaused(toast.id)) {
        progress = (timer.remaining / toast.duration) * 100
      } else {
        const elapsed = Date.now() - timer.start
        progress = (elapsed / toast.duration) * 100
      }

      return Math.max(0, Math.min(100, 100 - progress))
    },

    getProgressStyle(toast) {
      const progressValue = this.getProgressValue(toast)
      return {
        width: `${progressValue}%`,
        transition: this.isPaused(toast.id) ? 'none' : 'width 0.1s linear'
      }
    },

    getAriaLive(type) {
      const priorityTypes = ['error', 'warning']
      return priorityTypes.includes(type) ? 'assertive' : 'polite'
    },

    renderMessage(message) {
      if (typeof message === 'string') {
        // Enhanced XSS protection and formatting
        return message
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
          .replace(/\n/g, '<br>')
          .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
      }
      return message
    },

    setupToast(toast) {
      // Set default values
      const toastConfig = {
        duration: 5000,
        autoClose: true,
        closeOnClick: false,
        ...toast
      }

      if (toastConfig.duration && toastConfig.duration > 0 && toastConfig.autoClose) {
        this.timers[toastConfig.id] = {
          timeout: setTimeout(() => {
            this.closeToast(toastConfig.id)
          }, toastConfig.duration),
          start: Date.now(),
          remaining: toastConfig.duration,
          duration: toastConfig.duration
        }
      }

      // Initialize toast state
      this.toastStates[toastConfig.id] = {
        paused: false,
        progress: 0,
        createdAt: Date.now()
      }

      // Play sound if specified
      if (toastConfig.sound) {
        this.playSound(toastConfig.sound)
      }

      // Vibrate if supported and specified
      if (toastConfig.vibrate && 'vibrate' in navigator) {
        navigator.vibrate(toastConfig.vibrate)
      }

      // Auto-remove if configured
      if (this.autoRemove && toastConfig.duration === 0) {
        setTimeout(() => {
          if (this.toasts.find(t => t.id === toastConfig.id)) {
            this.closeToast(toastConfig.id)
          }
        }, this.removeDelay)
      }

      // Focus management for accessibility
      this.$nextTick(() => {
        if (toastConfig.autoFocus) {
          this.focusToast(toastConfig.id)
        }
      })
    },

    cleanupToast(id) {
      if (this.timers[id]) {
        clearTimeout(this.timers[id].timeout)
        delete this.timers[id]
      }
      this.pausedToasts.delete(id)
      delete this.toastStates[id]
    },

    cleanupAllToasts() {
      Object.keys(this.timers).forEach(id => {
        clearTimeout(this.timers[id].timeout)
      })
      this.timers = {}
      this.pausedToasts.clear()
      this.toastStates = {}
      this.toastQueue = []
    },

    closeToast(id) {
      // Mark toast as dismissed for animation
      const toast = this.toasts.find(t => t.id === id)
      if (toast) {
        toast.dismissed = true
      }
      
      // Wait for animation to complete before emitting
      setTimeout(() => {
        this.$emit('close-toast', id)
      }, 300)
    },

    closeAllToasts() {
      this.visibleToasts.forEach(toast => {
        this.closeToast(toast.id)
      })
    },

    pauseToast(id) {
      if (!this.pauseOnHover || !this.timers[id]) return

      const timer = this.timers[id]
      if (!this.isPaused(id)) {
        clearTimeout(timer.timeout)
        timer.remaining -= Date.now() - timer.start
        this.pausedToasts.add(id)
        
        // Update toast state
        if (this.toastStates[id]) {
          this.toastStates[id].paused = true
        }

        this.$emit('toast-paused', id)
      }
    },

    resumeToast(id) {
      if (!this.pauseOnHover || !this.timers[id]) return

      const timer = this.timers[id]
      if (this.isPaused(id)) {
        timer.start = Date.now()
        timer.timeout = setTimeout(() => {
          this.closeToast(id)
        }, timer.remaining)
        this.pausedToasts.delete(id)
        
        // Update toast state
        if (this.toastStates[id]) {
          this.toastStates[id].paused = false
        }

        this.$emit('toast-resumed', id)
      }
    },

    togglePause(id) {
      if (this.isPaused(id)) {
        this.resumeToast(id)
      } else {
        this.pauseToast(id)
      }
    },

    isPaused(id) {
      return this.pausedToasts.has(id)
    },

    handleToastClick(toast) {
      if (toast.clickable && toast.onClick) {
        toast.onClick(toast)
      }
      
      if (toast.closeOnClick) {
        this.closeToast(toast.id)
      }
      
      this.$emit('toast-click', toast)
    },

    handleActionClick(toast) {
      if (toast.action && toast.action.handler) {
        toast.action.handler(toast)
      }
      
      if (toast.action && toast.action.closeOnClick) {
        this.closeToast(toast.id)
      }
      
      this.$emit('action-click', toast)
    },

    handleVisibilityChange() {
      if (document.hidden) {
        // Pause all timers when page is not visible
        Object.keys(this.timers).forEach(id => {
          if (!this.isPaused(id)) {
            this.pauseToast(id)
          }
        })
      } else {
        // Resume all timers when page becomes visible
        Object.keys(this.timers).forEach(id => {
          if (this.isPaused(id)) {
            this.resumeToast(id)
          }
        })
      }
    },

    handleResize() {
      // Recalculate toast heights on resize
      this.$nextTick(() => {
        this.updateToastHeights()
      })
    },

    formatCountdown(toast) {
      const timer = this.timers[toast.id]
      if (!timer) return ''

      const remaining = this.isPaused(toast.id) 
        ? timer.remaining 
        : timer.remaining - (Date.now() - timer.start)
      
      const seconds = Math.ceil(remaining / 1000)
      return `${seconds}s`
    },

    playSound(sound) {
      try {
        if (typeof sound === 'string') {
          const audio = new Audio(sound)
          audio.volume = 0.3
          audio.play().catch(() => {
            // Silent fail for audio playback errors
          })
        } else if (sound && typeof sound.play === 'function') {
          sound.play().catch(() => {
            // Silent fail for audio playback errors
          })
        }
      } catch (error) {
        console.warn('Failed to play toast sound:', error)
      }
    },

    onToastEnter(el) {
      nextTick(() => {
        const height = el.offsetHeight
        const toast = this.visibleToasts.find(t => 
          el.__vueParentComponent?.ctx?.toast?.id === t.id
        )
        
        if (toast) {
          this.toastHeights[toast.id] = height
          el.style.setProperty('--toast-height', `${height}px`)
          el.style.setProperty('--enter-animation', 'slideInUp 0.4s ease-out')
        }
      })
    },

    onToastLeave(el) {
      const toast = this.visibleToasts.find(t => 
        el.__vueParentComponent?.ctx?.toast?.id === t.id
      )
      
      if (toast) {
        delete this.toastHeights[toast.id]
        el.style.setProperty('--leave-animation', 'slideOutDown 0.3s ease-in')
      }
    },

    updateContainerPosition() {
      // Ensure container is properly positioned
      if (this.containerRef) {
        const container = this.containerRef.$el || this.containerRef
        container.style.cssText = ''
      }
    },

    updateToastHeights() {
      this.$nextTick(() => {
        this.toastRefs.forEach((toastEl, index) => {
          if (toastEl && toastEl.offsetHeight) {
            const toast = this.visibleToasts[index]
            if (toast) {
              this.toastHeights[toast.id] = toastEl.offsetHeight
            }
          }
        })
      })
    },

    focusToast(id) {
      this.$nextTick(() => {
        const toastIndex = this.visibleToasts.findIndex(toast => toast.id === id)
        if (toastIndex !== -1 && this.toastRefs[toastIndex]) {
          this.toastRefs[toastIndex].focus()
        }
      })
    },

    // Public API methods
    addToast(toast) {
      this.$emit('update:toasts', [...this.toasts, toast])
    },

    removeToast(id) {
      this.$emit('update:toasts', this.toasts.filter(toast => toast.id !== id))
    },

    updateToast(id, updates) {
      this.$emit('update:toasts', this.toasts.map(toast => 
        toast.id === id ? { ...toast, ...updates } : toast
      ))
    },

    getToast(id) {
      return this.toasts.find(toast => toast.id === id)
    },

    // Queue management
    enqueueToast(toast) {
      this.toastQueue.push(toast)
      this.processQueue()
    },

    processQueue() {
      if (this.toasts.length < this.maxToasts && this.toastQueue.length > 0) {
        const toast = this.toastQueue.shift()
        this.addToast(toast)
        this.processQueue()
      }
    }
  }
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: none;
  padding: 1rem;
  max-width: 100vw;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

/* Position Variants */
.position-top-right {
  top: 0;
  right: 0;
  align-items: flex-end;
}

.position-top-left {
  top: 0;
  left: 0;
  align-items: flex-start;
}

.position-bottom-right {
  bottom: 0;
  right: 0;
  align-items: flex-end;
}

.position-bottom-left {
  bottom: 0;
  left: 0;
  align-items: flex-start;
}

.position-top-center {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  align-items: center;
}

.position-bottom-center {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  align-items: center;
}

.position-center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  align-items: center;
}

/* Toast Base Styles */
.toast {
  min-width: 300px;
  max-width: 450px;
  background: var(--toast-bg, #fff);
  color: var(--toast-color, #333);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: flex-start;
  padding: 1rem 1rem 1rem 1.25rem;
  position: relative;
  pointer-events: auto;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--toast-border, #e9ecef);
  overflow: hidden;
  animation: var(--enter-animation, none);
}

.toast:focus {
  outline: 2px solid var(--toast-focus-color, #007bff);
  outline-offset: 2px;
}

.toast.interactive {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.toast.interactive:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.toast.dismissed {
  animation: var(--leave-animation, slideOutDown 0.3s ease-in) !important;
}

/* Toast Icon */
.toast-icon {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  margin-top: 0.125rem;
  flex-shrink: 0;
  position: relative;
}

.toast-icon.pulse {
  animation: pulse 2s infinite;
}

.toast-icon.spin i {
  animation: spin 1s linear infinite;
}

.toast-icon.animated {
  animation: bounce 0.6s ease;
}

.icon-success {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.icon-error {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.icon-info {
  background: rgba(33, 150, 243, 0.1);
  color: #2196f3;
}

.icon-warning {
  background: rgba(255, 152, 0, 0.1);
  color: #ff9800;
}

.icon-loading {
  background: rgba(158, 158, 158, 0.1);
  color: #9e9e9e;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  position: absolute;
}

/* Toast Content */
.toast-content {
  flex: 1;
  min-width: 0;
  padding-right: 0.5rem;
}

.toast-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.25rem;
  gap: 0.5rem;
}

.toast-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--toast-title-color, #1a1a1a);
  line-height: 1.3;
  margin: 0;
}

.toast-action-btn {
  background: transparent;
  border: 1px solid var(--toast-action-border, #007bff);
  color: var(--toast-action-color, #007bff);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.toast-action-btn:hover:not(:disabled) {
  background: var(--toast-action-bg-hover, #007bff);
  color: white;
}

.toast-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toast-message {
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--toast-message-color, #666);
  word-wrap: break-word;
}

.toast-message :deep(br) {
  content: '';
  display: block;
  margin: 0.25rem 0;
}

.toast-subtext {
  font-size: 0.75rem;
  color: var(--toast-subtext-color, #999);
  margin-top: 0.25rem;
  line-height: 1.3;
}

.toast-custom-content {
  margin-top: 0.5rem;
  width: 100%;
}

/* Toast Controls */
.toast-controls {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-left: 0.5rem;
  flex-shrink: 0;
}

.control-btn {
  width: 1.75rem;
  height: 1.75rem;
  border: none;
  background: transparent;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--toast-control-color, #999);
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.control-btn:hover:not(:disabled) {
  background: var(--toast-control-bg-hover, rgba(0, 0, 0, 0.05));
  color: var(--toast-control-color-hover, #666);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Progress Bar */
.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--toast-progress-bg, rgba(0, 0, 0, 0.1));
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  transition: width 0.1s linear;
  border-radius: 0 2px 2px 0;
}

.progress-bar.paused {
  animation: pulse-opacity 2s infinite;
}

.progress-bar.indeterminate {
  animation: indeterminate 2s linear infinite;
  width: 50% !important;
}

.progress-success { background: #4caf50; }
.progress-error { background: #f44336; }
.progress-info { background: #2196f3; }
.progress-warning { background: #ff9800; }
.progress-loading { background: #9e9e9e; }

/* Countdown */
.toast-countdown {
  position: absolute;
  top: 0.5rem;
  right: 3rem;
  font-size: 0.7rem;
  color: var(--toast-countdown-color, #999);
  font-weight: 500;
}

/* Theme Variants */
.theme-dark .toast {
  --toast-bg: #1a1a1a;
  --toast-color: #fff;
  --toast-border: #333;
  --toast-title-color: #fff;
  --toast-message-color: #ccc;
  --toast-subtext-color: #999;
  --toast-control-bg-hover: rgba(255, 255, 255, 0.1);
  --toast-control-color: #999;
  --toast-control-color-hover: #fff;
  --toast-progress-bg: rgba(255, 255, 255, 0.2);
  --toast-focus-color: #4dabf7;
}

.theme-minimal .toast {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--toast-border, #f0f0f0);
  background: var(--toast-bg, #fafafa);
}

.theme-material .toast {
  border-radius: 4px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
}

.theme-glass .toast {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.theme-glass.theme-dark .toast {
  background: rgba(26, 26, 26, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* RTL Support */
.toast-container.rtl {
  direction: rtl;
}

.toast-container.rtl .toast-icon {
  margin-right: 0;
  margin-left: 0.75rem;
}

.toast-container.rtl .toast-content {
  padding-right: 0;
  padding-left: 0.5rem;
}

.toast-container.rtl .toast-controls {
  margin-left: 0;
  margin-right: 0.5rem;
}

.toast-container.rtl .toast-countdown {
  right: auto;
  left: 3rem;
}

.toast-container.rtl .progress-bar {
  border-radius: 2px 0 0 2px;
}

/* Animations */
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% { transform: scale(1); }
  40%, 43% { transform: scale(1.1); }
  70% { transform: scale(1.05); }
  90% { transform: scale(1.02); }
}

@keyframes pulse-opacity {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@keyframes indeterminate {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translate3d(0, 100%, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes slideOutDown {
  from {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
  to {
    opacity: 0;
    transform: translate3d(0, 100%, 0);
  }
}

/* Transition Animations */
.toast-slide-enter-active {
  animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-slide-leave-active {
  animation: slideOutDown 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}

.toast-fade-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.toast-scale-enter-active,
.toast-scale-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-scale-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.toast-scale-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.toast-bounce-enter-active {
  animation: bounce-in 0.5s;
}

.toast-bounce-leave-active {
  animation: bounce-out 0.5s;
}

.toast-zoom-enter-active {
  animation: zoomIn 0.3s ease-out;
}

.toast-zoom-leave-active {
  animation: zoomOut 0.3s ease-in;
}

@keyframes bounce-in {
  0% { transform: scale(0); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes bounce-out {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(0); }
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale3d(0.3, 0.3, 0.3);
  }
  50% {
    opacity: 1;
  }
}

@keyframes zoomOut {
  from {
    opacity: 1;
  }
  50% {
    opacity: 0;
    transform: scale3d(0.3, 0.3, 0.3);
  }
  to {
    opacity: 0;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .toast-container {
    padding: 0.75rem;
    gap: 0.5rem;
  }

  .toast {
    min-width: unset;
    width: calc(100vw - 1.5rem);
    max-width: 400px;
    padding: 0.875rem 0.875rem 0.875rem 1rem;
  }

  .position-top-center,
  .position-bottom-center {
    left: 0;
    right: 0;
    transform: none;
    align-items: stretch;
  }

  .toast-content {
    padding-right: 0.25rem;
  }

  .toast-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .toast-action-btn {
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .toast-container {
    padding: 0.5rem;
  }

  .toast {
    width: calc(100vw - 1rem);
    padding: 0.75rem;
  }

  .toast-icon {
    width: 1.25rem;
    height: 1.25rem;
    margin-right: 0.5rem;
  }

  .toast-controls {
    margin-left: 0.25rem;
  }

  .control-btn {
    width: 1.5rem;
    height: 1.5rem;
  }
}

/* High Contrast Support */
@media (prefers-contrast: high) {
  .toast {
    border: 2px solid currentColor;
  }

  .toast-icon {
    background: transparent !important;
    border: 1px solid currentColor;
  }

  .progress-bar {
    border: 1px solid currentColor;
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .toast {
    transition: opacity 0.3s ease;
  }

  .toast-slide-enter-active,
  .toast-slide-leave-active,
  .toast-fade-enter-active,
  .toast-fade-leave-active,
  .toast-scale-enter-active,
  .toast-scale-leave-active,
  .toast-zoom-enter-active,
  .toast-zoom-leave-active {
    transition: opacity 0.3s ease;
    animation: none;
  }

  .toast-slide-enter-from,
  .toast-slide-leave-to,
  .toast-fade-enter-from,
  .toast-fade-leave-to,
  .toast-scale-enter-from,
  .toast-scale-leave-to {
    transform: none;
  }

  .toast-bounce-enter-active,
  .toast-bounce-leave-active {
    animation: none;
  }

  .toast-icon.pulse,
  .toast-icon.spin i,
  .loading-spinner,
  .toast-icon.animated {
    animation: none;
  }

  .progress-bar.paused,
  .progress-bar.indeterminate {
    animation: none;
  }
}

/* Print Styles */
@media print {
  .toast-container {
    display: none !important;
  }
}
</style>