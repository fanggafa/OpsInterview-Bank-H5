<script setup>
import { computed } from 'vue'
import { usePwaUpdate } from '@/composables/usePwaUpdate'

/**
 * PWA 更新提示条。
 *
 * 只在新版本就绪时出现，不打扰正常使用。
 * 用页内提示条而不是浏览器原生弹窗 —— 项目里所有二次确认都遵循这个约定
 * （见 README「为什么二次确认一律用页内确认条」）。
 */
const pwa = usePwaUpdate()

const visible = computed(() => pwa.needRefresh.value && !pwa.dismissed.value)
</script>

<template>
  <Transition name="pwa">
    <div v-if="visible" class="pwa-bar" role="status" aria-live="polite">
      <span class="pwa-bar__text">有新版本可用</span>
      <div class="pwa-bar__acts">
        <button class="pwa-bar__btn pwa-bar__btn--ghost" @click="pwa.dismiss()">稍后</button>
        <button class="pwa-bar__btn pwa-bar__btn--primary" @click="pwa.applyUpdate()">
          立即更新
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.pwa-bar {
  position: fixed;
  left: 50%;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 68px);
  transform: translateX(-50%);
  z-index: 60;
  display: flex;
  align-items: center;
  gap: 10px;
  width: calc(100% - 24px);
  max-width: 480px;
  padding: 10px 12px;
  border-radius: var(--radius);
  background: var(--c-card);
  border: 1px solid var(--c-border);
  box-shadow: var(--shadow-lift);
}
.pwa-bar__text {
  flex: 1;
  font-size: 13px;
  color: var(--c-text);
}
.pwa-bar__acts {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
.pwa-bar__btn {
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 12.5px;
  font-weight: 600;
}
.pwa-bar__btn--ghost {
  color: var(--c-text-3);
}
.pwa-bar__btn--primary {
  background: var(--c-primary);
  color: #fff;
}

.pwa-enter-active,
.pwa-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.pwa-enter-from,
.pwa-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}
</style>
