<template>
    <teleport to="body">
        <transition
            name="modal-transition"
            @enter="onEnter"
            @after-enter="onAfterEnter"
            @before-leave="onBeforeLeave"
            @after-leave="onAfterLeave"
        >
            <div
                v-if="show"
                class="modal-overlay"
                :class="overlayClasses"
                @click.self="handleOverlayClick"
                @keydown="handleKeydown"
                role="dialog"
                :aria-modal="true"
                :aria-labelledby="titleId"
                :aria-describedby="descriptionId"
                ref="overlay"
            >
                <div
                    class="modal-container"
                    :style="containerStyles"
                    ref="modalContainer"
                    tabindex="-1"
                >
                    <!-- Backdrop blur effect -->
                    <div class="modal-backdrop" :style="backdropStyle"></div>
                    
                    <!-- Modal content -->
                    <div
                        class="modal-content"
                        :class="contentClasses"
                        ref="modalContent"
                    >
                        <!-- Header with enhanced styling -->
                        <div class="modal-header" v-if="showHeader">
                            <div class="header-content">
                                <div class="title-section">
                                    <div v-if="icon" class="modal-icon">
                                        <i :class="icon"></i>
                                    </div>
                                    <div class="title-wrapper">
                                        <h2 :id="titleId" class="modal-title">
                                            {{ title }}
                                        </h2>
                                        <p
                                            v-if="description"
                                            :id="descriptionId"
                                            class="modal-description"
                                        >
                                            {{ description }}
                                        </p>
                                    </div>
                                </div>
                                
                                <div class="header-actions">
                                    <slot name="header-actions"></slot>
                                    <button
                                        v-if="closable"
                                        class="close-button"
                                        @click="handleClose"
                                        :aria-label="closeAriaLabel"
                                        :disabled="loading"
                                        ref="closeButton"
                                    >
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Progress bar for loading state -->
                            <div
                                v-if="loading"
                                class="modal-progress"
                            >
                                <div
                                    class="progress-bar"
                                    :class="{ 'indeterminate': loading === true }"
                                    :style="progressStyle"
                                ></div>
                            </div>
                        </div>

                        <!-- Body with scroll management -->
                        <div
                            class="modal-body"
                            :class="{ 'no-padding': noPadding }"
                            ref="modalBody"
                            @scroll="handleBodyScroll"
                        >
                            <div class="body-content">
                                <slot></slot>
                                
                                <!-- Loading state for body content -->
                                <div v-if="loading" class="body-loading-overlay">
                                    <div class="loading-spinner">
                                        <i class="fas fa-spinner fa-spin"></i>
                                        <span>Loading...</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Scroll shadows -->
                            <div
                                v-if="showScrollShadow"
                                class="scroll-shadow top"
                                :class="{ visible: showTopShadow }"
                            ></div>
                            <div
                                v-if="showScrollShadow"
                                class="scroll-shadow bottom"
                                :class="{ visible: showBottomShadow }"
                            ></div>
                        </div>

                        <!-- Enhanced footer with flexible layout -->
                        <div
                            v-if="$slots.footer || showDefaultFooter"
                            class="modal-footer"
                            :class="footerClasses"
                        >
                            <slot name="footer">
                                <div
                                    v-if="showDefaultFooter"
                                    class="default-footer"
                                >
                                    <button
                                        v-if="secondaryActionText"
                                        class="btn btn-secondary"
                                        @click="handleSecondaryAction"
                                        :disabled="loading"
                                        :aria-label="secondaryActionAriaLabel"
                                        ref="secondaryButton"
                                    >
                                        {{ secondaryActionText }}
                                    </button>
                                    <button
                                        class="btn btn-primary"
                                        @click="handlePrimaryAction"
                                        :disabled="loading"
                                        :aria-label="primaryActionAriaLabel"
                                        :class="{ 'loading': loading }"
                                        ref="primaryButton"
                                    >
                                        <span class="btn-content">
                                            <i
                                                v-if="loading"
                                                class="fas fa-spinner fa-spin"
                                            ></i>
                                            {{ primaryActionText }}
                                        </span>
                                    </button>
                                </div>
                            </slot>
                        </div>

                        <!-- Drag handle for draggable modals -->
                        <div
                            v-if="draggable"
                            class="drag-handle"
                            @mousedown="startDrag"
                            @touchstart="startDrag"
                            :title="dragHandleTitle"
                        ></div>

                        <!-- Resize handles -->
                        <div
                            v-if="resizable"
                            class="resize-handles"
                        >
                            <div class="resize-handle resize-handle-t" @mousedown="startResize('t')"></div>
                            <div class="resize-handle resize-handle-r" @mousedown="startResize('r')"></div>
                            <div class="resize-handle resize-handle-b" @mousedown="startResize('b')"></div>
                            <div class="resize-handle resize-handle-l" @mousedown="startResize('l')"></div>
                            <div class="resize-handle resize-handle-tr" @mousedown="startResize('tr')"></div>
                            <div class="resize-handle resize-handle-br" @mousedown="startResize('br')"></div>
                            <div class="resize-handle resize-handle-bl" @mousedown="startResize('bl')"></div>
                            <div class="resize-handle resize-handle-tl" @mousedown="startResize('tl')"></div>
                        </div>
                    </div>
                </div>

                <!-- Multiple modal backdrop -->
                <div
                    v-if="multiModal"
                    class="multi-modal-backdrop"
                    :style="multiBackdropStyle"
                ></div>
            </div>
        </transition>
    </teleport>
</template>

<script>
import { nextTick } from 'vue'

export default {
    name: 'AdvancedModal',
    props: {
        show: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: ''
        },
        description: {
            type: String,
            default: ''
        },
        icon: {
            type: String,
            default: ''
        },
        width: {
            type: String,
            default: '500px'
        },
        height: {
            type: String,
            default: 'auto'
        },
        maxHeight: {
            type: String,
            default: '80vh'
        },
        minWidth: {
            type: String,
            default: '300px'
        },
        minHeight: {
            type: String,
            default: '200px'
        },
        closeOnEsc: {
            type: Boolean,
            default: true
        },
        closeOnOverlay: {
            type: Boolean,
            default: true
        },
        closable: {
            type: Boolean,
            default: true
        },
        showHeader: {
            type: Boolean,
            default: true
        },
        noPadding: {
            type: Boolean,
            default: false
        },
        loading: {
            type: [Boolean, Number],
            default: false
        },
        overlayBlur: {
            type: String,
            default: '8px'
        },
        overlayOpacity: {
            type: Number,
            default: 0.5
        },
        theme: {
            type: String,
            default: 'default',
            validator: (value) => ['default', 'dark', 'danger', 'warning', 'success'].includes(value)
        },
        position: {
            type: String,
            default: 'center',
            validator: (value) => ['center', 'top', 'bottom', 'left', 'right'].includes(value)
        },
        animation: {
            type: String,
            default: 'scale',
            validator: (value) => ['scale', 'slide', 'fade', 'none'].includes(value)
        },
        draggable: {
            type: Boolean,
            default: false
        },
        resizable: {
            type: Boolean,
            default: false
        },
        showDefaultFooter: {
            type: Boolean,
            default: false
        },
        primaryActionText: {
            type: String,
            default: 'Confirm'
        },
        secondaryActionText: {
            type: String,
            default: 'Cancel'
        },
        closeAriaLabel: {
            type: String,
            default: 'Close modal'
        },
        primaryActionAriaLabel: {
            type: String,
            default: 'Confirm action'
        },
        secondaryActionAriaLabel: {
            type: String,
            default: 'Cancel action'
        },
        zIndex: {
            type: Number,
            default: 1000
        },
        multiModal: {
            type: Boolean,
            default: false
        },
        preventBodyScroll: {
            type: Boolean,
            default: true
        },
        returnFocus: {
            type: Boolean,
            default: true
        },
        dragHandleTitle: {
            type: String,
            default: 'Drag to move modal'
        }
    },
    emits: [
        'close',
        'primary-action',
        'secondary-action',
        'opened',
        'closed',
        'scroll',
        'drag-start',
        'drag-end',
        'drag-move',
        'resize-start',
        'resize-end',
        'resize-move',
        'update:show'
    ],
    data() {
        return {
            showTopShadow: false,
            showBottomShadow: false,
            isDragging: false,
            isResizing: false,
            dragStartX: 0,
            dragStartY: 0,
            modalX: 0,
            modalY: 0,
            scrollTop: 0,
            modalStack: [],
            resizeDirection: null,
            originalWidth: 0,
            originalHeight: 0,
            originalX: 0,
            originalY: 0,
            resizeStartX: 0,
            resizeStartY: 0,
            previousActiveElement: null,
            isMounted: false
        }
    },
    computed: {
        titleId() {
            return `modal-title-${this._uid}`
        },
        descriptionId() {
            return `modal-description-${this._uid}`
        },
        containerStyles() {
            const styles = {
                '--modal-width': this.width,
                '--modal-height': this.height,
                '--modal-max-height': this.maxHeight,
                '--modal-min-width': this.minWidth,
                '--modal-min-height': this.minHeight,
                '--modal-z-index': this.zIndex,
                '--overlay-blur': this.overlayBlur,
                '--overlay-opacity': this.overlayOpacity
            }

            // Only apply transform if modal has been moved
            if (this.draggable && (this.modalX !== 0 || this.modalY !== 0)) {
                styles.transform = `translate(${this.modalX}px, ${this.modalY}px)`
            }

            // Apply resize styles if resizing
            if (this.resizable && (this.originalWidth || this.originalHeight)) {
                if (this.originalWidth) {
                    styles.width = `${this.originalWidth}px`
                }
                if (this.originalHeight) {
                    styles.height = `${this.originalHeight}px`
                }
            }

            return styles
        },
        backdropStyle() {
            return {
                backdropFilter: `blur(${this.overlayBlur})`
            }
        },
        multiBackdropStyle() {
            return {
                backdropFilter: `blur(${this.overlayBlur})`,
                opacity: this.overlayOpacity * 0.7
            }
        },
        progressStyle() {
            if (typeof this.loading === 'number') {
                return {
                    width: `${Math.min(100, Math.max(0, this.loading))}%`
                }
            }
            return {}
        },
        overlayClasses() {
            return [
                `theme-${this.theme}`,
                `position-${this.position}`,
                `animation-${this.animation}`,
                {
                    'multi-modal': this.multiModal,
                    'draggable': this.draggable,
                    'resizable': this.resizable,
                    'loading': this.loading,
                    'dragging': this.isDragging,
                    'resizing': this.isResizing
                }
            ]
        },
        contentClasses() {
            return {
                'no-header': !this.showHeader,
                'no-footer': !this.$slots.footer && !this.showDefaultFooter,
                'dragging': this.isDragging,
                'resizing': this.isResizing
            }
        },
        footerClasses() {
            return {
                'sticky': this.showDefaultFooter,
                'divided': this.showHeader
            }
        },
        showScrollShadow() {
            return this.maxHeight !== 'auto'
        }
    },
    watch: {
        show: {
            handler(val) {
                if (val) {
                    this.openModal()
                } else {
                    this.closeModal()
                }
            },
            immediate: true
        },
        loading(val) {
            if (val && this.preventBodyScroll) {
                this.lockBodyScroll()
            }
        }
    },
    mounted() {
        this.isMounted = true
        this.initResize()
        this.updateModalStack()
    },
    beforeUnmount() {
        this.cleanup()
        this.restoreBodyScroll()
        this.restoreFocus()
    },
    methods: {
        openModal() {
            if (!this.isMounted) return
            
            this.previousActiveElement = document.activeElement
            if (this.preventBodyScroll) {
                this.lockBodyScroll()
            }
            
            this.$nextTick(() => {
                this.focusModal()
                this.checkScrollShadows()
            })
        },
        
        closeModal() {
            if (this.preventBodyScroll) {
                this.restoreBodyScroll()
            }
            this.restoreFocus()
            this.resetDrag()
            this.resetResize()
        },
        
        onEnter() {
            document.addEventListener('keydown', this.handleKeydown)
            if (this.draggable) {
                document.addEventListener('mousemove', this.handleDrag)
                document.addEventListener('mouseup', this.stopDrag)
                document.addEventListener('touchmove', this.handleDrag, { passive: false })
                document.addEventListener('touchend', this.stopDrag)
            }
            if (this.resizable) {
                document.addEventListener('mousemove', this.handleResize)
                document.addEventListener('mouseup', this.stopResize)
            }
        },
        
        onAfterEnter() {
            this.$emit('opened')
            this.focusModal()
        },
        
        onBeforeLeave() {
            document.removeEventListener('keydown', this.handleKeydown)
            if (this.draggable) {
                document.removeEventListener('mousemove', this.handleDrag)
                document.removeEventListener('mouseup', this.stopDrag)
                document.removeEventListener('touchmove', this.handleDrag)
                document.removeEventListener('touchend', this.stopDrag)
            }
            if (this.resizable) {
                document.removeEventListener('mousemove', this.handleResize)
                document.removeEventListener('mouseup', this.stopResize)
            }
        },
        
        onAfterLeave() {
            this.$emit('closed')
            this.resetDrag()
            this.resetResize()
        },
        
        handleClose() {
            if (!this.loading && this.closable) {
                this.$emit('close')
                this.$emit('update:show', false)
            }
        },
        
        handleOverlayClick() {
            if (this.closeOnOverlay && !this.loading) {
                this.handleClose()
            }
        },
        
        handleKeydown(event) {
            switch (event.key) {
                case 'Escape':
                    if (this.closeOnEsc && !this.loading) {
                        event.preventDefault()
                        event.stopPropagation()
                        this.handleClose()
                    }
                    break
                case 'Tab':
                    this.trapFocus(event)
                    break
                case 'Enter':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault()
                        this.handlePrimaryAction()
                    }
                    break
            }
        },
        
        trapFocus(event) {
            const focusableElements = this.getFocusableElements()
            if (focusableElements.length === 0) return
            
            const firstElement = focusableElements[0]
            const lastElement = focusableElements[focusableElements.length - 1]
            
            if (event.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus()
                    event.preventDefault()
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus()
                    event.preventDefault()
                }
            }
        },
        
        getFocusableElements() {
            const modalContent = this.$refs.modalContent
            if (!modalContent) return []
            
            const elements = modalContent.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
            return Array.from(elements).filter(el => {
                return !el.disabled && el.offsetParent !== null
            })
        },
        
        focusModal() {
            this.$nextTick(() => {
                // Try to focus the first focusable element, or the modal content itself
                const focusableElements = this.getFocusableElements()
                if (focusableElements.length > 0) {
                    focusableElements[0].focus()
                } else {
                    const modalContent = this.$refs.modalContent
                    if (modalContent) {
                        modalContent.focus()
                    }
                }
            })
        },
        
        restoreFocus() {
            if (this.returnFocus && this.previousActiveElement) {
                this.$nextTick(() => {
                    if (this.previousActiveElement && typeof this.previousActiveElement.focus === 'function') {
                        this.previousActiveElement.focus()
                    }
                })
            }
        },
        
        handleBodyScroll(event) {
            this.scrollTop = event.target.scrollTop
            this.checkScrollShadows()
            this.$emit('scroll', {
                scrollTop: this.scrollTop,
                target: event.target
            })
        },
        
        checkScrollShadows() {
            const body = this.$refs.modalBody
            if (!body) return
            
            const { scrollTop, scrollHeight, clientHeight } = body
            this.showTopShadow = scrollTop > 0
            this.showBottomShadow = scrollTop < scrollHeight - clientHeight - 1
        },
        
        startDrag(event) {
            if (!this.draggable || this.loading) return
            
            event.preventDefault()
            this.isDragging = true
            const clientX = event.clientX || (event.touches && event.touches[0].clientX)
            const clientY = event.clientY || (event.touches && event.touches[0].clientY)
            
            this.dragStartX = clientX - this.modalX
            this.dragStartY = clientY - this.modalY
            
            this.$emit('drag-start', {
                x: this.modalX,
                y: this.modalY
            })
        },
        
        handleDrag(event) {
            if (!this.isDragging) return
            
            event.preventDefault()
            const clientX = event.clientX || (event.touches && event.touches[0].clientX)
            const clientY = event.clientY || (event.touches && event.touches[0].clientY)
            
            this.modalX = clientX - this.dragStartX
            this.modalY = clientY - this.dragStartY
            
            // Constrain to viewport
            const modalRect = this.$refs.modalContainer?.getBoundingClientRect()
            if (modalRect) {
                const maxX = window.innerWidth - modalRect.width
                const maxY = window.innerHeight - modalRect.height
                
                this.modalX = Math.max(-maxX / 2, Math.min(maxX / 2, this.modalX))
                this.modalY = Math.max(-maxY / 2, Math.min(maxY / 2, this.modalY))
            }
            
            this.$emit('drag-move', {
                x: this.modalX,
                y: this.modalY
            })
        },
        
        stopDrag() {
            if (this.isDragging) {
                this.isDragging = false
                this.$emit('drag-end', {
                    x: this.modalX,
                    y: this.modalY
                })
            }
        },
        
        resetDrag() {
            this.isDragging = false
            this.modalX = 0
            this.modalY = 0
        },
        
        startResize(direction) {
            if (!this.resizable || this.loading) return
            
            event.preventDefault()
            this.isResizing = true
            this.resizeDirection = direction
            
            const modalContainer = this.$refs.modalContainer
            if (modalContainer) {
                const rect = modalContainer.getBoundingClientRect()
                this.originalWidth = rect.width
                this.originalHeight = rect.height
                this.originalX = rect.left
                this.originalY = rect.top
                this.resizeStartX = event.clientX
                this.resizeStartY = event.clientY
            }
            
            this.$emit('resize-start', {
                direction,
                width: this.originalWidth,
                height: this.originalHeight
            })
        },
        
        handleResize(event) {
            if (!this.isResizing || !this.resizeDirection) return
            
            event.preventDefault()
            const deltaX = event.clientX - this.resizeStartX
            const deltaY = event.clientY - this.resizeStartY
            
            let newWidth = this.originalWidth
            let newHeight = this.originalHeight
            
            // Handle different resize directions
            if (this.resizeDirection.includes('r')) {
                newWidth = Math.max(parseInt(this.minWidth), this.originalWidth + deltaX)
            }
            if (this.resizeDirection.includes('l')) {
                newWidth = Math.max(parseInt(this.minWidth), this.originalWidth - deltaX)
                this.modalX = this.originalX + deltaX
            }
            if (this.resizeDirection.includes('b')) {
                newHeight = Math.max(parseInt(this.minHeight), this.originalHeight + deltaY)
            }
            if (this.resizeDirection.includes('t')) {
                newHeight = Math.max(parseInt(this.minHeight), this.originalHeight - deltaY)
                this.modalY = this.originalY + deltaY
            }
            
            this.originalWidth = newWidth
            this.originalHeight = newHeight
            
            this.$emit('resize-move', {
                direction: this.resizeDirection,
                width: newWidth,
                height: newHeight
            })
        },
        
        stopResize() {
            if (this.isResizing) {
                this.isResizing = false
                this.$emit('resize-end', {
                    direction: this.resizeDirection,
                    width: this.originalWidth,
                    height: this.originalHeight
                })
                this.resizeDirection = null
            }
        },
        
        resetResize() {
            this.isResizing = false
            this.resizeDirection = null
            this.originalWidth = 0
            this.originalHeight = 0
            this.originalX = 0
            this.originalY = 0
        },
        
        initResize() {
            // Resize functionality is now handled by resize handles
        },
        
        handlePrimaryAction() {
            if (!this.loading) {
                this.$emit('primary-action')
            }
        },
        
        handleSecondaryAction() {
            if (!this.loading) {
                this.$emit('secondary-action')
            }
        },
        
        lockBodyScroll() {
            if (!document.body.classList.contains('modal-open')) {
                document.body.classList.add('modal-open')
                // Store original padding to prevent layout shift
                const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
                document.body.style.paddingRight = `${scrollbarWidth}px`
            }
        },
        
        restoreBodyScroll() {
            document.body.classList.remove('modal-open')
            document.body.style.paddingRight = ''
        },
        
        updateModalStack() {
            // Track modal stacking for proper z-index management
            // This would integrate with a modal manager
        },
        
        cleanup() {
            document.removeEventListener('keydown', this.handleKeydown)
            document.removeEventListener('mousemove', this.handleDrag)
            document.removeEventListener('mouseup', this.stopDrag)
            document.removeEventListener('touchmove', this.handleDrag)
            document.removeEventListener('touchend', this.stopDrag)
            document.removeEventListener('mousemove', this.handleResize)
            document.removeEventListener('mouseup', this.stopResize)
            this.restoreBodyScroll()
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
    z-index: var(--modal-z-index, 1000);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    overflow: hidden;
}

.modal-container {
    position: relative;
    width: var(--modal-width, 500px);
    height: var(--modal-height, auto);
    max-height: var(--modal-max-height, 80vh);
    min-width: var(--modal-min-width, 300px);
    min-height: var(--modal-min-height, 200px);
    outline: none;
    transition: transform 0.2s ease;
}

.modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, var(--overlay-opacity, 0.5));
    backdrop-filter: var(--overlay-blur, blur(8px));
}

.multi-modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, calc(var(--overlay-opacity, 0.5) * 0.7));
    backdrop-filter: var(--overlay-blur, blur(8px));
}

.modal-content {
    position: relative;
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    max-height: inherit;
    min-height: inherit;
    overflow: hidden;
    transition: transform 0.1s ease;
    width: 100%;
    height: 100%;
}

.modal-content.dragging {
    transition: none;
    cursor: grabbing;
    user-select: none;
}

.modal-content.resizing {
    transition: none;
    user-select: none;
}

/* Header Styles */
.modal-header {
    position: relative;
    flex-shrink: 0;
    z-index: 10;
}

.header-content {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 1.5rem 1.5rem 1rem;
    gap: 1rem;
}

.title-section {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    flex: 1;
    min-width: 0;
}

.modal-icon {
    width: 2rem;
    height: 2rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #007bff;
    color: white;
    flex-shrink: 0;
    margin-top: 0.25rem;
}

.title-wrapper {
    flex: 1;
    min-width: 0;
}

.modal-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a1a1a;
    line-height: 1.4;
}

.modal-description {
    margin: 0.25rem 0 0 0;
    font-size: 0.875rem;
    color: #666;
    line-height: 1.4;
}

.header-actions {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    flex-shrink: 0;
}

.close-button {
    width: 2rem;
    height: 2rem;
    border: none;
    background: #f8f9fa;
    border-radius: 6px;
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

/* Progress Bar */
.modal-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: #f0f0f0;
}

.progress-bar {
    height: 100%;
    background: #007bff;
    transition: width 0.3s ease;
    border-radius: 0 2px 2px 0;
}

.progress-bar.indeterminate {
    width: 50% !important;
    animation: progress-indeterminate 1.5s infinite ease-in-out;
}

@keyframes progress-indeterminate {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
}

/* Body Styles */
.modal-body {
    position: relative;
    flex: 1;
    overflow-y: auto;
    padding: 1rem 1.5rem;
}

.modal-body.no-padding {
    padding: 0;
}

.body-content {
    position: relative;
    z-index: 1;
    min-height: 100%;
}

.body-loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5;
}

.loading-spinner {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #666;
    font-size: 0.875rem;
}

/* Scroll Shadows */
.scroll-shadow {
    position: absolute;
    left: 0;
    right: 0;
    height: 8px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 2;
}

.scroll-shadow.top {
    top: 0;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, transparent 100%);
}

.scroll-shadow.bottom {
    bottom: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.1) 0%, transparent 100%);
}

.scroll-shadow.visible {
    opacity: 1;
}

/* Footer Styles */
.modal-footer {
    flex-shrink: 0;
    padding: 1rem 1.5rem 1.5rem;
}

.modal-footer.sticky {
    background: white;
}

.modal-footer.divided {
    border-top: 1px solid #f0f0f0;
}

.default-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

.btn {
    padding: 0.625rem 1.25rem;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.875rem;
    min-width: 80px;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
}

.btn-primary {
    background: #007bff;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: #0056b3;
    transform: translateY(-1px);
}

.btn-primary.loading {
    pointer-events: none;
}

.btn-secondary {
    background: #6c757d;
    color: white;
}

.btn-secondary:hover:not(:disabled) {
    background: #545b62;
    transform: translateY(-1px);
}

.btn-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* Drag Handle */
.drag-handle {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1.5rem;
    cursor: grab;
    z-index: 5;
}

.drag-handle:active {
    cursor: grabbing;
}

.drag-handle::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 2px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 1px;
}

/* Resize Handles */
.resize-handles {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
}

.resize-handle {
    position: absolute;
    background: transparent;
    pointer-events: auto;
}

.resize-handle-t {
    top: 0;
    left: 5px;
    right: 5px;
    height: 5px;
    cursor: n-resize;
}

.resize-handle-r {
    top: 5px;
    right: 0;
    bottom: 5px;
    width: 5px;
    cursor: e-resize;
}

.resize-handle-b {
    bottom: 0;
    left: 5px;
    right: 5px;
    height: 5px;
    cursor: s-resize;
}

.resize-handle-l {
    top: 5px;
    left: 0;
    bottom: 5px;
    width: 5px;
    cursor: w-resize;
}

.resize-handle-tr {
    top: 0;
    right: 0;
    width: 10px;
    height: 10px;
    cursor: ne-resize;
}

.resize-handle-br {
    bottom: 0;
    right: 0;
    width: 10px;
    height: 10px;
    cursor: se-resize;
}

.resize-handle-bl {
    bottom: 0;
    left: 0;
    width: 10px;
    height: 10px;
    cursor: sw-resize;
}

.resize-handle-tl {
    top: 0;
    left: 0;
    width: 10px;
    height: 10px;
    cursor: nw-resize;
}

/* Animation Variants */
.modal-transition-enter-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-transition-leave-active {
    transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}

/* Scale Animation */
.animation-scale .modal-content {
    transform: scale(0.95);
    opacity: 0;
}

.animation-scale.modal-transition-enter-to .modal-content {
    transform: scale(1);
    opacity: 1;
}

.animation-scale.modal-transition-leave-to .modal-content {
    transform: scale(0.95);
    opacity: 0;
}

/* Slide Animations */
.animation-slide.modal-transition-enter-from .modal-content {
    transform: translateY(20px);
    opacity: 0;
}

.animation-slide.modal-transition-enter-to .modal-content {
    transform: translateY(0);
    opacity: 1;
}

.animation-slide.modal-transition-leave-to .modal-content {
    transform: translateY(-20px);
    opacity: 0;
}

/* Fade Animation */
.animation-fade.modal-transition-enter-from .modal-content {
    opacity: 0;
}

.animation-fade.modal-transition-enter-to .modal-content {
    opacity: 1;
}

.animation-fade.modal-transition-leave-to .modal-content {
    opacity: 0;
}

/* Position Variants */
.position-top .modal-container {
    align-self: flex-start;
    margin-top: 2rem;
}

.position-bottom .modal-container {
    align-self: flex-end;
    margin-bottom: 2rem;
}

.position-left .modal-container {
    align-self: center;
    justify-self: flex-start;
    margin-left: 2rem;
}

.position-right .modal-container {
    align-self: center;
    justify-self: flex-end;
    margin-right: 2rem;
}

/* Theme Variants */
.theme-dark .modal-content {
    background: #1a1a1a;
    color: white;
}

.theme-dark .modal-title {
    color: white;
}

.theme-dark .modal-description {
    color: #ccc;
}

.theme-dark .close-button {
    background: #333;
    color: #ccc;
}

.theme-dark .close-button:hover:not(:disabled) {
    background: #444;
    color: white;
}

.theme-dark .modal-footer.sticky {
    background: #1a1a1a;
}

.theme-dark .modal-footer.divided {
    border-top-color: #333;
}

.theme-dark .body-loading-overlay {
    background: rgba(26, 26, 26, 0.8);
}

.theme-danger .modal-icon {
    background: #dc3545;
}

.theme-warning .modal-icon {
    background: #ffc107;
    color: #000;
}

.theme-success .modal-icon {
    background: #28a745;
}

/* Responsive Design */
@media (max-width: 768px) {
    .modal-overlay {
        padding: 1rem;
    }
    
    .modal-container {
        width: 100% !important;
        max-height: 90vh;
    }
    
    .header-content {
        padding: 1.25rem 1.25rem 0.75rem;
    }
    
    .modal-body {
        padding: 0.75rem 1.25rem;
    }
    
    .modal-footer {
        padding: 0.75rem 1.25rem 1.25rem;
    }
    
    .default-footer {
        flex-direction: column-reverse;
    }
    
    .default-footer .btn {
        width: 100%;
    }
    
    /* Disable dragging and resizing on mobile */
    .draggable .drag-handle {
        display: none;
    }
    
    .resizable .resize-handles {
        display: none;
    }
}

@media (max-width: 480px) {
    .modal-overlay {
        padding: 0.5rem;
    }
    
    .header-content {
        flex-direction: column;
        gap: 0.75rem;
    }
    
    .header-actions {
        align-self: flex-end;
    }
}

/* Body scroll lock */
body.modal-open {
    overflow: hidden;
}

/* Focus styles */
.modal-content:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
}

/* High contrast support */
@media (prefers-contrast: high) {
    .modal-content {
        border: 2px solid currentColor;
    }
    
    .scroll-shadow {
        background: linear-gradient(to bottom, currentColor 0%, transparent 100%);
    }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
    .modal-transition-enter-active,
    .modal-transition-leave-active {
        transition: opacity 0.2s ease;
    }
    
    .modal-content {
        transition: none;
    }
    
    .progress-bar.indeterminate {
        animation: none;
        width: 100% !important;
    }
    
    .btn:hover:not(:disabled) {
        transform: none;
    }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
    .drag-handle {
        height: 2rem; /* Larger touch target */
    }
    
    .resize-handle {
        width: 15px;
        height: 15px;
    }
}
</style>