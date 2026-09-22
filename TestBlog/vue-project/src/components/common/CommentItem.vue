<script setup>
import { computed } from 'vue'
import CommentActions from './CommentActions.vue'
import CommentComposer from './CommentComposer.vue'
import CommentModeration from './CommentModeration.vue'

const props = defineProps({
  comment: { type: Object, required: true },
  currentUser: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  depth: { type: Number, default: 0 }
})

const emit = defineEmits(['reply', 'edit', 'delete', 'react', 'vote', 'pin', 'lock', 'block-user', 'report'])

const isOwner = computed(() => props.comment.author === props.currentUser)
const statusClass = computed(() => ({
  'comment-item--pinned': !!props.comment.pinned,
  'comment-item--highlighted': !!props.comment.highlighted,
  'comment-item--locked': !!props.comment.locked
}))

function onEditSave(payload) {
  emit('edit', payload)
}

function onModeration(action, value) {
  emit(action, value ?? props.comment)
}
</script>

<template>
  <article :class="['comment-item', statusClass]" :style="{ marginLeft: depth ? `${depth * 12}px` : undefined }">
    <header class="comment-item__header">
      <div class="comment-item__meta">
        <span class="comment-item__author">{{ comment.author || 'Anonymous' }}</span>
        <span class="comment-item__time">{{ comment.createdAt || 'just now' }}</span>
      </div>

      <CommentActions
        :comment="comment"
        :current-user="currentUser"
        :loading="loading"
        :is-owner="isOwner"
        @reply="emit('reply', $event)"
        @react="emit('react', $event)"
        @vote="emit('vote', $event)"
        @pin="emit('pin', $event)"
        @lock="emit('lock', $event)"
        @delete="emit('delete', $event)"
        @block-user="emit('block-user', $event)"
        @report="emit('report', $event)"
      />
    </header>

    <div class="comment-item__body">
      <p v-if="!comment.editing">{{ comment.content || 'No comment content' }}</p>
      <CommentComposer
        v-else
        :comment="comment"
        :loading="loading"
        @save="onEditSave"
        @cancel="emit('edit', { id: comment.id, action: 'cancel' })"
      />
    </div>

    <CommentModeration
      v-if="comment.canModerate"
      :comment="comment"
      :is-owner="isOwner"
      @delete="onModeration('delete', $event)"
      @pin="onModeration('pin', $event)"
      @lock="onModeration('lock', $event)"
      @block-user="onModeration('block-user', $event)"
    />
  </article>
</template>

<style scoped>
.comment-item {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  padding: 1rem;
  margin-bottom: 0.75rem;
}

.comment-item--pinned {
  border-color: #facc15;
}

.comment-item--highlighted {
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2);
}

.comment-item--locked {
  opacity: 0.75;
}

.comment-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.comment-item__meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.85rem;
  color: #6b7280;
}

.comment-item__author {
  font-weight: 600;
  color: #111827;
}

.comment-item__body {
  color: #374151;
  line-height: 1.6;
}
</style>
