<template>
    <div 
        class="comment-item" 
        :class="{ 
            highlighted: comment.highlighted, 
            collapsed: isCollapsed,
            'loading-state': loadingState,
            'deleted': comment.deleted,
            'pinned': comment.pinned,
            'popular': isPopular,
            'controversial': isControversial,
            'owner-reply': isOwnerReply,
            'has-mentions': hasMentions
        }"
        :id="`comment-${comment.id}`"
        :data-comment-id="comment.id"
        :aria-label="`Comment by ${comment.author}${comment.pinned ? ' - Pinned' : ''}`"
        :style="commentStyle"
    >
        <div class="comment-main">
            <!-- Enhanced loading skeleton -->
            <div v-if="loadingState" class="comment-skeleton">
                <div class="skeleton-header">
                    <div class="skeleton-avatar"></div>
                    <div class="skeleton-author">
                        <div class="skeleton-line short"></div>
                        <div class="skeleton-line shorter"></div>
                    </div>
                    <div class="skeleton-actions"></div>
                </div>
                <div class="skeleton-content">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line medium"></div>
                </div>
                <div class="skeleton-actions-bar">
                    <div class="skeleton-action"></div>
                    <div class="skeleton-action"></div>
                    <div class="skeleton-action"></div>
                </div>
            </div>

            <!-- Actual comment content -->
            <template v-else>
                <!-- Enhanced comment header with reputation -->
                <div class="comment-header">
                    <div class="comment-author">
                        <div class="author-avatar-container">
                            <div 
                                class="author-avatar" 
                                :style="avatarStyle"
                                :class="{ 'verified': comment.verified, 'moderator': isModerator }"
                                @click="viewUserProfile"
                            >
                                {{ comment.author?.charAt(0)?.toUpperCase() || '?' }}
                                <div v-if="comment.verified" class="verified-badge" title="Verified User">
                                    <i class="fas fa-check"></i>
                                </div>
                                <div v-if="isModerator" class="moderator-badge" title="Moderator">
                                    <i class="fas fa-shield-alt"></i>
                                </div>
                            </div>
                            <div class="online-indicator" v-if="comment.isOnline"></div>
                        </div>
                        <div class="author-info">
                            <div class="author-main">
                                <span class="author-name">{{ comment.author || 'Anonymous' }}</span>
                                <div class="author-badges">
                                    <span v-if="isOwner" class="you-badge">You</span>
                                    <span v-if="comment.isOP" class="op-badge">OP</span>
                                    <span class="reputation-score" :title="`Reputation: ${comment.reputation || 0}`">
                                        <i class="fas fa-star"></i> {{ comment.reputation || 0 }}
                                    </span>
                                </div>
                            </div>
                            <div class="comment-meta">
                                <span class="comment-date">{{ formatDate(comment.date) }}</span>
                                <span v-if="comment.edited" class="edited-badge" :title="`Edited ${formatExactDate(comment.editedAt)}`">
                                    (edited)
                                </span>
                                <span v-if="comment.pinned" class="pinned-badge" title="Pinned comment">
                                    <i class="fas fa-thumbtack"></i> Pinned
                                </span>
                                <span v-if="isPopular" class="popular-badge" title="Popular comment">
                                    <i class="fas fa-fire"></i> Popular
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="comment-actions">
                        <button 
                            v-if="isOwner && !comment.deleted"
                            @click="handleEdit"
                            class="btn-action"
                            :aria-label="`Edit comment by ${comment.author}`"
                            title="Edit comment"
                            :disabled="actionInProgress"
                        >
                            <i class="fas fa-edit"></i>
                        </button>
                        <button 
                            v-if="(isOwner || isModerator) && !comment.deleted"
                            @click="confirmDelete"
                            class="btn-action btn-danger"
                            :aria-label="`Delete comment by ${comment.author}`"
                            title="Delete comment"
                            :disabled="actionInProgress"
                        >
                            <i class="fas fa-trash"></i>
                        </button>
                        <button 
                            v-if="isModerator && !comment.pinned"
                            @click="togglePin"
                            class="btn-action"
                            :aria-label="`Pin comment by ${comment.author}`"
                            title="Pin comment"
                            :disabled="actionInProgress"
                        >
                            <i class="fas fa-thumbtack"></i>
                        </button>
                        <button 
                            v-if="isModerator && comment.pinned"
                            @click="togglePin"
                            class="btn-action"
                            :aria-label="`Unpin comment by ${comment.author}`"
                            title="Unpin comment"
                            :disabled="actionInProgress"
                        >
                            <i class="fas fa-thumbtack-slash"></i>
                        </button>
                        <button 
                            @click="toggleOptions"
                            class="btn-action"
                            :aria-label="`More options for comment by ${comment.author}`"
                            title="More options"
                            :aria-expanded="showOptions"
                            :disabled="actionInProgress"
                        >
                            <i class="fas fa-ellipsis-h"></i>
                        </button>
                    </div>
                </div>

                <!-- Enhanced comment content with rich features -->
                <div 
                    v-if="!comment.deleted"
                    class="comment-content" 
                    :class="{ 
                        'collapsed-content': isCollapsed,
                        'edited': comment.edited,
                        'has-code': hasCodeBlocks,
                        'has-images': hasImages
                    }"
                >
                    <div 
                        v-if="!isEditing"
                        class="content-display"
                        v-html="renderedContent"
                        :aria-live="comment.highlighted ? 'polite' : 'off'"
                        ref="contentDisplay"
                    ></div>
                    
                    <!-- Enhanced edit form -->
                    <div v-else class="edit-form">
                        <div class="edit-toolbar">
                            <button @click="insertFormatting('bold')" class="toolbar-btn" title="Bold">
                                <i class="fas fa-bold"></i>
                            </button>
                            <button @click="insertFormatting('italic')" class="toolbar-btn" title="Italic">
                                <i class="fas fa-italic"></i>
                            </button>
                            <button @click="insertFormatting('code')" class="toolbar-btn" title="Code">
                                <i class="fas fa-code"></i>
                            </button>
                            <button @click="insertFormatting('link')" class="toolbar-btn" title="Insert Link">
                                <i class="fas fa-link"></i>
                            </button>
                            <button @click="insertFormatting('mention')" class="toolbar-btn" title="Mention User">
                                <i class="fas fa-at"></i>
                            </button>
                        </div>
                        <textarea
                            ref="editTextarea"
                            v-model="editContent"
                            class="edit-textarea"
                            :placeholder="`Edit your comment...`"
                            rows="4"
                            maxlength="2000"
                            @keydown.esc="cancelEdit"
                            @keydown.ctrl.enter="saveEdit"
                            @input="handleEditInput"
                        ></textarea>
                        <div class="edit-actions">
                            <div class="edit-info">
                                <span class="char-count" :class="{ warning: editContent.length > 1800 }">
                                    {{ editContent.length }}/2000
                                </span>
                                <span v-if="editLastSaved" class="last-saved">
                                    Last saved: {{ editLastSaved }}
                                </span>
                            </div>
                            <div class="edit-buttons">
                                <button 
                                    @click="cancelEdit"
                                    class="btn-secondary"
                                    :disabled="editSaving"
                                >
                                    Cancel
                                </button>
                                <button 
                                    @click="saveEdit"
                                    class="btn-primary"
                                    :disabled="!editContent.trim() || editSaving"
                                >
                                    <i class="fas" :class="editSaving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                                    {{ editSaving ? 'Saving...' : 'Save' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Enhanced deleted comment placeholder -->
                <div v-else class="deleted-comment">
                    <div class="deleted-content">
                        <i class="fas fa-trash"></i>
                        <span>This comment has been deleted</span>
                        <span class="deletion-reason" v-if="comment.deletionReason">
                            Reason: {{ comment.deletionReason }}
                        </span>
                    </div>
                </div>

                <!-- Enhanced comment actions with more features -->
                <div v-if="!comment.deleted" class="comment-actions-bar">
                    <div class="vote-section">
                        <div class="vote-buttons">
                            <button 
                                @click="handleVote('upvote')"
                                class="vote-btn upvote"
                                :class="{ 
                                    active: userVote === 'upvote',
                                    disabled: !currentUser,
                                    animating: voteAnimating === 'upvote'
                                }"
                                :disabled="votingInProgress || !currentUser"
                                :aria-label="currentUser ? `Upvote comment by ${comment.author}. Current upvotes: ${comment.likes || 0}` : 'Please login to vote'"
                                :title="currentUser ? 'Upvote' : 'Please login to vote'"
                            >
                                <i class="fas fa-chevron-up"></i>
                                <span class="vote-count">{{ formatCount(comment.likes) }}</span>
                            </button>
                            <div class="vote-ratio" :title="`Upvote ratio: ${voteRatio}%`">
                                <div class="ratio-bar" :style="{ width: `${voteRatio}%` }"></div>
                            </div>
                            <button 
                                @click="handleVote('downvote')"
                                class="vote-btn downvote"
                                :class="{ 
                                    active: userVote === 'downvote',
                                    disabled: !currentUser,
                                    animating: voteAnimating === 'downvote'
                                }"
                                :disabled="votingInProgress || !currentUser"
                                :aria-label="currentUser ? `Downvote comment by ${comment.author}. Current downvotes: ${comment.dislikes || 0}` : 'Please login to vote'"
                                :title="currentUser ? 'Downvote' : 'Please login to vote'"
                            >
                                <i class="fas fa-chevron-down"></i>
                                <span class="vote-count">{{ formatCount(comment.dislikes) }}</span>
                            </button>
                        </div>
                        <div class="vote-stats" v-if="showVoteStats">
                            <span class="stat">{{ formatCount(comment.likes) }} upvotes</span>
                            <span class="stat">{{ formatCount(comment.dislikes) }} downvotes</span>
                            <span class="stat">{{ voteRatio }}% ratio</span>
                        </div>
                    </div>

                    <button 
                        v-if="!isEditing"
                        @click="handleReply"
                        class="btn-action reply-btn"
                        :class="{ active: isReplying }"
                        :aria-label="`Reply to comment by ${comment.author}`"
                        :disabled="!currentUser"
                        :title="currentUser ? 'Reply' : 'Please login to reply'"
                    >
                        <i class="fas fa-reply"></i> 
                        <span class="btn-text">Reply</span>
                        <span class="reply-count" v-if="comment.replyCount">
                            {{ comment.replyCount }}
                        </span>
                    </button>

                    <div class="reactions-section">
                        <div class="reactions">
                            <button 
                                v-for="reaction in quickReactions" 
                                :key="reaction.emoji"
                                @click="handleReaction(reaction.type)"
                                class="reaction-btn"
                                :class="{ 
                                    active: userReactions.includes(reaction.type),
                                    disabled: !currentUser,
                                    popular: isReactionPopular(reaction.type)
                                }"
                                :title="currentUser ? reaction.label : 'Please login to react'"
                                :aria-label="currentUser ? `Add ${reaction.label} reaction to comment by ${comment.author}` : 'Please login to react'"
                                :disabled="!currentUser"
                            >
                                <span class="reaction-emoji">{{ reaction.emoji }}</span>
                                <span class="reaction-count" v-if="comment.reactions?.[reaction.type]">
                                    {{ formatCount(comment.reactions[reaction.type]) }}
                                </span>
                            </button>
                            
                            <!-- Enhanced reaction picker -->
                            <div class="reaction-picker-container">
                                <button 
                                    class="reaction-picker-btn"
                                    @click="toggleReactionPicker"
                                    :aria-label="currentUser ? 'Show more reaction options' : 'Please login to react'"
                                    :title="currentUser ? 'More reactions' : 'Please login to react'"
                                    :disabled="!currentUser"
                                >
                                    <i class="fas fa-smile"></i>
                                    <span class="reaction-plus">+</span>
                                </button>
                                
                                <transition name="reaction-picker">
                                    <div v-if="showReactionPicker" class="reaction-picker" v-click-outside="closeReactionPicker">
                                        <div class="reaction-picker-header">
                                            <span>Add Reaction</span>
                                            <button @click="closeReactionPicker" class="close-picker">
                                                <i class="fas fa-times"></i>
                                            </button>
                                        </div>
                                        <div class="reaction-grid">
                                            <button
                                                v-for="reaction in allReactions"
                                                :key="reaction.emoji"
                                                @click="handleReaction(reaction.type)"
                                                class="reaction-option"
                                                :class="{ active: userReactions.includes(reaction.type) }"
                                                :title="reaction.label"
                                                :aria-label="`Add ${reaction.label} reaction`"
                                            >
                                                {{ reaction.emoji }}
                                            </button>
                                        </div>
                                    </div>
                                </transition>
                            </div>
                        </div>
                        
                        <!-- Reaction summary tooltip -->
                        <div class="reactions-summary" v-if="hasReactions" @mouseenter="showReactionSummary = true" @mouseleave="showReactionSummary = false">
                            <div class="summary-preview">
                                <span v-for="reaction in topReactions" :key="reaction.type" class="summary-reaction">
                                    {{ getReactionEmoji(reaction.type) }} {{ reaction.count }}
                                </span>
                                <span v-if="totalReactions > 3" class="summary-more">
                                    +{{ totalReactions - 3 }}
                                </span>
                            </div>
                            
                            <transition name="tooltip">
                                <div v-if="showReactionSummary" class="reaction-tooltip">
                                    <div class="tooltip-header">Reactions</div>
                                    <div class="tooltip-reactions">
                                        <div v-for="reaction in allReactionsWithCounts" :key="reaction.type" class="tooltip-reaction">
                                            <span class="reaction-emoji">{{ reaction.emoji }}</span>
                                            <span class="reaction-label">{{ reaction.label }}</span>
                                            <span class="reaction-count">{{ reaction.count }}</span>
                                        </div>
                                    </div>
                                </div>
                            </transition>
                        </div>
                    </div>

                    <div class="additional-actions">
                        <button 
                            @click="toggleSave"
                            class="btn-action save-btn"
                            :class="{ active: isSaved }"
                            :title="isSaved ? 'Unsave comment' : 'Save comment'"
                        >
                            <i class="fas" :class="isSaved ? 'fa-bookmark' : 'fa-bookmark-o'"></i>
                        </button>
                        
                        <button 
                            @click="toggleCollapse"
                            class="btn-action collapse-btn"
                            :title="isCollapsed ? 'Expand comment' : 'Collapse comment'"
                        >
                            <i class="fas" :class="isCollapsed ? 'fa-plus' : 'fa-minus'"></i>
                        </button>
                    </div>
                </div>

                <!-- Enhanced options dropdown -->
                <transition name="dropdown">
                    <div v-if="showOptions" class="options-dropdown" v-click-outside="closeOptions">
                        <div class="dropdown-section">
                            <h4>Comment Actions</h4>
                            <button class="dropdown-item" @click="copyLink">
                                <i class="fas fa-link"></i> Copy Link
                            </button>
                            <button v-if="navigator.share" class="dropdown-item" @click="shareComment">
                                <i class="fas fa-share"></i> Share
                            </button>
                            <button class="dropdown-item" @click="toggleSave">
                                <i class="fas" :class="isSaved ? 'fa-bookmark' : 'fa-bookmark-o'"></i>
                                {{ isSaved ? 'Unsave' : 'Save' }}
                            </button>
                        </div>
                        
                        <div class="dropdown-section" v-if="currentUser && !isOwner">
                            <h4>User Actions</h4>
                            <button class="dropdown-item" @click="reportComment">
                                <i class="fas fa-flag"></i> Report
                            </button>
                            <button class="dropdown-item" @click="blockUser">
                                <i class="fas fa-ban"></i> Block User
                            </button>
                        </div>
                        
                        <div class="dropdown-section" v-if="isModerator">
                            <h4>Moderator Tools</h4>
                            <button class="dropdown-item moderator-action" @click="togglePin">
                                <i class="fas" :class="comment.pinned ? 'fa-thumbtack-slash' : 'fa-thumbtack'"></i>
                                {{ comment.pinned ? 'Unpin' : 'Pin' }}
                            </button>
                            <button class="dropdown-item moderator-action" @click="toggleLock">
                                <i class="fas" :class="comment.locked ? 'fa-unlock' : 'fa-lock'"></i>
                                {{ comment.locked ? 'Unlock' : 'Lock' }}
                            </button>
                            <button class="dropdown-item moderator-action" @click="viewModLog">
                                <i class="fas fa-history"></i> Mod Log
                            </button>
                        </div>
                    </div>
                </transition>
            </template>
        </div>

        <!-- Enhanced nested replies with improved UX -->
        <transition name="slide">
            <div v-if="comment.replies?.length && !isCollapsed && !comment.deleted" class="comment-replies">
                <div class="replies-header">
                    <div class="replies-count">
                        <i class="fas fa-comments"></i>
                        {{ comment.replies.length }} {{ comment.replies.length === 1 ? 'reply' : 'replies' }}
                    </div>
                    <div class="replies-actions">
                        <button 
                            v-if="comment.replies.length > 2"
                            @click="toggleAllReplies"
                            class="btn-action"
                        >
                            {{ showAllReplies ? 'Show less' : `Show all ${comment.replies.length} replies` }}
                        </button>
                        <button 
                            @click="sortRepliesBy = sortRepliesBy === 'newest' ? 'oldest' : 'newest'"
                            class="btn-action"
                        >
                            Sort: {{ sortRepliesBy === 'newest' ? 'Newest' : 'Oldest' }}
                        </button>
                    </div>
                </div>
                
                <div class="replies-list">
                    <comment-item
                        v-for="reply in sortedReplies"
                        :key="reply.id"
                        :comment="reply"
                        :current-user="currentUser"
                        @reply="$emit('reply', $event)"
                        @edit="$emit('edit', $event)"
                        @delete="$emit('delete', $event)"
                        @react="$emit('react', $event)"
                        @vote="$emit('vote', $event)"
                        @pin="$emit('pin', $event)"
                    />
                </div>
                
                <div v-if="!showAllReplies && comment.replies.length > 2" class="replies-footer">
                    <button class="show-more-replies" @click="showAllReplies = true">
                        <i class="fas fa-chevron-down"></i>
                        Show {{ comment.replies.length - 2 }} more {{ comment.replies.length - 2 === 1 ? 'reply' : 'replies' }}
                    </button>
                </div>
            </div>
        </transition>
        
        <!-- Enhanced confirmation modal -->
        <transition name="modal">
            <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
                <div class="modal-content" role="dialog" aria-labelledby="delete-modal-title">
                    <div class="modal-header">
                        <h3 id="delete-modal-title">
                            <i class="fas fa-exclamation-triangle"></i>
                            Delete Comment
                        </h3>
                        <button @click="showDeleteModal = false" class="modal-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure you want to delete this comment? This action cannot be undone.</p>
                        <div v-if="isModerator && !isOwner" class="mod-deletion-options">
                            <label>
                                <input type="checkbox" v-model="sendModNotification">
                                Send moderation notification
                            </label>
                            <div class="deletion-reason-input" v-if="sendModNotification">
                                <label>Reason for deletion:</label>
                                <select v-model="deletionReason">
                                    <option value="">Select a reason</option>
                                    <option value="spam">Spam</option>
                                    <option value="harassment">Harassment</option>
                                    <option value="hate_speech">Hate Speech</option>
                                    <option value="misinformation">Misinformation</option>
                                    <option value="other">Other</option>
                                </select>
                                <input 
                                    v-if="deletionReason === 'other'" 
                                    v-model="customDeletionReason" 
                                    placeholder="Specify reason..."
                                    class="custom-reason-input"
                                >
                            </div>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="btn-secondary" @click="showDeleteModal = false" :disabled="actionInProgress">
                            Cancel
                        </button>
                        <button class="btn-danger" @click="confirmDeleteAction" :disabled="actionInProgress">
                            <i class="fas" :class="actionInProgress ? 'fa-spinner fa-spin' : 'fa-trash'"></i>
                            {{ actionInProgress ? 'Deleting...' : 'Delete' }}
                        </button>
                    </div>
                </div>
            </div>
        </transition>
        
        <!-- Enhanced toast notification -->
        <transition name="toast">
            <div v-if="toast.show" class="toast" :class="toast.type" role="alert" aria-live="polite">
                <div class="toast-content">
                    <i class="fas" :class="toast.icon"></i>
                    <span>{{ toast.message }}</span>
                </div>
                <button class="toast-close" @click="toast.show = false" aria-label="Close notification">
                    <i class="fas fa-times"></i>
                </button>
                <div class="toast-progress" :style="{ width: `${toast.progress}%` }"></div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue'

const props = defineProps({
    comment: {
        type: Object,
        required: true,
        validator: (value) => {
            return value && typeof value.id !== 'undefined'
        }
    },
    currentUser: {
        type: String,
        default: ''
    },
    loading: {
        type: Boolean,
        default: false
    },
    depth: {
        type: Number,
        default: 0
    }
})

const emit = defineEmits(['reply', 'edit', 'delete', 'react', 'vote', 'pin', 'lock', 'block-user'])

// Enhanced reactive state
const showOptions = ref(false)
const isCollapsed = ref(false)
const showReactionPicker = ref(false)
const showDeleteModal = ref(false)
const showReactionSummary = ref(false)
const votingInProgress = ref(false)
const voteAnimating = ref(null)
const showAllReplies = ref(false)
const isSaved = ref(false)
const actionInProgress = ref(false)
const isEditing = ref(false)
const isReplying = ref(false)
const editContent = ref('')
const editSaving = ref(false)
const editLastSaved = ref(null)
const loadingState = ref(props.loading)
const sortRepliesBy = ref('newest')
const sendModNotification = ref(true)
const deletionReason = ref('')
const customDeletionReason = ref('')

// Enhanced toast notification
const toast = ref({
    show: false,
    message: '',
    type: 'success',
    icon: 'fa-check',
    progress: 100
})

// Enhanced reactions configuration
const quickReactions = [
    { type: 'like', emoji: '👍', label: 'Like' },
    { type: 'love', emoji: '❤️', label: 'Love' },
    { type: 'laugh', emoji: '😂', label: 'Laugh' },
    { type: 'insightful', emoji: '💡', label: 'Insightful' }
]

const additionalReactions = [
    { type: 'sad', emoji: '😢', label: 'Sad' },
    { type: 'angry', emoji: '😠', label: 'Angry' },
    { type: 'surprised', emoji: '😮', label: 'Surprised' },
    { type: 'celebrate', emoji: '🎉', label: 'Celebrate' },
    { type: 'question', emoji: '❓', label: 'Question' },
    { type: 'agree', emoji: '✅', label: 'Agree' },
    { type: 'disagree', emoji: '❌', label: 'Disagree' },
    { type: 'interesting', emoji: '🤔', label: 'Interesting' }
]

const allReactions = computed(() => [...quickReactions, ...additionalReactions])

// Enhanced computed properties
const isOwner = computed(() => props.comment.author === props.currentUser)
const isModerator = computed(() => {
    // Enhanced moderator check logic
    return props.currentUser === 'admin' || props.comment.moderators?.includes(props.currentUser)
})

const isPopular = computed(() => {
    return (props.comment.likes || 0) > 50
})

const isControversial = computed(() => {
    const likes = props.comment.likes || 0
    const dislikes = props.comment.dislikes || 0
    return likes > 10 && dislikes > 10 && Math.abs(likes - dislikes) < (likes + dislikes) * 0.3
})

const isOwnerReply = computed(() => {
    return props.comment.isOP || false
})

const hasMentions = computed(() => {
    return props.comment.content?.includes('@') || false
})

const hasCodeBlocks = computed(() => {
    return props.comment.content?.includes('```') || props.comment.content?.includes('`')
})

const hasImages = computed(() => {
    return props.comment.content?.includes('![') || false
})

const userVote = computed(() => {
    // Enhanced user vote tracking
    return props.comment.userVote || null
})

const userReactions = computed(() => {
    // Enhanced user reactions tracking
    return props.comment.userReactions || []
})

const voteRatio = computed(() => {
    const likes = props.comment.likes || 0
    const dislikes = props.comment.dislikes || 0
    const total = likes + dislikes
    return total > 0 ? Math.round((likes / total) * 100) : 0
})

const showVoteStats = computed(() => {
    return (props.comment.likes || 0) + (props.comment.dislikes || 0) > 10
})

const hasReactions = computed(() => {
    if (!props.comment.reactions) return false
    return Object.values(props.comment.reactions).some(count => count > 0)
})

const topReactions = computed(() => {
    if (!props.comment.reactions) return []
    return Object.entries(props.comment.reactions)
        .filter(([_, count]) => count > 0)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([type, count]) => ({ type, count }))
})

const totalReactions = computed(() => {
    if (!props.comment.reactions) return 0
    return Object.values(props.comment.reactions).reduce((sum, count) => sum + count, 0)
})

const allReactionsWithCounts = computed(() => {
    return allReactions.value.map(reaction => ({
        ...reaction,
        count: props.comment.reactions?.[reaction.type] || 0
    })).filter(reaction => reaction.count > 0)
})

const commentStyle = computed(() => {
    const styles = {}
    if (props.depth > 0) {
        styles.marginLeft = `${Math.min(props.depth * 2, 8)}rem`
    }
    if (props.comment.highlighted) {
        styles.animation = 'highlightPulse 2s ease-in-out'
    }
    return styles
})

const sortedReplies = computed(() => {
    if (!props.comment.replies) return []
    const replies = [...props.comment.replies]
    if (sortRepliesBy.value === 'newest') {
        return replies.sort((a, b) => new Date(b.date) - new Date(a.date))
    } else {
        return replies.sort((a, b) => new Date(a.date) - new Date(b.date))
    }
})

const displayedReplies = computed(() => {
    if (showAllReplies.value || !props.comment.replies || props.comment.replies.length <= 2) {
        return sortedReplies.value
    }
    return sortedReplies.value.slice(0, 2)
})

// Enhanced content rendering with better security and features
const renderedContent = computed(() => {
    if (!props.comment.content) return ''
    
    let content = props.comment.content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
    
    // Enhanced markdown with better safety and features
    const markdownRules = [
        { pattern: /\*\*(.*?)\*\*/g, replacement: '<strong>$1</strong>' },
        { pattern: /\*(.*?)\*/g, replacement: '<em>$1</em>' },
        { pattern: /~~(.*?)~~/g, replacement: '<del>$1</del>' },
        { pattern: /`(.*?)`/g, replacement: '<code>$1</code>' },
        { pattern: /^> (.*$)/gim, replacement: '<blockquote>$1</blockquote>' },
        { pattern: /^# (.*$)/gim, replacement: '<h3>$1</h3>' },
        { pattern: /^## (.*$)/gim, replacement: '<h4>$1</h4>' }
    ]

    markdownRules.forEach(rule => {
        content = content.replace(rule.pattern, rule.replacement)
    })

    // Enhanced code block handling
    content = content.replace(
        /```(\w+)?\n([\s\S]*?)```/g,
        (match, language, code) => {
            return `<pre class="code-block"><code class="language-${language || 'text'}">${code.trim()}</code></pre>`
        }
    )

    // Safe link handling with enhanced features
    content = content.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g, 
        (match, text, url) => {
            try {
                const parsedUrl = new URL(url)
                if (['http:', 'https:'].includes(parsedUrl.protocol)) {
                    return `<a href="${url}" target="_blank" rel="noopener noreferrer nofollow" class="external-link">${text}</a>`
                }
            } catch {
                // Invalid URL, don't convert to link
            }
            return text
        }
    )
    
    // Enhanced mention handling with user links
    content = content.replace(/@([\w\-\.]+)/g, '<a href="/user/$1" class="mention">@$1</a>')
    
    // Image handling
    content = content.replace(
        /!\[([^\]]*)\]\(([^)]+)\)/g,
        (match, alt, src) => {
            return `<img src="${src}" alt="${alt}" class="comment-image" loading="lazy">`
        }
    )
    
    // Preserve line breaks and paragraphs
    content = content.replace(/\n\n/g, '</p><p>')
    content = content.replace(/\n/g, '<br>')
    content = `<p>${content}</p>`
    
    return content
})

const avatarStyle = computed(() => {
    const name = props.comment.author || 'Anonymous'
    const hue = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0) % 360
    const saturation = isModerator.value ? '80%' : '70%'
    const lightness = isModerator.value ? '40%' : '45%'
    return {
        backgroundColor: `hsl(${hue}, ${saturation}, ${lightness})`,
        color: 'white',
        backgroundImage: props.comment.avatar ? `url(${props.comment.avatar})` : 'none'
    }
})

// Enhanced methods
function toggleOptions() {
    if (actionInProgress.value) return
    showOptions.value = !showOptions.value
    showReactionPicker.value = false
}

function closeOptions() {
    showOptions.value = false
}

function toggleReactionPicker() {
    if (actionInProgress.value || !props.currentUser) return
    showReactionPicker.value = !showReactionPicker.value
    showOptions.value = false
}

function closeReactionPicker() {
    showReactionPicker.value = false
}

function toggleCollapse() {
    isCollapsed.value = !isCollapsed.value
    closeOptions()
}

function toggleAllReplies() {
    showAllReplies.value = !showAllReplies.value
}

function toggleSave() {
    if (actionInProgress.value) return
    
    isSaved.value = !isSaved.value
    showToast(
        isSaved.value ? 'Comment saved to your bookmarks' : 'Comment removed from saved', 
        'success'
    )
    closeOptions()
}

function toggleLock() {
    emit('lock', {
        commentId: props.comment.id,
        locked: !props.comment.locked
    })
    showToast(
        props.comment.locked ? 'Comment unlocked' : 'Comment locked', 
        'success'
    )
    closeOptions()
}

async function copyLink() {
    try {
        const url = `${window.location.origin}${window.location.pathname}#comment-${props.comment.id}`
        await navigator.clipboard.writeText(url)
        showToast('Comment link copied to clipboard', 'success')
    } catch (error) {
        showToast('Failed to copy link', 'error')
        console.error('Failed to copy link:', error)
    }
    closeOptions()
}

async function shareComment() {
    try {
        await navigator.share({
            title: `Comment by ${props.comment.author}`,
            text: props.comment.content.substring(0, 100) + (props.comment.content.length > 100 ? '...' : ''),
            url: `${window.location.origin}${window.location.pathname}#comment-${props.comment.id}`
        })
        showToast('Comment shared successfully', 'success')
    } catch (error) {
        if (error.name !== 'AbortError') {
            await copyLink() // Fallback to copy link
        }
    }
    closeOptions()
}

function reportComment() {
    // Enhanced reporting with categories
    const reportData = {
        commentId: props.comment.id,
        reason: 'inappropriate',
        category: 'other'
    }
    emit('report', reportData)
    showToast('Comment reported to moderators. Thank you for your feedback.', 'info')
    closeOptions()
}

function blockUser() {
    if (!props.currentUser || isOwner.value) return
    
    emit('block-user', {
        userId: props.comment.authorId,
        username: props.comment.author
    })
    showToast(`You have blocked ${props.comment.author}`, 'info')
    closeOptions()
}

function viewUserProfile() {
    // Navigate to user profile
    if (props.comment.authorId) {
        window.open(`/user/${props.comment.authorId}`, '_blank')
    }
}

function viewModLog() {
    // View moderation history for this comment
    console.log('View mod log for comment:', props.comment.id)
    showToast('Opening moderation log...', 'info')
    closeOptions()
}

function handleVote(type) {
    if (votingInProgress.value || !props.currentUser) return
    
    votingInProgress.value = true
    voteAnimating.value = type
    
    emit('vote', { commentId: props.comment.id, type })
    
    // Enhanced animation timing
    setTimeout(() => {
        votingInProgress.value = false
        setTimeout(() => {
            voteAnimating.value = null
        }, 300)
    }, 600)
}

function handleReaction(type) {
    if (!props.currentUser) {
        showToast('Please login to add reactions', 'info')
        return
    }
    
    emit('react', { commentId: props.comment.id, reaction: type })
    closeReactionPicker()
    
    // Show feedback for the reaction
    const reaction = allReactions.value.find(r => r.type === type)
    if (reaction) {
        showToast(`Added ${reaction.label} reaction`, 'success', 2000)
    }
}

function isReactionPopular(type) {
    const count = props.comment.reactions?.[type] || 0
    return count > 5
}

function getReactionEmoji(type) {
    const reaction = allReactions.value.find(r => r.type === type)
    return reaction ? reaction.emoji : '❓'
}

function handleReply() {
    if (!props.currentUser) {
        showToast('Please login to reply to comments', 'info')
        return
    }
    isReplying.value = true
    emit('reply', props.comment)
    
    // Reset reply state after animation
    setTimeout(() => {
        isReplying.value = false
    }, 1000)
}

function handleEdit() {
    if (actionInProgress.value) return
    
    isEditing.value = true
    editContent.value = props.comment.content
    editLastSaved.value = null
    closeOptions()
    
    nextTick(() => {
        const textarea = document.querySelector('.edit-textarea')
        if (textarea) {
            textarea.focus()
            textarea.setSelectionRange(textarea.value.length, textarea.value.length)
        }
    })
}

function insertFormatting(type) {
    const textarea = document.querySelector('.edit-textarea')
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = editContent.value.substring(start, end)
    
    let formattedText = ''
    let newCursorPos = 0
    
    switch (type) {
        case 'bold':
            formattedText = `**${selectedText}**`
            newCursorPos = start + 2 + selectedText.length
            break
        case 'italic':
            formattedText = `*${selectedText}*`
            newCursorPos = start + 1 + selectedText.length
            break
        case 'code':
            formattedText = selectedText.includes('\n') ? `\`\`\`\n${selectedText}\n\`\`\`` : `\`${selectedText}\``
            newCursorPos = start + (selectedText.includes('\n') ? 4 : 1) + selectedText.length
            break
        case 'link':
            formattedText = `[${selectedText || 'link text'}](https://)`
            newCursorPos = start + (selectedText ? selectedText.length + 3 : 11)
            break
        case 'mention':
            formattedText = `@${selectedText || 'username'}`
            newCursorPos = start + (selectedText ? selectedText.length + 1 : 9)
            break
    }
    
    // Update content and cursor position
    editContent.value = editContent.value.substring(0, start) + formattedText + editContent.value.substring(end)
    
    nextTick(() => {
        textarea.focus()
        textarea.setSelectionRange(newCursorPos, newCursorPos)
    })
}

function handleEditInput() {
    // Auto-save draft after 2 seconds of inactivity
    clearTimeout(window.editTimeout)
    window.editTimeout = setTimeout(() => {
        if (editContent.value.trim() && editContent.value !== props.comment.content) {
            localStorage.setItem(`comment-draft-${props.comment.id}`, editContent.value)
            editLastSaved.value = 'just now'
        }
    }, 2000)
}

async function saveEdit() {
    if (!editContent.value.trim() || editSaving.value) return
    
    editSaving.value = true
    actionInProgress.value = true
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        emit('edit', {
            commentId: props.comment.id,
            content: editContent.value.trim()
        })
        
        // Clear draft
        localStorage.removeItem(`comment-draft-${props.comment.id}`)
        
        showToast('Comment updated successfully', 'success')
        isEditing.value = false
    } catch (error) {
        showToast('Failed to update comment. Please try again.', 'error')
        console.error('Edit error:', error)
    } finally {
        editSaving.value = false
        actionInProgress.value = false
    }
}

function cancelEdit() {
    const draft = localStorage.getItem(`comment-draft-${props.comment.id}`)
    if (draft && draft !== props.comment.content) {
        if (confirm('You have unsaved changes. Are you sure you want to discard them?')) {
            isEditing.value = false
            editContent.value = ''
            localStorage.removeItem(`comment-draft-${props.comment.id}`)
        }
    } else {
        isEditing.value = false
        editContent.value = ''
    }
}

function confirmDelete() {
    showDeleteModal.value = true
    closeOptions()
}

async function confirmDeleteAction() {
    actionInProgress.value = true
    
    const deleteData = {
        commentId: props.comment.id
    }
    
    if (isModerator.value && !isOwner.value && sendModNotification.value) {
        deleteData.moderation = {
            notifyUser: sendModNotification.value,
            reason: deletionReason.value === 'other' ? customDeletionReason.value : deletionReason.value
        }
    }
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        emit('delete', deleteData)
        showDeleteModal.value = false
        showToast('Comment deleted successfully', 'success')
    } catch (error) {
        showToast('Failed to delete comment. Please try again.', 'error')
        console.error('Delete error:', error)
    } finally {
        actionInProgress.value = false
    }
}

function togglePin() {
    emit('pin', {
        commentId: props.comment.id,
        pinned: !props.comment.pinned
    })
    showToast(
        props.comment.pinned ? 'Comment unpinned' : 'Comment pinned to top', 
        'success'
    )
    closeOptions()
}

function showToast(message, type = 'success', duration = 4000) {
    toast.value = {
        show: true,
        message,
        type,
        icon: type === 'success' ? 'fa-check' : 
              type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle',
        progress: 100
    }
    
    // Animate progress bar
    const interval = setInterval(() => {
        if (toast.value.progress > 0) {
            toast.value.progress -= 100 / (duration / 100)
        }
    }, 100)
    
    setTimeout(() => {
        clearInterval(interval)
        toast.value.show = false
    }, duration)
}

function formatDate(dateStr) {
    if (!dateStr) return 'Unknown date'
    
    try {
        const date = new Date(dateStr)
        const now = new Date()
        const diff = now - date
        
        if (diff < 60000) return 'just now'
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
        return 'Invalid date'
    }
}

function formatExactDate(dateStr) {
    if (!dateStr) return 'Unknown date'
    
    try {
        const date = new Date(dateStr)
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    } catch {
        return 'Invalid date'
    }
}

function formatCount(count) {
    if (!count && count !== 0) return '0'
    if (count < 1000) return count.toString()
    if (count < 1000000) return (count / 1000).toFixed(1) + 'k'
    return (count / 1000000).toFixed(1) + 'm'
}

// Auto-collapse very long threads and load drafts
onMounted(() => {
    if (props.depth > 3) {
        isCollapsed.value = true
    }
    
    // Load draft if exists
    const draft = localStorage.getItem(`comment-draft-${props.comment.id}`)
    if (draft) {
        editContent.value = draft
        editLastSaved.value = 'draft'
    }
})

// Watch for loading state changes
watch(() => props.loading, (newVal) => {
    loadingState.value = newVal
})

// Watch for comment changes to update UI
watch(() => props.comment, (newComment) => {
    if (newComment.highlighted) {
        // Scroll to highlighted comment
        nextTick(() => {
            const element = document.getElementById(`comment-${newComment.id}`)
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        })
    }
}, { deep: true })
</script>

<style scoped>
/* Enhanced base styles */
.comment-item {
    margin-bottom: 1.5rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
}

.comment-item:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 1.5rem;
}

.comment-item.highlighted {
    background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%);
    border-radius: 12px;
    padding: 1.25rem;
    margin: 0.75rem 0;
    border-left: 4px solid #ffd700;
    animation: highlightPulse 2s ease-in-out;
}

.comment-item.pinned {
    background: linear-gradient(135deg, #f0f8ff 0%, #e3f2fd 100%);
    border-left: 4px solid #2196f3;
}

.comment-item.popular {
    border-left: 4px solid #ff6b35;
}

.comment-item.controversial {
    border-left: 4px solid #ffa726;
}

.comment-item.owner-reply {
    border-left: 4px solid #4caf50;
}

.comment-item.has-mentions {
    background: #f8f9fa;
}

.comment-main {
    background: #fff;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    position: relative;
    transition: all 0.3s ease;
    border: 1px solid #f5f5f5;
}

.comment-main:hover {
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    border-color: #e0e0e0;
}

.comment-replies {
    margin-left: 3rem;
    padding-left: 1.5rem;
    border-left: 3px solid #f0f0f0;
    margin-top: 1.5rem;
    transition: all 0.3s ease;
}

.replies-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding: 0.75rem 1rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.replies-count {
    font-weight: 600;
    color: #495057;
    font-size: 0.9rem;
}

.replies-actions {
    display: flex;
    gap: 0.5rem;
}

.replies-footer {
    text-align: center;
    padding: 1rem;
}

.show-more-replies {
    background: none;
    border: 1px solid #e9ecef;
    color: #6c757d;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.9rem;
}

.show-more-replies:hover {
    background: #e9ecef;
    color: #495057;
}

.comment-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
}

.comment-author {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    flex: 1;
}

.author-avatar-container {
    position: relative;
    flex-shrink: 0;
}

.author-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.1rem;
    background-size: cover;
    background-position: center;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    border: 2px solid transparent;
}

.author-avatar:hover {
    transform: scale(1.1);
    border-color: #3498db;
}

.author-avatar.verified {
    border-color: #4caf50;
}

.author-avatar.moderator {
    border-color: #e74c3c;
}

.verified-badge,
.moderator-badge {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.6rem;
    border: 2px solid white;
}

.verified-badge {
    background: #4caf50;
    color: white;
}

.moderator-badge {
    background: #e74c3c;
    color: white;
}

.online-indicator {
    position: absolute;
    top: -2px;
    right: -2px;
    width: 12px;
    height: 12px;
    background: #4caf50;
    border-radius: 50%;
    border: 2px solid white;
    animation: pulse 2s infinite;
}

.author-info {
    flex: 1;
}

.author-main {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.25rem;
}

.author-name {
    font-weight: 700;
    color: #2c3e50;
    font-size: 1rem;
}

.author-badges {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.you-badge {
    background: #3498db;
    color: white;
    padding: 0.2rem 0.5rem;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 600;
}

.op-badge {
    background: #4caf50;
    color: white;
    padding: 0.2rem 0.5rem;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 600;
}

.reputation-score {
    background: #f8f9fa;
    color: #6c757d;
    padding: 0.2rem 0.5rem;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 600;
}

.comment-meta {
    font-size: 0.85rem;
    color: #6c757d;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.edited-badge {
    color: #6c757d;
    font-style: italic;
    font-size: 0.8rem;
}

.pinned-badge {
    color: #2196f3;
    font-weight: 600;
    font-size: 0.8rem;
}

.popular-badge {
    color: #ff6b35;
    font-weight: 600;
    font-size: 0.8rem;
}

.comment-actions {
    display: flex;
    gap: 0.25rem;
    flex-shrink: 0;
}

.btn-action {
    background: none;
    border: none;
    padding: 0.6rem;
    border-radius: 8px;
    cursor: pointer;
    color: #6c757d;
    transition: all 0.3s ease;
    font-size: 0.85rem;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-action:hover {
    background: #f8f9fa;
    color: #495057;
    transform: translateY(-1px);
}

.btn-action:active {
    transform: translateY(0);
}

.btn-action.btn-danger:hover {
    background: #f8d7da;
    color: #721c24;
}

.btn-action:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

.comment-content {
    color: #2c3e50;
    line-height: 1.7;
    margin-bottom: 1.25rem;
    word-wrap: break-word;
    transition: all 0.3s ease;
}

.comment-content :deep(strong) {
    color: #2c3e50;
    font-weight: 700;
}

.comment-content :deep(em) {
    color: #7f8c8d;
    font-style: italic;
}

.comment-content :deep(del) {
    color: #95a5a6;
    text-decoration: line-through;
}

.comment-content :deep(code) {
    background: #f8f9fa;
    color: #e74c3c;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-size: 0.9em;
    font-family: 'Courier New', monospace;
}

.comment-content :deep(.code-block) {
    background: #2c3e50;
    color: #ecf0f1;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    margin: 1rem 0;
    border-left: 4px solid #3498db;
}

.comment-content :deep(.code-block code) {
    background: none;
    color: inherit;
    padding: 0;
}

.comment-content :deep(a) {
    color: #3498db;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
}

.comment-content :deep(a:hover) {
    color: #2980b9;
    text-decoration: underline;
}

.comment-content :deep(.external-link)::after {
    content: "↗";
    font-size: 0.8em;
    margin-left: 0.2em;
    opacity: 0.7;
}

.comment-content :deep(.mention) {
    background: #e3f2fd;
    color: #1976d2;
    padding: 0.1rem 0.4rem;
    border-radius: 12px;
    font-weight: 600;
    text-decoration: none;
}

.comment-content :deep(.mention:hover) {
    background: #bbdefb;
    text-decoration: none;
}

.comment-content :deep(blockquote) {
    border-left: 4px solid #bdc3c7;
    margin: 1rem 0;
    padding-left: 1.5rem;
    color: #7f8c8d;
    font-style: italic;
    background: #f8f9fa;
    padding: 1rem 1.5rem;
    border-radius: 0 8px 8px 0;
}

.comment-content :deep(h3) {
    color: #2c3e50;
    margin: 1.5rem 0 1rem 0;
    font-size: 1.2rem;
    font-weight: 700;
}

.comment-content :deep(h4) {
    color: #34495e;
    margin: 1.25rem 0 0.75rem 0;
    font-size: 1.1rem;
    font-weight: 600;
}

.comment-content :deep(img.comment-image) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 0.5rem 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.comment-content :deep(img.comment-image:hover) {
    transform: scale(1.02);
}

.comment-actions-bar {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #f0f0f0;
    flex-wrap: wrap;
}

.vote-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.vote-buttons {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #f8f9fa;
    border-radius: 24px;
    padding: 0.25rem;
    border: 1px solid #e9ecef;
}

.vote-btn {
    background: none;
    border: none;
    padding: 0.6rem 0.75rem;
    border-radius: 20px;
    cursor: pointer;
    color: #6c757d;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    font-weight: 600;
    position: relative;
    overflow: hidden;
}

.vote-btn::before {
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

.vote-btn:hover::before {
    opacity: 0.1;
}

.vote-btn:hover {
    transform: translateY(-1px);
}

.vote-btn:active {
    transform: translateY(0);
}

.vote-btn.active {
    color: #3498db;
    background: #e3f2fd;
}

.vote-btn.upvote.active {
    color: #27ae60;
    background: #e8f5e8;
}

.vote-btn.downvote.active {
    color: #e74c3c;
    background: #fdedec;
}

.vote-btn.animating {
    animation: votePulse 0.6s ease;
}

.vote-btn.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.vote-btn.disabled:hover {
    transform: none;
    background: inherit;
}

.vote-count {
    font-weight: 700;
    font-size: 0.85rem;
    min-width: 1.5rem;
    text-align: center;
}

.vote-ratio {
    width: 60px;
    height: 4px;
    background: #e9ecef;
    border-radius: 2px;
    overflow: hidden;
    margin: 0 auto;
}

.ratio-bar {
    height: 100%;
    background: linear-gradient(90deg, #e74c3c, #f39c12, #27ae60);
    transition: width 0.5s ease;
}

.vote-stats {
    display: flex;
    gap: 0.75rem;
    font-size: 0.75rem;
    color: #6c757d;
    flex-wrap: wrap;
}

.stat {
    padding: 0.2rem 0.5rem;
    background: #f8f9fa;
    border-radius: 10px;
}

.reply-btn {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    padding: 0.6rem 1.25rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.reply-btn:hover {
    background: #e9ecef;
    color: #495057;
    transform: translateY(-1px);
}

.reply-btn.active {
    background: #3498db;
    color: white;
    border-color: #3498db;
    animation: replyPulse 1s ease;
}

.reply-count {
    background: #3498db;
    color: white;
    padding: 0.1rem 0.4rem;
    border-radius: 10px;
    font-size: 0.7rem;
    font-weight: 600;
    min-width: 1.2rem;
    text-align: center;
}

.reactions-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    position: relative;
}

.reactions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.reaction-btn {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    padding: 0.4rem 0.75rem;
    border-radius: 16px;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    position: relative;
}

.reaction-btn:hover {
    background: #e9ecef;
    transform: translateY(-2px) scale(1.05);
}

.reaction-btn.active {
    background: #e3f2fd;
    border-color: #3498db;
    transform: scale(1.1);
}

.reaction-btn.popular {
    animation: popularGlow 2s ease-in-out infinite;
}

.reaction-btn.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.reaction-btn.disabled:hover {
    transform: none;
    background: inherit;
}

.reaction-emoji {
    font-size: 1rem;
}

.reaction-count {
    font-size: 0.75rem;
    font-weight: 700;
    color: #495057;
    min-width: 1rem;
    text-align: center;
}

.reaction-picker-container {
    position: relative;
}

.reaction-picker-btn {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    padding: 0.4rem;
    border-radius: 50%;
    cursor: pointer;
    color: #6c757d;
    transition: all 0.3s ease;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.reaction-picker-btn:hover {
    background: #e9ecef;
    color: #495057;
    transform: scale(1.1);
}

.reaction-plus {
    position: absolute;
    bottom: -2px;
    right: -2px;
    background: #3498db;
    color: white;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    font-size: 0.6rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid white;
}

.reaction-picker {
    position: absolute;
    bottom: 100%;
    left: 0;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    padding: 0.75rem;
    z-index: 100;
    min-width: 200px;
    border: 1px solid #e9ecef;
    animation: pickerSlideUp 0.2s ease;
}

.reaction-picker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #f0f0f0;
    font-weight: 600;
    font-size: 0.9rem;
    color: #495057;
}

.close-picker {
    background: none;
    border: none;
    cursor: pointer;
    color: #6c757d;
    padding: 0.25rem;
    border-radius: 4px;
}

.close-picker:hover {
    background: #f8f9fa;
    color: #495057;
}

.reaction-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
}

.reaction-option {
    background: none;
    border: none;
    padding: 0.5rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1.2rem;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.reaction-option:hover {
    background: #f8f9fa;
    transform: scale(1.2);
}

.reaction-option.active {
    background: #e3f2fd;
    transform: scale(1.1);
}

.reactions-summary {
    position: relative;
    cursor: pointer;
}

.summary-preview {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.75rem;
    background: #f8f9fa;
    border-radius: 16px;
    font-size: 0.8rem;
    color: #6c757d;
    border: 1px solid transparent;
    transition: all 0.2s;
}

.summary-preview:hover {
    background: #e9ecef;
    border-color: #dee2e6;
}

.summary-reaction {
    display: flex;
    align-items: center;
    gap: 0.2rem;
    font-weight: 600;
}

.summary-more {
    color: #6c757d;
    font-weight: 600;
}

.reaction-tooltip {
    position: absolute;
    bottom: 100%;
    left: 0;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    padding: 1rem;
    z-index: 10;
    min-width: 200px;
    border: 1px solid #e9ecef;
    animation: tooltipFadeIn 0.2s ease;
}

.tooltip-header {
    font-weight: 600;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #f0f0f0;
    color: #495057;
}

.tooltip-reactions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.tooltip-reaction {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.25rem 0;
}

.reaction-label {
    flex: 1;
    font-size: 0.85rem;
    color: #495057;
}

.additional-actions {
    display: flex;
    gap: 0.25rem;
    margin-left: auto;
}

.save-btn.active {
    color: #3498db;
}

.collapse-btn {
    color: #6c757d;
}

.collapse-btn:hover {
    color: #495057;
}

/* Enhanced edit form */
.edit-form {
    margin: 1rem 0;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    overflow: hidden;
    animation: formSlideDown 0.3s ease;
}

.edit-toolbar {
    display: flex;
    gap: 0.25rem;
    padding: 0.75rem;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
}

.toolbar-btn {
    background: none;
    border: none;
    padding: 0.5rem;
    border-radius: 6px;
    cursor: pointer;
    color: #6c757d;
    transition: all 0.2s;
    font-size: 0.9rem;
}

.toolbar-btn:hover {
    background: #e9ecef;
    color: #495057;
}

.edit-textarea {
    width: 100%;
    border: none;
    padding: 1rem;
    font-family: inherit;
    font-size: 0.95rem;
    resize: vertical;
    min-height: 120px;
    line-height: 1.6;
    background: white;
    transition: all 0.2s;
}

.edit-textarea:focus {
    outline: none;
    background: #fafbfc;
}

.edit-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: #f8f9fa;
    border-top: 1px solid #e9ecef;
}

.edit-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.char-count {
    font-size: 0.8rem;
    color: #6c757d;
}

.char-count.warning {
    color: #e74c3c;
    font-weight: 600;
}

.last-saved {
    font-size: 0.75rem;
    color: #6c757d;
    font-style: italic;
}

.edit-buttons {
    display: flex;
    gap: 0.75rem;
}

.btn-primary {
    background: #3498db;
    color: white;
    border: none;
    padding: 0.6rem 1.25rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
    background: #2980b9;
    transform: translateY(-1px);
}

.btn-primary:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
    transform: none;
}

.btn-secondary {
    background: #6c757d;
    color: white;
    border: none;
    padding: 0.6rem 1.25rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
}

.btn-secondary:hover:not(:disabled) {
    background: #5a6268;
    transform: translateY(-1px);
}

.btn-secondary:disabled {
    background: #a0a4a8;
    cursor: not-allowed;
    transform: none;
}

.btn-danger {
    background: #e74c3c;
    color: white;
    border: none;
    padding: 0.6rem 1.25rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-danger:hover:not(:disabled) {
    background: #c0392b;
    transform: translateY(-1px);
}

.btn-danger:disabled {
    background: #f1948a;
    cursor: not-allowed;
    transform: none;
}

/* Enhanced options dropdown */
.options-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    padding: 0.75rem;
    z-index: 100;
    min-width: 220px;
    border: 1px solid #e9ecef;
    animation: dropdownSlideDown 0.2s ease;
}

.dropdown-section {
    margin-bottom: 1rem;
}

.dropdown-section:last-child {
    margin-bottom: 0;
}

.dropdown-section h4 {
    margin: 0 0 0.5rem 0;
    font-size: 0.8rem;
    color: #6c757d;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    cursor: pointer;
    border-radius: 8px;
    transition: background 0.2s;
    font-size: 0.9rem;
    color: #495057;
    text-align: left;
}

.dropdown-item:hover {
    background: #f8f9fa;
}

.dropdown-item.moderator-action {
    color: #e74c3c;
    font-weight: 600;
}

.dropdown-divider {
    border: none;
    border-top: 1px solid #e9ecef;
    margin: 0.5rem 0;
}

/* Enhanced deleted comment */
.deleted-comment {
    padding: 1.5rem 0;
    text-align: center;
}

.deleted-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    color: #6c757d;
    font-style: italic;
}

.deleted-content i {
    font-size: 1.5rem;
    opacity: 0.7;
}

.deletion-reason {
    font-size: 0.85rem;
    background: #f8f9fa;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    color: #495057;
    max-width: 300px;
}

/* Enhanced modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
    backdrop-filter: blur(4px);
}

.modal-content {
    background: white;
    border-radius: 16px;
    padding: 0;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    animation: modalScaleIn 0.3s ease;
    overflow: hidden;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e9ecef;
    background: #f8f9fa;
}

.modal-header h3 {
    margin: 0;
    color: #e74c3c;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.modal-close {
    background: none;
    border: none;
    cursor: pointer;
    color: #6c757d;
    padding: 0.5rem;
    border-radius: 6px;
    transition: all 0.2s;
}

.modal-close:hover {
    background: #e9ecef;
    color: #495057;
}

.modal-body {
    padding: 1.5rem;
}

.mod-deletion-options {
    margin-top: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #e74c3c;
}

.mod-deletion-options label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    font-weight: 600;
    color: #495057;
}

.deletion-reason-input {
    margin-top: 0.75rem;
    padding-left: 1.5rem;
}

.deletion-reason-input label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #495057;
}

.deletion-reason-input select,
.custom-reason-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 0.9rem;
}

.custom-reason-input {
    margin-top: 0.5rem;
}

.modal-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    padding: 1.5rem;
    border-top: 1px solid #e9ecef;
    background: #f8f9fa;
}

/* Enhanced toast */
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
    z-index: 1100;
    min-width: 300px;
    border-left: 4px solid;
    overflow: hidden;
}

.toast.success {
    border-left-color: #4caf50;
    color: #2e7d32;
}

.toast.error {
    border-left-color: #e74c3c;
    color: #c62828;
}

.toast.info {
    border-left-color: #2196f3;
    color: #1565c0;
}

.toast-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
}

.toast-close {
    background: none;
    border: none;
    cursor: pointer;
    color: inherit;
    opacity: 0.7;
    padding: 0.25rem;
    border-radius: 4px;
    transition: opacity 0.2s;
}

.toast-close:hover {
    opacity: 1;
}

.toast-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background: currentColor;
    opacity: 0.3;
    transition: width 0.1s linear;
}

/* Enhanced loading skeleton */
.comment-skeleton {
    padding: 1.5rem;
    animation: skeletonPulse 1.5s ease-in-out infinite;
}

.skeleton-header {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    align-items: flex-start;
}

.skeleton-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    flex-shrink: 0;
}

.skeleton-author {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.skeleton-actions {
    display: flex;
    gap: 0.5rem;
}

.skeleton-actions .skeleton-line {
    width: 32px;
    height: 32px;
    border-radius: 6px;
}

.skeleton-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
}

.skeleton-line {
    height: 0.875rem;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    border-radius: 4px;
}

.skeleton-line.short {
    width: 60%;
}

.skeleton-line.shorter {
    width: 40%;
}

.skeleton-line.medium {
    width: 80%;
}

.skeleton-actions-bar {
    display: flex;
    gap: 1.5rem;
    align-items: center;
}

.skeleton-action {
    width: 80px;
    height: 36px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    border-radius: 18px;
}

/* Animations */
@keyframes highlightPulse {
    0% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7); }
    50% { box-shadow: 0 0 0 10px rgba(255, 215, 0, 0); }
    100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0); }
}

@keyframes votePulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
}

@keyframes replyPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

@keyframes popularGlow {
    0%, 100% { box-shadow: 0 0 5px rgba(255, 107, 53, 0.5); }
    50% { box-shadow: 0 0 15px rgba(255, 107, 53, 0.8); }
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

@keyframes skeletonPulse {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
}

@keyframes pickerSlideUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes tooltipFadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes formSlideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes dropdownSlideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes modalScaleIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
}

/* Enhanced transitions */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.dropdown-enter-active,
.dropdown-leave-active {
    transition: all 0.3s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

.slide-enter-active,
.slide-leave-active {
    transition: all 0.4s ease;
}

.slide-enter-from,
.slide-leave-to {
    opacity: 0;
    transform: translateX(-20px);
}

.modal-enter-active,
.modal-leave-active {
    transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
    transform: scale(0.9);
}

.toast-enter-active,
.toast-leave-active {
    transition: all 0.4s ease;
}

.toast-enter-from {
    opacity: 0;
    transform: translate(-50%, 20px);
}

.toast-leave-to {
    opacity: 0;
    transform: translate(-50%, -20px);
}

.reaction-picker-enter-active,
.reaction-picker-leave-active {
    transition: all 0.3s ease;
}

.reaction-picker-enter-from,
.reaction-picker-leave-to {
    opacity: 0;
    transform: translateY(10px);
}

/* Enhanced responsive design */
@media (max-width: 768px) {
    .comment-replies {
        margin-left: 1.5rem;
        padding-left: 1rem;
    }
    
    .comment-actions-bar {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
    
    .reactions-section {
        order: -1;
        width: 100%;
        justify-content: space-between;
    }
    
    .additional-actions {
        margin-left: 0;
        width: 100%;
        justify-content: flex-end;
    }
    
    .vote-section {
        width: 100%;
    }
    
    .vote-buttons {
        justify-content: center;
    }
    
    .replies-header {
        flex-direction: column;
        gap: 0.75rem;
        align-items: flex-start;
    }
    
    .replies-actions {
        width: 100%;
        justify-content: space-between;
    }
    
    .modal-content {
        margin: 1rem;
    }
    
    .modal-actions {
        flex-direction: column;
    }
    
    .toast {
        left: 1rem;
        right: 1rem;
        transform: none;
        min-width: auto;
    }
}

@media (max-width: 480px) {
    .comment-main {
        padding: 1.25rem;
    }
    
    .comment-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }
    
    .comment-actions {
        align-self: flex-end;
    }
    
    .author-main {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
    
    .edit-actions {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }
    
    .edit-buttons {
        width: 100%;
        justify-content: flex-end;
    }
    
    .reaction-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

/* Enhanced focus styles for accessibility */
.btn-action:focus,
.vote-btn:focus,
.reaction-btn:focus,
.dropdown-item:focus,
.toolbar-btn:focus,
.modal-close:focus,
.toast-close:focus {
    outline: 2px solid #3498db;
    outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
    .comment-main {
        border: 2px solid #000;
    }
    
    .vote-btn.active {
        border: 2px solid #000;
    }
    
    .reaction-btn.active {
        border: 2px solid #000;
    }
}

/* Reduced motion support */    
@media (prefers-reduced-motion: reduce) {
    .comment-item,
    .comment-main,
    .btn-action,
    .vote-btn,
    .reaction-btn,
    .author-avatar {
        transition: none;
    }
    
    .fade-enter-active,
    .fade-leave-active,
    .slide-enter-active,
    .slide-leave-active,
    .modal-enter-active,
    .modal-leave-active,
    .toast-enter-active,
    .toast-leave-active,
    .dropdown-enter-active,
    .dropdown-leave-active,
    .reaction-picker-enter-active,
    .reaction-picker-leave-active {
        transition: opacity 0.1s ease;
    }
    
    @keyframes highlightPulse {
        from, to { 
            opacity: 1;
            transform: none;
            box-shadow: none;
        }
        50% {
            opacity: 0.8;
        }
    }
    
    @keyframes votePulse {
        from, to { 
            opacity: 1;
            transform: none;
            box-shadow: none;
        }
        50% {
            opacity: 0.8;
        }
    }
    
    @keyframes replyPulse {
        from, to { 
            opacity: 1;
            transform: none;
            box-shadow: none;
        }
        50% {
            opacity: 0.8;
        }
    }
    
    @keyframes popularGlow {
        from, to { 
            opacity: 1;
            transform: none;
            box-shadow: none;
        }
        50% {
            opacity: 0.8;
        }
    }
    
    @keyframes pulse {
        from, to { 
            opacity: 1;
            transform: none;
            box-shadow: none;
        }
        50% {
            opacity: 0.8;
        }
    }
    
    @keyframes skeletonPulse {
        from, to { 
            opacity: 1;
            transform: none;
            box-shadow: none;
        }
        50% {
            opacity: 0.8;
        }
    }
    
    @keyframes pickerSlideUp {
        from, to { 
            opacity: 1;
            transform: none;
            box-shadow: none;
        }
        50% {
            opacity: 0.8;
        }
    }
    
    @keyframes tooltipFadeIn {
        from, to { 
            opacity: 1;
            transform: none;
            box-shadow: none;
        }
        50% {
            opacity: 0.8;
        }
    }
    
    @keyframes formSlideDown {
        from, to { 
            opacity: 1;
            transform: none;
            box-shadow: none;
        }
        50% {
            opacity: 0.8;
        }
    }
    
    @keyframes dropdownSlideDown {
        from, to { 
            opacity: 1;
            transform: none;
            box-shadow: none;
        }
        50% {
            opacity: 0.8;
        }
    }
    
    @keyframes modalScaleIn {
        from, to { 
            opacity: 1;
            transform: none;
            box-shadow: none;
        }
        50% {
            opacity: 0.8;
        }
    }
    @keyframes toastSlideIn {
        from, to { 
            opacity: 1;
            transform: none;
            box-shadow: none;
        }
        50% {
            opacity: 0.8;
        }
        
    }
}

/* Print styles */
@media print {
    .comment-actions,
    .comment-actions-bar,
    .options-dropdown,
    .reaction-picker,
    .edit-form,
    .modal-overlay,
    .toast {
        display: none !important;
    }
    
    .comment-item {
        break-inside: avoid;
        border: 1px solid #ddd !important;
        box-shadow: none !important;
    }
    
    .comment-main {
        box-shadow: none !important;
        border: none !important;
    }
}
</style>