/**
 * 题库数据服务：加载 public/data/questions.json，带缓存与错误包装。
 *
 * P2 TODO（未实现，扩展点已预留）：
 * 1. 云同步 / 登录：把 fetchQuestions 换成远程接口，上层 bankStore / studyStore 无需改动。
 * 2. 每日一题：可在此加 dailyQuestion(date)，以日期为种子从题库取样（无需后端）。
 * 3. 离线 / PWA：接入 vite-plugin-pwa 后，本文件的 fetch 会被 Service Worker 缓存拦截。
 */

const DATA_URL = `${import.meta.env.BASE_URL}data/questions.json`

/** 内存缓存，避免重复请求 */
let cache = null

/** 页面刷新后重新请求，但同一次会话内只拉一次 */
export async function fetchQuestions({ force = false } = {}) {
  if (cache && !force) return cache

  let res
  try {
    res = await fetch(DATA_URL, { cache: 'no-cache' })
  } catch (err) {
    throw new DataError('网络异常，无法加载题库', err)
  }

  if (!res.ok) {
    throw new DataError(`题库加载失败（HTTP ${res.status}）`)
  }

  let data
  try {
    data = await res.json()
  } catch (err) {
    throw new DataError('题库数据格式错误，无法解析', err)
  }

  if (!Array.isArray(data)) {
    throw new DataError('题库数据格式错误：顶层应为数组')
  }
  if (data.length === 0) {
    throw new DataError('题库为空，请检查 data/questions.json')
  }

  cache = data
  return data
}

/** 清空缓存（题目更新或重试时使用） */
export function clearCache() {
  cache = null
}

export class DataError extends Error {
  constructor(message, cause) {
    super(message)
    this.name = 'DataError'
    this.cause = cause
  }
}
