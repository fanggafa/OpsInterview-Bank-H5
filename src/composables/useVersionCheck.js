/**
 * 远端版本探测：判断「服务器上是不是已经有比我更新的版本」。
 *
 * ## 解决的问题
 *
 * 2026-11 的真实困境：用户设备上装着旧 SW、题库停在 2892 题，
 * 但**他完全不知道自己该更新** ——
 *
 * - `registerType: 'prompt'` 的弹窗只在「新版 SW 已装好、进入 waiting」时出现
 * - 旧 SW 是否去检查、多久检查一次，用户完全无感
 * - 即便弹出，用户可能点了「稍后」，本次会话就再也不提示
 *
 * 所以需要一个**独立于 SW 生命周期的探针**：
 * 定期 fetch `data/version.json`（NetworkOnly，永不缓存），
 * 比对 `sha` 与当前运行的版本。
 *
 * ## 三态结果
 *
 * | 结果 | 含义 | UI 表现 |
 * |---|---|---|
 * | `latest` | 与服务器一致 | 什么都不显示 |
 * | `stale` | 服务器更新 | **首页顶部挂横幅**（可点击更新） |
 * | `unknown` | 拿不到版本文件 | 什么都不显示（**不能误报**） |
 *
 * `unknown` 必须静默：离线、网络抖动、文件 404（老版本部署没有这文件）都会走这里。
 * 把「拿不到」当成「有新版」会天天骚扰用户。
 */
import { ref } from 'vue'
import { APP_SHA } from '@/utils/version'

/** 探测结果：'latest' | 'stale' | 'unknown' */
const remoteState = ref('unknown')

/** 服务器上的版本信息（拿到才有值） */
const remoteInfo = ref(null)

/**
 * 检查间隔：5 分钟。
 *
 * 为什么不是每小时：旧方案每小时检查一次，用户发版后要等一小时才知道，
 * 期间一直用着有问题（甚至永久停在旧题库）的版本。
 * 5 分钟对流量几乎没有影响（一个 <200 字节的 JSON），但感知快得多。
 */
const CHECK_INTERVAL = 5 * 60 * 1000

let timer = null
let started = false

/**
 * 探测一次远端版本。
 *
 * `cache: 'no-store'` 是**双重保险**：
 * ① SW 侧有 NetworkOnly 规则；
 * ② 即便某条规则没生效，浏览器 HTTP 缓存也不会命中。
 */
async function probe() {
  try {
    const base = import.meta.env.BASE_URL || '/'
    const res = await fetch(`${base}data/version.json?t=${Date.now()}`, {
      cache: 'no-store',
    })
    if (!res.ok) {
      remoteState.value = 'unknown'
      return
    }
    const info = await res.json()
    if (!info || typeof info.sha !== 'string') {
      remoteState.value = 'unknown'
      return
    }
    remoteInfo.value = info

    /**
     * 比较 sha。
     *
     * 用 `sha` 而不是 `version`：版本号是人工维护的，改 bug 不升版本，
     * 同一版本号下会有多个 sha；只有 sha 能精确判断「是否同一次构建」。
     *
     * `APP_SHA` 为 `unknown` / `dev`（本地开发、无 git 环境）时不参与判断，
     * 否则本地开发会永远显示「有新版本」。
     */
    if (!APP_SHA || APP_SHA === 'unknown' || APP_SHA === 'dev') {
      remoteState.value = 'unknown'
      return
    }
    remoteState.value = info.sha === APP_SHA ? 'latest' : 'stale'
  } catch {
    remoteState.value = 'unknown'
  }
}

/** 启动周期探测（幂等：多次调用只启一个定时器） */
function startWatching() {
  if (started) return
  started = true
  probe()
  timer = setInterval(probe, CHECK_INTERVAL)
}

/** 停止（测试用） */
function stopWatching() {
  if (timer) clearInterval(timer)
  timer = null
  started = false
}

export function useVersionCheck() {
  return {
    remoteState,
    remoteInfo,
    probe,
    startWatching,
    stopWatching,
    CHECK_INTERVAL,
  }
}
