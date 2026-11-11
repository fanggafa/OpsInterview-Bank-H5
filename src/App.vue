<script setup>
import { computed, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TabBar from '@/components/TabBar.vue'
import PwaUpdateDialog from '@/components/PwaUpdateDialog.vue'
import UpdateOverlay from '@/components/UpdateOverlay.vue'
import { usePwaUpdate } from '@/composables/usePwaUpdate'

const route = useRoute()

/** 底部 TabBar 在 4 个一级页面显示（含首页，否则无法从其他 Tab 回到首页） */
const TAB_ROUTES = ['/', '/bank', '/practice', '/me']
const showTab = computed(() => TAB_ROUTES.includes(route.path))

/**
 * 沉浸式页面：自己占满可视高度，内部滚动。
 * 刷题页（题卡占满一屏、操作栏吸底）属于这一类。
 */
const FULL_ROUTES = ['/practice']
const isFull = computed(() => FULL_ROUTES.includes(route.path))

const pwa = usePwaUpdate()

/**
 * 更新加载层：跨刷新的收尾逻辑。
 *
 * 点「立即更新」→ 写 sessionStorage 标记 → SW 接管 → 页面重载 →
 * 全新的 App 实例启动，`restoreUpdatingFlag()` 把标记读回来，加载层继续显示。
 *
 * 然后在**首屏渲染完成**（`nextTick` 之后）再调用 `markReady()`：
 * 它会保证加载层至少停留够最短时长，再淡出。
 * 这样用户看到的是「一屏加载动画 → 干净的首页」，而不是「白屏抖动 + 卡顿」。
 */
onMounted(async () => {
  if (!pwa.restoreUpdatingFlag()) return
  // 等 Vue 把首屏 DOM 渲染出来，再认为「已就绪」
  await nextTick()
  pwa.markReady()
})
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
    <!-- PWA 更新提示：只有新版本就绪时才出现，不打扰正常使用 -->
    <PwaUpdateDialog />
    <!-- 更新加载层：点「立即更新」后盖住整屏，跨刷新保持 -->
    <UpdateOverlay />
  </div>
</template>
