<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TabBar from '@/components/TabBar.vue'

const route = useRoute()

/** 底部 TabBar 只在 4 个一级页面显示 */
const TAB_ROUTES = ['/bank', '/practice', '/stats', '/me']
const showTab = computed(() => TAB_ROUTES.includes(route.path))

/**
 * 沉浸式页面：自己占满可视高度，内部滚动。
 * 刷题页（题卡占满一屏、操作栏吸底）与面试答题页同构。
 */
const FULL_ROUTES = ['/practice', '/interview/run']
const isFull = computed(() => FULL_ROUTES.includes(route.path))
</script>

<template>
  <div
    class="app-shell"
    :class="{ 'app-shell--no-tab': !showTab }"
  >
    <main
      class="app-main"
      :class="{
        'app-main--no-tab': !showTab,
        'app-main--full': isFull,
      }"
    >
      <router-view v-slot="{ Component }">
        <Transition name="fade-slide" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </main>
    <TabBar v-if="showTab" />
  </div>
</template>
