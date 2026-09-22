<template>
    <div class="home-page">
        <!-- Hero Section -->
        <section class="hero">
            <div class="container">
                <div class="hero-content">
                    <div class="hero-text">
                        <h1>
                            <span class="gradient-text">Discover</span> Your Next Favorite Blog
                        </h1>
                        <p>
                            Join our community of passionate writers and readers. Explore diverse voices and stories. 
                            Whether you're a tech enthusiast, lifestyle guru, or travel lover, there's something here for everyone.
                        </p>
                        <div class="hero-actions">
                            <button class="btn btn-primary" @click="startWriting">
                                <i class="fas fa-pen"></i> Start Writing
                            </button>
                            <button class="btn btn-outline" @click="scrollToFeatured">
                                <i class="fas fa-book-open"></i> Explore Articles
                            </button>
                        </div>
                        <div class="hero-stats">
                            <div class="stat">
                                <strong>{{ formatNumber(stats.articles) }}+</strong>
                                <span>Articles Published</span>
                            </div>
                            <div class="stat">
                                <strong>{{ formatNumber(stats.readers) }}+</strong>
                                <span>Monthly Readers</span>
                            </div>
                            <div class="stat">
                                <strong>{{ formatNumber(stats.authors) }}+</strong>
                                <span>Active Writers</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="hero-visual">
                        <div class="terminal">
                            <div class="terminal-header">
                                <div class="window-controls">
                                    <div class="circle red"></div>
                                    <div class="circle yellow"></div>
                                    <div class="circle green"></div>
                                </div>
                                <span class="terminal-title">latest-post.md</span>
                                <div class="terminal-actions">
                                    <button class="terminal-btn" @click="refreshLatestPost" title="Refresh">
                                        <i class="fas fa-sync-alt" :class="{ 'fa-spin': refreshing }"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="terminal-body">
                                <div class="terminal-line">
                                    <span class="prompt">$</span>
                                    <span class="command">cat latest-post.md</span>
                                </div>
                                <div class="terminal-content">
                                    <div v-if="latestPost" class="post-preview">
                                        <h3 class="post-title">{{ latestPost.title }}</h3>
                                        <p class="post-excerpt">{{ latestPost.excerpt }}</p>
                                        <div class="post-meta">
                                            <span class="meta-item">
                                                <i class="fas fa-user"></i>
                                                {{ latestPost.author }}
                                            </span>
                                            <span class="meta-item">
                                                <i class="fas fa-clock"></i>
                                                {{ formatDate(latestPost.createdAt) }}
                                            </span>
                                            <span class="meta-item">
                                                <i class="fas fa-tag"></i>
                                                {{ capitalize(latestPost.category) }}
                                            </span>
                                        </div>
                                        <div class="post-stats">
                                            <span class="stat-item">
                                                <i class="fas fa-heart"></i>
                                                {{ formatNumber(latestPost.likes || 0) }}
                                            </span>
                                        </div>
                                    </div>
                                    <div v-else class="post-preview loading">
                                        <div class="skeleton skeleton-title"></div>
                                        <div class="skeleton skeleton-text"></div>
                                        <div class="skeleton skeleton-text-short"></div>
                                    </div>
                                </div>
                                <div class="terminal-line">
                                    <span class="prompt">$</span>
                                    <span class="command" :class="{ 'typing': isTyping }">
                                        <span v-if="isTyping">{{ typedCommand }}</span>
                                        <span class="cursor" :class="{ 'blink': !isTyping }">_</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Scroll Indicator -->
            <div class="scroll-indicator" @click="scrollToFeatured">
                <i class="fas fa-chevron-down"></i>
            </div>
        </section>

        <!-- Trending Topics -->
        <section class="trending-section" v-if="trendingTopics.length > 0">
            <div class="container">
                <h3 class="section-subtitle">Trending Topics</h3>
                <div class="trending-tags">
                    <button 
                        v-for="topic in trendingTopics" 
                        :key="topic.name"
                        class="trending-tag"
                        :style="{ '--hue': topic.hue }"
                        @click="searchTopic(topic.name)"
                    >
                        <span class="trending-icon">#</span>
                        {{ topic.name }}
                        <span class="trending-count">{{ topic.count }}</span>
                    </button>
                </div>
            </div>
        </section>

        <!-- Category Filter -->
        <section class="category-section">
            <div class="container">
                <div class="category-filter">
                    <h3>Browse by Category</h3>
                    <div class="category-tags">
                        <button 
                            v-for="cat in categories" 
                            :key="cat.id"
                            class="category-tag"
                            :class="{ 
                                active: selectedCategory === cat.id,
                                'has-count': cat.count > 0
                            }"
                            @click="setCategory(cat.id)"
                        >
                            <i :class="cat.icon"></i>
                            {{ cat.name }}
                            <span v-if="cat.count > 0" class="category-count">{{ cat.count }}</span>
                        </button>
                    </div>
                    <div class="category-actions" v-if="selectedCategory !== 'all'">
                        <button class="btn-clear" @click="clearFilters">
                            <i class="fas fa-times"></i>
                            Clear Filter
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Featured Posts -->
        <section class="featured-posts" ref="featuredSection">
            <div class="container">
                <div class="section-header">
                    <h2>Featured Stories</h2>
                    <p>Discover the most engaging content from our community</p>
                    <div class="view-controls">
                        <button 
                            class="view-btn"
                            :class="{ active: viewMode === 'grid' }"
                            @click="viewMode = 'grid'"
                            title="Grid View"
                        >
                            <i class="fas fa-th"></i>
                        </button>
                        <button 
                            class="view-btn"
                            :class="{ active: viewMode === 'list' }"
                            @click="viewMode = 'list'"
                            title="List View"
                        >
                            <i class="fas fa-list"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Posts Grid/List -->
                <div 
                    class="posts-container" 
                    :class="`view-${viewMode}`"
                    v-if="filteredPosts.length"
                >
                    <transition-group name="posts-fade">
                        <BlogCard 
                            v-for="post in filteredPosts" 
                            :key="post.id" 
                            :post="post"
                            :view-mode="viewMode"
                            :is-liked="isLiked(post.id)"
                            :is-saved="isSaved(post.id)"
                            @view-post="viewPost"
                            @toggle-like="toggleLike"
                            @toggle-save="toggleSave"
                            @author-click="viewAuthorPosts"
                        />
                    </transition-group>
                </div>
                
                <!-- No Posts State -->
                <div v-else class="no-posts">
                    <div class="no-posts-content">
                        <i class="fas fa-search"></i>
                        <h3>No posts found</h3>
                        <p>Try selecting a different category or check back later for new content.</p>
                        <div class="no-posts-actions">
                            <button class="btn btn-primary" @click="clearFilters">
                                <i class="fas fa-times"></i> Clear Filters
                            </button>
                            <button class="btn btn-outline" @click="startWriting">
                                <i class="fas fa-pen"></i> Write First Post
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Loading More -->
                <div v-if="loadingMore" class="loading-more">
                    <div class="loading-spinner"></div>
                    <p>Loading more posts...</p>
                </div>
            </div>
        </section>

        <!-- Back to Top -->
        <button 
            v-if="showBackToTop" 
            class="back-to-top"
            @click="scrollToTop"
            title="Back to top"
        >
            <i class="fas fa-chevron-up"></i>
        </button>
    </div>
</template>

<script>
import BlogCard from '../common/BlogCard.vue'

import { CATEGORY_DEFINITIONS } from '../../config/categories.js'

export default {
    name: 'Home',
    components: {
        BlogCard
    },
    props: {
        posts: {
            type: Array,
            default: () => []
        },
        currentCategory: {
            type: String,
            default: 'all'
        }
    },
    emits: [
        'view-post', 
        'toggle-like', 
        'toggle-save', 
        'start-writing',
        'search-topic',
        'view-author',
        'toggle-follow',
        'subscribe-newsletter'
    ],
    data() {
        return {
            selectedCategory: this.currentCategory,
            visiblePosts: 9,
            viewMode: 'grid',
            loadingMore: false,
            showBackToTop: false,
            email: '',
            emailError: '',
            subscriptionSuccess: false,
            subscribing: false,
            refreshing: false,
            isTyping: true,
            typedCommand: '',
            currentTypingIndex: 0,
            typingSpeed: 50,
            fullCommand: 'open latest-post.md',
            stats: {
                articles: 1250,
                readers: 50000,
                authors: 350
            }
        }
    },
    computed: {
        categories() {
            const categoryCounts = this.getCategoryCounts()
            return CATEGORY_DEFINITIONS.map(category => ({
                ...category,
                count: category.id === 'all'
                    ? this.posts.length
                    : categoryCounts[category.id] || 0
            }))
        },
        filteredPosts() {
            let filtered = this.posts || []
            if (this.selectedCategory !== 'all') {
                filtered = filtered.filter(post => post.category === this.selectedCategory)
            }
            return filtered.slice(0, this.visiblePosts)
        },
        hasMorePosts() {
            let totalPosts = this.posts.length
            if (this.selectedCategory !== 'all') {
                totalPosts = this.posts.filter(post => post.category === this.selectedCategory).length
            }
            return this.visiblePosts < totalPosts
        },
        remainingPosts() {
            let totalPosts = this.posts.length
            if (this.selectedCategory !== 'all') {
                totalPosts = this.posts.filter(post => post.category === this.selectedCategory).length
            }
            return totalPosts - this.visiblePosts
        },
        latestPost() {
            if (!this.posts || this.posts.length === 0) return null
            const sorted = [...this.posts].sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            )
            return sorted[0]
        },
        trendingTopics() {
            // Mock trending topics - in real app, this would come from analytics
            return [
                { name: 'Web Development', count: 45, hue: 200 },
                { name: 'Digital Nomad', count: 32, hue: 160 },
                { name: 'Healthy Living', count: 28, hue: 120 },
                { name: 'Startup Tips', count: 25, hue: 280 },
                { name: 'Travel Hacks', count: 22, hue: 40 },
                { name: 'Cooking Recipes', count: 18, hue: 20 }
            ]
        }
    },
    watch: {
        currentCategory(newCategory) {
            this.selectedCategory = newCategory
        }
    },
    mounted() {
        this.startTypingAnimation()
        this.setupScrollListener()
        this.setupIntersectionObserver()
    },
    beforeUnmount() {
        this.cleanupEventListeners()
    },
    methods: {
        // Category Methods
        setCategory(category) {
            this.selectedCategory = category
            this.visiblePosts = 9
            this.scrollToFeatured()
        },
        clearFilters() {
            this.selectedCategory = 'all'
            this.visiblePosts = 9
        },
        getCategoryCounts() {
            const counts = {}
            this.posts.forEach(post => {
                counts[post.category] = (counts[post.category] || 0) + 1
            })
            return counts
        },

        // Post Methods
        startWriting() {
            this.$emit('start-writing')
        },
        viewPost(postId) {
            this.$emit('view-post', postId)
        },
        toggleLike(postId) {
            this.$emit('toggle-like', postId)
        },
        toggleSave(postId) {
            this.$emit('toggle-save', postId)
        },
        isLiked(postId) {
            // This would come from your store/composable
            return false
        },
        isSaved(postId) {
            // This would come from your store/composable
            return false
        },

        // Loading Methods
        async loadMore() {
            this.loadingMore = true
            this.visiblePosts += 9
            this.loadingMore = false
        },

        // Navigation Methods
        scrollToFeatured() {
            this.$refs.featuredSection?.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            })
        },
        scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        },

        // Search Methods
        searchTopic(topic) {
            this.$emit('search-topic', topic)
        },

        // Author Methods
        viewAuthorPosts(authorId) {
            this.$emit('view-author', authorId)
        },
        toggleFollow(authorId) {
            this.$emit('toggle-follow', authorId)
        },
        isFollowing(authorId) {
            // This would come from your store/composable
            return false
        },

        // Newsletter Methods
        async subscribeNewsletter() {
            if (!this.validateEmail()) return
            
            this.emailError = 'Newsletter subscriptions are unavailable because no backend endpoint is configured.'
        },
        validateEmail() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!this.email) {
                this.emailError = 'Email is required'
                return false
            }
            if (!emailRegex.test(this.email)) {
                this.emailError = 'Please enter a valid email address'
                return false
            }
            return true
        },
        clearEmailError() {
            this.emailError = ''
        },

        // Terminal Methods
        startTypingAnimation() {
            this.isTyping = true
            this.currentTypingIndex = 0
            this.typedCommand = ''
            
            const type = () => {
                if (this.currentTypingIndex < this.fullCommand.length) {
                    this.typedCommand += this.fullCommand[this.currentTypingIndex]
                    this.currentTypingIndex++
                    setTimeout(type, this.typingSpeed)
                } else {
                    this.isTyping = false
                    // Restart typing after a delay
                    setTimeout(() => {
                        this.startTypingAnimation()
                    }, 3000)
                }
            }
            
            type()
        },
        refreshLatestPost() {
            this.emailError = 'Refreshing the latest post is unavailable because posts are already loaded locally.'
        },

        // UI Methods
        showCommunity() {
            this.emailError = 'Community features are unavailable because no backend endpoint is configured.'
        },
        setupScrollListener() {
            this.handleScroll = () => {
                this.showBackToTop = window.pageYOffset > 1000
            }
            window.addEventListener('scroll', this.handleScroll, { passive: true })
        },
        setupIntersectionObserver() {
            // Setup for lazy loading or animations
        },

        // Utility Methods
        formatDate(dateString) {
            if (!dateString) return ''
            try {
                const options = { year: 'numeric', month: 'short', day: 'numeric' }
                return new Date(dateString).toLocaleDateString(undefined, options)
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
        capitalize(str) {
            if (!str) return ''
            return str.charAt(0).toUpperCase() + str.slice(1)
        },
        getInitials(name) {
            if (!name) return 'U'
            return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        },
        handleImageError(event) {
            event.target.style.display = 'none'
        },

        // Cleanup
        cleanupEventListeners() {
            if (this.handleScroll) {
                window.removeEventListener('scroll', this.handleScroll)
            }
        }
    }
}
</script>

<style scoped>
.home-page {
    min-height: 100vh;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

/* Hero Section */
.hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    padding: 3rem 0 5rem;
    position: relative;
    overflow: hidden;
}

.hero .container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    align-items: center;
}

.hero-content {
    display: contents;
}

.hero-text h1 {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 1.5rem;
    line-height: 1.2;
}

.gradient-text {
    background: linear-gradient(90deg, #ffd89b, #19547b);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.hero-text p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    opacity: 0.9;
    line-height: 1.6;
}

.hero-actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 3rem;
    flex-wrap: wrap;
}

.btn {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-primary {
    background: #ff6b6b;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: #ff5252;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
}

.btn-primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
}

.btn-outline {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-outline:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}

.hero-stats {
    display: flex;
    gap: 2rem;
}

.stat {
    text-align: left;
}

.stat strong {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
}

.stat span {
    font-size: 0.9rem;
    opacity: 0.8;
}

/* Terminal Styles */
.hero-visual {
    display: flex;
    justify-content: center;
    align-items: center;
}

.terminal {
    background: #1a1b26;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    width: 100%;
    max-width: 500px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.terminal-header {
    background: #2f334d;
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border-bottom: 1px solid #3b4261;
}

.window-controls {
    display: flex;
    gap: 0.5rem;
}

.circle {
    width: 12px;
    height: 12px;
    border-radius: 50%;
}

.circle.red { background: #ff5f57; }
.circle.yellow { background: #ffbd2e; }
.circle.green { background: #28ca42; }

.terminal-title {
    color: #a9b1d6;
    font-size: 0.9rem;
    margin-left: auto;
    margin-right: auto;
}

.terminal-actions {
    display: flex;
    gap: 0.25rem;
}

.terminal-btn {
    background: none;
    border: none;
    color: #a9b1d6;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: background 0.2s;
}

.terminal-btn:hover {
    background: rgba(255, 255, 255, 0.1);
}

.terminal-body {
    padding: 1.5rem;
    color: #c0caf5;
    min-height: 200px;
}

.terminal-line {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
}

.prompt {
    color: #7aa2f7;
    margin-right: 0.75rem;
    font-weight: bold;
}

.command {
    color: #9ece6a;
}

.command.typing {
    border-right: 2px solid #9ece6a;
}

.terminal-content {
    background: #16161e;
    border: 1px solid #3b4261;
    border-radius: 8px;
    padding: 1.5rem;
    margin: 1rem 0;
}

.post-preview h3 {
    color: #7dcfff;
    font-size: 1.2rem;
    margin-bottom: 1rem;
    font-weight: 600;
}

.post-preview p {
    color: #c0caf5;
    line-height: 1.5;
    margin-bottom: 1rem;
    font-size: 0.95rem;
}

.post-meta {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    font-size: 0.85rem;
    margin-bottom: 1rem;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: #737aa2;
}

.meta-item i {
    font-size: 0.75rem;
}

.post-stats {
    display: flex;
    gap: 1rem;
    font-size: 0.8rem;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: #565f89;
}

/* Skeleton Loading */
.skeleton {
    background: linear-gradient(90deg, #2a2e3f 25%, #3b4261 50%, #2a2e3f 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 4px;
}

.skeleton-title {
    height: 1.5rem;
    margin-bottom: 1rem;
    width: 80%;
}

.skeleton-text {
    height: 0.875rem;
    margin-bottom: 0.5rem;
    width: 100%;
}

.skeleton-text-short {
    height: 0.875rem;
    width: 60%;
}

@keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

.cursor {
    display: inline-block;
}

.blink {
    animation: blink 1s infinite;
}

@keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
}

/* Scroll Indicator */
.scroll-indicator {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    animation: bounce 2s infinite;
}

@keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
    40% { transform: translateX(-50%) translateY(-10px); }
    60% { transform: translateX(-50%) translateY(-5px); }
}

/* Trending Section */
.trending-section {
    padding: 2rem 0;
    background: #f8f9fa;
}

.section-subtitle {
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
    color: #666;
    font-weight: 600;
}

.trending-tags {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.75rem;
}

.trending-tag {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.2rem;
    background: white;
    border: 2px solid #e9ecef;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
    color: #666;
    position: relative;
    overflow: hidden;
}

.trending-tag::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transition: left 0.5s;
}

.trending-tag:hover::before {
    left: 100%;
}

.trending-tag:hover {
    border-color: hsl(var(--hue), 70%, 60%);
    color: hsl(var(--hue), 70%, 50%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.trending-icon {
    font-weight: bold;
    opacity: 0.7;
}

.trending-count {
    background: #f1f3f4;
    color: #666;
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
}

/* Category Section */
.category-section {
    padding: 3rem 0;
    background: white;
}

.category-filter h3 {
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
    color: #333;
}

.category-tags {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.category-tag {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: white;
    border: 2px solid #e9ecef;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
    color: #666;
    position: relative;
}

.category-tag:hover {
    border-color: #007bff;
    color: #007bff;
    transform: translateY(-2px);
}

.category-tag.active {
    background: #007bff;
    border-color: #007bff;
    color: white;
}

.category-tag.has-count::after {
    content: '';
    position: absolute;
    top: -5px;
    right: -5px;
    width: 8px;
    height: 8px;
    background: #ff6b6b;
    border-radius: 50%;
    border: 2px solid white;
}

.category-count {
    background: rgba(0, 123, 255, 0.1);
    color: #007bff;
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
    margin-left: 0.25rem;
}

.category-tag.active .category-count {
    background: rgba(255, 255, 255, 0.2);
    color: white;
}

.category-actions {
    text-align: center;
}

.btn-clear {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    transition: all 0.2s;
}

.btn-clear:hover {
    background: #f8f9fa;
    color: #333;
}

/* Featured Posts */
.featured-posts {
    padding: 4rem 0;
    background: #f8f9fa;
}

.section-header {
    text-align: center;
    margin-bottom: 3rem;
    position: relative;
}

.section-header h2 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: #333;
}

.section-header p {
    font-size: 1.1rem;
    color: #666;
    max-width: 600px;
    margin: 0 auto;
}

.view-controls {
    position: absolute;
    right: 0;
    top: 0;
    display: flex;
    gap: 0.5rem;
    background: white;
    padding: 0.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.view-btn {
    width: 36px;
    height: 36px;
    border: 1px solid #e9ecef;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    transition: all 0.2s;
}

.view-btn.active {
    background: #007bff;
    border-color: #007bff;
    color: white;
}

.view-btn:hover:not(.active) {
    border-color: #007bff;
    color: #007bff;
}

/* Posts Container */
.posts-container {
    margin-bottom: 3rem;
}

.posts-container.view-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
}

.posts-container.view-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 800px;
    margin: 0 auto;
}

/* Posts Animation */
.posts-fade-enter-active,
.posts-fade-leave-active {
    transition: all 0.5s ease;
}

.posts-fade-enter-from {
    opacity: 0;
    transform: translateY(20px);
}

.posts-fade-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}

/* No Posts */
.no-posts {
    text-align: center;
    padding: 4rem 2rem;
    color: #666;
}

.no-posts-content i {
    font-size: 4rem;
    margin-bottom: 1rem;
    color: #ddd;
}

.no-posts-content h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #333;
}

.no-posts-content p {
    margin-bottom: 2rem;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
}

.no-posts-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
}

/* Loading More */
.loading-more {
    text-align: center;
    padding: 2rem;
    color: #666;
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

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Load More */
.load-more-section {
    text-align: center;
}

.load-more-btn {
    padding: 0.75rem 2rem;
}

.posts-count {
    font-size: 0.9rem;
    opacity: 0.7;
    margin-left: 0.5rem;
}

/* Back to Top */
.back-to-top {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 50px;
    height: 50px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(0, 123, 255, 0.3);
    transition: all 0.3s;
    z-index: 1000;
}

.back-to-top:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
}

/* Responsive Design */
@media (max-width: 1024px) {
    .hero .container {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 2rem;
    }

    .hero-text h1 {
        font-size: 2.5rem;
    }

    .hero-stats {
        justify-content: center;
    }

    .view-controls {
        position: static;
        justify-content: center;
        margin-top: 1rem;
    }
}

@media (max-width: 768px) {
    .hero {
        padding: 3rem 0 4rem;
    }

    .hero-text h1 {
        font-size: 2rem;
    }

    .hero-text p {
        font-size: 1.1rem;
    }

    .hero-actions {
        justify-content: center;
    }

    .hero-stats {
        flex-direction: column;
        gap: 1rem;
    }

    .posts-container.view-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .category-tags {
        justify-content: flex-start;
        overflow-x: auto;
        padding-bottom: 0.5rem;
    }

    .category-tag {
        flex-shrink: 0;
    }

    .input-group {
        flex-direction: column;
    }

    .terminal {
        max-width: 100%;
    }

    .post-meta {
        flex-direction: column;
        gap: 0.5rem;
    }

}

@media (max-width: 480px) {
    .container {
        padding: 0 0.5rem;
    }

    .hero-text h1 {
        font-size: 1.75rem;
    }

    .section-header h2 {
        font-size: 2rem;
    }

    .btn {
        width: 100%;
        justify-content: center;
    }

    .hero-actions {
        flex-direction: column;
    }

    .terminal-body {
        padding: 1rem;
    }

    .terminal-content {
        padding: 1rem;
    }

    .no-posts-actions {
        flex-direction: column;
    }

    .back-to-top {
        bottom: 1rem;
        right: 1rem;
        width: 40px;
        height: 40px;
    }
}

/* Dark Mode Styles */
:root {
    --hero-bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --hero-dark-bg: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    --section-bg: #f8f9fa;
    --section-dark-bg: #1a1f2e;
    --card-bg: #ffffff;
    --card-dark-bg: #262d3d;
    --text-color: #333;
    --text-dark-color: #e0e0e0;
    --border-color: #e9ecef;
    --border-dark-color: #3b4261;
}

.home-page {
    background: var(--card-bg);
    color: var(--text-color);
    transition: all 0.3s ease;
}

body.dark-mode .home-page {
    background-color: #121212;
    color: var(--text-dark-color);
}

/* Hero Section Dark Mode */
body.dark-mode .hero {
    background: var(--hero-dark-bg);
}

body.dark-mode .gradient-text {
    background: linear-gradient(90deg, #b8a6ff, #667eea);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

body.dark-mode .hero-text p {
    color: #b0b0b0;
}

body.dark-mode .terminal {
    background: #0a0e27;
}

body.dark-mode .terminal-header {
    background: #151931;
    border-bottom-color: #2a2e3f;
}

body.dark-mode .terminal-title {
    color: #a9b1d6;
}

body.dark-mode .terminal-body {
    background-color: #0a0e27;
    color: #c0caf5;
}

body.dark-mode .terminal-content {
    background: #16161e;
    border-color: #3b4261;
}

body.dark-mode .post-preview h3 {
    color: #7dcfff;
}

body.dark-mode .post-preview p {
    color: #c0caf5;
}

body.dark-mode .meta-item {
    color: #737aa2;
}

body.dark-mode .stat-item {
    color: #565f89;
}

body.dark-mode .skeleton {
    background: linear-gradient(90deg, #2a2e3f 25%, #3b4261 50%, #2a2e3f 75%);
}

body.dark-mode .scroll-indicator {
    color: rgba(255, 255, 255, 0.7);
}

/* Trending Section Dark Mode */
body.dark-mode .trending-section {
    background: var(--section-dark-bg);
}

body.dark-mode .section-subtitle {
    color: var(--text-dark-color);
}

body.dark-mode .trending-tag {
    background: var(--card-dark-bg);
    border-color: var(--border-dark-color);
    color: var(--text-dark-color);
}

body.dark-mode .trending-tag:hover {
    border-color: hsl(var(--hue), 70%, 60%);
    color: hsl(var(--hue), 70%, 70%);
}

body.dark-mode .trending-count {
    background: rgba(100, 100, 100, 0.3);
    color: var(--text-dark-color);
}

/* Category Section Dark Mode */
body.dark-mode .category-section {
    background: var(--section-dark-bg);
}

body.dark-mode .category-filter h3 {
    color: var(--text-dark-color);
}

body.dark-mode .category-tag {
    background: var(--card-dark-bg);
    border-color: var(--border-dark-color);
    color: var(--text-dark-color);
}

body.dark-mode .category-tag:hover {
    border-color: #007bff;
    color: #7aa2f7;
}

body.dark-mode .category-tag.active {
    background: #007bff;
    border-color: #007bff;
}

body.dark-mode .category-count {
    background: rgba(0, 123, 255, 0.2);
    color: #7aa2f7;
}

body.dark-mode .btn-clear {
    color: var(--text-dark-color);
}

body.dark-mode .btn-clear:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-dark-color);
}

/* Featured Posts Section Dark Mode */
body.dark-mode .featured-posts {
    background: #121212;
}

body.dark-mode .section-header h2 {
    color: var(--text-dark-color);
}

body.dark-mode .section-header p {
    color: #b0b0b0;
}

body.dark-mode .view-controls {
    background: var(--card-dark-bg);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

body.dark-mode .view-btn {
    background: var(--card-dark-bg);
    border-color: var(--border-dark-color);
    color: var(--text-dark-color);
}

body.dark-mode .view-btn.active {
    background: #007bff;
    border-color: #007bff;
    color: white;
}

body.dark-mode .view-btn:hover:not(.active) {
    border-color: #007bff;
    color: #7aa2f7;
}

/* No Posts Dark Mode */
body.dark-mode .no-posts {
    background: var(--card-dark-bg);
    color: var(--text-dark-color);
}

body.dark-mode .no-posts-content i {
    color: rgba(255, 255, 255, 0.1);
}

body.dark-mode .no-posts-content h3 {
    color: var(--text-dark-color);
}

body.dark-mode .no-posts-content p {
    color: #b0b0b0;
}

/* Loading More Dark Mode */
body.dark-mode .loading-more {
    color: var(--text-dark-color);
}

body.dark-mode .loading-spinner {
    border-color: #2a2e3f;
    border-top-color: #3498db;
}

/* Load More Section Dark Mode */
body.dark-mode .load-more-section {
    text-align: center;
}

body.dark-mode .posts-count {
    color: #b0b0b0;
}

/* Back to Top Dark Mode */
body.dark-mode .back-to-top {
    background: #007bff;
    box-shadow: 0 4px 16px rgba(0, 123, 255, 0.3);
}

body.dark-mode .back-to-top:hover {
    box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
}
</style>
