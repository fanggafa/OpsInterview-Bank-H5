<script setup>
import { computed, ref } from 'vue'
import { useVersionCheck } from '@/composables/useVersionCheck'
import { usePwaUpdate } from '@/composables/usePwaUpdate'
import { APP_SHA } from '@/utils/version'

/**
 * 「有新版本」横幅 —— **存量用户的救命通道**。
 *
 * ## 为什么需要它（SPA 里已经有弹窗了）
 *
 * 现有弹窗（`PwaUpdateDialog`）依赖一个前提：**新 SW 已经装好并进入 waiting**。
 * 但 2026-11 的真实情况是：
 *
 * - 用户设备上的旧 SW 是否去检查更新，完全不可控（旧版本每小时才查一次）
 * - 用户可能几周不重开 App，那一次检查永远不发生
 * - 即便弹出，用户点「稍后」后本次会话就不再提示
 *
 * 结果就是：**修复发了，用户却一直用着有问题的旧版本，而他自己毫不知情。**
 *
 * 这条横幅不依赖 SW 生命周期：前端自己 fetch `data/version.json`
 * （NetworkOnly，永不缓存）比对 sha，发现不一致就显示。
 *
 * ## 交互设计
 *
 * - **可点击整条**：点了就执行「立即更新」（调 skipWaiting + reload）
 * - **可关闭**：右上角 ×，本次会话不再出现（但刷新后会重新判断）
 * - **文案给出具体版本差**：让用户知道「我在 2892，最新 3209」，比「有新版本」更有说服力
 */
const { remoteState, remoteInfo } = useVersionCheck()
const pwa = usePwaUpdate()

/**
 * 本次会话是否已手动关掉。
 *
 * 用 sessionStorage 而不是内存 ref：用户关掉横幅后如果立刻刷新页面，
 * 不该马上又弹出来（那会很烦）。但**新开会话仍会重新提示** —— 这是刻意的，
 * 否则他会一直停在旧版本。
 *
 * 注意：`hidden` 必须在 `visible` 之前声明，否则 computed 首次求值时取不到。
 */
const HIDDEN_KEY = 'oi_version_banner_hidden'
const hidden = ref(readHidden())

function readHidden() {
  try {
    return sessionStorage.getItem(HIDDEN_KEY) === '1'
  } catch {
    return false
  }
}

const visible = computed(() => remoteState.value === 'stale' && !hidden.value)

function close(e) {
  e.stopPropagation()
  hidden.value = true
  try {
    sessionStorage.setItem(HIDDEN_KEY, '1')
  } catch {
    /* 存储不可用时仅本次有效 */
  }
}

/**
 * 点击横幅 → 更新。
 *
 * 分两条路径：
 * - SW 已就绪（有 waiting 版本）→ `applyUpdate()` 走标准流程（会显示加载层）
 * - 没有 waiting 版本（典型情况：旧 SW 根本不认识新版本）→ 直接重载，
 *   让浏览器重新拉 index.html 与 sw.js
 *
 * 为什么后者也要重载：重载会触发 SW 的 `update()` 检查，
 * 相当于帮用户手动催了一次。
 */
function onClick() {
  if (pwa.needRefresh.value) {
    pwa.applyUpdate()
  } else {
    window.location.reload()
  }
}

/** 版本对比文案：本地 → 远端 */
const detail = computed(() => {
  const local = APP_SHA && APP_SHA !== 'unknown' ? APP_SHA : '当前'
  const remote = remoteInfo.value?.sha || '最新'
  return `${local} → ${remote}`
})
</script>

<template>
  <Transition name="upbanner">
    <div
      v-if="visible"
      class="upbanner"
      role="button"
      tabindex="0"
      aria-label="有新版本可用，点击更新"
      @click="onClick"
      @keydown.enter="onClick"
    >
      <span class="upbanner__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="17" height="17">
          <path
            d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
      <span class="upbanner__text">
        <span class="upbanner__title">有新版本可用，点此更新</span>
        <span class="upbanner__desc">{{ detail }}</span>
      </span>
      <button class="upbanner__close" aria-label="关闭提示" @click="close">
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <path d="M7 7l10 10M17 7L7 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    </div>
  </Transition>
</template>

<style scoped>
/*
 * 横幅贴在页头下方（sticky），滑动时始终可见 ——
 * 它需要「一直提醒但不挡操作」，所以不能做成居中弹窗（那会挡住刷题）。
 */
.upbanner {
  position: sticky;
  top: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 8px;
  padding: 9px 10px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f59e0b, #ea580c);
  color: #fff;
  box-shadow: 0 3px 10px rgba(234, 88, 12, 0.28);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.upbanner:active {
  transform: scale(0.995);
}
.upbanner__icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.22);
}
.upbanner__text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.upbanner__title {
  font-size: 12.5px;
  font-weight: 700;
  line-height: 1.3;
}
.upbanner__desc {
  font-size: 10.5px;
  opacity: 0.86;
  font-variant-numeric: tabular-nums;
  /* sha 是十六进制串，不会被截断，但长版本号要允许收缩 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.upbanner__close {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  cursor: pointer;
  padding: 0;
}
.upbanner__close:active {
  background: rgba(255, 255, 255, 0.3);
}

/* 进出场：从上方滑入，幅度小、时间短，避免刷题时被大动画打扰 */
.upbanner-enter-active,
.upbanner-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.upbanner-enter-from,
.upbanner-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .upbanner-enter-active,
  .upbanner-leave-active {
    transition: opacity 0.15s ease;
  }
  .upbanner-enter-from,
  .upbanner-leave-to {
    transform: none;
  }
}
</style>
