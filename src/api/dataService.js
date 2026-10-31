/**
 * 题库数据服务：运行时只加载「分片数据」，不再请求 4.3 MB 的 questions.json。
 *
 * 两套接口：
 *   - fetchIndex()           列表页索引（gzip 约 121 KB，是全量 1455 KB 的 8%）
 *   - fetchAnswerShard(slug) 按分类拉答案分片（最大 gzip 85 KB）
 *   - hydrateAnswers()       把答案合并进索引行，得到完整题目对象
 *   - fetchAllSharded()      索引 + 全部分片（等价于旧的「一次拉全量」）
 *
 * 分片由 `npm run split:data` 生成（见 scripts/split-data.mjs）。
 *
 * 注意：`public/data/questions.json` 仍留在仓库里，但它是**编辑期数据源**
 * （merge-batch / fig.mjs / 各 check 脚本都读它），构建时会被剔除，不部署。
 *
 * P2 TODO（未实现，扩展点已预留）：
 * 1. 云同步 / 登录：把 fetchIndex/hydrateAnswers 换成远程接口，上层 store 无需改动。
 * 2. 每日一题：可在此加 dailyQuestion(date)，以日期为种子从题库取样（无需后端）。
 * 3. 离线 / PWA：接入 vite-plugin-pwa 后，本文件的 fetch 会被 Service Worker 缓存拦截。
 */

const BASE = import.meta.env.BASE_URL
const INDEX_URL = `${BASE}data/questions-index.json`
const ANSWERS_DIR = `${BASE}data/answers`

/**
 * 单次请求的超时预算。
 *
 * 选 15 秒的依据：索引在 gzip 后只有 121 KB，4G 弱网（约 100 KB/s）约 1.2 秒，
 * 2G/极弱网（约 20 KB/s）约 6 秒 —— 留一倍余量取 15 秒。
 * 超过这个时间基本可以判定「网络卡死」而不是「慢」，继续等没有意义，
 * 不如快速失败让用户看到重试入口。
 */
export const REQUEST_TIMEOUT_MS = 15000

/**
 * 带超时的 JSON 请求。
 *
 * 为什么要超时：浏览器原生 fetch **没有超时**（默认等到天荒地老）。
 * 弱网或中间设备挂住时会一直转圈，用户既看不到错误也用不上重试按钮。
 *
 * 用 AbortController 主动中断，并把中断包装成可重试的错误。
 *
 * @param {string} url
 * @param {string} label 用于错误文案（如「题库索引」）
 * @param {number} timeoutMs
 * @returns {Promise<any>} 解析后的 JSON
 */
async function fetchJSON(url, label, timeoutMs = REQUEST_TIMEOUT_MS) {
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null
  const timer = ctrl
    ? setTimeout(() => ctrl.abort(), timeoutMs)
    : null

  let res
  try {
    res = await fetch(url, {
      cache: 'no-cache',
      ...(ctrl ? { signal: ctrl.signal } : {}),
    })
  } catch (err) {
    // 中断 → 超时；其他 → 网络异常。两者都可重试
    const aborted = err && (err.name === 'AbortError' || err.code === 20)
    if (aborted) {
      throw new DataError(
        `${label}请求超时（超过 ${Math.round(timeoutMs / 1000)} 秒），请检查网络后重试`,
        err,
        { retryable: true, timeout: true },
      )
    }
    throw new DataError(`网络异常，无法加载${label}`, err, { retryable: true })
  } finally {
    if (timer) clearTimeout(timer)
  }

  if (!res.ok) {
    // 5xx / 429 通常是临时故障 → 可重试；4xx（除 408/429）重试无意义
    const retryable = res.status >= 500 || res.status === 408 || res.status === 429
    throw new DataError(`${label}加载失败（HTTP ${res.status}）`, undefined, { retryable })
  }

  try {
    return await res.json()
  } catch (err) {
    // 解析失败说明拿到的不是预期数据，重试通常无效
    throw new DataError(`${label}格式错误，无法解析`, err, { retryable: false })
  }
}

/** 索引缓存（分片方案的列表数据） */
let indexCache = null
/** 分片缓存：slug -> 答案行数组 */
const shardCache = new Map()
/** 分片清单缓存（分类 → slug 映射） */
let manifestCache = null
/** 全量（索引 + 全部答案）缓存 */
let allCache = null

/** 清空缓存（题目更新或重试时使用） */
export function clearCache() {
  indexCache = null
  allCache = null
  manifestCache = null
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

  const rows = await fetchJSON(INDEX_URL, '题库索引')
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new DataError('题库索引为空，请先运行 npm run split:data', undefined, {
      retryable: false,
    })
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

  const rows = await fetchJSON(`${ANSWERS_DIR}/${slug}.json`, `「${slug}」答案分片`)
  if (!Array.isArray(rows)) {
    throw new DataError(`答案分片格式错误：${slug}`, undefined, { retryable: false })
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
  return fetchJSON(`${ANSWERS_DIR}/manifest.json`, '分片清单')
}

/**
 * 按分类加载答案，并把答案合并进索引行 —— 返回**完整的题目对象**。
 *
 * 这是切换分片方案的核心入口：调用方拿到的东西与原来 `fetchQuestions()`
 * 返回的数组元素结构完全一样（含 answer / explanation / options），
 * 所以视图层不用改。
 *
 * @param {Array} indexRows fetchIndex() 的结果
 * @param {string} category 分类名（空字符串 = 加载全部分类）
 * @returns {Promise<Array>} 合并了答案的完整题目数组
 */
export async function hydrateAnswers(indexRows, category = '') {
  if (!manifestCache) manifestCache = await fetchAnswersManifest()

  // 要加载哪些分类的 slug（manifest 里是 slugs 数组，大分类会被拆成多片）
  const targets = category
    ? [[category, manifestCache[category]]]
    : Object.entries(manifestCache)

  if (category && !manifestCache[category]) {
    throw new DataError(`未知分类：${category}`)
  }

  // 并行拉取所需分片（每个分类可能有多个份片）
  const shards = await Promise.all(
    targets
      .filter(([, meta]) => meta)
      .map(async ([cat, meta]) => {
        const slugs = Array.isArray(meta.slugs) ? meta.slugs : [meta.slug]
        const parts = await Promise.all(slugs.map((s) => fetchAnswerShard(s)))
        const merged = new Map()
        for (const rows of parts) for (const r of rows) merged.set(r.id, r)
        return [cat, merged]
      }),
  )

  const byCat = new Map(shards)
  return indexRows.map((row) => {
    const m = byCat.get(row.category)
    const ans = m && m.get(row.id)
    if (!ans) return row
    const full = { ...row, answer: ans.answer }
    if (ans.explanation) full.explanation = ans.explanation
    if (ans.options) full.options = ans.options
    return full
  })
}

/**
 * 一次性加载「索引 + 全部答案」，语义等价于旧的「一次拉全量」。
 *
 * 主要用于：刷题/复习这类需要跨分类抽题、且立刻要用答案的场景。
 */
export async function fetchAllSharded({ force = false } = {}) {
  if (allCache && !force) return allCache
  const idx = await fetchIndex({ force })
  allCache = await hydrateAnswers(idx)
  return allCache
}

export class DataError extends Error {
  /**
   * @param {string} message 给用户看的文案
   * @param {unknown} cause 原始错误
   * @param {{retryable?: boolean, timeout?: boolean}} meta
   *   retryable：重试是否可能有用（网络/超时/5xx 为 true，解析失败/4xx 为 false）
   *   timeout：是否由超时中断导致（界面可据此提示「网络较慢」）
   */
  constructor(message, cause, meta = {}) {
    super(message)
    this.name = 'DataError'
    this.cause = cause
    this.retryable = meta.retryable !== false
    this.timeout = Boolean(meta.timeout)
  }
}
