<script setup>
import { onMounted } from 'vue'
import { usePwaUpdate } from '@/composables/usePwaUpdate'

/**
 * 更新加载层 —— 点击「立即更新」后盖住整屏的动画。
 *
 * ## 解决什么
 *
 * 用户反馈「每次更新完，立马使用会非常卡顿，页面切换、按钮点击都会卡顿甚至无反应，
 * 过一阵子才正常」。除了把缓存预热挪到空闲时段，还需要**给用户一个明确的等待信号**：
 * 点完更新不是「没反应」，而是「正在准备」。
 *
 * ## 为什么能跨刷新
 *
 * 点更新会让 SW 接管并重载页面，组件会重新创建、内存状态丢失。
 * 所以状态放在 `usePwaUpdate` 里并落 `sessionStorage`：
 * 新页面启动时 `restoreUpdatingFlag()` 读回标记，加载层继续显示，
 * 等首屏真正就绪再淡出。
 *
 * ## 节奏
 *
 * - 最短展示 900ms：太短会闪一下，反而更像故障
 * - 最长 12s 兜底：异常情况下不会把用户永远困在转圈里
 * - 淡出 240ms：不要「啪」地消失
 */
const pwa = usePwaUpdate()

onMounted(() => {
  // 若是刷新后回到这里，继续把兜底计时器挂上
  if (pwa.updating.value) pwa.armUpdatingTimeout()
})
</script>

<template>
  <Transition name="upd-fade">
    <div v-if="pwa.updating.value" class="upd" role="status" aria-live="polite" aria-busy="true">
      <div class="upd__box">
        <!-- 环形进度：用 conic-gradient + mask 挖空，纯 CSS，不依赖 SVG 动画库 -->
        <div class="upd__ring" aria-hidden="true">
          <div class="upd__ring-inner"></div>
        </div>

        <p class="upd__title">正在更新</p>
        <p class="upd__desc">首次加载需要几秒，请稍候</p>

        <!-- 底部细进度条：纯装饰，循环播放，给「在动」的感知 -->
        <div class="upd__bar" aria-hidden="true">
          <span class="upd__bar-fill"></span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/**
 * 全屏遮罩：**不透明**，这是刻意的。
 *
 * 更新期间背后可能正在重载、数据尚未就绪，露出半截页面反而显得「崩了」。
 * 一整块干净的背景 + 居中的动画，观感更稳。
 */
.upd {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--c-bg);
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
}

.upd__box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 28px 32px;
  border-radius: 20px;
  background: var(--glass-bar-bg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-bar-saturate));
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-bar-saturate));
  min-width: 200px;
}

/**
 * 环形转圈。
 *
 * 用 `conic-gradient` 画「亮 → 暗」的扇形，再用 `mask` 挖掉中间 ——
 * 比 SVG stroke-dasharray 简单，且能直接用 CSS 变量上色。
 */
.upd__ring {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    var(--c-primary) 300deg,
    var(--c-primary) 360deg
  );
  /* 挖空中间形成环 */
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px));
  animation: upd-spin 0.9s linear infinite;
}

/* 内层不需要显示内容，仅用于撑开结构，视觉上被 mask 挖空 */
.upd__ring-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

@keyframes upd-spin {
  to {
    transform: rotate(360deg);
  }
}

.upd__title {
  margin: 2px 0 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--c-text);
}

.upd__desc {
  margin: 0;
  font-size: 12px;
  color: var(--c-text-3);
}

/* 底部细进度条：无限循环的不确定进度 */
.upd__bar {
  position: relative;
  width: 100%;
  height: 3px;
  margin-top: 4px;
  border-radius: 999px;
  background: var(--c-bg);
  overflow: hidden;
}
.upd__bar-fill {
  position: absolute;
  inset: 0 auto 0 0;
  width: 40%;
  border-radius: 999px;
  background: var(--c-primary);
  animation: upd-slide 1.3s ease-in-out infinite;
}

@keyframes upd-slide {
  0% {
    left: -40%;
  }
  100% {
    left: 100%;
  }
}

/* 过渡：淡入淡出，不要「啪」地出现或消失 */
.upd-fade-enter-active,
.upd-fade-leave-active {
  transition: opacity 0.24s ease;
}
.upd-fade-enter-from,
.upd-fade-leave-to {
  opacity: 0;
}

/**
 * 尊重「减少动态效果」的系统偏好：
 * 关掉旋转与横移动画，只保留静态环和文案 —— 仍然能表达「正在更新」。
 */
@media (prefers-reduced-motion: reduce) {
  .upd__ring,
  .upd__bar-fill {
    animation: none;
  }
}
</style>
