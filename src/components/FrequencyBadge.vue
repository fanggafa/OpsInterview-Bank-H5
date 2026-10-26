<script setup>
defineProps({
  frequency: { type: String, required: true },
})
</script>

<template>
  <span class="badge freq" :class="{ 'freq--high': frequency === '高频' }">{{ frequency }}</span>
</template>

<style scoped>
.freq {
  color: var(--c-freq);
  background: var(--c-freq-weak);
}
.freq--high {
  color: var(--c-primary);
  background: var(--c-primary-weak);
}
</style>
