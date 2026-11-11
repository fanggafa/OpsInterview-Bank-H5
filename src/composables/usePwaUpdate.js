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

  /**
   * 应用更新（会重载页面）。
   *
   * **先亮起加载层再重载**：`updating` 立刻置真，弹窗收起、全屏动画出现，
   * 用户看到的是「正在准备」而不是「点了一下就白屏/卡死」。
   * 同时把标记写进 sessionStorage —— 重载后新实例读回它，继续显示加载层。
   */
  function applyUpdate() {
    needRefresh.value = false
    updatingSince = Date.now()
    updating.value = true
    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.setItem(UPDATING_KEY, String(updatingSince))
      } catch {
        /* 存储不可用时忽略：加载层在本次重载内仍会显示 */
      }
    }
    armUpdatingTimeout()

    if (updateSW) {
      // 留一点时间让加载层先画出来，再让 SW 接管（接管会触发重载）
      setTimeout(() => {
        updateSW(true).catch(() => {
          // SW 接管失败：别把用户困在加载层
          finishUpdating()
        })
      }, 260)
    } else {
      window.location.reload()
    }
  }

  /** 稍后再说 */
  function dismiss() {
    dismissed.value = true
  }

  /** 是否要显示提示条 */
  const promptVisible = () => needRefresh.value && !dismissed.value

  /**
   * 是否正在「更新中」—— 控制全屏加载动画。
   *
   * ## 为什么要有这一屏
   *
   * 用户反馈「每次更新完，立马使用会非常卡顿，页面切换、按钮点击都卡顿甚至无反应，
   * 过一阵子才正常」。除了把重活挪到空闲时段（见 `prewarmCache`），
   * 更直接的办法是：**点「立即更新」后，明确展示一屏加载动画**，
   * 让用户知道「正在准备，稍等」而不是「点了没反应」。
   *
   * ## 必须跨刷新存活
   *
   * `applyUpdate()` 会让 SW 接管并重载页面，`updating` 这个内存状态会随刷新丢失。
   * 所以用 `sessionStorage` 打标记：刷新后新的页面实例读回标记，
   * 继续展示加载层，直到应用真正就绪再淡出。
   */
  const UPDATING_KEY = 'oi_pwa_updating'
  /** 加载层最短展示时长：太短会闪一下，反而显得卡 */
  const MIN_SHOW_MS = 900
  /** 加载层最长展示时长：兜底，避免异常时永远转圈 */
  const MAX_SHOW_MS = 12000

  const updating = ref(false)
  let updatingSince = 0

  /** 读回「上次是否点了更新」（刷新后继续展示加载层） */
  function restoreUpdatingFlag() {
    if (typeof sessionStorage === 'undefined') return false
    try {
      const raw = sessionStorage.getItem(UPDATING_KEY)
      if (!raw) return false
      const at = Number(raw)
      // 超过 2 分钟的标记视为失效（用户可能中途关掉了页面）
      if (!Number.isFinite(at) || Date.now() - at > 2 * 60 * 1000) {
        sessionStorage.removeItem(UPDATING_KEY)
        return false
      }
      updatingSince = at
      updating.value = true
      return true
    } catch {
      return false
    }
  }

  /** 结束更新态（加载层淡出） */
  function finishUpdating() {
    updating.value = false
    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.removeItem(UPDATING_KEY)
      } catch {
        /* 存储不可用时忽略 */
      }
    }
  }

  /**
   * 应用就绪后调用：确保加载层至少停留 `MIN_SHOW_MS`，避免一闪而过。
   * 由 `App.vue` 在挂载完成 + 首屏数据就绪后触发。
   */
  function markReady() {
    if (!updating.value) return
    const shown = Date.now() - (updatingSince || Date.now())
    const wait = Math.max(0, MIN_SHOW_MS - shown)
    setTimeout(finishUpdating, wait)
  }

  /** 兜底：无论如何不超过 MAX_SHOW_MS */
  function armUpdatingTimeout() {
    if (!updating.value) return
    setTimeout(() => {
      if (updating.value) finishUpdating()
    }, MAX_SHOW_MS)
  }

  /**
   * 空闲时**分批预热答案分片**到 SW 缓存。
   *
   * ## 为什么需要它
   *
   * 答案分片（34 个、共 4.37 MB）已从 precache 移出、改走 `CacheFirst` 运行时缓存。
   * 但产品的核心承诺是「装好之后全程离线可刷」，如果只靠用户点开才有缓存，
   * 那些没打开过的分类在离线时就没有答案。
   *
   * 所以这里主动把分片「喂」给 SW 的运行时缓存 —— 关键差别是**时机**：
   * 不再由 SW 安装时一口气吞下 4.37 MB（那会把发版后的头几十秒卡死），
   * 而是等页面空闲、且用户没有正在进行的手势/输入时，逐个 fetch。
   *
   * ## 几个刻意的细节
   *
   * - **用 `requestIdleCallback`**：把工作排到浏览器空闲帧；不支持时退回 `setTimeout`
   * - **一次只取一个，取完再排下一次**：并发会让带宽和主线程一起打满
   * - **`requestIdleCallback` 的 timeout 给 3 秒**：极端情况下（一直忙）也能推进，
   *   不至于永远不预热；配合「一次一个」不会造成明显卡顿
   * - **失败静默跳过**：预热是锦上添花，不能因为它报错而影响正常使用
   * - **只跑一次**：用 `prewarmed` 标记，避免路由切换时重复触发
   *
   * @returns {Promise<void>}
   */
  let prewarmed = false

  async function prewarmCache() {
    if (prewarmed) return
    if (typeof window === 'undefined' || typeof fetch !== 'function') return
    if (!('serviceWorker' in navigator)) return

    /**
     * **必须由 SW 控制本页面才能预热**（`navigator.serviceWorker.controller` 非空）。
     *
     * 这里踩过一个关键坑：我们配了 `clientsClaim: false`（配合 prompt 模式，
     * 不让 SW 抢行接管当前页面）。后果是**首次访问时 controller 恒为 null** ——
     * 这次页面会话的所有 fetch 都**不经过 SW**，运行时缓存规则形同虚设。
     *
     * 实测证据（生产构建、全新浏览器上下文）：
     * - SW 已 `activated`、`getRegistration()` 有值，但 `controller === false`
     * - 手动 `fetch('/data/answers/dns.json')` 返回 200，可 `answers-shards`
     *   缓存区始终不出现、分片数恒为 0
     *
     * 所以正确的时机是**下一次页面加载**：那时页面已由 SW 接管，fetch 才会命中
     * `runtimeCaching` 规则。首访这次直接返回，等下次进来再预热。
     *
     * 这也是为什么 `main.js` 里延迟 2 秒调用它 —— 用户通常不会只开一次页面。
     */
    if (!navigator.serviceWorker.controller) return

    prewarmed = true

    /** 空闲调度：优先 requestIdleCallback，退化为 setTimeout */
    const idle = (fn) => {
      if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(fn, { timeout: 3000 })
      } else {
        setTimeout(fn, 300)
      }
    }

    let shards = []
    try {
      const base = import.meta.env.BASE_URL || '/'
      /**
       * 分片清单的真实路径与结构：
       * `data/answers/manifest.json` → `{ 分类名: { slugs: ['a.json', ...] } }`。
       * 大分类会被拆成多片，所以要摊平所有 `slugs`。
       */
      const res = await fetch(`${base}data/answers/manifest.json`)
      if (!res.ok) return
      const manifest = await res.json()
      const slugs = Object.values(manifest || {}).flatMap((meta) => {
        if (!meta) return []
        if (Array.isArray(meta.slugs)) return meta.slugs
        return meta.slug ? [meta.slug] : []
      })
      shards = [...new Set(slugs)]
    } catch {
      return
    }
    if (!shards.length) return

    let i = 0
    const step = () => {
      if (i >= shards.length) return
      const slug = shards[i++]
      const base = import.meta.env.BASE_URL || '/'
      /**
       * **必须补 `.json` 后缀**：manifest 里的 `slugs` 是 `dns` 这种裸名
       * （不带扩展名）。而 `runtimeCaching` 的 `urlPattern` 是
       * `/\/data\/answers\/.*\.json$/`，只匹配 `.json` 结尾的 URL。
       *
       * 早先这里直接拼 `${slug}`，请求的是 `/data/answers/dns` ——
       * 服务器虽然也返回 200（静态托管会兜底），但**不匹配缓存规则**，
       * 于是 SW 直接放行、分片根本没进缓存。
       *
       * 实测症状：发出去了 34 个分片请求，`answers-shards` 里却只有
       * `manifest.json` 一条（它是带后缀的，恰好匹配）。
       */
      fetch(`${base}data/answers/${slug}.json`, { cache: 'no-store' })
        .catch(() => {})
        .finally(() => idle(step))
    }
    idle(step)
  }

  shared = {
    needRefresh,
    offlineReady,
    dismissed,
    promptVisible,
    register,
    applyUpdate,
    dismiss,
    prewarmCache,
    // 更新加载层
    updating,
    restoreUpdatingFlag,
    markReady,
    armUpdatingTimeout,
    finishUpdating,
    _stopWatch: () => killWatch && killWatch(),
  }

  onBeforeUnmount(() => {
    // 组件卸载不清除共享状态 —— 这个 composable 是应用级单例，
    // 定时器跟随应用生命周期
  })

  return shared
}
