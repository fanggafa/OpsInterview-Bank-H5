<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { TAB_ITEMS } from '@/utils/constants'

const route = useRoute()

/** 判断某项是否高亮：精确匹配或为该项的子路由（meta.parent） */
function isActive(item) {
  if (route.path === item.path) return true
  if (route.meta?.parent === item.path) return true
  return route.path.startsWith(item.path + '/')
}

const items = computed(() => TAB_ITEMS)
</script>

<template>
  <nav class="tabbar" aria-label="主导航">
    <router-link
      v-for="item in items"
      :key="item.path"
      :to="item.path"
      class="tabbar__item"
      :class="{ 'tabbar__item--active': isActive(item) }"
      :aria-label="item.label"
      :aria-current="isActive(item) ? 'page' : undefined"
    >
      <svg class="tabbar__icon" viewBox="0 0 24 24" aria-hidden="true">
        <!-- 首页：房子 -->
        <template v-if="item.icon === 'home'">
          <path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-4.5v-5.5h-5V21H5a1 1 0 0 1-1-1v-8.5z" fill="currentColor" opacity=".9" />
        </template>
        <!-- 题库：矩形堆叠 -->
        <template v-else-if="item.icon === 'bank'">
          <rect x="3" y="5" width="18" height="4" rx="1.5" fill="currentColor" opacity=".9" />
          <rect x="3" y="11" width="18" height="4" rx="1.5" fill="currentColor" opacity=".6" />
          <rect x="3" y="17" width="12" height="3" rx="1.5" fill="currentColor" opacity=".4" />
        </template>
        <!-- 刷题：闪电 -->
        <template v-else-if="item.icon === 'practice'">
          <path d="M13 3 5 14h5l-1 7 8-11h-5l1-7z" fill="currentColor" />
        </template>
        <!-- 我的：人形 -->
        <template v-else>
          <circle cx="12" cy="8" r="3.5" fill="currentColor" />
          <path d="M4.5 20c0-4 3.4-6.5 7.5-6.5s7.5 2.5 7.5 6.5" fill="currentColor" opacity=".8" />
        </template>
      </svg>
      <span class="tabbar__label">{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<style scoped>
.tabbar {
  position: fixed;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--maxw);
  height: calc(var(--tabbar-h) + var(--safe-bottom));
  padding-bottom: var(--safe-bottom);
  display: flex;
  background: var(--c-card);
  border-top: 1px solid var(--c-border);
  z-index: 20;
}

.tabbar__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 44px;
  color: var(--c-text-3);
  font-size: 11px;
  transition: color 0.15s ease;
}

.tabbar__item--active {
  color: var(--c-primary);
}

.tabbar__icon {
  width: 22px;
  height: 22px;
}

.tabbar__label {
  line-height: 1;
}
</style>
