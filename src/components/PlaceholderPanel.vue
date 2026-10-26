<script setup>
import AppHeader from '@/components/AppHeader.vue'

defineProps({
  title: { type: String, default: '' },
  step: { type: String, default: '' },
  desc: { type: String, default: '' },
})
</script>

<template>
  <div class="page">
    <AppHeader v-if="title" :title="title" :back="false" />
    <div class="placeholder card">
      <p class="placeholder__tag">{{ step }}</p>
      <h2 class="placeholder__title">{{ title || '页面建设中' }}</h2>
      <p class="placeholder__desc">{{ desc || '该页面将在后续步骤实现。' }}</p>
    </div>
  </div>
</template>

<style scoped>
.placeholder {
  padding: 24px 18px;
  margin-top: 12px;
}
.placeholder__tag {
  display: inline-block;
  margin: 0 0 10px;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  color: var(--c-primary);
  background: var(--c-primary-weak);
}
.placeholder__title {
  margin: 0 0 8px;
  font-size: 18px;
  color: var(--c-text);
}
.placeholder__desc {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.7;
  color: var(--c-text-2);
}
</style>
