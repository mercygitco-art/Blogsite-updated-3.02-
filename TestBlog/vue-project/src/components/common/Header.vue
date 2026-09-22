<template>
    <header :class="{ 'dark-mode': darkMode, 'mobile-menu-open': mobileMenuOpen, 'header-hidden': headerHidden }" class="site-header">
        <!-- Sidebar hover trigger -->
        <div class="sidebar-trigger"></div>

        <!-- Logo positioned at top left -->
        <div 
            class="logo" 
            tabindex="0" 
            role="button"
            aria-label="BlogSphere Pro Home" 
            @click="handleLogoClick"
            @keydown.enter="handleLogoClick"
            @keydown.space="handleLogoClick"
        >
            <div class="logo-icon">
                <i class="fas fa-blog"></i>
            </div>
            <span class="logo-text"></span>
        </div>

        <div class="container">
            <div class="header-content">
                <!-- Mobile menu toggle -->
                <button 
                    class="mobile-menu-toggle" 
                    @click="toggleMobileMenu"
                    :aria-expanded="mobileMenuOpen"
                    aria-label="Toggle navigation menu"
                    :class="{ 'active': mobileMenuOpen }"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <!-- Header Actions -->
                <div class="header-actions">
                    <!-- Search -->
                    <div class="search-container" :class="{ 'search-active': searchActive }">
                        <button 
                            class="icon-btn search-toggle" 
                            @click="toggleSearch"
                            :aria-expanded="searchActive"
                            aria-label="Toggle search"
                        >
                            <i class="fas fa-search"></i>
                        </button>
                        <div class="search-bar">
                            <input 
                                type="text" 
                                placeholder="Search articles..." 
                                v-model="searchQuery"
                                @input="handleSearchInput"
                                @keydown.enter="executeSearch"
                                @keydown.esc="closeSearch"
                                ref="searchInput"
                                aria-label="Search articles"
                            >
                            <button 
                                class="search-close" 
                                @click="closeSearch"
                                aria-label="Close search"
                            >
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Theme toggle -->
                    <button 
                        class="icon-btn theme-toggle" 
                        @click="toggleDarkMode"
                        :aria-label="darkMode ? 'Switch to light mode' : 'Switch to dark mode'"
                    >
                        <transition name="icon-swap" mode="out-in">
                            <i :key="darkMode ? 'sun' : 'moon'" 
                               :class="darkMode ? 'fas fa-sun' : 'fas fa-moon'">
                            </i>
                        </transition>
                    </button>

                    <!-- Write button -->
                    <div class="write-btn-container">
                        <button 
                            class="btn btn-primary" 
                            @click="handleWritePost" 
                            aria-label="Write a new post"
                        >
                            <i class="fas fa-pen"></i> 
                            <span class="btn-text">Write</span>
                        </button>
                    </div>

                    <!-- User menu -->
                    <div 
                        class="user-menu" 
                        @mouseenter="userMenuHover = true" 
                        @mouseleave="userMenuHover = false"
                        ref="userMenu"
                    >
                        <div
                            class="user-avatar"
                            @click="toggleUserMenu"
                            @keydown.enter="toggleUserMenu"
                            @keydown.space="toggleUserMenu"
                            tabindex="0"
                            role="button"
                            :aria-label="currentUser ? `${currentUser.name}'s profile menu` : 'User menu'"
                            :class="{ 'active': userMenuOpen }"
                        >
                            <div class="avatar-container">
                                <img
                                    v-if="currentUser && currentUser.avatar"
                                    :src="currentUser.avatar"
                                    :alt="`${currentUser.name}'s avatar`"
                                    class="avatar-img"
                                />
                                <span v-else class="avatar-fallback">
                                    {{ currentUser ? currentUser.name.charAt(0).toUpperCase() : 'U' }}
                                </span>
                                <span v-if="currentUser?.role === 'admin'" class="admin-badge" title="Admin">
                                    <i class="fas fa-star"></i>
                                </span>
                            </div>
                            <i class="fas fa-chevron-down user-menu-arrow" :class="{ 'rotate': userMenuOpen }"></i>
                        </div>
                        <transition name="dropdown">
                            <div 
                                v-show="userMenuOpen || userMenuHover" 
                                class="user-dropdown-menu" 
                                role="menu"
                                @click.stop
                                v-click-outside="closeUserMenu"
                            >
                                <div class="user-info" v-if="currentUser">
                                    <div class="user-name">
                                        {{ currentUser.name }}
                                        <span v-if="currentUser.role === 'admin'" class="role-badge admin">Admin</span>
                                        <span v-else class="role-badge user">User</span>
                                    </div>
                                    <div class="user-email">{{ currentUser.email }}</div>
                                </div>
                                <div v-else class="user-info guest">
                                    <div class="user-name">Guest User</div>
                                    <div class="user-email">Sign in to access all features</div>
                                </div>
                                <hr>
                                <a href="#" class="dropdown-item" role="menuitem" @click.prevent="handleProfileClick">
                                    <i class="fas fa-user"></i> Profile
                                </a>
                                <a v-if="currentUser && currentUser.role === 'admin'" href="#" class="dropdown-item" role="menuitem" @click.prevent="$emit('admin-click')">
                                    <i class="fas fa-tools"></i> Admin Panel
                                </a>
                                <template v-if="currentUser">
                                    <hr>
                                    <a href="#" class="dropdown-item" role="menuitem" @click.prevent="handleLogoutClick">
                                        <i class="fas fa-sign-out-alt"></i> Sign Out
                                    </a>
                                </template>
                                <template v-else>
                                    <hr>
                                    <a href="#" class="dropdown-item" role="menuitem" @click.prevent="handleLoginClick">
                                        <i class="fas fa-sign-in-alt"></i> Sign In
                                    </a>
                                    <a href="#" class="dropdown-item" role="menuitem" @click.prevent="handleRegisterClick">
                                        <i class="fas fa-user-plus"></i> Sign Up
                                    </a>
                                </template>
                            </div>
                        </transition>
                    </div>
                </div>
            </div>
        </div>

        <!-- Navigation Sidebar -->
        <nav 
            class="nav-links" 
            :class="{ 'mobile-open': mobileMenuOpen }"
            @click="handleNavClick"
        >
            <div class="nav-container">
                <a
                    v-for="category in visibleCategories"
                    :key="category.id"
                    href="#"
                    class="nav-link"
                    :class="{ active: currentCategory === category.id }"
                    @click.prevent="setCategory(category.id)"
                    :aria-current="currentCategory === category.id ? 'page' : null"
                >
                    <i v-if="category.icon" :class="category.icon" class="nav-icon"></i>
                    <span class="nav-text">{{ category.name }}</span>
                </a>
                
                <!-- Dropdown for more categories -->
                <div 
                    v-if="moreCategories.length" 
                    class="nav-dropdown" 
                    @mouseenter="dropdownHover = true" 
                    @mouseleave="dropdownHover = false"
                    ref="dropdown"
                >
                    <button 
                        class="nav-link dropdown-btn" 
                        :aria-expanded="dropdownOpen"
                        @click="toggleDropdown"
                        :class="{ 'active': dropdownOpen || isMoreCategoryActive }"
                    >
                        <i class="fas fa-ellipsis-h nav-icon"></i>
                        <span class="nav-text">More</span>
                        <i class="fas fa-chevron-down dropdown-arrow" :class="{ 'rotate': dropdownOpen }"></i>
                    </button>
                    <transition name="dropdown">
                        <div 
                            v-show="dropdownOpen || dropdownHover" 
                            class="dropdown-menu" 
                            role="menu"
                            @click.stop
                            v-click-outside="closeDropdown"
                        >
                            <a
                                v-for="category in moreCategories"
                                :key="category.id"
                                href="#"
                                class="dropdown-item"
                                :class="{ active: currentCategory === category.id }"
                                @click.prevent="setCategory(category.id)"
                                role="menuitem"
                            >
                                <i v-if="category.icon" :class="category.icon" class="nav-icon"></i>
                                {{ category.name }}
                            </a>
                        </div>
                    </transition>
                </div>
                
                <!-- View All Posts Button -->
                <button 
                    class="view-all-posts-btn"
                    @click="$emit('view-all-posts')"
                    title="View All Posts"
                >
                    <i class="fas fa-book"></i>
                    <span class="nav-text">All Posts</span>
                </button>
            </div>
        </nav>
        
        <!-- Mobile overlay -->
        <div 
            v-if="mobileMenuOpen" 
            class="mobile-overlay" 
            @click="closeMobileMenu"
        ></div>
        
        <!-- Search results dropdown (optional) -->
        <div v-if="searchResults.length > 0 && searchActive" class="search-results-dropdown">
            <div class="search-results-container">
                <div class="search-results-header">
                    <h3>Search Results</h3>
                    <button @click="clearSearchResults" class="clear-results-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="search-results-list">
                    <a 
                        v-for="result in searchResults" 
                        :key="result.id" 
                        href="#" 
                        class="search-result-item"
                        @click.prevent="handleSearchResultClick(result)"
                    >
                        <div class="result-title">{{ result.title }}</div>
                        <div class="result-category">{{ result.category }}</div>
                    </a>
                </div>
            </div>
        </div>
    </header>
</template>

<script>
// Custom directive for click outside
const clickOutside = {
    beforeMount(el, binding) {
        el.clickOutsideEvent = function(event) {
            if (!(el === event.target || el.contains(event.target))) {
                binding.value(event);
            }
        };
        document.addEventListener('click', el.clickOutsideEvent);
    },
    unmounted(el) {
        document.removeEventListener('click', el.clickOutsideEvent);
    }
};

import { CATEGORY_DEFINITIONS } from '../../config/categories.js'
import { postsAPI } from '../../api/index.js'

export default {
    name: 'AdvancedHeader',
    directives: {
        'click-outside': clickOutside
    },
    props: {
        currentCategory: {
            type: String,
            default: 'all'
        },
        currentUser: {
            type: Object,
            default: null
        },
        darkMode: {
            type: Boolean,
            default: false
        }
    },
    emits: [
        'set-category', 
        'toggle-dark-mode', 
        'write-post', 
        'user-avatar-click', 
        'search', 
        'show-login', 
        'show-register',
        'search-result-click',
        'profile-click',
        'logout-click',
        'view-all-posts',
        'admin-click'
    ],
    data() {
        return {
            categories: CATEGORY_DEFINITIONS.map(category => ({
                ...category,
                name: category.navName || category.name
            })),
            dropdownOpen: false,
            dropdownHover: false,
            userMenuOpen: false,
            userMenuHover: false,
            mobileMenuOpen: false,
            searchActive: false,
            searchQuery: '',
            searchTimeout: null,
            searchResults: [],
            maxVisible: 4,
            lastScrollY: 0,
            headerHidden: false
        }
    },
    computed: {
        visibleCategories() {
            return this.categories.slice(0, this.maxVisible);
        },
        moreCategories() {
            return this.categories.slice(this.maxVisible);
        },
        isMoreCategoryActive() {
            return this.moreCategories.some(cat => cat.id === this.currentCategory);
        }
    },
    watch: {
        mobileMenuOpen(newVal) {
            // Prevent body scroll when mobile menu is open
            if (newVal) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        },
        searchActive(newVal) {
            if (!newVal) {
                this.searchResults = [];
            }
        }
    },
    mounted() {
        window.addEventListener('resize', this.handleResize);
        this.handleResize();
        
        // Add keyboard navigation
        document.addEventListener('keydown', this.handleGlobalKeydown);

        // Add scroll listener for header hide/show
        window.addEventListener('scroll', this.handleScroll);
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('keydown', this.handleGlobalKeydown);
        
        // Ensure body scroll is restored
        document.body.style.overflow = '';
        
        // Clear any pending timeouts
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // Remove scroll listener
        window.removeEventListener('scroll', this.handleScroll);
    },
    methods: {
        setCategory(categoryId) {
            this.$emit('set-category', categoryId);
            this.closeDropdown();
            this.closeMobileMenu();
        },
        
        toggleDropdown() {
            this.dropdownOpen = !this.dropdownOpen;
            if (this.dropdownOpen) {
                this.userMenuOpen = false;
            }
        },
        
        closeDropdown() {
            this.dropdownOpen = false;
            this.dropdownHover = false;
        },
        
        toggleUserMenu() {
            this.userMenuOpen = !this.userMenuOpen;
            if (this.userMenuOpen) {
                this.dropdownOpen = false;
            }
        },
        
        closeUserMenu() {
            this.userMenuOpen = false;
            this.userMenuHover = false;
        },
        
        toggleMobileMenu() {
            this.mobileMenuOpen = !this.mobileMenuOpen;
        },
        
        closeMobileMenu() {
            this.mobileMenuOpen = false;
        },
        
        toggleSearch() {
            this.searchActive = !this.searchActive;
            if (this.searchActive) {
                this.$nextTick(() => {
                    this.$refs.searchInput.focus();
                });
            } else {
                this.searchQuery = '';
                this.searchResults = [];
            }
        },
        
        closeSearch() {
            this.searchActive = false;
            this.searchQuery = '';
            this.searchResults = [];
        },
        
        toggleDarkMode() {
            this.$emit('toggle-dark-mode');
        },
        
        handleLogoClick() {
            this.$emit('set-category', 'all');
            this.setCategory('all');
        },
        
        handleSearchInput() {
            // Clear previous timeout
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
            }
            
            // Set new timeout for debouncing
            this.searchTimeout = setTimeout(() => {
                if (this.searchQuery.trim()) {
                    this.performSearch(this.searchQuery);
                } else {
                    this.searchResults = [];
                }
            }, 500);
        },
        
        async performSearch(query) {
            try {
                const response = await postsAPI.searchPosts(query)
                this.searchResults = (response.posts || []).map(post => ({
                    id: post._id || post.id,
                    title: post.title,
                    category: post.categoryId?.name || 'Uncategorized'
                }))
                this.$emit('search', query)
            } catch {
                this.searchResults = []
            }
        },
        
        executeSearch() {
            if (this.searchQuery.trim()) {
                this.$emit('search', this.searchQuery);
                this.performSearch(this.searchQuery)
            }
        },
        
        clearSearchResults() {
            this.searchResults = [];
        },
        
        handleSearchResultClick(result) {
            this.$emit('search-result-click', result);
            this.closeSearch();
        },
        
        handleResize() {
            const width = window.innerWidth;
            if (width < 768) {
                this.maxVisible = 2;
            } else if (width < 1024) {
                this.maxVisible = 3;
            } else {
                this.maxVisible = 4;
            }
            
            // Close mobile menu on resize to desktop
            if (width >= 768 && this.mobileMenuOpen) {
                this.closeMobileMenu();
            }
        },
        
        handleNavClick(event) {
            if (window.innerWidth < 768 && !event.target.classList.contains('dropdown-btn')) {
                this.closeMobileMenu();
            }
        },
        
        handleGlobalKeydown(event) {
            // Close dropdowns on Escape key
            if (event.key === 'Escape') {
                if (this.dropdownOpen) {
                    this.closeDropdown();
                }
                if (this.userMenuOpen) {
                    this.closeUserMenu();
                }
                if (this.searchActive) {
                    this.closeSearch();
                }
                if (this.mobileMenuOpen) {
                    this.closeMobileMenu();
                }
            }
        },
        
        handleWritePost() {
            if (this.currentUser) {
                this.$emit('write-post');
            } else {
                this.$emit('show-login');
            }
        },

        handleProfileClick() {
            if (this.currentUser) {
                this.$emit('profile-click');
            } else {
                this.$emit('show-login');
            }
            this.closeUserMenu();
        },

        handleLogoutClick() {
            this.$emit('logout-click');
            this.closeUserMenu();
        },
        
        handleLoginClick() {
            this.$emit('show-login');
            this.closeUserMenu();
        },
        
        handleRegisterClick() {
            this.$emit('show-register');
            this.closeUserMenu();
        },

        handleScroll() {
            const currentScrollY = window.scrollY;
            if (currentScrollY > this.lastScrollY && currentScrollY > 70) {
                this.headerHidden = true;
            } else if (currentScrollY < this.lastScrollY) {
                this.headerHidden = false;
            }
            this.lastScrollY = currentScrollY;
        }
    }
}
</script>

<style scoped>
.site-header {
    background: var(--header-bg, #fff);
    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    position: sticky;
    top: 0;
    z-index: 1000;
    transition: all 0.3s ease;
}

.site-header.header-hidden {
    transform: translateY(-100%);
}

.site-header.dark-mode {
    --header-bg: #1a1a1a;
    --text-color: #f0f0f0;
    --border-color: #333;
    --hover-bg: #2a2a2a;
    --shadow-color: rgba(0,0,0,0.3);
}

.site-header.mobile-menu-open {
    box-shadow: 0 2px 20px var(--shadow-color, rgba(0,0,0,0.15));
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem 0 5rem;
}

.header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
    position: relative;
}

/* Logo Styles */
.logo {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s ease;
    outline: none;
    user-select: none;
    z-index: 10;
}

.logo:hover, .logo:focus {
    background: var(--hover-bg, #f5f5f5);
    transform: translateY(-1px);
}

.logo-icon {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #007bff, #0056b3);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
}

.logo-text {
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #007bff, #0056b3);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
    display: none;
    flex-direction: column;
    justify-content: space-between;
    width: 24px;
    height: 18px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    position: relative;
    z-index: 110;
}

.mobile-menu-toggle span {
    display: block;
    height: 2px;
    width: 100%;
    background: var(--text-color, #333);
    border-radius: 1px;
    transition: all 0.3s ease;
    transform-origin: center;
}

.mobile-menu-toggle.active span:nth-child(1) {
    transform: translateY(8px) rotate(45deg);
}

.mobile-menu-toggle.active span:nth-child(2) {
    opacity: 0;
}

.mobile-menu-toggle.active span:nth-child(3) {
    transform: translateY(-8px) rotate(-45deg);
}

/* Sidebar trigger */
.sidebar-trigger {
    position: fixed;
    left: 0;
    top: 70px;
    width: 10px;
    height: calc(100vh - 70px);
    z-index: 5;
    background: transparent;
}

/* Navigation Styles */
.nav-links {
    position: fixed;
    left: 0;
    top: 70px;
    width: 250px;
    height: calc(100vh - 70px);
    background: var(--header-bg, #fff);
    box-shadow: 2px 0 10px rgba(0,0,0,0.1);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 10;
    overflow-y: auto;
    padding: 1rem 0;
}

.sidebar-trigger:hover ~ .nav-links,
.nav-links:hover {
    transform: translateX(0);
}

.nav-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0 1rem;
}

.nav-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: var(--text-color, #333);
    padding: 0.6rem 1rem;
    border-radius: 6px;
    transition: all 0.2s ease;
    font-weight: 500;
    outline: none;
    border: 1px solid transparent;
    white-space: nowrap;
}

.nav-link:hover, .nav-link:focus {
    background: var(--hover-bg, #f5f5f5);
    border-color: var(--border-color, #e0e0e0);
}

.nav-link.active {
    background: #007bff;
    color: #fff;
    box-shadow: 0 2px 5px rgba(0,123,255,0.3);
}

.nav-icon {
    font-size: 0.9rem;
    width: 16px;
    text-align: center;
}

/* View All Posts Button */
.view-all-posts-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 0.6rem 1rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 600;
    margin-top: 0.5rem;
    outline: none;
}

.view-all-posts-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.view-all-posts-btn:active {
    transform: translateY(0);
}

/* Dropdown Styles */
.nav-dropdown, .user-menu {
    position: relative;
}

.dropdown-btn, .user-avatar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.6rem 1rem;
    border-radius: 6px;
    color: var(--text-color, #333);
    font-weight: 500;
    transition: all 0.2s ease;
    outline: none;
    border: 1px solid transparent;
    white-space: nowrap;
}

.dropdown-btn:hover, .dropdown-btn:focus,
.user-avatar:hover, .user-avatar:focus {
    background: var(--hover-bg, #f5f5f5);
    border-color: var(--border-color, #e0e0e0);
}

.dropdown-btn.active, .user-avatar.active {
    background: var(--hover-bg, #f5f5f5);
    border-color: var(--border-color, #e0e0e0);
}

.dropdown-arrow, .user-menu-arrow {
    font-size: 0.7rem;
    transition: transform 0.3s ease;
}

.rotate {
    transform: rotate(180deg);
}

.dropdown-menu, .user-dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    background: var(--header-bg, #fff);
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 8px;
    min-width: 200px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    z-index: 20;
    overflow: hidden;
    margin-top: 5px;
}

.user-dropdown-menu {
    right: 0;
    left: auto;
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    color: var(--text-color, #333);
    text-decoration: none;
    cursor: pointer;
    transition: background 0.2s ease;
    outline: none;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    font-size: 0.9rem;
}

.dropdown-item:hover, .dropdown-item:focus {
    background: var(--hover-bg, #f5f5f5);
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
    transition: all 0.3s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

/* Header Actions */
.header-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    position: absolute;
    top: 0;
    right: -10rem;
    z-index: 10;
}

/* Search Styles */
.search-container {
    position: relative;
    display: flex;
    align-items: center;
}

.search-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
}

.search-bar {
    position: absolute;
    top: 100%;
    right: 0;
    background: var(--header-bg, #fff);
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 6px;
    padding: 0.5rem;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.3s ease;
    z-index: 30;
}

.search-active .search-bar {
    opacity: 1;
    visibility: visible;
    transform: translateY(5px);
}

.search-bar input {
    border: none;
    background: none;
    outline: none;
    width: 250px;
    padding: 0.5rem;
    color: var(--text-color, #333);
    font-size: 0.9rem;
}

.search-bar input::placeholder {
    color: var(--text-color, #999);
    opacity: 0.7;
}

.search-close {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-color, #666);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    border-radius: 4px;
    transition: background 0.2s ease;
    font-size: 0.9rem;
}

.search-close:hover {
    background: var(--hover-bg, #f5f5f5);
}

/* Search Results */
.search-results-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--header-bg, #fff);
    border: 1px solid var(--border-color, #e0e0e0);
    border-top: none;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    z-index: 25;
    max-height: 400px;
    overflow-y: auto;
}

.search-results-container {
    padding: 1rem;
}

.search-results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-color, #e0e0e0);
}

.search-results-header h3 {
    margin: 0;
    font-size: 1rem;
    color: var(--text-color, #333);
}

.clear-results-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-color, #666);
    padding: 0.25rem;
    border-radius: 4px;
    transition: background 0.2s ease;
}

.clear-results-btn:hover {
    background: var(--hover-bg, #f5f5f5);
}

.search-result-item {
    display: block;
    padding: 0.75rem;
    text-decoration: none;
    color: var(--text-color, #333);
    border-radius: 4px;
    transition: background 0.2s ease;
    margin-bottom: 0.25rem;
}

.search-result-item:hover {
    background: var(--hover-bg, #f5f5f5);
}

.result-title {
    font-weight: 500;
    margin-bottom: 0.25rem;
}

.result-category {
    font-size: 0.8rem;
    color: var(--text-color, #666);
    opacity: 0.7;
}

/* Icon Button Styles */
.icon-btn {
    width: 40px;
    height: 40px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.1rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    color: var(--text-color, #333);
    outline: none;
}

.icon-btn:hover, .icon-btn:focus {
    background: var(--hover-bg, #f5f5f5);
    transform: scale(1.05);
}

/* Icon swap transition */
.icon-swap-enter-active,
.icon-swap-leave-active {
    transition: all 0.3s ease;
}

.icon-swap-enter-from {
    opacity: 0;
    transform: scale(0.8) rotate(-90deg);
}

.icon-swap-leave-to {
    opacity: 0;
    transform: scale(0.8) rotate(90deg);
}

/* Write Button */
.btn-primary {
    background: #007bff;
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
    outline: none;
    font-size: 0.9rem;
}

.btn-primary:hover, .btn-primary:focus {
    background: #0056b3;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0,123,255,0.3);
}

.btn-outline {
    background: transparent;
    border: 1px solid #007bff;
    color: #007bff;
    padding: 0.6rem 1.2rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
}

.btn-outline:hover {
    background: #007bff;
    color: white;
}

/* User Avatar */
.avatar-container {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #007bff, #0056b3);
    position: relative;
}

.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-fallback {
    color: white;
    font-weight: 600;
    font-size: 0.9rem;
}

.admin-badge {
    position: absolute;
    bottom: -2px;
    right: -2px;
    background: #ffd700;
    color: #000;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.6rem;
    border: 2px solid white;
}

.user-info {
    padding: 1rem;
}

.user-info.guest {
    opacity: 0.7;
}

.user-name {
    font-weight: 600;
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.user-email {
    font-size: 0.8rem;
    color: var(--text-color, #666);
    opacity: 0.8;
}

.role-badge {
    font-size: 0.7rem;
    padding: 0.1rem 0.4rem;
    border-radius: 10px;
    font-weight: 600;
}

.role-badge.admin {
    background: #ffd700;
    color: #000;
}

.role-badge.user {
    background: #6c757d;
    color: white;
}

hr {
    border: none;
    height: 1px;
    background: var(--border-color, #e0e0e0);
    margin: 0.5rem 0;
}

/* Mobile Styles */
@media (max-width: 768px) {
    .logo {
        left: 1rem;
    }
    
    .container {
        padding-left: 5rem;
    }
    
    .sidebar-trigger {
        display: none;
    }
    
    .mobile-menu-toggle {
        display: flex;
    }
    
    .nav-links {
        position: fixed;
        top: 70px;
        left: 0;
        width: 100%;
        height: calc(100vh - 70px);
        background: var(--header-bg, #fff);
        flex-direction: column;
        align-items: stretch;
        padding: 1rem;
        transform: translateX(-100%);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 90;
        overflow-y: auto;
    }
    
    .nav-links.mobile-open {
        transform: translateX(0);
        opacity: 1;
        visibility: visible;
    }
    
    .nav-container {
        flex-direction: column;
        gap: 0;
    }
    
    .nav-link, .dropdown-btn {
        width: 100%;
        justify-content: flex-start;
        border-radius: 6px;
        border: none;
        margin-bottom: 0.25rem;
    }
    
    .dropdown-menu {
        position: static;
        box-shadow: none;
        border: none;
        border-radius: 0;
        width: 100%;
        margin-top: 0;
        background: transparent;
    }
    
    .search-bar {
        position: fixed;
        top: 70px;
        left: 0;
        width: 100%;
        border-radius: 0;
        border-left: none;
        border-right: none;
        padding: 1rem;
        z-index: 95;
    }
    
    .search-bar input {
        width: 100%;
    }
    
    .search-results-dropdown {
        top: 140px;
        z-index: 90;
    }
    
    .mobile-overlay {
        position: fixed;
        top: 70px;
        left: 0;
        width: 100%;
        height: calc(100vh - 70px);
        background: rgba(0,0,0,0.5);
        z-index: 85;
    }
    
    .btn-text {
        display: none;
    }
    
    .user-dropdown-menu {
        right: 0;
        left: 0;
        width: 100%;
    }

    .header-actions {
        gap: 0.5rem;
        position: static;
    }
}

@media (max-width: 480px) {
    .logo-text {
        display: none;
    }
    
    .header-actions {
        gap: 0.25rem;
    }
    
    .container {
        padding: 0 0.5rem;
    }
    
    .nav-link, .dropdown-btn {
        padding: 0.75rem 0.5rem;
    }
}
</style>