<script setup>
import { computed } from 'vue'
import { usePwaUpdate } from '@/composables/usePwaUpdate'

/**
 * PWA 更新提示 —— **屏幕正中的弹窗**。
 *
 * ## 为什么改成居中弹窗
 *
 * 早先是底部提示条（`bottom: 68px`，贴在 TabBar 上方）。
 * 用户反馈「底部容易被忽略」—— 底部本来就有 TabBar 和滑动提示，
 * 视线通常停在内容区，那条窄提示很容易看漏。
 *
 * 改成居中弹窗后：
 * - 位置在屏幕中央，无论当前在看哪块内容都会撞进视野
 * - 文案与按钮**竖排**，比原来横排更醒目（原来文字和按钮挤在一行）
 * - 加一层淡遮罩，把注意力集中到这一个决定上
 *
 * ## 仍然不用浏览器原生 confirm
 *
 * 项目里所有二次确认一律用**页内** UI（见 README），
 * 原生 `confirm()` 样式不可控、在微信内会被拦。
 */
const pwa = usePwaUpdate()

const visible = computed(() => pwa.needRefresh.value && !pwa.dismissed.value)
</script>

<template>
  <Transition name="pwa">
    <div v-if="visible" class="pwa-mask" role="presentation">
      <div class="pwa-dialog" role="dialog" aria-modal="true" aria-labelledby="pwa-title">
        <p id="pwa-title" class="pwa-dialog__title">有新版本可用</p>
        <p class="pwa-dialog__desc">更新后即可用上最新的题库与修复</p>
        <div class="pwa-dialog__acts">
          <button class="pwa-dialog__btn pwa-dialog__btn--ghost" @click="pwa.dismiss()">稍后</button>
          <button class="pwa-dialog__btn pwa-dialog__btn--primary" @click="pwa.applyUpdate()">
            立即更新
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/**
 * 遮罩：只压暗、不阻断（点遮罩不做任何事）。
 *
 * `pointer-events` 保持默认（可接收），这样弹窗打开时用户点不到背后的内容；
 * 但遮罩本身没有点击处理 —— 必须明确选「稍后」或「立即更新」才能关掉，
 * 避免误触空白处关掉而错过更新。
 */
.pwa-mask {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.42);
}

.pwa-dialog {
  width: 100%;
  max-width: 320px;
  padding: 20px 18px 14px;
  border-radius: 16px;
  background: var(--c-card);
  border: 1px solid var(--c-border);
  box-shadow: var(--shadow-lift);
  text-align: center;
}

.pwa-dialog__title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--c-text);
}

.pwa-dialog__desc {
  margin: 6px 0 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--c-text-3);
}

/* 两个按钮竖排：手机上好按，也让「立即更新」成为唯一显眼的主操作 */
.pwa-dialog__acts {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.pwa-dialog__btn {
  width: 100%;
  min-height: 42px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
}
.pwa-dialog__btn--ghost {
  color: var(--c-text-3);
  background: var(--c-bg);
  border: 1px solid var(--c-border);
}
.pwa-dialog__btn--primary {
  background: var(--c-primary);
  color: #fff;
}

/* 进出场：遮罩淡入，弹窗轻微缩放，避免「啪」地出现 */
.pwa-enter-active,
.pwa-leave-active {
  transition: opacity 0.2s ease;
}
.pwa-enter-active .pwa-dialog,
.pwa-leave-active .pwa-dialog {
  transition: transform 0.2s ease;
}
.pwa-enter-from,
.pwa-leave-to {
  opacity: 0;
}
.pwa-enter-from .pwa-dialog,
.pwa-leave-to .pwa-dialog {
  transform: scale(0.94);
}
</style>
