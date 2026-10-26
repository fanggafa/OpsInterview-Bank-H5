<script setup>
import { DIFFICULTY_COLOR } from '@/utils/constants'

const props = defineProps({
  difficulty: { type: String, required: true },
})

const color = DIFFICULTY_COLOR[props.difficulty] || 'var(--c-text-3)'
</script>

<template>
  <span class="badge" :style="{ color, background: color + '14' }">{{ difficulty }}</span>
</template>
