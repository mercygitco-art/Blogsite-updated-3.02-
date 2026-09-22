/* UI fixes for header and actions */
.post-actions-clean {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin: 2rem 0 1.5rem 0;
}
.post-header {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
.post-category-badge {
    display: flex;
    align-items: center;
    gap: 1rem;
}
.tags {
    margin-top: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}
<template>
    <div class="blog-post-container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading post...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Post Not Found</h3>
            <p>{{ error }}</p>
            <button class="btn btn-primary" @click="$emit('back-to-home')">
                <i class="fas fa-arrow-left"></i> Back to Home
            </button>
        </div>

        <!-- Main Content -->
        <div v-else-if="post" class="blog-post-view">
            <!-- Featured Image Banner (ALWAYS FIRST) -->
            <div v-if="post.image" class="post-image-banner">
                <img
                    :src="post.image"
                    :alt="post.title"
                    class="post-image"
                    loading="lazy"
                    @error="handleImageError"
                />
                <div v-if="post.imageCaption" class="image-caption">
                    {{ post.imageCaption }}
                </div>
            </div>

            <!-- Navigation Header -->
            <div class="post-navigation">
                <button class="btn-navigation" @click="$emit('back-to-home')">
                    <i class="fas fa-arrow-left"></i>
                    Back to Blog
                </button>
                <div class="navigation-actions">
                    <button 
                        class="btn-icon" 
                        @click="toggleReadingMode"
                        :title="readingMode ? 'Exit reading mode' : 'Enter reading mode'"
                    >
                        <i :class="readingMode ? 'fas fa-compress' : 'fas fa-expand'"></i>
                    </button>
                    <button 
                        class="btn-icon" 
                        @click="toggleFontSize"
                        :title="`Current font size: ${fontSize}`"
                    >
                        <i class="fas fa-text-height"></i>
                    </button>
                    <button 
                        class="btn-icon" 
                        @click="printPost"
                        title="Print post"
                    >
                        <i class="fas fa-print"></i>
                    </button>
                </div>
            </div>

            <header class="post-header post-header-clean">
                <div class="post-category-badge">
                    <span class="post-category">{{ capitalize(post.category) }}</span>
                    <span v-if="post.status === 'draft'" class="status-badge draft">Draft</span>
                    <span v-if="post.isFeatured" class="featured-badge">
                        <i class="fas fa-star"></i> Featured
                    </span>
                </div>
                <h1 class="post-title">{{ post.title }}</h1>
                <div class="post-meta post-meta-clean">
                    <div class="author-info">
                        <div class="author-avatar">
                            <img
                                v-if="post.authorAvatar"
                                :src="post.authorAvatar"
                                :alt="`${post.author}'s avatar`"
                                class="author-avatar-img"
                            />
                            <div v-else class="author-avatar-fallback">
                                {{ getInitials(post.author) }}
                            </div>
                        </div>
                        <div class="author-details">
                            <span class="author-name">{{ post.author }}</span>
                            <span v-if="post.authorTitle" class="author-title">{{ post.authorTitle }}</span>
                        </div>
                    </div>
                    <div class="post-stats">
                        <div class="stat-item">
                            <i class="fas fa-clock"></i>
                            <span>{{ post.readTime }} min read</span>
                        </div>
                        <div class="stat-item" v-if="post.wordCount">
                            <i class="fas fa-file-alt"></i>
                            <span>{{ post.wordCount }} words</span>
                        </div>
                    </div>
                </div>
                <div class="social-share-top">
                    <button 
                        class="share-btn" 
                        @click="shareOnTwitter"
                        title="Share on Twitter"
                    >
                        <i class="fab fa-twitter"></i>
                    </button>
                    <button 
                        class="share-btn" 
                        @click="shareOnLinkedIn"
                        title="Share on LinkedIn"
                    >
                        <i class="fab fa-linkedin"></i>
                    </button>
                    <button 
                        class="share-btn" 
                        @click="shareOnFacebook"
                        title="Share on Facebook"
                    >
                        <i class="fab fa-facebook"></i>
                    </button>
                    <button 
                        class="share-btn" 
                        @click="copyLink"
                        :title="linkCopied ? 'Link copied!' : 'Copy link'"
                    >
                        <i :class="linkCopied ? 'fas fa-check' : 'fas fa-link'"></i>
                    </button>
                </div>
                <div class="post-excerpt" v-if="post.excerpt">
                    {{ post.excerpt }}
                </div>
            </header>

            <!-- Post Content -->
            <article 
                class="post-content" 
                :class="{
                    'reading-mode': readingMode,
                    [`font-size-${fontSize}`]: true
                }"
                ref="postContent"
            >
                <div v-html="sanitizedContent"></div>
            </article>

            <!-- Post Tags -->
            <div v-if="post.tags && post.tags.length" class="post-tags">
                <h3 class="tags-title">
                    <i class="fas fa-tags"></i>
                    Tags
                </h3>
                <div class="tags-container">
                    <span 
                        v-for="tag in post.tags" 
                        :key="tag"
                        class="tag"
                        @click="$emit('tag-click', tag)"
                    >
                        {{ tag }}
                    </span>
                </div>
            </div>

            <!-- Post Actions -->
            <div class="post-actions">
                <div class="actions-left">
                    <button
                        class="action-btn"
                        :class="{ liked: isLiked }"
                        @click="handleLike"
                        :aria-pressed="isLiked"
                        :disabled="likeLoading"
                        :title="isLiked ? 'Unlike this post' : 'Like this post'"
                    >
                        <i v-if="likeLoading" class="fas fa-spinner fa-spin"></i>
                        <i v-else class="fas fa-heart"></i>
                        <span>{{ formatNumber(post.likes || 0) }}</span>
                        <span class="sr-only">{{ post.likes === 1 ? 'Like' : 'Likes' }}</span>
                    </button>



                    <button 
                        class="action-btn" 
                        @click="toggleBookmark"
                        :class="{ bookmarked: isBookmarked }"
                        :title="isBookmarked ? 'Remove bookmark' : 'Bookmark this post'"
                    >
                        <i class="fas fa-bookmark"></i>
                        <span>Save</span>
                    </button>
                </div>

                <div class="actions-right">
                    <div class="share-dropdown">
                        <button class="btn btn-outline" @click="toggleShareDropdown">
                            <i class="fas fa-share-alt"></i>
                            Share
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div v-if="showShareDropdown" class="share-dropdown-menu">
                            <button @click="shareOnTwitter" class="share-option">
                                <i class="fab fa-twitter"></i>
                                Twitter
                            </button>
                            <button @click="shareOnLinkedIn" class="share-option">
                                <i class="fab fa-linkedin"></i>
                                LinkedIn
                            </button>
                            <button @click="shareOnFacebook" class="share-option">
                                <i class="fab fa-facebook"></i>
                                Facebook
                            </button>
                            <button @click="copyLink" class="share-option">
                                <i :class="linkCopied ? 'fas fa-check' : 'fas fa-link'"></i>
                                {{ linkCopied ? 'Copied!' : 'Copy Link' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Author Bio -->
            <div v-if="post.authorBio" class="author-bio">
                <div class="bio-header">
                    <div class="author-avatar">
                        <img
                            v-if="post.authorAvatar"
                            :src="post.authorAvatar"
                            :alt="`${post.author}'s avatar`"
                            class="author-avatar-img"
                        />
                        <div v-else class="author-avatar-fallback">
                            {{ getInitials(post.author) }}
                        </div>
                    </div>
                    <div class="bio-info">
                        <h3>About {{ post.author }}</h3>
                        <p v-if="post.authorTitle" class="author-title">{{ post.authorTitle }}</p>
                    </div>
                </div>
                <div class="bio-content">
                    <p>{{ post.authorBio }}</p>
                </div>
                <div v-if="post.authorSocial" class="author-social">
                    <a 
                        v-for="social in post.authorSocial" 
                        :key="social.platform"
                        :href="social.url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="social-link"
                        :title="`Follow on ${social.platform}`"
                    >
                        <i :class="`fab fa-${social.platform.toLowerCase()}`"></i>
                    </a>
                </div>
            </div>

            <!-- Related Posts -->
            <div v-if="relatedPosts && relatedPosts.length" class="related-posts">
                <h3 class="related-title">
                    <i class="fas fa-thumbtack"></i>
                    Related Posts
                </h3>
                <div class="related-grid">
                    <article 
                        v-for="relatedPost in relatedPosts" 
                        :key="relatedPost.id"
                        class="related-card"
                        @click="$emit('post-click', relatedPost.id)"
                    >
                        <img 
                            v-if="relatedPost.image" 
                            :src="relatedPost.image" 
                            :alt="relatedPost.title"
                            class="related-image"
                        />
                        <div class="related-content">
                            <h4>{{ relatedPost.title }}</h4>
                            <div class="related-meta">
                                <span class="related-category">{{ capitalize(relatedPost.category) }}</span>
                                <span class="related-date">{{ formatDate(relatedPost.publishedAt) }}</span>
                            </div>
                        </div>
                    </article>
                </div>
            </div>

        </div>

        <!-- Reading Progress Bar -->
        <div v-if="post && !readingMode" class="reading-progress">
            <div 
                class="progress-bar" 
                :style="{ width: `${scrollProgress}%` }"
            ></div>
        </div>

        <!-- Back to Top Button -->
        <button 
            v-if="showBackToTop" 
            class="back-to-top"
            @click="scrollToTop"
            title="Back to top"
        >
            <i class="fas fa-chevron-up"></i>
        </button>

        <!-- Share Modal -->
        <div v-if="showShareModal" class="modal-overlay" @click="showShareModal = false">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>Share This Post</h3>
                    <button class="modal-close" @click="showShareModal = false">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="share-options-grid">
                        <button @click="shareOnTwitter" class="share-option-large">
                            <i class="fab fa-twitter"></i>
                            <span>Twitter</span>
                        </button>
                        <button @click="shareOnLinkedIn" class="share-option-large">
                            <i class="fab fa-linkedin"></i>
                            <span>LinkedIn</span>
                        </button>
                        <button @click="shareOnFacebook" class="share-option-large">
                            <i class="fab fa-facebook"></i>
                            <span>Facebook</span>
                        </button>
                        <button @click="copyLink" class="share-option-large">
                            <i :class="linkCopied ? 'fas fa-check' : 'fas fa-link'"></i>
                            <span>{{ linkCopied ? 'Link Copied!' : 'Copy Link' }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import DOMPurify from 'dompurify'

export default {
    name: 'BlogPost',
    props: {
        post: {
            type: Object,
            default: null
        },
        isLiked: {
            type: Boolean,
            default: false
        },
        relatedPosts: {
            type: Array,
            default: () => []
        },
        loading: {
            type: Boolean,
            default: false
        },
        error: {
            type: String,
            default: ''
        }
    },
    emits: [
        'toggle-like', 
        'toggle-save',

        'share-post', 
        'back-to-home',
        'tag-click',
        'post-click',
    ],
    data() {
        return {
            readingMode: false,
            fontSize: 'medium',
            showShareDropdown: false,
            showShareModal: false,
            linkCopied: false,
            likeLoading: false,
            isBookmarked: false,
            showBackToTop: false,
            scrollProgress: 0,
            activeHeading: '',
            headings: [],
            copyTimeout: null
        }
    },
    computed: {
        sanitizedContent() {
            return DOMPurify.sanitize(this.post?.content || '')
        },
        showTableOfContents() {
            return this.headings.length > 2 // Only show if there are more than 2 headings
        }
    },
    watch: {
        post: {
            handler(newPost) {
                if (newPost) {
                    this.$nextTick(() => {
                        this.extractHeadings()
                        this.setupIntersectionObserver()
                    })
                }
            },
            immediate: true
        }
    },
    mounted() {
        this.setupScrollListener()
        this.setupKeyboardNavigation()
    },
    beforeUnmount() {
        this.cleanupEventListeners()
        if (this.copyTimeout) {
            clearTimeout(this.copyTimeout)
        }
    },
    methods: {
        // Utility Methods
        capitalize(str) {
            if (!str) return ''
            return str.charAt(0).toUpperCase() + str.slice(1)
        },

        formatDate(date) {
            if (!date) return ''
            try {
                const d = new Date(date)
                return d.toLocaleDateString(undefined, { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })
            } catch {
                return 'Invalid date'
            }
        },

        formatNumber(num) {
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M'
            } else if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'K'
            }
            return num.toString()
        },

        getInitials(name) {
            if (!name) return 'U'
            return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        },

        // Image Handling
        handleImageError(event) {
            event.target.style.display = 'none'
            const fallback = event.target.parentElement.querySelector('.image-fallback')
            if (fallback) {
                fallback.style.display = 'block'
            }
        },

        // Reading Experience
        toggleReadingMode() {
            this.readingMode = !this.readingMode
            if (this.readingMode) {
                document.body.classList.add('reading-mode-active')
            } else {
                document.body.classList.remove('reading-mode-active')
            }
        },

        toggleFontSize() {
            const sizes = ['small', 'medium', 'large', 'x-large']
            const currentIndex = sizes.indexOf(this.fontSize)
            this.fontSize = sizes[(currentIndex + 1) % sizes.length]
        },

        // Navigation
        scrollToComments() {
            this.$refs.commentsSection?.$el?.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            })
        },

        scrollToHeading(headingId) {
            const element = document.getElementById(headingId)
            if (element) {
                const offset = 100 // Account for fixed header
                const elementPosition = element.offsetTop - offset
                window.scrollTo({
                    top: elementPosition,
                    behavior: 'smooth'
                })
            }
        },

        scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        },

        // Content Analysis
        extractHeadings() {
            if (!this.$refs.postContent) return
            
            const contentElement = this.$refs.postContent
            const headingElements = contentElement.querySelectorAll('h1, h2, h3, h4, h5, h6')
            
            this.headings = Array.from(headingElements)
                .filter(heading => heading.id) // Only headings with IDs
                .map(heading => ({
                    id: heading.id,
                    text: heading.textContent,
                    level: parseInt(heading.tagName.charAt(1))
                }))
        },

        setupIntersectionObserver() {
            if (!this.$refs.postContent) return

            const headings = this.$refs.postContent.querySelectorAll('h1, h2, h3, h4, h5, h6')
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.activeHeading = entry.target.id
                        }
                    })
                },
                { 
                    rootMargin: '-20% 0px -60% 0px',
                    threshold: 0.1
                }
            )

            headings.forEach(heading => {
                if (heading.id) {
                    observer.observe(heading)
                }
            })

            this.intersectionObserver = observer
        },

        // Scroll Handling
        setupScrollListener() {
            this.handleScroll = () => {
                // Reading progress
                const winHeight = window.innerHeight
                const docHeight = document.documentElement.scrollHeight
                const scrollTop = window.pageYOffset
                this.scrollProgress = (scrollTop / (docHeight - winHeight)) * 100

                // Back to top button
                this.showBackToTop = scrollTop > 1000
            }

            window.addEventListener('scroll', this.handleScroll, { passive: true })
        },

        // Interactions
        handleLike() {
            if (this.likeLoading) return
            
            this.likeLoading = true
            this.$emit('toggle-like', this.post.id)
            this.likeLoading = false
        },

        toggleBookmark() {
            this.$emit('toggle-save', this.post.id)
        },

        // Sharing
        shareOnTwitter() {
            const text = encodeURIComponent(`Check out this article: ${this.post.title}`)
            const url = encodeURIComponent(window.location.href)
            window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
            this.showShareDropdown = false
            this.showShareModal = false
        },

        shareOnLinkedIn() {
            const url = encodeURIComponent(window.location.href)
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank')
            this.showShareDropdown = false
            this.showShareModal = false
        },

        shareOnFacebook() {
            const url = encodeURIComponent(window.location.href)
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
            this.showShareDropdown = false
            this.showShareModal = false
        },

        copyLink() {
            const url = window.location.href
            navigator.clipboard.writeText(url).then(() => {
                this.linkCopied = true
                if (this.copyTimeout) {
                    clearTimeout(this.copyTimeout)
                }
                this.copyTimeout = setTimeout(() => {
                    this.linkCopied = false
                }, 2000)
            })
        },

        toggleShareDropdown() {
            this.showShareDropdown = !this.showShareDropdown
        },

        // Comments
        handleAddComment(comment) {
            this.$emit('add-comment', {
                ...comment,
                postId: this.post.id
            })
        },

        handleReplyComment(reply) {
            this.$emit('reply-comment', {
                ...reply,
                postId: this.post.id
            })
        },

        // Printing
        printPost() {
            window.print()
        },

        // Keyboard Navigation
        setupKeyboardNavigation() {
            this.handleKeydown = (event) => {
                // Escape key to exit reading mode
                if (event.key === 'Escape' && this.readingMode) {
                    this.toggleReadingMode()
                }
                
                // Space bar to toggle reading mode
                if (event.key === ' ' && event.target === document.body) {
                    event.preventDefault()
                    this.toggleReadingMode()
                }
            }

            document.addEventListener('keydown', this.handleKeydown)
        },

        // Cleanup
        cleanupEventListeners() {
            if (this.handleScroll) {
                window.removeEventListener('scroll', this.handleScroll)
            }
            if (this.handleKeydown) {
                document.removeEventListener('keydown', this.handleKeydown)
            }
            if (this.intersectionObserver) {
                this.intersectionObserver.disconnect()
            }
        }
    }
}
</script>

<style scoped>
.blog-post-container {
    position: relative;
    max-width: 1200px;
    margin: 0 auto;
    min-height: 100vh;
}

/* Loading & Error States */
.loading-state,
.error-state {
    text-align: center;
    padding: 4rem 2rem;
    color: #6c757d;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

.error-state i {
    font-size: 3rem;
    color: #e74c3c;
    margin-bottom: 1rem;
}

.error-state h3 {
    margin: 0 0 0.5rem;
    color: #2c3e50;
}

/* Navigation */
.post-navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e9ecef;
}

.btn-navigation {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    color: #6c757d;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-navigation:hover {
    background: #e9ecef;
    border-color: #adb5bd;
}

.navigation-actions {
    display: flex;
    gap: 0.5rem;
}

.btn-icon {
    width: 40px;
    height: 40px;
    border: 1px solid #dee2e6;
    background: #fff;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6c757d;
    transition: all 0.2s;
}

.btn-icon:hover {
    background: #f8f9fa;
    border-color: #adb5bd;
}

/* Post Header */
.post-header {
    margin-bottom: 35rem;
}

.post-category-badge {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
}

.post-category {
    background: #e3f2fd;
    color: #1976d2;
    padding: 0.4rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-badge {
    padding: 0.3rem 0.8rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
}

.status-badge.draft {
    background: #fff3cd;
    color: #856404;
}

.featured-badge {
    background: linear-gradient(135deg, #ffd700, #ffed4e);
    color: #856404;
    padding: 0.4rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.post-title {
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 800;
    line-height: 1.2;
    margin: 0 0 1rem 0;
    color: #2c3e50;
    word-wrap: break-word;
}

.post-excerpt {
    font-size: 1.25rem;
    line-height: 1.6;
    color: #6c757d;
    margin-bottom: 2rem;
    font-style: italic;
    border-left: 4px solid #3498db;
    padding-left: 1rem;
}

.post-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.author-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.author-avatar {
    position: relative;
}

.author-avatar-img,
.author-avatar-fallback {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    object-fit: cover;
}

.author-avatar-fallback {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 1.2rem;
}

.author-details {
    display: flex;
    flex-direction: column;
}

.author-name {
    font-weight: 600;
    color: #2c3e50;
    font-size: 1.1rem;
}

.author-title {
    color: #6c757d;
    font-size: 0.9rem;
}

.post-stats {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    flex-wrap: wrap;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #6c757d;
    font-size: 0.9rem;
}

.stat-item i {
    width: 16px;
    color: #3498db;
}

/* Social Share */
.social-share-top {
    display: flex;
    gap: 0.5rem;
    margin-top: 1.5rem;
}

.share-btn {
    width: 40px;
    height: 40px;
    border: 1px solid #dee2e6;
    background: #fff;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6c757d;
    transition: all 0.2s;
}

.share-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.share-btn:nth-child(1):hover { background: #1da1f2; color: white; border-color: #1da1f2; }
.share-btn:nth-child(2):hover { background: #0077b5; color: white; border-color: #0077b5; }
.share-btn:nth-child(3):hover { background: #4267B2; color: white; border-color: #4267B2; }
.share-btn:nth-child(4):hover { background: #6c757d; color: white; border-color: #6c757d; }

/* Featured Image */
.post-image-container {
    margin: 2rem 0;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.post-image {
    width: 100%;
    max-height: 500px;
    object-fit: cover;
    display: block;
}

.image-caption {
    text-align: center;
    padding: 1rem;
    background: #f8f9fa;
    color: #6c757d;
    font-style: italic;
    font-size: 0.9rem;
    border-top: 1px solid #e9ecef;
}

/* Table of Contents */
.table-of-contents {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 1.5rem;
    margin: 2rem 0;
}

.toc-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 1rem 0;
    color: #2c3e50;
    font-size: 1.1rem;
}

.toc-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.toc-list li {
    margin-bottom: 0.5rem;
}

.toc-list a {
    display: block;
    padding: 0.5rem 0.75rem;
    color: #6c757d;
    text-decoration: none;
    border-radius: 4px;
    transition: all 0.2s;
    border-left: 3px solid transparent;
}

.toc-list a:hover,
.toc-list a.active {
    background: #fff;
    color: #3498db;
    border-left-color: #3498db;
}

.toc-level-2 { padding-left: 1rem; }
.toc-level-3 { padding-left: 2rem; }
.toc-level-4 { padding-left: 3rem; }
.toc-level-5 { padding-left: 4rem; }
.toc-level-6 { padding-left: 5rem; }

/* Post Content */
.post-content {
    line-height: 1.8;
    color: #2c3e50;
    margin-bottom: 3rem;
}

.post-content.reading-mode {
    max-width: 700px;
    margin: 0 auto 3rem;
    font-size: 1.2rem;
    line-height: 1.8;
}

.post-content.font-size-small { font-size: 0.9rem; }
.post-content.font-size-medium { font-size: 1rem; }
.post-content.font-size-large { font-size: 1.1rem; }
.post-content.font-size-x-large { font-size: 1.2rem; }

/* Content Styling (applied to rendered HTML) */
.post-content :deep(h1),
.post-content :deep(h2),
.post-content :deep(h3),
.post-content :deep(h4),
.post-content :deep(h5),
.post-content :deep(h6) {
    margin: 2rem 0 1rem 0;
    color: #2c3e50;
    line-height: 1.3;
}

.post-content :deep(h1) { font-size: 2rem; font-weight: 700; }
.post-content :deep(h2) { font-size: 1.75rem; font-weight: 600; }
.post-content :deep(h3) { font-size: 1.5rem; font-weight: 600; }
.post-content :deep(h4) { font-size: 1.25rem; font-weight: 600; }
.post-content :deep(h5) { font-size: 1.1rem; font-weight: 600; }
.post-content :deep(h6) { font-size: 1rem; font-weight: 600; }

.post-content :deep(p) {
    margin-bottom: 1.5rem;
}

.post-content :deep(a) {
    color: #3498db;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s;
}

.post-content :deep(a:hover) {
    border-bottom-color: #3498db;
}

.post-content :deep(blockquote) {
    border-left: 4px solid #3498db;
    margin: 2rem 0;
    padding: 1rem 1.5rem;
    background: #f8f9fa;
    font-style: italic;
    color: #6c757d;
}

.post-content :deep(code) {
    background: #f1f3f4;
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
}

.post-content :deep(pre) {
    background: #2c3e50;
    color: #fff;
    padding: 1.5rem;
    border-radius: 8px;
    overflow-x: auto;
    margin: 2rem 0;
    line-height: 1.5;
}

.post-content :deep(pre code) {
    background: none;
    padding: 0;
    color: inherit;
}

.post-content :deep(ul),
.post-content :deep(ol) {
    margin: 1.5rem 0;
    padding-left: 2rem;
}

.post-content :deep(li) {
    margin-bottom: 0.5rem;
}

.post-content :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 1.5rem 0;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.post-content :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 2rem 0;
}

.post-content :deep(th),
.post-content :deep(td) {
    padding: 0.75rem;
    border: 1px solid #dee2e6;
    text-align: left;
}

.post-content :deep(th) {
    background: #f8f9fa;
    font-weight: 600;
}

/* Tags */
.post-tags {
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid #e9ecef;
}

.tags-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 1rem 0;
    color: #2c3e50;
    font-size: 1.1rem;
}

.tags-container {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.tag {
    background: #e3f2fd;
    color: #1976d2;
    padding: 0.4rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.tag:hover {
    background: #1976d2;
    color: white;
    transform: translateY(-1px);
}

/* Post Actions */
.post-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 3rem 0;
    padding: 2rem 0;
    border-top: 1px solid #e9ecef;
    border-bottom: 1px solid #e9ecef;
    flex-wrap: wrap;
    gap: 1rem;
}

.actions-left {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.action-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    color: #6c757d;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
}

.action-btn:hover {
    background: #e9ecef;
    transform: translateY(-1px);
}

.action-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.action-btn.liked {
    background: #ffeaea;
    color: #e74c3c;
    border-color: #e74c3c;
}

.action-btn.bookmarked {
    background: #fff3cd;
    color: #856404;
    border-color: #856404;
}

.actions-right {
    position: relative;
}

.share-dropdown {
    position: relative;
}

.share-dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    padding: 0.5rem;
    min-width: 150px;
    z-index: 100;
    margin-top: 0.5rem;
}

.share-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    color: #6c757d;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.2s;
}

.share-option:hover {
    background: #f8f9fa;
}

/* Author Bio */
.author-bio {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 2rem;
    margin: 3rem 0;
    border: 1px solid #e9ecef;
}

.bio-header {
    display: flex;
    align-items: flex-start;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}

.bio-info h3 {
    margin: 0 0 0.5rem 0;
    color: #2c3e50;
}

.bio-content p {
    margin: 0;
    line-height: 1.7;
    color: #6c757d;
}

.author-social {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
}

.social-link {
    width: 40px;
    height: 40px;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6c757d;
    text-decoration: none;
    transition: all 0.2s;
}

.social-link:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

/* Related Posts */
.related-posts {
    margin: 3rem 0;
}

.related-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 1.5rem 0;
    color: #2c3e50;
    font-size: 1.25rem;
}

.related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
}

.related-card {
    background: white;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s;
}

.related-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.related-image {
    width: 100%;
    height: 160px;
    object-fit: cover;
}

.related-content {
    padding: 1.25rem;
}

.related-content h4 {
    margin: 0 0 0.75rem 0;
    color: #2c3e50;
    font-size: 1.1rem;
    line-height: 1.4;
}

.related-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.85rem;
    color: #6c757d;
}

.related-category {
    background: #e3f2fd;
    color: #1976d2;
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
    font-weight: 500;
}

/* Reading Progress */
.reading-progress {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: #e9ecef;
    z-index: 1000;
}

.progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #3498db, #667eea);
    transition: width 0.1s ease;
}

/* Back to Top */
.back-to-top {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 50px;
    height: 50px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(52, 152, 219, 0.3);
    transition: all 0.3s;
    z-index: 1000;
}

.back-to-top:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
}

/* Share Modal */
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
    z-index: 2000;
}

.modal-content {
    background: white;
    border-radius: 12px;
    padding: 0;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
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
}

.modal-close {
    background: none;
    border: none;
    font-size: 1.25rem;
    color: #6c757d;
    cursor: pointer;
    padding: 0.25rem;
}

.modal-body {
    padding: 1.5rem;
}

.share-options-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}

.share-option-large {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
}

.share-option-large:hover {
    background: #e9ecef;
    transform: translateY(-2px);
}

.share-option-large i {
    font-size: 1.5rem;
}

/* Buttons */
.btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border: 2px solid;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
}

.btn-primary {
    background: #3498db;
    border-color: #3498db;
    color: white;
}

.btn-primary:hover {
    background: #2980b9;
    border-color: #2980b9;
    transform: translateY(-1px);
}

.btn-outline {
    background: transparent;
    border-color: #dee2e6;
    color: #6c757d;
}

.btn-outline:hover {
    background: #f8f9fa;
    border-color: #adb5bd;
}

/* Accessibility */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

/* Animations */
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
    .blog-post-view {
        padding: 1rem;
    }

    .post-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 1.5rem;
    }

    .post-stats {
        gap: 1rem;
    }

    .post-actions {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }

    .actions-left {
        justify-content: center;
    }

    .actions-right {
        width: 100%;
    }

    .share-dropdown {
        width: 100%;
    }

    .share-dropdown-menu {
        right: auto;
        left: 0;
        width: 100%;
    }

    .related-grid {
        grid-template-columns: 1fr;
    }

    .bio-header {
        flex-direction: column;
        text-align: center;
    }

    .table-of-contents {
        display: none; /* Hide TOC on mobile for better experience */
    }
}

@media (max-width: 480px) {
    .post-title {
        font-size: 1.75rem;
    }

    .post-excerpt {
        font-size: 1.1rem;
    }

    .actions-left {
        flex-wrap: wrap;
        justify-content: center;
    }

    .share-options-grid {
        grid-template-columns: 1fr;
    }
}

/* Print Styles */
@media print {
    .post-navigation,
    .social-share-top,
    .post-actions,
    .back-to-top {
        display: none !important;
    }

    .blog-post-view {
        box-shadow: none;
        padding: 0;
    }

    .post-content {
        font-size: 12pt;
        line-height: 1.6;
    }
}
</style>