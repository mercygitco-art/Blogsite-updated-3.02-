import { ref, computed, watch } from 'vue'
import { likesAPI, savedPostsAPI, reactionsAPI } from '../api/index.js'

export function usePostReactions({ posts, currentUser, currentPost, error, notification }) {
    const likes = ref([])
    const savedPosts = ref([])

    const hydrateUserPostState = async (user) => {
        likes.value = []
        savedPosts.value = []
        if (!user || !posts.value.length) return

        const state = await reactionsAPI.getMine()
        likes.value = (state.likedPostIds || []).map(postId => ({ postId, userId: user.id }))
        savedPosts.value = (state.savedPostIds || []).map(postId => ({ postId, userId: user.id }))
    }

    watch([posts, currentUser], async ([postList, user]) => {
        if (postList.length && user) {
            try {
                await hydrateUserPostState(user)
            } catch {
                error.value = 'Unable to load your saved and liked posts.'
            }
        }
    }, { deep: false })

    const isLiked = (postId) => {
        if (!currentUser.value || !postId) return false
        return likes.value.some(like => like.postId === postId && like.userId === currentUser.value.id)
    }

    const isSaved = (postId) => {
        if (!currentUser.value || !postId) return false
        return savedPosts.value.some(saved => saved.postId === postId && saved.userId === currentUser.value.id)
    }

    const postLikeCount = computed(() => {
        if (!currentPost.value) return 0
        return likes.value.filter(like => like.postId === currentPost.value.id).length
    })

    const toggleLike = async (postId) => {
        if (!currentUser.value) {
            error.value = 'You must be logged in to like posts.'
            return
        }
        const likeIndex = likes.value.findIndex(like => like.postId === postId && like.userId === currentUser.value.id)
        try {
            if (likeIndex !== -1) {
                await likesAPI.unlikePost(currentUser.value.id, postId)
                likes.value.splice(likeIndex, 1)
                const post = posts.value.find(p => p.id === postId)
                if (post && post.likes > 0) post.likes--
                notification.value = 'Like removed.'
            } else {
                const response = await likesAPI.togglePostLike(postId)
                likes.value.push({ ...(response.like || response), postId, userId: currentUser.value.id })
                const post = posts.value.find(p => p.id === postId)
                if (post) post.likes = (post.likes || 0) + 1
                notification.value = 'Post liked!'
            }
        } catch (apiError) {
            error.value = apiError.response?.data?.message || 'Unable to update the like.'
        }
    }

    const toggleSave = async (postId) => {
        if (!currentUser.value) {
            error.value = 'You must be logged in to save posts.'
            return
        }
        const saveIndex = savedPosts.value.findIndex(saved => saved.postId === postId && saved.userId === currentUser.value.id)
        try {
            if (saveIndex !== -1) {
                await savedPostsAPI.unsavePost(currentUser.value.id, postId)
                savedPosts.value.splice(saveIndex, 1)
                notification.value = 'Post removed from saved.'
            } else {
                const response = await savedPostsAPI.savePost(postId)
                savedPosts.value.push({ ...(response.savedPost || response), postId, userId: currentUser.value.id })
                notification.value = 'Post saved to favorites!'
            }
        } catch (apiError) {
            error.value = apiError.response?.data?.message || 'Unable to update saved posts.'
        }
    }

    return {
        likes,
        savedPosts,
        isLiked,
        isSaved,
        postLikeCount,
        toggleLike,
        toggleSave
    }
}
