/**
 * localStorage 封装：
 * - JSON 解析容错，脏数据回退默认值并清理
 * - 配额超限降级（写失败返回 false）
 * - 内存态 + ≥200ms 节流落盘，页面隐藏/卸载时强制 flush
 *
 * 所有 key 由调用方传入 constants.js 的 STORAGE_KEYS。
 */

const THROTTLE_MS = 200

/** key -> { value, timer } */
const pending = new Map()

/** 是否可用（隐私模式 / SSR 下 localStorage 不存在或抛错） */
export function isStorageAvailable() {
  try {
    if (typeof localStorage === 'undefined') return false
    const k = '__oi_probe__'
    localStorage.setItem(k, '1')
    localStorage.removeItem(k)
    return true
  } catch (e) {
    return false
  }
}

/** 判断是否为配额超限错误 */
export function isQuotaError(err) {
  if (!err) return false
  return (
    err.name === 'QuotaExceededError' ||
    err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    err.code === 22 ||
    err.code === 1014
  )
}

/**
 * 读取并解析。损坏/缺失/类型不符均返回 fallback，并把脏数据清理掉。
 * @param {string} key
 * @param {*} fallback
 * @param {(v:any)=>boolean} [validate] 类型守卫，返回 false 视为脏数据
 */
export function readJSON(key, fallback, validate) {
  if (!isStorageAvailable()) return clone(fallback)
  let raw = null
  try {
    raw = localStorage.getItem(key)
  } catch (e) {
    return clone(fallback)
  }
  if (raw === null || raw === '') return clone(fallback)

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch (e) {
    // JSON 损坏：清理脏数据后回退
    safeRemove(key)
    return clone(fallback)
  }

  if (validate && !validate(parsed)) {
    safeRemove(key)
    return clone(fallback)
  }
  return parsed
}

/**
 * 立即写入。失败（超限/不可用）返回 false，不抛异常。
 */
export function writeJSON(key, value) {
  if (!isStorageAvailable()) return false
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (err) {
    if (isQuotaError(err)) {
      // 降级：告警由上层消费 writeJSON 返回值处理
      return false
    }
    return false
  }
}

/**
 * 节流写入：同一 key 在 200ms 内多次调用只落盘最后一次。
 * @returns {boolean} 本次是否实际写入成功（延迟写入时为 true，表示已排队）
 */
export function writeJSONThrottled(key, value) {
  const entry = pending.get(key)
  if (entry) {
    clearTimeout(entry.timer)
    entry.value = value
    entry.timer = setTimeout(() => flushKey(key), THROTTLE_MS)
    return true
  }

  const timer = setTimeout(() => flushKey(key), THROTTLE_MS)
  pending.set(key, { value, timer })
  return true
}

function flushKey(key) {
  const entry = pending.get(key)
  if (!entry) return
  clearTimeout(entry.timer)
  pending.delete(key)
  writeJSON(key, entry.value)
}

/** 强制把所有排队中的数据落盘（页面隐藏/卸载时调用） */
export function flushAll() {
  for (const key of Array.from(pending.keys())) {
    flushKey(key)
  }
}

export function safeRemove(key) {
  try {
    localStorage.removeItem(key)
  } catch (e) {
    /* 忽略 */
  }
}

/** 深拷贝简单 JSON 值，避免 fallback 被改写 */
function clone(v) {
  if (v === null || typeof v !== 'object') return v
  try {
    return JSON.parse(JSON.stringify(v))
  } catch (e) {
    return v
  }
}

/** 注册页面隐藏/卸载时的强制落盘，返回解绑函数（便于测试与 HMR） */
export function bindFlushOnHide() {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return () => {}
  }
  const onHidden = () => {
    if (document.visibilityState === 'hidden') flushAll()
  }
  const onPageHide = () => flushAll()

  document.addEventListener('visibilitychange', onHidden)
  window.addEventListener('pagehide', onPageHide)

  return () => {
    document.removeEventListener('visibilitychange', onHidden)
    window.removeEventListener('pagehide', onPageHide)
  }
}

/** 仅测试用：清空节流队列，避免测试间串味 */
export function __resetPending() {
  for (const entry of pending.values()) clearTimeout(entry.timer)
  pending.clear()
}
