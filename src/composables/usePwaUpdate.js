/**
 * PWA 更新提示。
 *
 * 背景：`vite-plugin-pwa` 用 `registerType: 'prompt'` 时，新版本的 Service Worker
 * 会安装完成但**不自动接管**，而是等待我们调 `updateServiceWorker(true)`。
 *
 * 为什么不自动更新：用户可能正在刷题（题卡占满一屏），SW 立刻接管会导致页面
 * 重新加载、丢失当前作答状态。所以由用户自己决定何时刷新。
 *
 * 这个 composable 负责：
 * 1. 注册 SW（生产环境才注册，开发环境由插件跳过）
 * 2. 暴露 `needRefresh`：有新版本待应用
 * 3. 暴露 `applyUpdate()`：用户点了「立即更新」
 * 4. 暴露 `dismiss()`：用户选择「稍后」，本次会话不再提示
 *
 * 注意：浏览器不支持 SW 时所有状态保持 false，界面不显示提示，功能正常。
 */
import { onBeforeUnmount, ref } from 'vue'

/** 全局共享：多个组件同时使用时不重复注册 */
let shared = null

export function usePwaUpdate() {
  if (shared) return shared

  const needRefresh = ref(false)
  const offlineReady = ref(false)
  /** 用户选了「稍后」→ 本次会话不再提示 */
  const dismissed = ref(false)

  let updateSW = null
  let killWatch = null

  /**
   * 注册 SW。
   *
   * 延迟到「首屏渲染之后」再注册：注册本身会占用一点带宽与主线程，
   * 让它别和首屏抢资源。
   */
  async function register() {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    try {
      const mod = await import('virtual:pwa-register')
      const registerSW = mod.registerSW
      updateSW = registerSW({
        onNeedRefresh() {
          needRefresh.value = true
          dismissed.value = false
        },
        onOfflineReady() {
          offlineReady.value = true
        },
        onRegisteredSW(_url, registration) {
          // 定期检查更新（每小时一次）：应用常驻时也能发现新版本
          if (!registration) return
          const timer = setInterval(
            () => {
              registration.update().catch(() => {})
            },
            60 * 60 * 1000,
          )
          killWatch = () => clearInterval(timer)
        },
      })
    } catch {
      // 生产构建才生成 virtual 模块；开发环境或未启用时走这里，静默跳过
    }
  }

  /** 应用更新（会重载页面） */
  function applyUpdate() {
    needRefresh.value = false
    if (updateSW) {
      updateSW(true).catch(() => {})
    } else {
      // 兜底：没有 SW 更新器时直接重载
      window.location.reload()
    }
  }

  /** 稍后再说 */
  function dismiss() {
    dismissed.value = true
  }

  /** 是否要显示提示条 */
  const promptVisible = () => needRefresh.value && !dismissed.value

  shared = {
    needRefresh,
    offlineReady,
    dismissed,
    promptVisible,
    register,
    applyUpdate,
    dismiss,
    _stopWatch: () => killWatch && killWatch(),
  }

  onBeforeUnmount(() => {
    // 组件卸载不清除共享状态 —— 这个 composable 是应用级单例，
    // 定时器跟随应用生命周期
  })

  return shared
}
