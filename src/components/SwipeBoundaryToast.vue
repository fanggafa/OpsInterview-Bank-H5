<script setup>
/**
 * 「已经是第一题 / 最后一题」提示浮层。**纯展示**，状态由调用方传入。
 *
 * 状态逻辑在 `src/utils/swipeBoundary.js`（`useSwipeBoundaryToast`），
 * 因为 SFC 的 `<script setup>` 无法额外导出函数。
 *
 * 详情页与刷题页共用同一个组件：样式、位置、淡入淡出只维护一处。
 */
defineProps({
  /** 要显示的文案；空串 = 不显示 */
  text: { type: String, default: '' },
})
</script>

<template>
  <Transition name="boundary-fade">
    <div v-if="text" class="boundary-toast" role="status" aria-live="polite">
      {{ text }}
    </div>
  </Transition>
</template>

<style scoped>
/**
 * 居中、深底浅字：
 * - 位置 `fixed` + 居中，不随页面滚动跑掉
 * - `pointer-events: none`：不拦手指，提示期间照样能继续滑动
 * - 层级高于卡片，但不加遮罩 —— 没必要为一条 1.6 秒的提示压暗整屏
 */
.boundary-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 40;
  transform: translate(-50%, -50%);
  padding: 10px 20px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--c-text) 86%, transparent);
  color: var(--c-bg);
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
}

/* 淡入淡出：越界提示不能「啪」地出现，那样更像报错 */
.boundary-fade-enter-active,
.boundary-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.boundary-fade-enter-from,
.boundary-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.94);
}
</style>
