<script setup>
import EmptyState from '@/components/EmptyState.vue'
import AppHeader from '@/components/AppHeader.vue'
</script>

<template>
  <div class="page">
    <AppHeader title="页面不存在" back-to="/" />
    <EmptyState
      variant="error"
      title="404"
      desc="你访问的页面不存在或已被移除。"
      action="回首页"
      @action="$router.replace('/')"
    />
  </div>
</template>
