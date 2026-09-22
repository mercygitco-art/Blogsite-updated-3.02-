<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  comment: { type: Object, required: true },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['save', 'cancel'])
const draft = ref(props.comment?.content || '')

watch(
  () => props.comment?.content,
  (value) => {
    draft.value = value || ''
  }
)

function save() {
  emit('save', { id: props.comment.id, content: draft.value })
}
</script>

<template>
  <div class="comment-composer">
    <textarea v-model="draft" rows="4" :disabled="loading" placeholder="Write a reply..." />
    <div class="comment-composer__actions">
      <button type="button" class="comment-composer__save" :disabled="loading" @click="save">Save</button>
      <button type="button" class="comment-composer__cancel" @click="emit('cancel')">Cancel</button>
    </div>
  </div>
</template>

<style scoped>
.comment-composer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

textarea {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.75rem;
  resize: vertical;
}

.comment-composer__actions {
  display: flex;
  gap: 0.5rem;
}

button {
  border: none;
  border-radius: 9999px;
  padding: 0.5rem 0.9rem;
  cursor: pointer;
}

.comment-composer__save {
  background: #111827;
  color: #fff;
}

.comment-composer__cancel {
  background: #f3f4f6;
  color: #111827;
}
</style>
