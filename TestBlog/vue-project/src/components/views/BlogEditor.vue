<template>
    <div class="blog-editor">
        <!-- Editor Header -->
        <div class="editor-header">
            <div class="header-content">
                <h2>{{ post ? 'Edit Blog Post' : 'Create New Blog Post' }}</h2>
                <div class="header-actions">
                    <button 
                        class="btn-icon" 
                        @click="togglePreview"
                        :aria-label="showPreview ? 'Hide preview' : 'Show preview'"
                        :disabled="loading"
                    >
                        <i :class="showPreview ? 'fas fa-edit' : 'fas fa-eye'"></i>
                        {{ showPreview ? 'Edit' : 'Preview' }}
                    </button>
                    <button 
                        class="btn-icon" 
                        @click="toggleFullscreen"
                        :aria-label="isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
                    >
                        <i :class="isFullscreen ? 'fas fa-compress' : 'fas fa-expand'"></i>
                    </button>
                </div>
            </div>
            
            <!-- Status Bar -->
            <div class="status-bar">
                <div class="status-item">
                    <span class="status-label">Status:</span>
                    <span class="status-badge" :class="formData.status">
                        {{ formData.status === 'draft' ? 'Draft' : (formData.status === 'archived' ? 'Archived' : 'Published') }}
                    </span>
                </div>
                <div class="status-item" v-if="post">
                    <span class="status-label">Last Updated:</span>
                    <span class="status-value">{{ formatDate(post.updatedAt) }}</span>
                </div>
                <div class="status-item">
                    <span class="status-label">Word Count:</span>
                    <span class="status-value">{{ wordCount }}</span>
                </div>
                <div class="status-item">
                    <span class="status-label">Reading Time:</span>
                    <span class="status-value">{{ readingTime }} min read</span>
                </div>
            </div>
        </div>

        <!-- Editor Body -->
        <div class="editor-body" :class="{ 'preview-mode': showPreview, 'fullscreen': isFullscreen }">
            <!-- Edit Mode -->
            <div v-if="!showPreview" class="editor-content">
                <form @submit.prevent="handleSave(false)" class="editor-form">
                    <!-- Title Section -->
                    <div class="form-section">
                        <div class="form-group">
                            <label for="postTitle" class="form-label">
                                Title *
                                <span class="required-indicator"></span>
                            </label>
                            <input
                                type="text"
                                id="postTitle"
                                v-model="formData.title"
                                class="form-control"
                                :class="{ 'error': errors.title }"
                                placeholder="Enter a compelling post title..."
                                required
                                maxlength="100"
                                @input="validateField('title')"
                                @blur="generateSlug"
                                :disabled="loading"
                            />
                            <div class="form-meta">
                                <div v-if="errors.title" class="error-message">
                                    <i class="fas fa-exclamation-circle"></i>
                                    {{ errors.title }}
                                </div>
                                <div class="char-counter">
                                    {{ formData.title.length }}/100
                                </div>
                            </div>
                        </div>

                        <!-- Slug Field -->
                        <div class="form-group" v-if="formData.title">
                            <label for="postSlug" class="form-label">URL Slug</label>
                            <div class="input-with-prefix">
                                <span class="input-prefix">/blog/</span>
                                <input
                                    type="text"
                                    id="postSlug"
                                    v-model="formData.slug"
                                    class="form-control"
                                    :class="{ 'error': errors.slug }"
                                    placeholder="url-slug"
                                    @input="validateField('slug')"
                                    :disabled="loading"
                                />
                            </div>
                            <div v-if="errors.slug" class="error-message">
                                <i class="fas fa-exclamation-circle"></i>
                                {{ errors.slug }}
                            </div>
                        </div>
                    </div>

                    <!-- Excerpt & Category Section -->
                    <div class="form-row">
                        <div class="form-group">
                            <label for="postExcerpt" class="form-label">
                                Excerpt *
                                <span class="required-indicator"></span>
                            </label>
                            <textarea
                                id="postExcerpt"
                                v-model="formData.excerpt"
                                class="form-control"
                                :class="{ 'error': errors.excerpt }"
                                placeholder="Brief description of your post..."
                                rows="3"
                                required
                                maxlength="200"
                                @input="validateField('excerpt')"
                                :disabled="loading"
                            ></textarea>
                            <div class="form-meta">
                                <div v-if="errors.excerpt" class="error-message">
                                    <i class="fas fa-exclamation-circle"></i>
                                    {{ errors.excerpt }}
                                </div>
                                <div class="char-counter" :class="{ 'near-limit': formData.excerpt.length > 180 }">
                                    {{ formData.excerpt.length }}/200
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="postCategory" class="form-label">
                                Category *
                                <span class="required-indicator"></span>
                            </label>
                            <select
                                id="postCategory"
                                v-model="formData.category"
                                class="form-control"
                                :class="{ 'error': errors.category }"
                                required
                                @change="validateField('category')"
                                :disabled="loading"
                            >
                                <option value="">Select a category</option>
                                <option value="technology">Technology</option>
                                <option value="programming">Programming</option>
                                <option value="web-development">Web Development</option>
                                <option value="mobile-development">Mobile Development</option>
                                <option value="ai-ml">AI & Machine Learning</option>
                                <option value="devops">DevOps</option>
                                <option value="career">Career</option>
                                <option value="tutorials">Tutorials</option>
                                <option value="news">News</option>
                            </select>
                            <div v-if="errors.category" class="error-message">
                                <i class="fas fa-exclamation-circle"></i>
                                {{ errors.category }}
                            </div>
                            
                            <!-- Tags Input -->
                            <label for="postTags" class="form-label" style="margin-top: 1rem;">Tags</label>
                            <div class="tags-input">
                                <div class="tags-container" :class="{ 'focused': tagInputFocused }">
                                    <span 
                                        v-for="tag in formData.tags" 
                                        :key="tag" 
                                        class="tag"
                                        @click="removeTag(tag)"
                                    >
                                        {{ tag }}
                                        <i class="fas fa-times"></i>
                                    </span>
                                    <input
                                        id="postTags"
                                        v-model="tagInput"
                                        class="tag-input"
                                        placeholder="Add tags..."
                                        @keydown.enter.prevent="addTag"
                                        @keydown.backspace="handleBackspace"
                                        @focus="tagInputFocused = true"
                                        @blur="tagInputFocused = false"
                                        :disabled="loading"
                                    />
                                </div>
                                <div class="tags-hint">
                                    Press Enter to add tags (max 10)
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Featured Image Section -->
                    <div class="form-section">
                        <div class="form-group">
                            <label for="postImage" class="form-label">Featured Image</label>
                            
                            <!-- Image Upload Options -->
                            <div class="image-upload-options">
                                <div class="upload-tabs">
                                    <button 
                                        type="button" 
                                        :class="['tab-button', { 'active': imageUploadMethod === 'url' }]"
                                        @click="imageUploadMethod = 'url'"
                                        :disabled="loading"
                                    >
                                        URL
                                    </button>
                                    <button 
                                        type="button" 
                                        :class="['tab-button', { 'active': imageUploadMethod === 'upload' }]"
                                        @click="imageUploadMethod = 'upload'"
                                        :disabled="loading"
                                    >
                                        Upload
                                    </button>
                                </div>

                                <!-- URL Input -->
                                <div v-if="imageUploadMethod === 'url'" class="upload-content">
                                    <input
                                        type="url"
                                        id="postImage"
                                        v-model="formData.image"
                                        class="form-control"
                                        :class="{ 'error': errors.image }"
                                        placeholder="https://example.com/image.jpg"
                                        @input="validateField('image')"
                                        :disabled="loading"
                                    />
                                    <div v-if="errors.image" class="error-message">
                                        <i class="fas fa-exclamation-circle"></i>
                                        {{ errors.image }}
                                    </div>
                                </div>

                                <!-- File Upload -->
                                <div v-else class="upload-content">
                                    <div 
                                        class="file-upload-area" 
                                        @click="triggerFileUpload"
                                        @drop.prevent="handleDrop"
                                        @dragover.prevent
                                    >
                                        <input
                                            ref="fileInput"
                                            type="file"
                                            accept="image/*"
                                            style="display: none"
                                            @change="handleFileUpload"
                                            :disabled="loading"
                                        />
                                        <i class="fas fa-cloud-upload-alt"></i>
                                        <p>Click to upload or drag and drop</p>
                                        <small>PNG, JPG, GIF, WebP up to 5MB</small>
                                    </div>
                                </div>
                            </div>

                            <!-- Image Preview -->
                            <div v-if="formData.image && !imageError" class="image-preview">
                                <div class="preview-container">
                                    <img 
                                        :src="formData.image" 
                                        alt="Featured image preview" 
                                        @load="imageError = false"
                                        @error="imageError = true"
                                    />
                                    <button 
                                        class="preview-remove" 
                                        @click="removeImage"
                                        aria-label="Remove image"
                                        :disabled="loading"
                                    >
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div v-if="imageError" class="error-message">
                                <i class="fas fa-exclamation-circle"></i>
                                Failed to load image. Please check the URL or upload a new image.
                            </div>
                        </div>
                    </div>

                    <!-- Content Editor -->
                    <div class="form-section">
                        <div class="form-group">
                            <div class="editor-header-bar">
                                <label for="postContent" class="form-label">
                                    Content *
                                    <span class="required-indicator"></span>
                                </label>
                                <div class="editor-toolbar">
                                    <button 
                                        type="button" 
                                        class="toolbar-btn"
                                        @click="formatText('bold')"
                                        title="Bold"
                                        :disabled="loading"
                                    >
                                        <i class="fas fa-bold"></i>
                                    </button>
                                    <button 
                                        type="button" 
                                        class="toolbar-btn"
                                        @click="formatText('italic')"
                                        title="Italic"
                                        :disabled="loading"
                                    >
                                        <i class="fas fa-italic"></i>
                                    </button>
                                    <button 
                                        type="button" 
                                        class="toolbar-btn"
                                        @click="formatText('underline')"
                                        title="Underline"
                                        :disabled="loading"
                                    >
                                        <i class="fas fa-underline"></i>
                                    </button>
                                    <button 
                                        type="button" 
                                        class="toolbar-btn"
                                        @click="insertLink"
                                        title="Insert Link"
                                        :disabled="loading"
                                    >
                                        <i class="fas fa-link"></i>
                                    </button>
                                    <button 
                                        type="button" 
                                        class="toolbar-btn"
                                        @click="insertImage"
                                        title="Insert Image"
                                        :disabled="loading"
                                    >
                                        <i class="fas fa-image"></i>
                                    </button>
                                    <button 
                                        type="button" 
                                        class="toolbar-btn"
                                        @click="formatText('code')"
                                        title="Code Block"
                                        :disabled="loading"
                                    >
                                        <i class="fas fa-code"></i>
                                    </button>
                                    <button 
                                        type="button" 
                                        class="toolbar-btn"
                                        @click="insertList('insertUnorderedList')"
                                        title="Bullet List"
                                        :disabled="loading"
                                    >
                                        <i class="fas fa-list-ul"></i>
                                    </button>
                                    <button 
                                        type="button" 
                                        class="toolbar-btn"
                                        @click="insertList('insertOrderedList')"
                                        title="Numbered List"
                                        :disabled="loading"
                                    >
                                        <i class="fas fa-list-ol"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Rich Text Editor -->
                            <div
                                ref="editor"
                                class="rich-editor"
                                contenteditable="true"
                                :innerHTML="formData.content"
                                @input="onContentInput"
                                @paste="handlePaste"
                                @keydown="handleKeydown"
                                @blur="validateField('content')"
                                :class="{ 'error': errors.content }"
                                :disabled="loading"
                            ></div>
                            
                            <div class="form-meta">
                                <div v-if="errors.content" class="error-message">
                                    <i class="fas fa-exclamation-circle"></i>
                                    {{ errors.content }}
                                </div>
                                <div class="editor-stats">
                                    <span>{{ wordCount }} words</span>
                                    <span>{{ readingTime }} min read</span>
                                    <span>{{ characterCount }} characters</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- SEO Settings -->
                    <div class="form-section" v-if="showSeoSettings">
                        <h3 class="section-title">
                            <i class="fas fa-search"></i>
                            SEO Settings
                        </h3>
                        
                        <div class="form-group">
                            <label for="metaTitle" class="form-label">Meta Title</label>
                            <input
                                type="text"
                                id="metaTitle"
                                v-model="formData.metaTitle"
                                class="form-control"
                                placeholder="SEO title (defaults to post title)"
                                maxlength="60"
                                :disabled="loading"
                            />
                            <div class="char-counter">{{ formData.metaTitle.length }}/60</div>
                        </div>

                        <div class="form-group">
                            <label for="metaDescription" class="form-label">Meta Description</label>
                            <textarea
                                id="metaDescription"
                                v-model="formData.metaDescription"
                                class="form-control"
                                placeholder="SEO description (defaults to post excerpt)"
                                rows="3"
                                maxlength="160"
                                :disabled="loading"
                            ></textarea>
                            <div class="char-counter">{{ formData.metaDescription.length }}/160</div>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Preview Mode -->
            <div v-else class="preview-content">
                <article class="blog-preview">
                    <header class="preview-header">
                        <h1 class="preview-title">{{ formData.title || 'Untitled' }}</h1>
                        <div class="preview-meta">
                            <span class="preview-category">{{ getCategoryName(formData.category) }}</span>
                            <span class="preview-date">{{ formatDate(new Date()) }}</span>
                            <span class="preview-reading-time">{{ readingTime }} min read</span>
                        </div>
                        <div v-if="formData.image && !imageError" class="preview-image">
                            <img :src="formData.image" alt="Featured image" @error="imageError = true" />
                        </div>
                    </header>
                    
                    <div class="preview-excerpt" v-if="formData.excerpt">
                        <p>{{ formData.excerpt }}</p>
                    </div>
                    
                    <div class="preview-body" v-html="compiledContent"></div>
                    
                    <footer class="preview-footer">
                        <div class="preview-tags" v-if="formData.tags.length">
                            <span v-for="tag in formData.tags" :key="tag" class="tag">
                                {{ tag }}
                            </span>
                        </div>
                    </footer>
                </article>
            </div>
        </div>

        <!-- Editor Actions -->
        <div class="editor-actions">
            <div class="actions-left">
                <button 
                    class="btn btn-outline" 
                    @click="handleCancel" 
                    :disabled="loading"
                >
                    <i class="fas fa-times"></i> Cancel
                </button>
                
                <button 
                    class="btn btn-outline" 
                    @click="toggleSeoSettings"
                    :disabled="loading"
                >
                    <i class="fas fa-search"></i>
                    {{ showSeoSettings ? 'Hide SEO' : 'Show SEO' }}
                </button>
            </div>
            
            <div class="actions-right">
                <button 
                    class="btn btn-secondary" 
                    @click="handleSave(true)" 
                    :disabled="loading"
                    :class="{ 'loading': loading && savingDraft }"
                >
                    <i v-if="loading && savingDraft" class="fas fa-spinner fa-spin"></i>
                    <i v-else class="fas fa-save"></i> 
                    {{ loading && savingDraft ? 'Saving...' : 'Save Draft' }}
                </button>
                
                <button 
                    class="btn btn-primary" 
                    @click="handleSave(false)" 
                    :disabled="!isFormValid || loading"
                    :class="{ 'loading': loading && !savingDraft }"
                >
                    <i v-if="loading && !savingDraft" class="fas fa-spinner fa-spin"></i>
                    <i v-else class="fas fa-paper-plane"></i>
                    {{ loading && !savingDraft ? 'Publishing...' : (post ? 'Update Post' : 'Publish Post') }}
                </button>
            </div>
        </div>

        <!-- Auto-save Indicator -->
        <div v-if="autoSaveIndicator" class="auto-save-indicator">
            <i class="fas fa-save"></i>
            Auto-saved just now
        </div>

        <!-- Unsaved Changes Warning -->
        <div v-if="showUnsavedWarning" class="unsaved-warning">
            <div class="warning-content">
                <i class="fas fa-exclamation-triangle"></i>
                <div class="warning-text">
                    <h4>Unsaved Changes</h4>
                    <p>You have unsaved changes. Are you sure you want to leave?</p>
                </div>
                <div class="warning-actions">
                    <button class="btn btn-outline" @click="showUnsavedWarning = false">Stay</button>
                    <button class="btn btn-primary" @click="confirmLeave">Leave Anyway</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue'

export default {
    name: 'BlogEditor',
    props: {
        post: {
            type: Object,
            default: null
        }
    },
    emits: ['save-post', 'cancel'],
    setup(props, { emit }) {
        // Form data with defaults
        const formData = ref({
            title: '',
            slug: '',
            excerpt: '',
            category: '',
            tags: [],
            image: '',
            content: '',
            status: 'draft',
            metaTitle: '',
            metaDescription: ''
        })

        // UI State
        const errors = ref({})
        const loading = ref(false)
        const savingDraft = ref(false)
        const imageError = ref(false)
        const showPreview = ref(false)
        const isFullscreen = ref(false)
        const showSeoSettings = ref(false)
        const imageUploadMethod = ref('url')
        const tagInput = ref('')
        const tagInputFocused = ref(false)
        const autoSaveIndicator = ref(false)
        const autoSaveInterval = ref(null)
        const showUnsavedWarning = ref(false)
        const pendingNavigation = ref(null)

        // Refs
        const editor = ref(null)
        const fileInput = ref(null)

        // Initialize form data
        const initializeFormData = () => {
            if (props.post) {
                formData.value = {
                    title: props.post.title || '',
                    slug: props.post.slug || '',
                    excerpt: props.post.excerpt || '',
                    category: props.post.category || '',
                    tags: props.post.tags || [],
                    image: props.post.image || '',
                    content: props.post.content || '',
                    status: props.post.status || 'draft',
                    metaTitle: props.post.metaTitle || '',
                    metaDescription: props.post.metaDescription || ''
                }
            } else {
                formData.value = {
                    title: '',
                    slug: '',
                    excerpt: '',
                    category: '',
                    tags: [],
                    image: '',
                    content: '',
                    status: 'draft',
                    metaTitle: '',
                    metaDescription: ''
                }
            }
            imageError.value = false
            errors.value = {}
        }

        // Computed properties
        const isFormValid = computed(() => {
            return (
                formData.value.title?.trim() &&
                formData.value.excerpt?.trim() &&
                formData.value.category &&
                formData.value.content?.trim() &&
                !Object.values(errors.value).some(error => error)
            )
        })

        const wordCount = computed(() => {
            const text = formData.value.content.replace(/<[^>]*>/g, ' ').trim()
            return text ? text.split(/\s+/).filter(word => word.length > 0).length : 0
        })

        const characterCount = computed(() => {
            return formData.value.content.replace(/<[^>]*>/g, '').length
        })

        const readingTime = computed(() => {
            const words = wordCount.value
            return Math.max(1, Math.ceil(words / 200))
        })

        const compiledContent = computed(() => {
            if (!formData.value.content) return '<p>Start writing your content...</p>'
            
            // Basic sanitization and formatting for preview
            return formData.value.content
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
                .replace(/<img/gi, '<img style="max-width: 100%; height: auto;" ') // Make images responsive
        })

        const hasUnsavedChanges = computed(() => {
            if (!props.post) return formData.value.title || formData.value.content
            return (
                formData.value.title !== props.post.title ||
                formData.value.content !== props.post.content ||
                formData.value.excerpt !== props.post.excerpt ||
                formData.value.category !== props.post.category ||
                JSON.stringify(formData.value.tags) !== JSON.stringify(props.post.tags || []) ||
                formData.value.image !== props.post.image
            )
        })

        // Methods
        const validateField = (field) => {
            const fieldErrors = {}
            
            switch (field) {
                case 'title':
                    if (!formData.value.title.trim()) {
                        fieldErrors.title = 'Title is required'
                    } else if (formData.value.title.length > 100) {
                        fieldErrors.title = 'Title must be less than 100 characters'
                    }
                    break
                    
                case 'slug':
                    if (formData.value.slug) {
                        if (!/^[a-z0-9-]+$/.test(formData.value.slug)) {
                            fieldErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens'
                        } else if (formData.value.slug.length < 3) {
                            fieldErrors.slug = 'Slug must be at least 3 characters long'
                        }
                    }
                    break
                    
                case 'excerpt':
                    if (!formData.value.excerpt.trim()) {
                        fieldErrors.excerpt = 'Excerpt is required'
                    } else if (formData.value.excerpt.length > 200) {
                        fieldErrors.excerpt = 'Excerpt must be under 200 characters'
                    } else if (formData.value.excerpt.length < 50) {
                        fieldErrors.excerpt = 'Excerpt should be at least 50 characters'
                    }
                    break
                    
                case 'category':
                    if (!formData.value.category) {
                        fieldErrors.category = 'Category is required'
                    }
                    break
                    
                case 'image':
                    if (formData.value.image && !isValidImageUrl(formData.value.image)) {
                        fieldErrors.image = 'Please enter a valid image URL (jpg, png, gif, webp)'
                    }
                    break
                    
                case 'content':
                    const textContent = formData.value.content.replace(/<[^>]*>/g, '').trim()
                    if (!textContent) {
                        fieldErrors.content = 'Content is required'
                    } else if (textContent.length < 50) {
                        fieldErrors.content = 'Content should be at least 50 characters'
                    }
                    break
            }
            
            const nextErrors = { ...errors.value }
            if (fieldErrors[field]) {
                nextErrors[field] = fieldErrors[field]
            } else {
                delete nextErrors[field]
            }
            errors.value = nextErrors
        }

        const isValidImageUrl = (url) => {
            if (url.startsWith('data:')) return true // Allow data URLs for uploaded images
            return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url)
        }

        const generateSlug = () => {
            if (!formData.value.slug && formData.value.title) {
                formData.value.slug = formData.value.title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '')
                    .substring(0, 50) // Limit slug length
                validateField('slug')
            }
        }

        const addTag = () => {
            const tag = tagInput.value.trim()
            if (tag && !formData.value.tags.includes(tag)) {
                if (formData.value.tags.length >= 10) {
                    alert('Maximum 10 tags allowed')
                    return
                }
                formData.value.tags.push(tag)
                tagInput.value = ''
            }
        }

        const removeTag = (tagToRemove) => {
            formData.value.tags = formData.value.tags.filter(tag => tag !== tagToRemove)
        }

        const handleBackspace = (event) => {
            if (!tagInput.value && formData.value.tags.length > 0) {
                event.preventDefault()
                formData.value.tags.pop()
            }
        }

        const triggerFileUpload = () => {
            if (loading.value) return
            fileInput.value?.click()
        }

        const handleDrop = (event) => {
            if (loading.value) return
            const files = event.dataTransfer.files
            if (files.length > 0) {
                handleFileUpload({ target: { files } })
            }
        }

        const handleFileUpload = (event) => {
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

            const reader = new FileReader()
            reader.onload = (e) => {
                formData.value.image = e.target.result
                imageError.value = false
                event.target.value = ''
                validateField('image')
            }
            reader.onerror = () => {
                alert('Error reading file. Please try again.')
            }
            reader.readAsDataURL(file)
        }

        const removeImage = () => {
            formData.value.image = ''
            imageError.value = false
        }

        const onContentInput = (event) => {
            formData.value.content = event.target.innerHTML
            validateField('content')
        }

        const handlePaste = (event) => {
            event.preventDefault()
            
            // Get plain text from clipboard
            const text = event.clipboardData.getData('text/plain')
            
            // Insert text at cursor position
            document.execCommand('insertText', false, text)
        }

        const handleKeydown = (event) => {
            // Handle tab key for indentation
            if (event.key === 'Tab') {
                event.preventDefault()
                document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;')
            }
        }

        const formatText = (command) => {
            if (editor.value && !loading.value) {
                editor.value.focus()
                document.execCommand(command, false, null)
                // Update content after formatting
                formData.value.content = editor.value.innerHTML
            }
        }

        const insertList = (command) => {
            if (editor.value && !loading.value) {
                editor.value.focus()
                document.execCommand(command, false, null)
                formData.value.content = editor.value.innerHTML
            }
        }

        const insertLink = () => {
            if (loading.value) return
            const url = prompt('Enter URL:')
            if (url) {
                document.execCommand('createLink', false, url)
                formData.value.content = editor.value.innerHTML
            }
        }

        const insertImage = () => {
            if (loading.value) return
            const url = prompt('Enter image URL:')
            if (url) {
                document.execCommand('insertImage', false, url)
                formData.value.content = editor.value.innerHTML
            }
        }

        const togglePreview = () => {
            if (loading.value) return
            
            // Validate form before showing preview
            if (!showPreview.value) {
                validateField('title')
                validateField('excerpt')
                validateField('category')
                validateField('content')
                
                if (Object.keys(errors.value).length > 0) {
                    alert('Please fix all errors before previewing')
                    return
                }
            }
            
            showPreview.value = !showPreview.value
        }

        const toggleFullscreen = () => {
            isFullscreen.value = !isFullscreen.value
        }

        const toggleSeoSettings = () => {
            showSeoSettings.value = !showSeoSettings.value
        }

        const getCategoryName = (category) => {
            const categories = {
                'technology': 'Technology',
                'programming': 'Programming',
                'web-development': 'Web Development',
                'mobile-development': 'Mobile Development',
                'ai-ml': 'AI & Machine Learning',
                'devops': 'DevOps',
                'career': 'Career',
                'tutorials': 'Tutorials',
                'news': 'News'
            }
            return categories[category] || category
        }

        const formatDate = (date) => {
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        }

        const handleSave = async (isDraft) => {
            // Validate all fields before saving
            validateField('title')
            validateField('excerpt')
            validateField('category')
            validateField('content')
            validateField('slug')
            validateField('image')

            if (Object.keys(errors.value).length > 0) {
                alert('Please fix all errors before saving')
                return
            }

            if (!isDraft && !isFormValid.value) {
                alert('Please fill in all required fields')
                return
            }
            
            savingDraft.value = isDraft
            loading.value = true

            try {
                const postData = {
                    ...formData.value,
                    status: isDraft ? 'draft' : 'published',
                    wordCount: wordCount.value,
                    readingTime: readingTime.value,
                    updatedAt: new Date().toISOString(),
                    createdAt: props.post?.createdAt || new Date().toISOString()
                }

                emit('save-post', postData)
                
                // Show success feedback
                if (isDraft) {
                    autoSaveIndicator.value = true
                    setTimeout(() => {
                        autoSaveIndicator.value = false
                    }, 3000)
                }
            } catch (error) {
                console.error('Error saving post:', error)
                alert('Failed to save post. Please try again.')
            } finally {
                loading.value = false
                savingDraft.value = false
            }
        }

        const handleCancel = () => {
            if (hasUnsavedChanges.value) {
                showUnsavedWarning.value = true
            } else {
                emit('cancel')
            }
        }

        const confirmLeave = () => {
            showUnsavedWarning.value = false
            emit('cancel')
        }

        const startAutoSave = () => {
            autoSaveInterval.value = setInterval(() => {
                if (isFormValid.value && hasUnsavedChanges.value && !loading.value) {
                    // Auto-save draft every 30 seconds if there are changes
                    handleSave(true)
                }
            }, 30000)
        }

        const stopAutoSave = () => {
            if (autoSaveInterval.value) {
                clearInterval(autoSaveInterval.value)
                autoSaveInterval.value = null
            }
        }

        // Lifecycle
        onMounted(() => {
            initializeFormData()
            startAutoSave()

            // Set initial focus
            nextTick(() => {
                const titleInput = document.getElementById('postTitle')
                if (titleInput) {
                    titleInput.focus()
                }
            })
        })

        onUnmounted(() => {
            stopAutoSave()
        })

        // Watchers
        watch(() => props.post, initializeFormData, { immediate: true })

        watch(() => formData.value.image, (newUrl) => {
            if (newUrl) {
                imageError.value = false
                validateField('image')
            }
        })

        // Watch for unsaved changes and handle page/browser navigation
        const handleBeforeUnload = (event) => {
            if (hasUnsavedChanges.value) {
                event.preventDefault()
                event.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
                return event.returnValue
            }
        }

        onMounted(() => {
            window.addEventListener('beforeunload', handleBeforeUnload)
        })

        onUnmounted(() => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        })

        return {
            formData,
            errors,
            loading,
            savingDraft,
            imageError,
            showPreview,
            isFullscreen,
            showSeoSettings,
            imageUploadMethod,
            tagInput,
            tagInputFocused,
            autoSaveIndicator,
            showUnsavedWarning,
            editor,
            fileInput,
            isFormValid,
            wordCount,
            characterCount,
            readingTime,
            compiledContent,
            validateField,
            generateSlug,
            addTag,
            removeTag,
            handleBackspace,
            triggerFileUpload,
            handleDrop,
            handleFileUpload,
            removeImage,
            onContentInput,
            handlePaste,
            handleKeydown,
            formatText,
            insertList,
            insertLink,
            insertImage,
            togglePreview,
            toggleFullscreen,
            toggleSeoSettings,
            getCategoryName,
            formatDate,
            handleSave,
            handleCancel,
            confirmLeave
        }
    }
}
</script>

<style scoped>
.blog-editor {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    position: relative;
}

/* Editor Header */
.editor-header {
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    padding: 1.5rem 2rem;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.header-content h2 {
    margin: 0;
    color: #2c3e50;
    font-size: 1.5rem;
    font-weight: 600;
}

.header-actions {
    display: flex;
    gap: 0.5rem;
}

.btn-icon {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #fff;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    color: #6c757d;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s;
}

.btn-icon:hover:not(:disabled) {
    background: #f8f9fa;
    border-color: #adb5bd;
}

.btn-icon:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Status Bar */
.status-bar {
    display: flex;
    gap: 2rem;
    align-items: center;
    flex-wrap: wrap;
}

.status-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
}

.status-label {
    color: #6c757d;
    font-weight: 500;
}

.status-value {
    color: #2c3e50;
    font-weight: 500;
}

.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
}

.status-badge.draft {
    background: #fff3cd;
    color: #856404;
}

.status-badge.published {
    background: #d1edff;
    color: #0c5460;
}

/* Editor Body */
.editor-body {
    padding: 2rem;
    max-height: calc(100vh - 200px);
    overflow-y: auto;
}

.editor-body.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    background: #fff;
    max-height: 100vh;
}

/* Form Styles */
.editor-form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.form-section {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid #e9ecef;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 1.5rem 0;
    color: #2c3e50;
    font-size: 1.2rem;
    font-weight: 600;
}

.section-title i {
    color: #3498db;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

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

.form-control:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
    opacity: 0.7;
}

.form-control textarea {
    resize: vertical;
    min-height: 80px;
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

/* Form Meta */
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

.error-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #e74c3c;
    font-size: 0.875rem;
    font-weight: 500;
}

/* Tags Input */
.tags-input {
    margin-top: 0.5rem;
}

.tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    padding: 0.5rem;
    border: 2px solid #e9ecef;
    border-radius: 6px;
    background: #fff;
    min-height: 46px;
    transition: all 0.2s ease;
}

.tags-container.focused {
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.tag {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.75rem;
    background: #3498db;
    color: white;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
    user-select: none;
}

.tag:hover {
    background: #2980b9;
}

.tag-input {
    border: none;
    outline: none;
    padding: 0.5rem;
    flex: 1;
    min-width: 120px;
    background: transparent;
}

.tag-input:disabled {
    background: transparent;
}

.tags-hint {
    font-size: 0.75rem;
    color: #6c757d;
    margin-top: 0.25rem;
}

/* Image Upload */
.image-upload-options {
    border: 1px solid #e9ecef;
    border-radius: 6px;
    overflow: hidden;
}

.upload-tabs {
    display: flex;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
}

.tab-button {
    flex: 1;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    cursor: pointer;
    font-weight: 500;
    color: #6c757d;
    transition: all 0.2s;
}

.tab-button.active {
    background: #fff;
    color: #3498db;
    border-bottom: 2px solid #3498db;
}

.tab-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.upload-content {
    padding: 1rem;
}

.file-upload-area {
    border: 2px dashed #dee2e6;
    border-radius: 6px;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
}

.file-upload-area:hover:not(.disabled) {
    border-color: #3498db;
    background: #f8f9fa;
}

.file-upload-area.disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.file-upload-area i {
    font-size: 2rem;
    color: #6c757d;
    margin-bottom: 1rem;
}

.file-upload-area p {
    margin: 0 0 0.5rem 0;
    color: #2c3e50;
    font-weight: 500;
}

.file-upload-area small {
    color: #6c757d;
}

/* Image Preview */
.image-preview {
    margin-top: 1rem;
}

.preview-container {
    position: relative;
    display: inline-block;
    max-width: 300px;
}

.preview-container img {
    max-width: 100%;
    max-height: 200px;
    border-radius: 6px;
    border: 1px solid #e9ecef;
}

.preview-remove {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 24px;
    height: 24px;
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    transition: background 0.2s;
}

.preview-remove:hover:not(:disabled) {
    background: #c0392b;
}

.preview-remove:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Rich Text Editor */
.editor-header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.editor-toolbar {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
}

.toolbar-btn {
    width: 32px;
    height: 32px;
    border: 1px solid #dee2e6;
    background: #fff;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6c757d;
    transition: all 0.2s;
}

.toolbar-btn:hover:not(:disabled) {
    background: #f8f9fa;
    border-color: #adb5bd;
}

.toolbar-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.rich-editor {
    border: 2px solid #e9ecef;
    border-radius: 6px;
    padding: 1rem;
    background: #fff;
    min-height: 300px;
    outline: none;
    line-height: 1.6;
    overflow-y: auto;
    transition: all 0.2s ease;
}

.rich-editor:focus {
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.rich-editor.error {
    border-color: #e74c3c;
    box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
}

.rich-editor[contenteditable="false"] {
    background: #f8f9fa;
    cursor: not-allowed;
    opacity: 0.7;
}

.rich-editor :deep(p) {
    margin: 0 0 1rem 0;
}

.rich-editor :deep(h1),
.rich-editor :deep(h2),
.rich-editor :deep(h3) {
    margin: 1.5rem 0 1rem 0;
    color: #2c3e50;
}

.rich-editor :deep(ul),
.rich-editor :deep(ol) {
    margin: 1rem 0;
    padding-left: 2rem;
}

.rich-editor :deep(blockquote) {
    border-left: 4px solid #3498db;
    margin: 1rem 0;
    padding: 0.5rem 1rem;
    background: #f8f9fa;
    font-style: italic;
}

.rich-editor :deep(code) {
    background: #f1f3f4;
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
}

.rich-editor :deep(pre) {
    background: #2c3e50;
    color: #fff;
    padding: 1rem;
    border-radius: 6px;
    overflow-x: auto;
    margin: 1rem 0;
}

.editor-stats {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
    color: #6c757d;
}

/* Preview Mode */
.preview-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
}

.blog-preview {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.preview-header {
    padding: 2rem;
    border-bottom: 1px solid #e9ecef;
}

.preview-title {
    margin: 0 0 1rem 0;
    color: #2c3e50;
    font-size: 2rem;
    font-weight: 700;
    line-height: 1.2;
}

.preview-meta {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
    color: #6c757d;
}

.preview-category {
    background: #3498db;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-weight: 500;
}

.preview-image img {
    width: 100%;
    max-height: 400px;
    object-fit: cover;
    border-radius: 6px;
}

.preview-excerpt {
    padding: 1.5rem 2rem;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
}

.preview-excerpt p {
    margin: 0;
    font-size: 1.1rem;
    color: #2c3e50;
    line-height: 1.6;
    font-style: italic;
}

.preview-body {
    padding: 2rem;
    line-height: 1.7;
}

.preview-body :deep(*) {
    max-width: 100%;
}

.preview-body :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 6px;
    margin: 1rem 0;
}

.preview-body :deep(a) {
    color: #3498db;
    text-decoration: none;
}

.preview-body :deep(a:hover) {
    text-decoration: underline;
}

.preview-footer {
    padding: 1.5rem 2rem;
    border-top: 1px solid #e9ecef;
    background: #f8f9fa;
}

.preview-tags {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

/* Editor Actions */
.editor-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    background: #f8f9fa;
    border-top: 1px solid #e9ecef;
}

.actions-left,
.actions-right {
    display: flex;
    gap: 0.75rem;
    align-items: center;
}

/* Buttons */
.btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border: 2px solid;
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

.btn.loading {
    position: relative;
    color: transparent;
}

.btn.loading::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.btn-primary {
    background: #3498db;
    border-color: #3498db;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: #2980b9;
    border-color: #2980b9;
    transform: translateY(-1px);
}

.btn-secondary {
    background: #95a5a6;
    border-color: #95a5a6;
    color: white;
}

.btn-secondary:hover:not(:disabled) {
    background: #7f8c8d;
    border-color: #7f8c8d;
}

.btn-outline {
    background: transparent;
    border-color: #dee2e6;
    color: #6c757d;
}

.btn-outline:hover:not(:disabled) {
    background: #f8f9fa;
    border-color: #adb5bd;
}

/* Auto-save Indicator */
.auto-save-indicator {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    background: #27ae60;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    z-index: 1001;
    animation: slideInUp 0.3s ease;
}

/* Unsaved Changes Warning */
.unsaved-warning {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

.warning-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    max-width: 400px;
    width: 90%;
    text-align: center;
}

.warning-content i {
    font-size: 3rem;
    color: #e67e22;
    margin-bottom: 1rem;
}

.warning-text h4 {
    margin: 0 0 0.5rem 0;
    color: #2c3e50;
    font-size: 1.25rem;
}

.warning-text p {
    margin: 0 0 1.5rem 0;
    color: #6c757d;
    line-height: 1.5;
}

.warning-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
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

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
    .editor-header,
    .editor-body,
    .editor-actions {
        padding: 1rem;
    }

    .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .status-bar {
        gap: 1rem;
    }

    .form-row {
        grid-template-columns: 1fr;
    }

    .editor-actions {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }

    .actions-left,
    .actions-right {
        justify-content: center;
    }

    .preview-content {
        padding: 1rem;
    }

    .preview-title {
        font-size: 1.5rem;
    }

    .warning-actions {
        flex-direction: column;
    }
}

@media (max-width: 480px) {
    .form-section {
        padding: 1rem;
    }

    .editor-toolbar {
        flex-wrap: wrap;
    }

    .preview-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .editor-stats {
        flex-direction: column;
        gap: 0.25rem;
    }
}
</style>