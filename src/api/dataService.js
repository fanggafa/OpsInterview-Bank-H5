/**
 * 题库数据服务：加载 public/data/questions.json，带缓存与错误包装。
 *
 * 另外提供「分片加载」的一套接口（索引 + 按分类取答案），用于减小首屏体积：
 *   - fetchIndex()           只拉列表页需要的字段（gzip 119 KB，是全量 1455 KB 的 8%）
 *   - fetchAnswerShard(cat)  按分类拉答案分片（最大 gzip 85 KB）
 *
 * 分片由 `npm run split:data` 生成（见 scripts/split-data.mjs）。
 * 目前**尚未切换**使用分片 —— 仍走单文件加载，切换是独立的后续改动。
 *
 * P2 TODO（未实现，扩展点已预留）：
 * 1. 云同步 / 登录：把 fetchQuestions 换成远程接口，上层 bankStore / studyStore 无需改动。
 * 2. 每日一题：可在此加 dailyQuestion(date)，以日期为种子从题库取样（无需后端）。
 * 3. 离线 / PWA：接入 vite-plugin-pwa 后，本文件的 fetch 会被 Service Worker 缓存拦截。
 */

const BASE = import.meta.env.BASE_URL
const DATA_URL = `${BASE}data/questions.json`
const INDEX_URL = `${BASE}data/questions-index.json`
const ANSWERS_DIR = `${BASE}data/answers`

/** 内存缓存，避免重复请求 */
let cache = null
/** 索引缓存（分片方案的列表数据） */
let indexCache = null
/** 分片缓存：slug -> 答案行数组 */
const shardCache = new Map()

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
  indexCache = null
  shardCache.clear()
}

/**
 * 拉取列表页索引（分片方案用）。
 *
 * 返回字段是压缩过的短名，这里还原成与题库一致的字段名，
 * 让上层代码不用关心存储格式：
 *   i→id  t→type  c→category  d→difficulty  f→frequency  q→question  g→tags
 *
 * @returns {Promise<Array<{id:number, type:string, category:string,
 *   difficulty:string, frequency:string, question:string, tags:string[]}>>}
 */
export async function fetchIndex({ force = false } = {}) {
  if (indexCache && !force) return indexCache

  let res
  try {
    res = await fetch(INDEX_URL, { cache: 'no-cache' })
  } catch (err) {
    throw new DataError('网络异常，无法加载题库索引', err)
  }
  if (!res.ok) {
    throw new DataError(`题库索引加载失败（HTTP ${res.status}）`)
  }

  let rows
  try {
    rows = await res.json()
  } catch (err) {
    throw new DataError('题库索引格式错误，无法解析', err)
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new DataError('题库索引为空，请先运行 npm run split:data')
  }

  indexCache = rows.map((r) => ({
    id: r.i,
    type: r.t,
    category: r.c,
    difficulty: r.d,
    frequency: r.f,
    question: r.q,
    tags: r.g || [],
  }))
  return indexCache
}

/**
 * 按分类 slug 拉取答案分片。
 *
 * @param {string} slug 分类 slug（见 public/data/answers/manifest.json）
 * @returns {Promise<Array<{id:number, answer:string|string[], explanation?:string, options?:Array}>>}
 */
export async function fetchAnswerShard(slug) {
  if (shardCache.has(slug)) return shardCache.get(slug)

  const url = `${ANSWERS_DIR}/${slug}.json`
  let res
  try {
    res = await fetch(url, { cache: 'no-cache' })
  } catch (err) {
    throw new DataError(`网络异常，无法加载「${slug}」的答案分片`, err)
  }
  if (!res.ok) {
    throw new DataError(`答案分片加载失败（HTTP ${res.status}）：${slug}`)
  }

  let rows
  try {
    rows = await res.json()
  } catch (err) {
    throw new DataError(`答案分片格式错误：${slug}`, err)
  }

  const out = rows.map((r) => ({
    id: r.i,
    answer: r.a,
    ...(r.e ? { explanation: r.e } : {}),
    ...(r.o ? { options: r.o } : {}),
  }))
  shardCache.set(slug, out)
  return out
}

/** 拉取分类 → slug 的映射表 */
export async function fetchAnswersManifest() {
  let res
  try {
    res = await fetch(`${ANSWERS_DIR}/manifest.json`, { cache: 'no-cache' })
  } catch (err) {
    throw new DataError('网络异常，无法加载分片清单', err)
  }
  if (!res.ok) throw new DataError(`分片清单加载失败（HTTP ${res.status}）`)
  return res.json()
}

export class DataError extends Error {
  constructor(message, cause) {
    super(message)
    this.name = 'DataError'
    this.cause = cause
  }
}
