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
/**
 * TabBar：**浮动圆角玻璃胶囊**，与页头同一形态。
 *
 * ## 为什么不再是贴底通栏条
 *
 * 早先它 `bottom: 0` 横贯全屏、上沿一条白色高光线。
 * 在深色下那条高光成了一条刺眼的亮线，整条底栏像一块贴上去的板子。
 *
 * iOS 26 的 TabBar 是**浮在内容上方的圆角胶囊**：四周留白、圆角、柔和投影。
 * 改成胶囊后与页头、卡片统一成一套语言。
 *
 * ## 关键细节
 *
 * - **底部留白 10px + 安全区**：`bottom: calc(10px + safe-area)`，贴着屏幕下沿会失去浮动感
 * - **左右各留 12px**：与页头、卡片对齐
 * - 高度只算内容，`--safe-bottom` 不再进 height（它已经在 bottom 里）
 * - 不加边框、不加内高光线：玻璃的边界是模糊过渡
 */
.tabbar {
  position: fixed;
  left: 50%;
  bottom: calc(10px + var(--safe-bottom));
  transform: translateX(-50%);
  width: calc(100% - 24px);
  max-width: calc(var(--maxw) - 24px);
  height: var(--tabbar-h);
  display: flex;
  border-radius: 16px;
  background: var(--glass-bar-bg);
  box-shadow: var(--glass-shadow);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-bar-saturate));
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-bar-saturate));
  z-index: 20;
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .tabbar {
    background: var(--c-card);
  }
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
