<script setup>
import CommentItem from './CommentItem.vue'

const props = defineProps({
  comment: { type: Object, required: true, validator: (value) => value && typeof value.id !== 'undefined' },
  currentUser: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  depth: { type: Number, default: 0 }
})

const emit = defineEmits(['reply', 'edit', 'delete', 'react', 'vote', 'pin', 'lock', 'block-user', 'report'])
</script>

<template>
  <CommentItem
    :comment="comment"
    :current-user="currentUser"
    :loading="loading"
    :depth="depth"
    @reply="emit('reply', $event)"
    @edit="emit('edit', $event)"
    @delete="emit('delete', $event)"
    @react="emit('react', $event)"
    @vote="emit('vote', $event)"
    @pin="emit('pin', $event)"
    @lock="emit('lock', $event)"
    @block-user="emit('block-user', $event)"
    @report="emit('report', $event)"
  />
</template>
