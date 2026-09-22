import { ref, computed, watch, onMounted } from 'vue'
import { postsAPI, commentsAPI } from '../api/index.js'
import { usePostReactions } from './usePostReactions.js'

function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9)
}

export function usePosts(currentUser) {
    const currentView = ref('home')
    const currentCategory = ref('all')
    const currentPost = ref(null)
    const editingPost = ref(null)
    const newComment = ref('')
    const loading = ref(false)
    const error = ref('')
    const notification = ref('')
    const searchQuery = ref('')
    const sortBy = ref('newest')

    const posts = ref([])

    // Posts are loaded from the backend.
    const fetchPosts = async (params = {}) => {
        loading.value = true
        error.value = ''
        
        try {
            const response = await postsAPI.getPosts(params)
            posts.value = (response.posts || response).map(post => ({
                ...post,
                id: post.id || post._id,
                category: post.category || post.categoryId?.slug || '',
                author: post.author || post.authorName || post.authorId?.name || 'Unknown author',
                authorAvatar: post.authorAvatar || post.authorId?.avatar,
                date: post.date || post.createdAt,
                draft: post.status !== 'published'
            }))
            return posts.value
        } catch (apiError) {
            error.value = apiError.response?.data?.message || 'Unable to load posts from the server.'
            posts.value = []
            throw apiError
        } finally {
            loading.value = false
        }
    }

    const comments = ref([])

    const drafts = ref([])

    const {
        likes,
        savedPosts,
        isLiked,
        isSaved,
        postLikeCount,
        toggleLike,
        toggleSave
    } = usePostReactions({ posts, currentUser, currentPost, error, notification })

    onMounted(() => {
        void fetchPosts()
    })

    // Computed properties
    const filteredPosts = computed(() => {
        let filtered = posts.value.filter(post => !post.draft)

        // Filter by category
        if (currentCategory.value !== 'all') {
            filtered = filtered.filter(post => post.category === currentCategory.value)
        }

        // Filter by search query
        if (searchQuery.value) {
            const query = searchQuery.value.toLowerCase()
            filtered = filtered.filter(post => 
                post.title.toLowerCase().includes(query) ||
                post.excerpt.toLowerCase().includes(query) ||
                post.tags.some(tag => tag.toLowerCase().includes(query)) ||
                post.author.toLowerCase().includes(query)
            )
        }

        // Sort posts
        return sortPosts(filtered, sortBy.value)
    })

    const featuredPosts = computed(() => {
        return posts.value.filter(post => post.featured && !post.draft)
    })

    const trendingPosts = computed(() => {
        return posts.value.filter(post => post.trending && !post.draft)
    })

    const userPosts = computed(() => {
        if (!currentUser.value) return []
        return posts.value.filter(post => post.author === currentUser.value.name)
    })

    const userDrafts = computed(() => {
        if (!currentUser.value) return []
        return posts.value.filter(post => post.draft && post.author === currentUser.value.name)
    })

    const categories = computed(() => {
        const categoriesSet = new Set(posts.value.map(post => post.category))
        return ['all', ...Array.from(categoriesSet)]
    })

    const postComments = computed(() => {
        if (!currentPost.value) return []
        return comments.value
            .filter(comment => comment.postId === currentPost.value.id)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
    })

    // Methods
    const setCategory = (category) => {
        currentCategory.value = category
    }

    const setSortBy = (sort) => {
        sortBy.value = sort
    }

    const setSearchQuery = (query) => {
        searchQuery.value = query
    }

    const showHomeView = () => {
        currentView.value = 'home'
        currentPost.value = null
        editingPost.value = null
        error.value = ''
    }

    const showProfileView = () => {
        if (!currentUser.value) {
            error.value = 'You must be logged in to view your profile.'
            return
        }
        currentView.value = 'profile'
        currentPost.value = null
        editingPost.value = null
        error.value = ''
    }

    const viewPost = async (postId) => {
        loading.value = true
        try {
            const response = await postsAPI.getPost(postId)
            const post = response.post || response
            currentPost.value = {
                ...post,
                id: post.id || post._id,
                category: post.category || post.categoryId?.slug || '',
                author: post.author || post.authorName || post.authorId?.name || 'Unknown author',
                date: post.date || post.createdAt
            }
            currentView.value = 'post'
            comments.value = (await commentsAPI.getComments(postId)).comments || []
        } catch (apiError) {
            error.value = apiError.response?.data?.message || 'Unable to load this post.'
        } finally {
            loading.value = false
        }
    }

    const writePost = () => {
        if (!currentUser.value) {
            error.value = 'You must be logged in to write a post.'
            return false
        }
        editingPost.value = null
        currentView.value = 'editor'
        error.value = ''
        return true
    }

    const editPost = (postId) => {
        if (!currentUser.value) {
            error.value = 'You must be logged in to edit a post.'
            return false
        }
        const post = posts.value.find(p => p.id === postId)
        if (post && (post.author === currentUser.value.name || currentUser.value.role === 'admin')) {
            editingPost.value = { ...post }
            currentView.value = 'editor'
            error.value = ''
        } else {
            error.value = 'You can only edit your own posts.'
        }
    }

    const deletePost = async (postId) => {
        if (!currentUser.value) {
            error.value = 'You must be logged in to delete a post.'
            return false
        }
        
        const postIndex = posts.value.findIndex(p => p.id === postId)
        if (postIndex !== -1) {
            const post = posts.value[postIndex]
            if (post.author === currentUser.value.name || currentUser.value.role === 'admin') {
                await postsAPI.deletePost(postId, currentUser.value.role === 'admin')
                posts.value.splice(postIndex, 1)
                notification.value = 'Post deleted successfully!'
                
                // Clear current post if it's the one being deleted
                if (currentPost.value && currentPost.value.id === postId) {
                    showHomeView()
                }
            } else {
                error.value = 'You can only delete your own posts.'
            }
        } else {
            error.value = 'Post not found.'
        }
    }

    // Admin can approve posts
    const approvePost = async (postId) => {
        if (!currentUser.value || currentUser.value.role !== 'admin') {
            error.value = 'Only admins can approve posts.'
            return
        }
        const post = posts.value.find(p => p.id === postId)
        if (post) {
            await postsAPI.updatePost(postId, { status: 'published' }, true)
            post.status = 'published'
            notification.value = 'Post published!'
        }
    }

    // Admin can reject posts
    const rejectPost = async (postId) => {
        if (!currentUser.value || currentUser.value.role !== 'admin') {
            error.value = 'Only admins can reject posts.'
            return
        }
        const post = posts.value.find(p => p.id === postId)
        if (post) {
            await postsAPI.updatePost(postId, { status: 'archived' }, true)
            post.status = 'archived'
            notification.value = 'Post archived!'
        }
    }

    const savePost = async (postData, isDraft = false) => {
        loading.value = true
        error.value = ''
        try {
            if (!currentUser.value) throw new Error('Not authenticated')
            if (!postData.title || !postData.content) throw new Error('Title and content are required')
            
            if (editingPost.value) {
                await postsAPI.updatePost(editingPost.value.id, {
                    ...postData,
                    status: isDraft ? 'draft' : 'published'
                }, currentUser.value.role === 'admin')
                await fetchPosts()
                notification.value = isDraft ? 'Draft updated successfully!' : 'Post updated successfully!'
            } else {
                await postsAPI.createPost({
                    ...postData,
                    status: isDraft ? 'draft' : 'published'
                }, currentUser.value.role === 'admin')
                await fetchPosts()
                notification.value = isDraft ? 'Draft saved successfully!' : (currentUser.value.role === 'admin' ? 'Post published successfully!' : 'Post submitted for approval!')
            }
            showHomeView()
        } catch (e) {
            error.value = e.message
        } finally {
            loading.value = false
        }
    }

    const addComment = async (content, parentId = null) => {
        if (!currentUser.value) {
            error.value = 'You must be logged in to comment.'
            return
        }
        if (!content.trim()) {
            error.value = 'Comment cannot be empty.'
            return
        }
        if (!currentPost.value) {
            error.value = 'No post selected.'
            return
        }
        
        if (parentId) {
            // Add reply to existing comment
            const parentComment = comments.value.find(c => c.id === parentId)
            if (parentComment) {
                const newReply = {
                    id: generateId(),
                    author: currentUser.value.name,
                    content,
                    date: new Date().toISOString(),
                    likes: 0,
                    dislikes: 0
                }
                parentComment.replies.push(newReply)
                notification.value = 'Reply added successfully!'
            }
        } else {
            // Add new comment
            try {
                const response = await commentsAPI.createComment(currentPost.value.id, { content })
                const savedComment = response.comment || response
                comments.value.push({
                    ...savedComment,
                    id: savedComment.id || savedComment._id,
                    postId: savedComment.postId || currentPost.value.id,
                    author: savedComment.author || savedComment.authorName,
                    date: savedComment.date || savedComment.createdAt,
                    replies: []
                })
                currentPost.value.comments += 1
                notification.value = 'Comment added successfully!'
            } catch (apiError) {
                error.value = apiError.response?.data?.message || 'Unable to add your comment.'
            }
        }
        newComment.value = ''
    }

    const editComment = async (commentId, newContent) => {
        const comment = comments.value.find(c => c.id === commentId)
        if (comment && comment.author === currentUser.value?.name) {
            const response = await commentsAPI.updateComment(commentId, { content: newContent })
            Object.assign(comment, response.comment || response)
            comment.edited = true
            notification.value = 'Comment updated successfully!'
        } else {
            error.value = 'You can only edit your own comments.'
        }
    }

    const deleteComment = async (commentId) => {
        const commentIndex = comments.value.findIndex(c => c.id === commentId)
        if (commentIndex !== -1) {
            const comment = comments.value[commentIndex]
            if (comment.author === currentUser.value?.name) {
                await commentsAPI.deleteComment(commentId)
                comments.value.splice(commentIndex, 1)
                if (currentPost.value) {
                    currentPost.value.comments = Math.max(0, currentPost.value.comments - 1)
                }
                notification.value = 'Comment deleted successfully!'
            } else {
                error.value = 'You can only delete your own comments.'
            }
        }
    }

    const sharePost = (post) => {
        if (!post) return
        // Simulate sharing
        const postUrl = `${window.location.origin}/post/${post.id}`
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(postUrl).then(() => {
                notification.value = 'Post link copied to clipboard!'
            }).catch(() => {
                notification.value = 'Post shared!'
            })
        } else {
            notification.value = 'Post shared!'
        }
    }

    const startWriting = () => {
        if (currentUser.value) {
            return writePost()
        } else {
            error.value = 'Please log in to write a post.'
            return false
        }
    }

    const userAvatarClick = () => {
        notification.value = 'User profile clicked.'
    }

    const clearNotification = () => {
        notification.value = ''
    }

    const clearError = () => {
        error.value = ''
    }

    // Helper functions
    const sortPosts = (postsToSort, sortType) => {
        const sorted = [...postsToSort]
        switch (sortType) {
            case 'newest':
                return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            case 'oldest':
                return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            case 'most-liked':
                return sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0))
            case 'most-viewed':
                return sorted.sort((a, b) => (b.views || 0) - (a.views || 0))
            case 'most-commented':
                return sorted.sort((a, b) => (b.comments || 0) - (a.comments || 0))
            default:
                return sorted
        }
    }

    // Watch for changes to automatically clear notifications after 3 seconds
    watch(notification, (newVal) => {
        if (newVal) {
            setTimeout(() => {
                if (notification.value === newVal) {
                    clearNotification()
                }
            }, 3000)
        }
    })

    watch(error, (newVal) => {
        if (newVal) {
            setTimeout(() => {
                if (error.value === newVal) {
                    clearError()
                }
            }, 5000)
        }
    })

    return {
        posts,
        comments,
        likes,
        savedPosts,
        drafts,
        currentView,
        currentCategory,
        currentPost,
        editingPost,
        filteredPosts,
        featuredPosts,
        trendingPosts,
        userPosts,
        userDrafts,
        categories,
        postComments,
        isLiked,
        isSaved,
        postLikeCount,
        newComment,
        loading,
        error,
        notification,
        searchQuery,
        sortBy,
        fetchPosts,
        setCategory,
        setSortBy,
        setSearchQuery,
        showHomeView,
        showProfileView,
        viewPost,
        writePost,
        editPost,
        deletePost,
        savePost,
        approvePost,
        rejectPost,
        toggleLike,
        toggleSave,
        addComment,
        editComment,
        deleteComment,
        sharePost,
        startWriting,
        userAvatarClick,
        clearNotification,
        clearError
    }
}