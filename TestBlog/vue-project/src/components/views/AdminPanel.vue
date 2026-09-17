
<template>
  <div class="admin-panel">
    <div class="container">
      <div class="admin-header">
        <h1 class="page-title">Admin Panel</h1>
        <p class="page-subtitle">Manage and moderate blog posts</p>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <h3>{{ pendingCount }}</h3>
            <p>Pending Posts</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <h3>{{ approvedCount }}</h3>
            <p>Approved Posts</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-times-circle"></i>
          </div>
          <div class="stat-content">
            <h3>{{ rejectedCount }}</h3>
            <p>Rejected Posts</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-file-alt"></i>
          </div>
          <div class="stat-content">
            <h3>{{ totalPosts }}</h3>
            <p>Total Posts</p>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs-container">
        <div class="tabs">
          <button
            :class="{ active: activeTab === 'pending' }"
            @click="activeTab = 'pending'"
            class="tab-btn"
          >
            <i class="fas fa-clock"></i>
            Pending
            <span class="tab-count">{{ pendingCount }}</span>
          </button>
          <button
            :class="{ active: activeTab === 'approved' }"
            @click="activeTab = 'approved'"
            class="tab-btn"
          >
            <i class="fas fa-check-circle"></i>
            Approved
            <span class="tab-count">{{ approvedCount }}</span>
          </button>
          <button
            :class="{ active: activeTab === 'rejected' }"
            @click="activeTab = 'rejected'"
            class="tab-btn"
          >
            <i class="fas fa-times-circle"></i>
            Rejected
            <span class="tab-count">{{ rejectedCount }}</span>
          </button>
        </div>
      </div>

      <!-- Advanced Search -->
      <div class="search-section">
        <div class="search-bar-advanced">
          <div class="search-input-group">
            <i class="fas fa-search search-icon"></i>
            <input
              v-model="searchQuery"
              @input="onSearchInput"
              type="text"
              placeholder="Search posts, tags, author..."
              class="search-bar"
              aria-label="search posts"
              autocomplete="off"
            />
            <ul v-if="showSuggestions && suggestions.length" class="search-suggestions">
              <li v-for="s in suggestions" :key="s" @click="applySuggestion(s)">{{ s }}</li>
            </ul>
          </div>

          <div class="filter-group">
            <select v-model="selectedStatus" class="filter-select">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select v-model="selectedCategory" class="filter-select">
              <option value="">All Categories</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>

            <input type="date" v-model="dateFrom" class="filter-date" aria-label="from date" />
            <input type="date" v-model="dateTo" class="filter-date" aria-label="to date" />

            <select v-model="sortBy" class="filter-select">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="most-liked">Most Liked</option>
              <option value="most-viewed">Most Viewed</option>
              <option value="most-commented">Most Commented</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Posts List -->
      <div v-if="filteredPosts.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-inbox"></i>
        </div>
        <h3>No posts found</h3>
        <p>Try adjusting your search or filter criteria</p>
      </div>

      <div v-else class="posts-grid">
        <div
          v-for="post in filteredPosts"
          :key="post.id"
          class="admin-post-card"
        >
          <div class="post-header">
            <div class="post-title-section">
              <h3 v-html="highlight(post.title)" class="post-title"></h3>
              <span class="status-badge" :class="post.status">
                <i :class="getStatusIcon(post.status)"></i>
                {{ post.status }}
              </span>
            </div>
          </div>

          <div class="post-meta">
            <div class="meta-item">
              <i class="fas fa-user"></i>
              <span v-html="highlight(post.author)"></span>
            </div>
            <div class="meta-item">
              <i class="fas fa-tag"></i>
              <span v-html="highlight(post.category)"></span>
            </div>
            <div class="meta-item">
              <i class="fas fa-calendar"></i>
              {{ formatDate(post.createdAt) }}
            </div>
          </div>

          <div class="post-excerpt">
            <p v-html="highlight(post.excerpt)"></p>
          </div>

          <div class="post-stats">
            <div class="stat-item">
              <i class="fas fa-heart"></i>
              {{ post.likes || 0 }}
            </div>
          </div>

          <div class="post-actions">
            <button
              v-if="post.status === 'pending'"
              @click="$emit('approve-post', post.id)"
              class="btn btn-success"
            >
              <i class="fas fa-check"></i>
              Approve
            </button>
            <button
              v-if="post.status === 'pending'"
              @click="$emit('reject-post', post.id)"
              class="btn btn-danger"
            >
              <i class="fas fa-times"></i>
              Reject
            </button>
            <button @click="$emit('edit-post', post.id)" class="btn btn-primary">
              <i class="fas fa-edit"></i>
              Edit
            </button>
            <button @click="$emit('delete-post', post.id)" class="btn btn-outline-danger">
              <i class="fas fa-trash"></i>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>



<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { usePosts } from '@/composables/usePosts'

const { currentUser, isAdmin } = useAuth()
const { posts, categories } = usePosts(currentUser)

// Define emitted events
defineEmits(['approve-post', 'reject-post', 'edit-post', 'delete-post'])

const activeTab = ref('pending')
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedCategory = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const sortBy = ref('newest')

const suggestions = ref([])
const showSuggestions = ref(false)

const onSearchInput = () => {
  if (!searchQuery.value) {
    suggestions.value = []
    showSuggestions.value = false
    return
  }
  const q = searchQuery.value.toLowerCase()
  const all = posts.value.flatMap(post => [post.title, post.author, post.category, ...(post.tags || [])])
  const unique = Array.from(new Set(all.filter(Boolean)))
  suggestions.value = unique.filter(s => s.toLowerCase().includes(q)).slice(0, 6)
  showSuggestions.value = suggestions.value.length > 0
}

const applySuggestion = (s) => {
  searchQuery.value = s
  showSuggestions.value = false
}

const filteredPosts = computed(() => {
  let filtered = posts.value.filter(post => post.status === activeTab.value)
  if (selectedStatus.value) filtered = filtered.filter(post => post.status === selectedStatus.value)
  if (selectedCategory.value) filtered = filtered.filter(post => post.category === selectedCategory.value)
  if (dateFrom.value) filtered = filtered.filter(post => post.createdAt && post.createdAt >= dateFrom.value)
  if (dateTo.value) filtered = filtered.filter(post => post.createdAt && post.createdAt <= dateTo.value + 'T23:59:59')
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(post =>
      post.title.toLowerCase().includes(q) ||
      post.author.toLowerCase().includes(q) ||
      post.category.toLowerCase().includes(q) ||
      (post.tags && post.tags.some(tag => tag.toLowerCase().includes(q))) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(q))
    )
  }
  // Sort
  switch (sortBy.value) {
    case 'oldest':
      filtered = filtered.slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break
    case 'most-liked':
      filtered = filtered.slice().sort((a, b) => (b.likes || 0) - (a.likes || 0)); break
    case 'most-viewed':
      filtered = filtered.slice().sort((a, b) => (b.views || 0) - (a.views || 0)); break
    case 'most-commented':
      filtered = filtered.slice().sort((a, b) => (b.comments || 0) - (a.comments || 0)); break
    default:
      filtered = filtered.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
  return filtered
})

const pendingCount = computed(() => posts.value.filter(post => post.status === 'pending').length)
const approvedCount = computed(() => posts.value.filter(post => post.status === 'approved').length)
const rejectedCount = computed(() => posts.value.filter(post => post.status === 'rejected').length)
const totalPosts = computed(() => posts.value.length)

function getStatusIcon(status) {
  switch (status) {
    case 'pending': return 'fas fa-clock'
    case 'approved': return 'fas fa-check-circle'
    case 'rejected': return 'fas fa-times-circle'
    default: return 'fas fa-question-circle'
  }
}

function highlight(text) {
  if (!searchQuery.value || !text) return text
  const q = searchQuery.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(q, 'gi'), match => `<mark>${match}</mark>`)
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}


// ...existing code...
</script>

<style scoped>
.admin-panel {
  min-height: 100vh;
  padding: 2rem 0;
  background: var(--light);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.admin-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--dark);
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.1rem;
  color: var(--gray);
  margin: 0;
}

/* Statistics Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: var(--white);
  border-radius: var(--radius);
  padding: 1.5rem;
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: var(--transition);
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  font-size: 1.2rem;
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--dark);
  margin: 0;
}

.stat-content p {
  font-size: 0.9rem;
  color: var(--gray);
  margin: 0.25rem 0 0 0;
}

/* Tabs */
.tabs-container {
  margin-bottom: 2rem;
}

.tabs {
  display: flex;
  background: var(--white);
  border-radius: var(--radius);
  padding: 0.5rem;
  box-shadow: var(--shadow);
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.tab-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  border-radius: calc(var(--radius) - 2px);
  font-weight: 600;
  color: var(--gray);
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  position: relative;
}

.tab-btn:hover {
  background: rgba(58, 110, 165, 0.1);
  color: var(--primary);
}

.tab-btn.active {
  background: var(--primary);
  color: var(--white);
  box-shadow: 0 2px 8px rgba(58, 110, 165, 0.3);
}

.tab-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 700;
}

/* Search Section */
.search-section {
  background: var(--white);
  border-radius: var(--radius);
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow);
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.search-bar-advanced {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.search-input-group {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray);
  font-size: 1rem;
}

.search-bar {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #e0e0e0;
  border-radius: var(--radius);
  font-size: 1rem;
  outline: none;
  transition: var(--transition);
  background: var(--light);
}

.search-bar:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(58, 110, 165, 0.1);
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--white);
  border: 1px solid #e0e0e0;
  border-top: none;
  border-radius: 0 0 var(--radius) var(--radius);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.search-suggestions li {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: var(--transition);
}

.search-suggestions li:hover {
  background: var(--light);
}

.filter-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-select,
.filter-date {
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: var(--radius);
  font-size: 0.9rem;
  outline: none;
  transition: var(--transition);
  background: var(--white);
}

.filter-select:focus,
.filter-date:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(58, 110, 165, 0.1);
}

/* Posts Grid */
.posts-grid {
  display: grid;
  gap: 1.5rem;
}

.admin-post-card {
  background: var(--white);
  border-radius: var(--radius);
  padding: 1.5rem;
  box-shadow: var(--shadow);
  border: 1px solid rgba(0, 0, 0, 0.03);
  transition: var(--transition);
}

.admin-post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.post-header {
  margin-bottom: 1rem;
}

.post-title-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.post-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--dark);
  margin: 0;
  flex: 1;
}

.status-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-shrink: 0;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.approved {
  background: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
}

.post-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: var(--gray);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.post-excerpt {
  margin-bottom: 1rem;
}

.post-excerpt p {
  color: var(--dark);
  line-height: 1.6;
  margin: 0;
}

.post-stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: var(--gray);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.post-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  text-decoration: none;
}

.btn-primary {
  background: var(--primary);
  color: var(--white);
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.btn-success {
  background: var(--success);
  color: var(--white);
}

.btn-success:hover {
  background: #2e7d32;
  transform: translateY(-1px);
}

.btn-danger {
  background: var(--danger);
  color: var(--white);
}

.btn-danger:hover {
  background: #c62828;
  transform: translateY(-1px);
}

.btn-outline-danger {
  background: transparent;
  color: var(--danger);
  border: 2px solid var(--danger);
}

.btn-outline-danger:hover {
  background: var(--danger);
  color: var(--white);
  transform: translateY(-1px);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.empty-icon {
  font-size: 4rem;
  color: var(--gray-light);
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: var(--dark);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--gray);
  margin: 0;
}

/* Dark Mode Support */
body.dark-mode .admin-panel {
  background: #121212;
}

body.dark-mode .stat-card,
body.dark-mode .tabs,
body.dark-mode .search-section,
body.dark-mode .admin-post-card,
body.dark-mode .empty-state {
  background: #1e1e1e;
  border-color: rgba(255, 255, 255, 0.1);
}

body.dark-mode .page-title,
body.dark-mode .stat-content h3,
body.dark-mode .post-title,
body.dark-mode .post-excerpt p,
body.dark-mode .empty-state h3 {
  color: var(--white);
}

body.dark-mode .page-subtitle,
body.dark-mode .stat-content p,
body.dark-mode .post-meta,
body.dark-mode .post-stats,
body.dark-mode .empty-state p {
  color: #b0b0b0;
}

body.dark-mode .search-bar,
body.dark-mode .filter-select,
body.dark-mode .filter-date {
  background: #2a2a2a;
  border-color: rgba(255, 255, 255, 0.1);
  color: var(--white);
}

body.dark-mode .search-bar::placeholder {
  color: #888;
}

body.dark-mode .search-suggestions {
  background: #2a2a2a;
  border-color: rgba(255, 255, 255, 0.1);
}

body.dark-mode .search-suggestions li:hover {
  background: #333;
}

body.dark-mode .status-badge.pending {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

body.dark-mode .status-badge.approved {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
}

body.dark-mode .status-badge.rejected {
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .tabs {
    flex-direction: column;
  }

  .tab-btn {
    padding: 0.6rem 0.8rem;
  }

  .search-bar-advanced {
    gap: 1rem;
  }

  .filter-group {
    grid-template-columns: 1fr;
  }

  .post-title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .post-actions {
    justify-content: center;
  }

  .btn {
    flex: 1;
    justify-content: center;
  }
}
</style>
