<template>
    <div class="all-posts-page">
        <!-- Category Filter -->
        <section class="category-filter-section">
            <div class="container">
                <div class="filter-wrapper">
                    <h3>Filter by Category</h3>
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
                    <div class="filter-actions" v-if="selectedCategory !== 'all'">
                        <button class="btn-clear" @click="clearFilters">
                            <i class="fas fa-times"></i>
                            Clear Filter
                        </button>
                    </div>
                </div>

                <!-- Search Bar -->
                <div class="search-section">
                    <input 
                        v-model="searchQuery"
                        type="text"
                        placeholder="Search posts by title, author, or content..."
                        class="search-input"
                    />
                    <i class="fas fa-search search-icon"></i>
                </div>

                <!-- Sort and View Controls -->
                <div class="controls-row">
                    <div class="sort-section">
                        <label for="sort-select">Sort by:</label>
                        <select id="sort-select" v-model="sortBy" class="sort-select">
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="most-liked">Most Liked</option>
                            <option value="views">Most Viewed</option>
                        </select>
                    </div>
                    <div class="view-controls">
                        <button 
                            class="view-btn"
                            :class="{ active: viewMode === 'grid' }"
                            @click="viewMode = 'grid'"
                            title="Grid View"
                        >
                            <i class="fas fa-th"></i> Grid
                        </button>
                        <button 
                            class="view-btn"
                            :class="{ active: viewMode === 'list' }"
                            @click="viewMode = 'list'"
                            title="List View"
                        >
                            <i class="fas fa-list"></i> List
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Posts Container -->
        <section class="posts-section">
            <div class="container">
                <!-- Results Info -->
                <div class="results-info" v-if="totalPosts > 0">
                    <p>Displaying <strong>{{ startIndex + 1 }}</strong> to <strong>{{ endIndex }}</strong> of <strong>{{ totalPosts }}</strong> post<span v-if="totalPosts !== 1">s</span></p>
                </div>

                <!-- Posts Grid/List -->
                <div 
                    class="posts-container" 
                    :class="`view-${viewMode}`"
                    v-if="paginatedPosts.length"
                >
                    <transition-group name="posts-fade">
                        <BlogCard 
                            v-for="post in paginatedPosts" 
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

                <div v-else class="no-posts">
                    <div class="no-posts-content">
                        <i class="fas fa-search"></i>
                        <h3>No posts found</h3>
                        <p>Try adjusting your filters or search query.</p>
                        <div class="no-posts-actions">
                            <button class="btn btn-primary" @click="clearFilters">
                                <i class="fas fa-times"></i> Clear Filters
                            </button>
                            <button class="btn btn-outline" @click="goHome">
                                <i class="fas fa-home"></i> Go Home
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Pagination Section -->
                <section class="pagination-section" v-if="totalPosts > postsPerPage">
                    <div class="pagination-controls">
                        <button 
                            class="pagination-btn" 
                            @click="previousPage"
                            :disabled="currentPage === 1"
                        >
                            <i class="fas fa-chevron-left"></i> Previous
                        </button>
                        <div class="page-numbers">
                            <button 
                                v-for="page in visiblePages"
                                :key="page"
                                class="page-btn"
                                :class="{ active: currentPage === page }"
                                @click="goToPage(page)"
                            >
                                {{ page }}
                            </button>
                        </div>
                        <button 
                            class="pagination-btn" 
                            @click="nextPage"
                            :disabled="currentPage === totalPages"
                        >
                            Next <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </section>

            </div>
        </section>

        <!-- Back to Home -->
        <section class="back-to-home-section">
            <div class="container">
                <button class="btn btn-outline" @click="goHome">
                    <i class="fas fa-arrow-left"></i> Back to Home
                </button>
            </div>
        </section>
    </div>
</template>

<script>
import BlogCard from '../common/BlogCard.vue'

export default {
    name: 'AllPosts',
    components: {
        BlogCard
    },
    props: {
        posts: {
            type: Array,
            default: () => []
        }
    },
    emits: [
        'view-post',
        'toggle-like',
        'toggle-save',
        'view-author',
        'go-home'
    ],
    data() {
        return {
            selectedCategory: 'all',
            searchQuery: '',
            viewMode: 'grid',
            sortBy: 'newest',
            currentPage: 1,
            postsPerPage: 12,
        }
    },
    computed: {
        categories() {
            const categoryCounts = this.getCategoryCounts()
            return [
                { 
                    id: 'all', 
                    name: 'All', 
                    icon: 'fas fa-th',
                    count: this.posts.length
                },
                { 
                    id: 'technology', 
                    name: 'Technology', 
                    icon: 'fas fa-laptop-code',
                    count: categoryCounts.technology || 0
                },
                { 
                    id: 'lifestyle', 
                    name: 'Lifestyle', 
                    icon: 'fas fa-heart',
                    count: categoryCounts.lifestyle || 0
                },
                { 
                    id: 'business', 
                    name: 'Business', 
                    icon: 'fas fa-chart-line',
                    count: categoryCounts.business || 0
                },
                { 
                    id: 'travel', 
                    name: 'Travel', 
                    icon: 'fas fa-plane',
                    count: categoryCounts.travel || 0
                },
                { 
                    id: 'food', 
                    name: 'Food', 
                    icon: 'fas fa-utensils',
                    count: categoryCounts.food || 0
                }
            ]
        },
        filteredPosts() {
            let filtered = this.posts || []
            
            // Filter by category
            if (this.selectedCategory !== 'all') {
                filtered = filtered.filter(post => post.category === this.selectedCategory)
            }
            
            // Filter by search query
            if (this.searchQuery.trim()) {
                const query = this.searchQuery.toLowerCase()
                filtered = filtered.filter(post => 
                    post.title.toLowerCase().includes(query) ||
                    post.excerpt.toLowerCase().includes(query) ||
                    post.author.toLowerCase().includes(query)
                )
            }
            
            return filtered
        },
        sortedPosts() {
            const posts = [...this.filteredPosts]
            
            switch(this.sortBy) {
                case 'oldest':
                    return posts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                case 'most-liked':
                    return posts.sort((a, b) => (b.likes || 0) - (a.likes || 0))
                case 'views':
                    return posts.sort((a, b) => (b.views || 0) - (a.views || 0))
                case 'newest':
                default:
                    return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            }
        },
        totalPosts() {
            return this.sortedPosts.length
        },
        totalPages() {
            return Math.ceil(this.totalPosts / this.postsPerPage) || 1
        },
        startIndex() {
            return (this.currentPage - 1) * this.postsPerPage
        },
        endIndex() {
            return Math.min(this.startIndex + this.postsPerPage, this.totalPosts)
        },
        paginatedPosts() {
            return this.sortedPosts.slice(this.startIndex, this.endIndex)
        },
        visiblePages() {
            const maxPages = 5
            let startPage = Math.max(1, this.currentPage - 2)
            let endPage = Math.min(this.totalPages, startPage + maxPages - 1)
            
            if (endPage - startPage < maxPages - 1) {
                startPage = Math.max(1, endPage - maxPages + 1)
            }
            
            const pages = []
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i)
            }
            return pages
        }
    },
    methods: {
        setCategory(category) {
            this.selectedCategory = category
        },
        clearFilters() {
            this.selectedCategory = 'all'
            this.searchQuery = ''
            this.currentPage = 1
        },
        getCategoryCounts() {
            const counts = {}
            this.posts.forEach(post => {
                counts[post.category] = (counts[post.category] || 0) + 1
            })
            return counts
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
            return false
        },
        isSaved(postId) {
            return false
        },
        viewAuthorPosts(authorId) {
            this.$emit('view-author', authorId)
        },
        goToPage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }
        },
        nextPage() {
            this.goToPage(this.currentPage + 1)
        },
        previousPage() {
            this.goToPage(this.currentPage - 1)
        },
        goHome() {
            this.$emit('go-home')
        },
        scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }
}
</script>

<style scoped>
.all-posts-page {
    min-height: 100vh;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

/* Header Section */
.posts-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    padding: 3rem 0;
    margin-bottom: 2rem;
}

.posts-header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 2rem;
}

.header-content h1 {
    font-size: 2.5rem;
    font-weight: 800;
    margin: 0 0 0.5rem 0;
}

.header-content p {
    font-size: 1.1rem;
    opacity: 0.9;
    margin: 0;
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

.btn-primary:hover {
    background: #ff5252;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
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

/* Category Filter Section */
.category-filter-section {
    background: white;
    padding: 2rem 0;
    margin-bottom: 2rem;
    border-bottom: 1px solid #e9ecef;
}

.filter-wrapper h3 {
    margin-bottom: 1rem;
    color: #333;
    font-size: 1.1rem;
}

.category-tags {
    display: flex;
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

.category-count {
    background: rgba(0, 123, 255, 0.1);
    color: #007bff;
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
}

.category-tag.active .category-count {
    background: rgba(255, 255, 255, 0.2);
    color: white;
}

.filter-actions {
    text-align: center;
    margin-bottom: 1.5rem;
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

/* Search Section */
.search-section {
    position: relative;
    margin-bottom: 1.5rem;
}

.search-input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s;
}

.search-input:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
}

/* Controls Row */
.controls-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-top: 1.5rem;
    flex-wrap: wrap;
}

/* Sort Section */
.sort-section {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.sort-section label {
    font-weight: 600;
    color: #333;
}

.sort-select {
    padding: 0.5rem 0.75rem;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    background: white;
    color: #333;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
}

.sort-select:hover {
    border-color: #007bff;
}

.sort-select:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

/* View Controls */
.view-controls {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
}

.view-btn {
    padding: 0.5rem 1rem;
    background: white;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #666;
    transition: all 0.2s;
    font-weight: 500;
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

/* Posts Section */
.posts-section {
    padding: 2rem 0;
}

.results-info {
    text-align: center;
    margin-bottom: 2rem;
    color: #666;
    font-size: 1rem;
}

/* Posts Container */
.posts-container {
    margin-bottom: 3rem;
}

.posts-container.view-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 2rem;
}

.posts-container.view-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 900px;
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



/* Back to Home Section */
.back-to-home-section {
    background: #f8f9fa;
    padding: 2rem 0;
    text-align: center;
    border-top: 1px solid #e9ecef;
}

/* Pagination Section */
.pagination-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-top: 3rem;
    padding: 2rem;
    background: white;
    border: 1px solid #e9ecef;
    border-radius: 12px;
}

.pagination-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.pagination-info label {
    font-weight: 600;
    color: #333;
}

.items-select {
    padding: 0.5rem 0.75rem;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    background: white;
    color: #333;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
}

.items-select:hover {
    border-color: #007bff;
}

.items-select:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.page-info {
    color: #666;
    font-weight: 500;
}

.pagination-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.pagination-btn {
    padding: 0.5rem 1rem;
    background: white;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    color: #333;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
}

.pagination-btn:hover:not(:disabled) {
    background: #007bff;
    border-color: #007bff;
    color: white;
    transform: translateY(-2px);
}

.pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.page-numbers {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
}

.page-btn {
    min-width: 40px;
    height: 40px;
    padding: 0;
    background: white;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    color: #333;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.page-btn:hover {
    border-color: #007bff;
    color: #007bff;
}

.page-btn.active {
    background: #007bff;
    border-color: #007bff;
    color: white;
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
}

/* Responsive Design */
@media (max-width: 1024px) {
    .header-content {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
    }

    .posts-container.view-grid {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }

    .controls-row {
        flex-direction: column;
        align-items: stretch;
    }

    .sort-section {
        flex-direction: column;
        align-items: flex-start;
    }

    .sort-select {
        width: 100%;
    }

    .view-controls {
        justify-content: center;
    }

    .pagination-info {
        flex-direction: column;
        gap: 0.75rem;
    }

    .pagination-controls {
        flex-direction: column;
    }

    .page-numbers {
        justify-content: center;
    }
}

@media (max-width: 768px) {
    .posts-header {
        padding: 2rem 0;
    }

    .header-content h1 {
        font-size: 2rem;
    }

    .posts-container.view-grid {
        grid-template-columns: 1fr;
    }

    .category-tags {
        justify-content: flex-start;
        overflow-x: auto;
        padding-bottom: 0.5rem;
    }

    .category-tag {
        flex-shrink: 0;
    }

    .controls-row {
        flex-direction: column;
        gap: 0.75rem;
    }

    .sort-section {
        flex-direction: column;
        align-items: flex-start;
        width: 100%;
    }

    .sort-select {
        width: 100%;
    }

    .view-controls {
        justify-content: center;
        width: 100%;
    }

    .no-posts-actions {
        flex-direction: column;
    }

    .pagination-section {
        padding: 1.5rem;
    }

    .pagination-info {
        flex-direction: column;
        font-size: 0.9rem;
    }

    .pagination-controls {
        gap: 0.25rem;
    }

    .pagination-btn {
        padding: 0.5rem 0.75rem;
        font-size: 0.9rem;
    }

    .page-btn {
        min-width: 36px;
        height: 36px;
        font-size: 0.85rem;
    }
}

@media (max-width: 480px) {
    .header-content {
        flex-direction: column;
    }

    .header-content h1 {
        font-size: 1.5rem;
    }

    .header-content p {
        font-size: 1rem;
    }

    .btn {
        width: 100%;
        justify-content: center;
    }

    .posts-container.view-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .sort-section {
        width: 100%;
    }

    .sort-select {
        width: 100%;
    }

    .pagination-section {
        padding: 1rem;
    }

    .pagination-info {
        flex-direction: column;
        font-size: 0.85rem;
    }

    .items-select {
        width: 100%;
    }

    .pagination-controls {
        flex-direction: column;
        gap: 0.25rem;
    }

    .pagination-btn {
        width: 100%;
        justify-content: center;
        padding: 0.5rem;
        font-size: 0.85rem;
    }

    .page-numbers {
        width: 100%;
        justify-content: center;
    }

    .page-btn {
        min-width: 32px;
        height: 32px;
        font-size: 0.8rem;
    }
}

/* Dark Mode Styles */
:root {
    --section-dark-bg: #1a1f2e;
    --card-dark-bg: #262d3d;
    --text-dark-color: #e0e0e0;
    --text-light-gray: #b0b0b0;
    --border-dark-color: #3b4261;
}

.all-posts-page {
    background: white;
    color: #333;
    transition: all 0.3s ease;
}

body.dark-mode .all-posts-page {
    background-color: #121212;
    color: var(--text-dark-color);
}

/* Category Filter Section Dark Mode */
body.dark-mode .category-filter-section {
    background-color: var(--section-dark-bg);
    border-bottom-color: var(--border-dark-color);
}

body.dark-mode .filter-wrapper h3 {
    color: var(--text-dark-color);
}

body.dark-mode .category-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1rem;
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
    color: white;
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

/* Search Section Dark Mode */
body.dark-mode .search-input {
    background: var(--card-dark-bg);
    border-color: var(--border-dark-color);
    color: var(--text-dark-color);
}

body.dark-mode .search-input:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

body.dark-mode .search-icon {
    color: #666;
}

/* Controls Row Dark Mode */
body.dark-mode .sort-section label {
    color: var(--text-dark-color);
}

body.dark-mode .sort-select {
    background: var(--card-dark-bg);
    border-color: var(--border-dark-color);
    color: var(--text-dark-color);
}

body.dark-mode .sort-select:hover {
    border-color: #007bff;
}

body.dark-mode .sort-select:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
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

/* Posts Section Dark Mode */
body.dark-mode .posts-section {
    background: #121212;
}

body.dark-mode .results-info {
    color: var(--text-light-gray);
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
    color: var(--text-light-gray);
}

/* Pagination Section Dark Mode */
body.dark-mode .pagination-section {
    background: var(--card-dark-bg);
    border-color: var(--border-dark-color);
}

body.dark-mode .pagination-info label {
    color: var(--text-dark-color);
}

body.dark-mode .items-select,
body.dark-mode .posts-per-page {
    background: var(--card-dark-bg);
    border-color: var(--border-dark-color);
    color: var(--text-dark-color);
}

body.dark-mode .items-select:hover,
body.dark-mode .posts-per-page:hover {
    border-color: #007bff;
}

body.dark-mode .items-select:focus,
body.dark-mode .posts-per-page:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

body.dark-mode .page-info {
    color: var(--text-light-gray);
}

body.dark-mode .pagination-btn {
    background: var(--card-dark-bg);
    border-color: var(--border-dark-color);
    color: var(--text-dark-color);
}

body.dark-mode .pagination-btn:hover:not(:disabled) {
    background: #007bff;
    border-color: #007bff;
    color: white;
    transform: translateY(-2px);
}

body.dark-mode .pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

body.dark-mode .page-btn {
    background: var(--card-dark-bg);
    border-color: var(--border-dark-color);
    color: var(--text-dark-color);
}

body.dark-mode .page-btn:hover {
    border-color: #007bff;
    color: #7aa2f7;
}

body.dark-mode .page-btn.active {
    background: #007bff;
    border-color: #007bff;
    color: white;
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
}

/* Back to Home Section Dark Mode */
body.dark-mode .back-to-home-section {
    background: var(--section-dark-bg);
    border-top-color: var(--border-dark-color);
}
</style>
