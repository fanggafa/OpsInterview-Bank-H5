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

/**
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

  // 要加载哪些分类的 slug
  const targets = category
    ? [[category, manifestCache[category]]]
    : Object.entries(manifestCache)

  if (category && !manifestCache[category]) {
    throw new DataError(`未知分类：${category}`)
  }

  // 并行拉取所需分片
  const shards = await Promise.all(
    targets.filter(([, meta]) => meta).map(async ([cat, meta]) => {
      const rows = await fetchAnswerShard(meta.slug)
      return [cat, new Map(rows.map((r) => [r.id, r]))]
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
  constructor(message, cause) {
    super(message)
    this.name = 'DataError'
    this.cause = cause
  }
}
