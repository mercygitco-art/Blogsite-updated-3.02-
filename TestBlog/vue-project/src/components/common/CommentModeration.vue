<script setup>
const props = defineProps({
  comment: { type: Object, required: true },
  isOwner: { type: Boolean, default: false }
})

const emit = defineEmits(['delete', 'pin', 'lock', 'block-user'])
</script>

<template>
  <div class="comment-moderation">
    <button v-if="isOwner || comment.moderator" type="button" class="comment-moderation__danger" @click="emit('delete', comment)">Delete</button>
    <button v-if="comment.moderator" type="button" @click="emit('pin', comment)">Pin</button>
    <button v-if="comment.moderator" type="button" @click="emit('lock', comment)">Lock</button>
    <button v-if="comment.moderator" type="button" @click="emit('block-user', comment)">Block user</button>
  </div>
</template>

<style scoped>
.comment-moderation {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
}

button {
  border: 1px solid #d1d5db;
  background: #fff;
  color: #374151;
  border-radius: 9999px;
  padding: 0.35rem 0.7rem;
  cursor: pointer;
}

.comment-moderation__danger {
  border-color: #fca5a5;
  color: #b91c1c;
}
</style>
