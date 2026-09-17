<template>
    <div 
        class="post-card" 
        @click="handleCardClick"
        @keyup.enter="handleCardClick"
        tabindex="0" 
        role="article"
        :aria-label="`Post: ${post.title}. ${post.excerpt}. Category: ${formattedCategory}.`"
        :class="{
            'featured': post.featured,
            'trending': isTrending,
            'liked': isLiked,
            'saved': isSaved,
            'new': isNewPost
        }"
    >
        <!-- Image with overlay -->
        <div class="image-container">
            <img
                :src="post.image || defaultImage"
                :alt="post.title"
                class="post-image"
                @error="onImageError"
                @load="onImageLoad"
                loading="lazy"
                :class="{ loaded: imageLoaded }"
            >
            <div class="image-overlay">
                <button 
                    class="save-btn"
                    @click.stop="toggleSave"
                    :aria-pressed="isSaved"
                    :title="isSaved ? 'Remove from saved' : 'Save post'"
                >
                    <i :class="isSaved ? 'fas fa-bookmark' : 'far fa-bookmark'"></i>
                </button>
                <div class="badges-container">
                    <span v-if="post.featured" class="featured-badge">Featured</span>
                    <span v-if="isTrending" class="trending-badge">
                        <i class="fas fa-fire"></i> Trending
                    </span>
                    <span v-if="isNewPost" class="new-badge">New</span>
                </div>
            </div>
            <div class="loading-spinner" v-if="!imageLoaded">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
        </div>

        <!-- Content -->
        <div class="post-content">
            <div class="category-time">
                <span class="post-category">{{ formattedCategory }}</span>
                <div class="time-reading">
                    <span class="post-time">{{ formattedTime }}</span>
                    <span class="read-time">{{ post.readTime || '5 min' }} read</span>
                </div>
            </div>
            
            <h3 class="post-title" :title="post.title">
                <a href="#" @click.stop.prevent="$emit('view-post', post.id)" class="title-link">
                    {{ post.title }}
                </a>
            </h3>
            
            <p class="post-excerpt" :class="{ expanded: isExpanded }">
                {{ isExpanded ? post.excerpt : truncatedExcerpt }}
                <button 
                    v-if="showReadMore" 
                    @click.stop="toggleExpand"
                    class="read-more-btn"
                    :aria-expanded="isExpanded"
                >
                    {{ isExpanded ? 'Show less' : 'Read more' }}
                </button>
            </p>

            <!-- Progress bar for reading progress -->
            <div class="reading-progress" v-if="post.readingProgress !== undefined">
                <div class="progress-bar">
                    <div 
                        class="progress-fill" 
                        :style="{ width: `${post.readingProgress}%` }"
                    ></div>
                </div>
                <span class="progress-text">{{ post.readingProgress }}% read</span>
            </div>

            <!-- Tags -->
            <div class="post-tags" v-if="post.tags && post.tags.length">
                <span 
                    v-for="tag in visibleTags" 
                    :key="tag"
                    class="post-tag"
                    @click.stop="emitTagClick(tag)"
                >
                    #{{ tag }}
                </span>
                <button 
                    v-if="post.tags.length > maxVisibleTags"
                    @click.stop="toggleTags"
                    class="tags-toggle"
                >
                    {{ showAllTags ? 'Less' : `+${post.tags.length - maxVisibleTags}` }}
                </button>
            </div>

            <!-- Meta information -->
            <div class="post-meta">
                <div class="author-info">
                    <div class="author-avatar" :style="avatarStyle" :aria-label="'Author: ' + post.author">
                        <img 
                            v-if="post.authorAvatar" 
                            :src="post.authorAvatar" 
                            :alt="post.author"
                            @error="onAvatarError"
                        >
                        <span v-else>{{ post.author?.charAt(0).toUpperCase() || '?' }}</span>
                    </div>
                    <div class="author-details">
                        <span class="author-name">{{ post.author }}</span>
                        <span class="post-date">{{ formattedDate }}</span>
                    </div>
                </div>
                
                <div class="post-stats">
                    <button
                        class="post-stat like-btn"
                        :class="{ liked: isLiked, animating: likeAnimating }"
                        @click.stop="handleLike"
                        :aria-pressed="isLiked"
                        :title="isLiked ? 'Unlike' : 'Like'"
                        :disabled="likeLoading"
                    >
                        <i class="fas fa-heart"></i>
                        <span class="stat-count">{{ formattedLikes }}</span>
                    </button>
                    
                    <button
                        class="post-stat share-btn"
                        @click.stop="openShareMenu"
                        title="Share post"
                        ref="shareButton"
                    >
                        <i class="fas fa-share-alt"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Share dropdown -->
        <div v-if="showShareMenu" class="share-dropdown" v-click-outside="closeShareMenu">
            <button @click="shareOnPlatform('twitter')" class="share-option">
                <i class="fab fa-twitter"></i> Twitter
            </button>
            <button @click="shareOnPlatform('facebook')" class="share-option">
                <i class="fab fa-facebook"></i> Facebook
            </button>
            <button @click="shareOnPlatform('linkedin')" class="share-option">
                <i class="fab fa-linkedin"></i> LinkedIn
            </button>
            <button @click="shareOnPlatform('pinterest')" class="share-option">
                <i class="fab fa-pinterest"></i> Pinterest
            </button>
            <button @click="copyLink" class="share-option">
                <i class="fas fa-link"></i> Copy Link
            </button>
        </div>

        <!-- Toast notification -->
        <div v-if="showToast" class="toast" :class="toastType">
            <i :class="toastIcon"></i>
            <span>{{ toastMessage }}</span>
            <button class="toast-close" @click="showToast = false">
                <i class="fas fa-times"></i>
            </button>
        </div>
    </div>
</template>

<script>
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop';
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face';

// Click outside directive
const clickOutside = {
    beforeMount(el, binding) {
        el.clickOutsideEvent = (event) => {
            if (!(el === event.target || el.contains(event.target))) {
                binding.value();
            }
        };
        document.addEventListener('click', el.clickOutsideEvent);
    },
    unmounted(el) {
        document.removeEventListener('click', el.clickOutsideEvent);
    }
};

export default {
    name: 'AdvancedBlogCard',
    directives: {
        'click-outside': clickOutside
    },
    props: {
        post: {
            type: Object,
            required: true,
            validator: (post) => {
                return post.id && post.title;
            }
        },
        isLiked: {
            type: Boolean,
            default: false
        },
        isSaved: {
            type: Boolean,
            default: false
        }
    },
    emits: ['view-post', 'toggle-like', 'toggle-save', 'tag-click', 'share'],
    data() {
        return {
            defaultImage: DEFAULT_IMAGE,
            defaultAvatar: DEFAULT_AVATAR,
            imageLoaded: false,
            isExpanded: false,
            showAllTags: false,
            showShareMenu: false,
            likeAnimating: false,
            likeLoading: false,
            maxVisibleTags: 2,
            showToast: false,
            toastMessage: '',
            toastType: 'success',
            toastTimeout: null
        };
    },
    computed: {
        formattedCategory() {
            if (!this.post.category) return 'Uncategorized';
            return this.post.category.split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        },
        truncatedExcerpt() {
            if (!this.post.excerpt) return '';
            return this.post.excerpt.length > 120
                ? this.post.excerpt.slice(0, 120) + '...'
                : this.post.excerpt;
        },
        showReadMore() {
            return this.post.excerpt && this.post.excerpt.length > 120;
        },
        visibleTags() {
            if (!this.post.tags) return [];
            return this.showAllTags 
                ? this.post.tags 
                : this.post.tags.slice(0, this.maxVisibleTags);
        },
        isTrending() {
            return this.post.likes > 100 || this.post.views > 1000;
        },
        isNewPost() {
            if (!this.post.date) return false;
            const postDate = new Date(this.post.date);
            const now = new Date();
            const diffTime = Math.abs(now - postDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 7; // New if posted within last 7 days
        },
        formattedTime() {
            if (!this.post.date) return '';
            const date = new Date(this.post.date);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) return '1 day ago';
            if (diffDays < 7) return `${diffDays} days ago`;
            if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
            return date.toLocaleDateString();
        },
        formattedDate() {
            if (!this.post.date) return '';
            const date = new Date(this.post.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        },
        formattedLikes() {
            const likes = this.post.likes || 0;
            if (likes >= 1000000) {
                return (likes / 1000000).toFixed(1) + 'M';
            }
            if (likes >= 1000) {
                return (likes / 1000).toFixed(1) + 'k';
            }
            return likes.toString();
        },
        avatarStyle() {
            if (this.post.authorColor) {
                return {
                    backgroundColor: this.post.authorColor,
                    color: '#fff'
                };
            }
            return {};
        },
        toastIcon() {
            switch (this.toastType) {
                case 'success': return 'fas fa-check-circle';
                case 'error': return 'fas fa-exclamation-circle';
                case 'info': return 'fas fa-info-circle';
                default: return 'fas fa-check-circle';
            }
        }
    },
    methods: {
        handleCardClick() {
            this.$emit('view-post', this.post.id);
        },
        async handleLike() {
            if (this.likeLoading) return;
            
            this.likeLoading = true;
            this.likeAnimating = true;
            
            try {
                await this.$emit('toggle-like', this.post.id);
                this.showToastMessage(
                    this.isLiked ? 'Post liked!' : 'Post unliked!',
                    'success'
                );
            } catch (error) {
                this.showToastMessage('Failed to update like', 'error');
            } finally {
                setTimeout(() => {
                    this.likeAnimating = false;
                    this.likeLoading = false;
                }, 600);
            }
        },
        toggleSave() {
            this.$emit('toggle-save', this.post.id);
            this.showToastMessage(
                this.isSaved ? 'Post saved!' : 'Post removed from saved!',
                'success'
            );
        },
        toggleExpand() {
            this.isExpanded = !this.isExpanded;
        },
        toggleTags() {
            this.showAllTags = !this.showAllTags;
        },
        onImageError(event) {
            event.target.src = this.defaultImage;
            this.imageLoaded = true;
        },
        onImageLoad() {
            this.imageLoaded = true;
        },
        onAvatarError(event) {
            event.target.src = this.defaultAvatar;
        },
        openShareMenu() {
            this.showShareMenu = !this.showShareMenu;
        },
        closeShareMenu() {
            this.showShareMenu = false;
        },
        shareOnPlatform(platform) {
            const url = `${window.location.origin}/post/${this.post.id}`;
            const text = `Check out this post: ${this.post.title}`;
            
            let shareUrl = '';
            switch (platform) {
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                    break;
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                    break;
                case 'linkedin':
                    shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                    break;
                case 'pinterest':
                    shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}`;
                    break;
            }
            
            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
            
            this.$emit('share', { platform, postId: this.post.id });
            this.showToastMessage(`Shared on ${platform}`, 'success');
            this.closeShareMenu();
        },
        async copyLink() {
            const url = `${window.location.origin}/post/${this.post.id}`;
            try {
                await navigator.clipboard.writeText(url);
                this.showToastMessage('Link copied to clipboard!', 'success');
            } catch (err) {
                this.showToastMessage('Failed to copy link', 'error');
                console.error('Failed to copy link:', err);
            }
            this.closeShareMenu();
        },
        emitTagClick(tag) {
            this.$emit('tag-click', tag);
        },
        showToastMessage(message, type = 'success') {
            this.toastMessage = message;
            this.toastType = type;
            this.showToast = true;
            
            // Clear any existing timeout
            if (this.toastTimeout) {
                clearTimeout(this.toastTimeout);
            }
            
            // Auto hide after 3 seconds
            this.toastTimeout = setTimeout(() => {
                this.showToast = false;
            }, 3000);
        }
    }
};
</script>

<style scoped>
.post-card {
    position: relative;
    display: flex;
    flex-direction: column;
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    outline: none;
    overflow: hidden;
    height: 100%;
    border: 1px solid rgba(0,0,0,0.03);
}

.post-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.15);
}

.post-card:focus {
    box-shadow: 0 0 0 3px #0078d7, 0 12px 40px rgba(0,0,0,0.15);
}

.post-card.featured {
    border-left: 6px solid #ff6b35;
    background: linear-gradient(135deg, #fff 0%, #fff9f7 100%);
}

.post-card.trending {
    background: linear-gradient(135deg, #fff 0%, #fef7ed 100%);
}

.post-card.new {
    position: relative;
    overflow: hidden;
}

.post-card.new::before {
    content: '';
    position: absolute;
    top: -10px;
    right: -10px;
    width: 20px;
    height: 20px;
    background: #4CAF50;
    border-radius: 50%;
    z-index: 2;
    box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.2);
    animation: pulse 2s infinite;
}

.post-card.saved .save-btn {
    color: #0078d7;
}

/* Image container */
.image-container {
    position: relative;
    overflow: hidden;
    aspect-ratio: 16/9;
    background: #f5f7fa;
}

.post-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.215, 0.61, 0.355, 1);
    opacity: 0;
}

.post-image.loaded {
    opacity: 1;
}

.post-card:hover .post-image {
    transform: scale(1.08);
}

.image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.4));
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1.25rem;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.post-card:hover .image-overlay {
    opacity: 1;
}

.badges-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-end;
}

.save-btn {
    background: rgba(255, 255, 255, 0.95);
    border: none;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    color: #666;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    backdrop-filter: blur(10px);
}

.save-btn:hover {
    background: #fff;
    color: #0078d7;
    transform: scale(1.15) rotate(5deg);
    box-shadow: 0 4px 15px rgba(0,0,0,0.15);
}

.featured-badge,
.trending-badge,
.new-badge {
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.featured-badge {
    background: linear-gradient(135deg, #ff6b35, #ff8e53);
}

.trending-badge {
    background: linear-gradient(135deg, #FF5722, #FF9800);
}

.new-badge {
    background: linear-gradient(135deg, #4CAF50, #8BC34A);
}

.loading-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #0078d7;
    font-size: 1.5rem;
}

/* Content */
.post-content {
    padding: 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1;
}

.category-time {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.post-category {
    color: #0078d7;
    font-weight: 700;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 0.4rem 0.8rem;
    background: rgba(0, 120, 215, 0.1);
    border-radius: 12px;
}

.time-reading {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
}

.post-time {
    color: #666;
    font-size: 0.8rem;
    font-weight: 500;
}

.read-time {
    color: #888;
    font-size: 0.75rem;
}

.post-title {
    font-size: 1.5rem;
    font-weight: 800;
    margin: 0;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    background: linear-gradient(135deg, #2c3e50, #34495e);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.title-link {
    color: inherit;
    text-decoration: none;
    transition: all 0.2s;
}

.title-link:hover {
    background: linear-gradient(135deg, #0078d7, #0056b3);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.post-excerpt {
    color: #555;
    font-size: 1rem;
    line-height: 1.7;
    margin: 0;
}

.read-more-btn {
    background: none;
    border: none;
    color: #0078d7;
    cursor: pointer;
    font-weight: 600;
    margin-left: 0.5rem;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    transition: all 0.2s;
}

.read-more-btn:hover {
    background: rgba(0, 120, 215, 0.1);
    text-decoration: none;
}

/* Reading progress */
.reading-progress {
    margin-top: 0.5rem;
}

.progress-bar {
    height: 6px;
    background: #f0f0f0;
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 0.5rem;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #0078d7, #00a2ff);
    border-radius: 3px;
    transition: width 0.5s ease;
}

.progress-text {
    font-size: 0.8rem;
    color: #666;
    font-weight: 500;
}

/* Tags */
.post-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 0.5rem 0;
}

.post-tag {
    background: #f0f6ff;
    color: #0078d7;
    padding: 0.4rem 0.9rem;
    border-radius: 20px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 500;
    border: 1px solid transparent;
}

.post-tag:hover {
    background: #0078d7;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 120, 215, 0.3);
}

.tags-toggle {
    background: none;
    border: 1px solid #ddd;
    color: #666;
    padding: 0.4rem 0.9rem;
    border-radius: 20px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
}

.tags-toggle:hover {
    background: #f5f5f5;
    border-color: #ccc;
}

/* Meta information */
.post-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
    padding-top: 1.25rem;
    border-top: 1px solid #f0f0f0;
    flex-wrap: wrap;
    gap: 1rem;
}

.author-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.author-avatar {
    width: 44px;
    height: 44px;
    background: #e0e7ef;
    color: #0078d7;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.1rem;
    overflow: hidden;
    flex-shrink: 0;
    border: 2px solid #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: all 0.3s;
}

.author-avatar:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.author-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.author-details {
    display: flex;
    flex-direction: column;
}

.author-name {
    font-weight: 700;
    font-size: 0.9rem;
    color: #333;
}

.post-date {
    color: #888;
    font-size: 0.8rem;
}

/* Stats */
.post-stats {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.post-stat {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
    color: #666;
    transition: all 0.3s;
    padding: 0.6rem;
    border-radius: 12px;
    position: relative;
    overflow: hidden;
}

.post-stat::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: currentColor;
    opacity: 0;
    transition: opacity 0.3s;
    border-radius: inherit;
}

.post-stat:hover:not(:disabled) {
    color: #0078d7;
    background: rgba(0, 120, 215, 0.1);
    transform: translateY(-2px);
}

.post-stat:hover::before {
    opacity: 0.05;
}

.post-stat:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.like-btn.animating i {
    animation: heartBeat 0.6s ease;
}

.like-btn.liked,
.like-btn.liked i {
    color: #e0245e;
}

.stat-count {
    font-weight: 700;
    font-size: 0.85rem;
    min-width: 1.5rem;
    text-align: center;
}

/* Share dropdown */
.share-dropdown {
    position: absolute;
    top: 100%;
    right: 1rem;
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    padding: 0.75rem;
    z-index: 20;
    min-width: 160px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0,0,0,0.05);
    animation: slideDown 0.2s ease;
}

.share-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    cursor: pointer;
    border-radius: 10px;
    transition: background 0.2s;
    font-size: 0.9rem;
    color: #333;
    font-weight: 500;
}

.share-option:hover {
    background: #f5f5f5;
}

.share-option:nth-child(1):hover { color: #1DA1F2; }
.share-option:nth-child(2):hover { color: #4267B2; }
.share-option:nth-child(3):hover { color: #0077B5; }
.share-option:nth-child(4):hover { color: #E60023; }
.share-option:nth-child(5):hover { color: #0078d7; }

/* Toast notification */
.toast {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    z-index: 1000;
    animation: slideUp 0.3s ease;
    border-left: 4px solid;
    min-width: 280px;
}

.toast.success {
    border-left-color: #4CAF50;
    color: #2E7D32;
}

.toast.error {
    border-left-color: #F44336;
    color: #C62828;
}

.toast.info {
    border-left-color: #2196F3;
    color: #1565C0;
}

.toast-close {
    background: none;
    border: none;
    cursor: pointer;
    color: inherit;
    opacity: 0.7;
    margin-left: auto;
    transition: opacity 0.2s;
}

.toast-close:hover {
    opacity: 1;
}

/* Animations */
@keyframes heartBeat {
    0% { transform: scale(1); }
    25% { transform: scale(1.3); }
    50% { transform: scale(1.1); }
    75% { transform: scale(1.2); }
    100% { transform: scale(1); }
}

@keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
    100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
}

@keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
    from { opacity: 0; transform: translate(-50%, 20px); }
    to { opacity: 1; transform: translate(-50%, 0); }
}

/* Responsive */
@media (max-width: 768px) {
    .post-content {
        padding: 1.5rem;
    }
    
    .post-title {
        font-size: 1.3rem;
    }
    
    .post-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
    
    .post-stats {
        width: 100%;
        justify-content: space-between;
    }
    
    .image-overlay {
        padding: 1rem;
        opacity: 1;
    }
    
    .save-btn {
        width: 40px;
        height: 40px;
    }
    
    .featured-badge,
    .trending-badge,
    .new-badge {
        font-size: 0.75rem;
        padding: 0.4rem 0.8rem;
    }
    
    .toast {
        bottom: 1rem;
        left: 1rem;
        right: 1rem;
        transform: none;
        min-width: auto;
    }
}

@media (max-width: 480px) {
    .post-content {
        padding: 1.25rem;
    }
    
    .post-title {
        font-size: 1.2rem;
    }
    
    .post-excerpt {
        font-size: 0.9rem;
    }
    
    .category-time {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .time-reading {
        align-items: flex-start;
    }
    
    .author-info {
        gap: 0.5rem;
    }
    
    .author-avatar {
        width: 36px;
        height: 36px;
        font-size: 0.9rem;
    }
    
    .post-stats {
        gap: 0.25rem;
    }
    
    .post-stat {
        padding: 0.5rem;
        font-size: 0.8rem;
    }
    
    .share-dropdown {
        right: 0.5rem;
        left: 0.5rem;
        min-width: auto;
    }
}

/* Dark Mode Styles */
body.dark-mode .post-card {
    background: #262d3d;
    border-color: #3b4261;
    color: #e0e0e0;
}

body.dark-mode .post-card:hover {
    box-shadow: 0 8px 24px rgba(0, 123, 255, 0.2);
}

body.dark-mode .post-title {
    color: #e0e0e0;
}

body.dark-mode .post-title:hover {
    color: #7aa2f7;
}

body.dark-mode .post-excerpt {
    color: #b0b0b0;
}

body.dark-mode .post-meta {
    color: #737aa2;
}

body.dark-mode .category-tag {
    background: rgba(122, 162, 247, 0.1);
    border-color: rgba(122, 162, 247, 0.3);
    color: #7aa2f7;
}

body.dark-mode .category-tag:hover {
    background: rgba(122, 162, 247, 0.2);
}

body.dark-mode .time-reading {
    color: #737aa2;
}

body.dark-mode .featured-badge {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

body.dark-mode .trending-badge {
    background: #ff6b6b;
}

body.dark-mode .new-badge {
    background: #4caf50;
}

body.dark-mode .like-btn,
body.dark-mode .save-btn {
    color: #b0b0b0;
}

body.dark-mode .like-btn:hover,
body.dark-mode .save-btn:hover {
    color: #7aa2f7;
}

body.dark-mode .like-btn.active {
    color: #ff6b6b;
}

body.dark-mode .view-post-btn {
    background: #007bff;
    color: white;
    border: none;
}

body.dark-mode .view-post-btn:hover {
    background: #0056b3;
    transform: translateY(-2px);
}

body.dark-mode .author-avatar {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

body.dark-mode .post-stats {
    color: #737aa2;
}

body.dark-mode .toggle-stats {
    color: #737aa2;
}

body.dark-mode .toggle-stats:hover {
    color: #7aa2f7;
}

body.dark-mode .share-btn {
    color: #b0b0b0;
}

body.dark-mode .share-btn:hover {
    color: #7aa2f7;
}

body.dark-mode .share-dropdown {
    background: #1e1e2e;
    border-color: #3b4261;
}

body.dark-mode .share-option {
    color: #e0e0e0;
}

body.dark-mode .share-option:hover {
    background: #2a2e3f;
    color: #7aa2f7;
}

body.dark-mode .share-option i {
    color: #7aa2f7;
}

body.dark-mode .loading-spinner {
    color: #7aa2f7;
}

body.dark-mode .image-overlay {
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, transparent 100%);
}
</style>