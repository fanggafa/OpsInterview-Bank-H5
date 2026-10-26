<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * 回到顶部按钮：长页面统一使用。
 * 滚动超过阈值才出现，避免在短页面上打扰。
 */
const props = defineProps({
  /** 滚动多少像素后出现 */
  threshold: { type: Number, default: 600 },
})

const visible = ref(false)
let ticking = false

function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    visible.value = (window.scrollY || 0) > props.threshold
    ticking = false
  })
}

function toTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <Transition name="totop">
    <button
      v-if="visible"
      class="totop"
      aria-label="回到顶部"
      @click="toTop"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          d="M12 19V6M6 12l6-6 6 6"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </Transition>
</template>

<style scoped>
.totop {
  position: fixed;
  right: max(14px, calc(50% - 240px + 14px));
  bottom: calc(var(--tabbar-h) + var(--safe-bottom) + 74px);
  z-index: 15;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-primary);
  background: var(--c-card);
  border: 1px solid var(--c-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}
.totop:active {
  background: var(--c-primary-weak);
}

.totop-enter-active,
.totop-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.totop-enter-from,
.totop-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
