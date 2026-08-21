import { ref } from 'vue'

export function useToast() {
    const toasts = ref([])
    let toastCounter = 0

    // Default options for toasts
    const defaultOptions = {
        type: 'info',           // info, success, warning, error, loading
        duration: 4000,         // ms (0 for persistent)
        dismissible: true,      // can be closed by user
        position: 'top-right',  // top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
        onClose: null,          // callback when toast closes
        onAction: null,         // callback when action button is clicked
        actionText: null,       // text for action button
        icon: null,             // custom icon name or component
        title: null,            // optional title for the toast
        progress: false,        // show progress bar
        pauseOnHover: true,     // pause timer when hovered
        closeButton: true,      // show close button
        rich: false,            // allow HTML content
        transition: 'fade',     // fade, slide, scale, bounce
        group: null,            // group toasts together
        max: 5,                 // maximum toasts to show at once
        queue: false            // queue toasts when max is reached
    }

    // Show a toast with flexible options
    const showToast = (message, options = {}) => {
        const id = toastCounter++
        const opts = { ...defaultOptions, ...options }
        
        // Check if we've reached the maximum number of toasts
        if (opts.max > 0 && toasts.value.length >= opts.max) {
            if (opts.queue) {
                // Queue the toast to show later
                setTimeout(() => showToast(message, options), 500)
                return id
            } else {
                // Remove the oldest toast
                closeToast(toasts.value[0].id)
            }
        }

        const toast = {
            id,
            message,
            type: opts.type,
            title: opts.title,
            show: true,
            dismissible: opts.dismissible,
            position: opts.position,
            onClose: opts.onClose,
            onAction: opts.onAction,
            actionText: opts.actionText,
            icon: opts.icon,
            progress: opts.progress,
            pauseOnHover: opts.pauseOnHover,
            closeButton: opts.closeButton,
            rich: opts.rich,
            transition: opts.transition,
            group: opts.group,
            duration: opts.duration,
            progressWidth: '100%',
            timer: null,
            paused: false,
            remainingTime: opts.duration,
            startTime: Date.now()
        }

        toasts.value.push(toast)

        // Auto-hide after duration if not persistent
        if (opts.duration > 0) {
            startTimer(toast)
        }

        return id
    }

    // Start the auto-close timer for a toast
    const startTimer = (toast) => {
        if (toast.timer) {
            clearTimeout(toast.timer)
        }

        toast.timer = setTimeout(() => {
            if (!toast.paused) {
                closeToast(toast.id)
            }
        }, toast.remainingTime)
    }

    // Pause a toast's timer (on hover)
    const pauseToast = (id) => {
        const toast = toasts.value.find(t => t.id === id)
        if (toast && toast.duration > 0 && !toast.paused && toast.timer) {
            clearTimeout(toast.timer)
            toast.paused = true
            toast.remainingTime = toast.duration - (Date.now() - toast.startTime)
        }
    }

    // Resume a toast's timer
    const resumeToast = (id) => {
        const toast = toasts.value.find(t => t.id === id)
        if (toast && toast.duration > 0 && toast.paused) {
            toast.paused = false
            toast.startTime = Date.now()
            startTimer(toast)
        }
    }

    // Update toast progress (useful for loading states)
    const updateToastProgress = (id, progress) => {
        const toast = toasts.value.find(t => t.id === id)
        if (toast) {
            toast.progressWidth = `${progress}%`
        }
    }

    // Close a toast by id
    const closeToast = (id) => {
        const index = toasts.value.findIndex(t => t.id === id)
        if (index !== -1) {
            const toast = toasts.value[index]
            
            // Clear any existing timer
            if (toast.timer) {
                clearTimeout(toast.timer)
            }

            // Start close animation
            toast.show = false
            
            // Remove from array after animation
            setTimeout(() => {
                const currentIndex = toasts.value.findIndex(t => t.id === id)
                if (currentIndex !== -1) {
                    const removedToast = toasts.value[currentIndex]
                    toasts.value.splice(currentIndex, 1)
                    
                    // Call onClose callback if provided
                    if (removedToast && typeof removedToast.onClose === 'function') {
                        removedToast.onClose()
                    }
                }
            }, 300)
        }
    }

    // Close all toasts
    const closeAllToasts = (position = null) => {
        const toastsToClose = position 
            ? toasts.value.filter(t => t.position === position)
            : toasts.value.slice() // copy array
        
        toastsToClose.forEach(toast => closeToast(toast.id))
    }

    // Close all toasts in a specific group
    const closeGroup = (groupName) => {
        toasts.value
            .filter(t => t.group === groupName)
            .forEach(toast => closeToast(toast.id))
    }

    // Update an existing toast
    const updateToast = (id, updates) => {
        const toast = toasts.value.find(t => t.id === id)
        if (toast) {
            Object.assign(toast, updates)
            
            // Restart timer if duration changed
            if (updates.duration !== undefined && updates.duration > 0) {
                if (toast.timer) {
                    clearTimeout(toast.timer)
                }
                toast.remainingTime = updates.duration
                toast.startTime = Date.now()
                startTimer(toast)
            }
        }
    }

    // Helper methods for common types
    const success = (msg, opts = {}) => showToast(msg, { ...opts, type: 'success' })
    const error = (msg, opts = {}) => showToast(msg, { ...opts, type: 'error' })
    const warning = (msg, opts = {}) => showToast(msg, { ...opts, type: 'warning' })
    const info = (msg, opts = {}) => showToast(msg, { ...opts, type: 'info' })
    const loading = (msg, opts = {}) => showToast(msg, { 
        ...opts, 
        type: 'loading', 
        duration: 0, 
        dismissible: false 
    })

    // Promise-based toast for async operations
    const promise = async (promise, messages, opts = {}) => {
        const { 
            loading = 'Loading...',
            success = 'Success!',
            error = 'Something went wrong'
        } = typeof messages === 'string' ? { loading: messages } : messages

        const toastId = showToast(loading, { 
            ...opts, 
            type: 'loading', 
            duration: 0,
            dismissible: false 
        })

        try {
            const result = await promise
            updateToast(toastId, {
                message: typeof success === 'function' ? success(result) : success,
                type: 'success',
                duration: 4000,
                dismissible: true
            })
            return result
        } catch (err) {
            updateToast(toastId, {
                message: typeof error === 'function' ? error(err) : error,
                type: 'error',
                duration: 5000,
                dismissible: true
            })
            throw err
        }
    }

    // Get toasts by position
    const getToastsByPosition = (position) => {
        return toasts.value.filter(t => t.position === position)
    }

    // Check if any toasts exist for a position
    const hasToasts = (position = null) => {
        return position 
            ? toasts.value.some(t => t.position === position)
            : toasts.value.length > 0
    }

    return {
        toasts,
        showToast,
        closeToast,
        closeAllToasts,
        closeGroup,
        updateToast,
        updateToastProgress,
        pauseToast,
        resumeToast,
        success,
        error,
        warning,
        info,
        loading,
        promise,
        getToastsByPosition,
        hasToasts
    }
}