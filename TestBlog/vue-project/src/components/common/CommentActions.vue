<script setup>
const props = defineProps({
  comment: { type: Object, required: true },
  currentUser: { type: String, default: '' },
  isOwner: { type: Boolean, default: false },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['reply', 'react', 'vote', 'pin', 'lock', 'delete', 'block-user', 'report'])

function action(label) {
  if (label === 'reply') emit('reply', props.comment)
  if (label === 'react') emit('react', { id: props.comment.id, reaction: 'like' })
  if (label === 'vote') emit('vote', { id: props.comment.id, value: 1 })
  if (label === 'pin') emit('pin', props.comment)
  if (label === 'lock') emit('lock', props.comment)
  if (label === 'delete') emit('delete', props.comment)
  if (label === 'block-user') emit('block-user', props.comment)
  if (label === 'report') emit('report', props.comment)
}
</script>

<template>
  <div class="comment-actions">
    <button type="button" @click="action('reply')">Reply</button>
    <button type="button" @click="action('react')">Like</button>
    <button type="button" @click="action('vote')">Vote</button>
    <button v-if="isOwner || currentUser" type="button" @click="action('pin')">Pin</button>
    <button v-if="isOwner || currentUser" type="button" @click="action('lock')">Lock</button>
    <button v-if="isOwner || currentUser" type="button" @click="action('delete')">Delete</button>
    <button type="button" @click="action('block-user')">Block</button>
    <button type="button" @click="action('report')">Report</button>
  </div>
</template>

<style scoped>
.comment-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
}

button {
  border: 1px solid #d1d5db;
  background: #fff;
  border-radius: 9999px;
  padding: 0.35rem 0.7rem;
  font-size: 0.75rem;
  color: #374151;
  cursor: pointer;
}
</style>
