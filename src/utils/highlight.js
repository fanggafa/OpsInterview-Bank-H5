/**
 * 关键词高亮：把文本切成片段，标记出命中的部分。
 *
 * 为什么返回片段数组而不是 HTML 字符串：
 * 项目全链路**不使用 v-html**（题库内容可能含任意字符，用 HTML 拼接就有注入风险）。
 * 这里只产出「纯文本 + 是否命中」的结构，由模板用插值渲染成 <mark>，
 * 命中内容永远被当作文本处理，不可能变成标签。
 */

/**
 * 把关键词拆成可匹配的片段（按空白分隔，忽略空项）。
 *
 * @param {string} keyword
 * @returns {string[]} 去重后的小写关键词数组
 */
export function splitKeywords(keyword) {
  if (!keyword) return []
  const parts = String(keyword)
    .toLowerCase()
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
  return [...new Set(parts)]
}

/**
 * 将文本按命中位置切分。
 *
 * @param {string} text 原文本
 * @param {string} keyword 用户输入（可含多个空格分隔的关键词）
 * @returns {Array<{text: string, hit: boolean}>}
 *   按原顺序排列的片段；没有任何命中时返回单段（hit=false），
 *   便于调用方统一渲染、不必分支。
 */
export function highlightSegments(text, keyword) {
  const src = text === null || text === undefined ? '' : String(text)
  if (!src) return []

  const kws = splitKeywords(keyword)
  if (!kws.length) return [{ text: src, hit: false }]

  const lower = src.toLowerCase()

  // 收集所有命中区间（多个关键词可能重叠，需要合并）
  const ranges = []
  for (const kw of kws) {
    let from = 0
    while (from <= lower.length - kw.length) {
      const at = lower.indexOf(kw, from)
      if (at === -1) break
      ranges.push([at, at + kw.length])
      from = at + Math.max(1, kw.length)
    }
  }
  if (!ranges.length) return [{ text: src, hit: false }]

  // 按起点排序并合并重叠/相邻区间（相邻也合并，避免出现两个紧挨的 mark）
  ranges.sort((a, b) => a[0] - b[0])
  const merged = []
  for (const r of ranges) {
    const last = merged[merged.length - 1]
    if (last && r[0] <= last[1]) {
      last[1] = Math.max(last[1], r[1])
    } else {
      merged.push([r[0], r[1]])
    }
  }

  // 按区间切段
  const out = []
  let cursor = 0
  for (const [start, end] of merged) {
    if (start > cursor) out.push({ text: src.slice(cursor, start), hit: false })
    out.push({ text: src.slice(start, end), hit: true })
    cursor = end
  }
  if (cursor < src.length) out.push({ text: src.slice(cursor), hit: false })

  return out
}
