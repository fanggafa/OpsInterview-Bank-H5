import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * 编号区间守卫。
 *
 * 题库按分类分段编号，每类 500 个位置。这些规则散落在三处，容易不同步：
 *   1. `scripts/merge-batch.mjs` 的 `ID_RANGES`（合并时校验）
 *   2. `scripts/reid-ranges.mjs` 的 `NEW`（重排脚本）
 *   3. `docs/question-authoring.md` 的「分类与编号段」表格（文档）
 *
 * 本测试保证三者一致，并且「实际题库里每道题都在其分类区间内」。
 * 这样有人改了区间却忘了同步时，CI 会直接拦住。
 */

const SRC = resolve(__dirname, '../scripts/merge-batch.mjs')
const REID = resolve(__dirname, '../scripts/reid-ranges.mjs')
/**
 * 编号段文档表格：2026-11 文档重构时从 README 移到了 question-authoring。
 * 守卫的意图不变 —— 防止「改了区间却忘了同步文档」。
 */
const DOC = resolve(__dirname, '../docs/question-authoring.md')
const BANK = resolve(__dirname, '../public/data/questions.json')

/**
 * 从源码里解析出区间表（不执行脚本，避免副作用）。
 *
 * 支持两种 key 写法：
 * - 带引号：`'Linux 基础': [8500, 8999]`（含空格/斜杠的分类必须加引号）
 * - 不带引号：`Kubernetes: [10000, 10499]`
 *
 * ⚠️ 未加引号的分支必须允许**空格** —— 2026-11 分类名改为
 * 「Linux 基础」「Shell 脚本」这类含空格的形式后，旧正则
 * `[A-Za-z一-龥/]+` 匹配不到，导致区间表解析为空、
 * 整个题库被判「没有区间定义」。
 */
function parseRanges(source, pattern) {
  const start = source.indexOf('export const ' + pattern)
  if (start < 0) return {}

  /**
   * 不能简单地 `indexOf('}')` 截断 —— 区间表的注释里也含 `}`
   * （例如「{ a: 1 }」这类说明），会在注释处提前结束，后面的分类全丢。
   *
   * 这里从 `{` 开始做**括号配对**，跳过注释与字符串，找到真正的闭合位置。
   */
  const braceStart = source.indexOf('{', start)
  if (braceStart < 0) return {}

  let depth = 0
  let end = -1
  let inLineComment = false
  let inBlockComment = false
  let inString = null

  for (let i = braceStart; i < source.length; i++) {
    const ch = source[i]
    const next = source[i + 1]

    if (inLineComment) {
      if (ch === '\n') inLineComment = false
      continue
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false
        i++
      }
      continue
    }
    if (inString) {
      if (ch === '\\') {
        i++
        continue
      }
      if (ch === inString) inString = null
      continue
    }

    if (ch === '/' && next === '/') {
      inLineComment = true
      i++
      continue
    }
    if (ch === '/' && next === '*') {
      inBlockComment = true
      i++
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      inString = ch
      continue
    }

    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) {
        end = i
        break
      }
    }
  }

  const body = source.slice(braceStart, end < 0 ? source.length : end + 1)
  const out = {}

  /**
   * ⚠️ 未加引号分支里**只能用字面空格 ` `，不能用 `\s`**。
   *
   * `\s` 会匹配换行 —— 一旦某行末尾换行，正则就能跨越行边界、
   * 把后面注释里的 `/` 和下一个条目一起吞掉，导致解析结果出现
   * 形如 `/\n  可观测性` 的脏 key、真正的条目丢失。
   *
   * 分类名中间的空格都是普通空格，用 ` ` 足够。
   */
  const re =
    /(?:'([^']+)'|([A-Za-z\u4e00-\u9fa5/][A-Za-z\u4e00-\u9fa5/ ]*?)):[ \t]*\[[ \t]*(\d+)[ \t]*,[ \t]*(\d+)[ \t]*\]/g
  for (const m of body.matchAll(re)) {
    const key = (m[1] || m[2] || '').trim()
    if (key) out[key] = [Number(m[3]), Number(m[4])]
  }
  return out
}

const mergeSrc = readFileSync(SRC, 'utf8')
const reidSrc = readFileSync(REID, 'utf8')
const doc = readFileSync(DOC, 'utf8')
const bank = JSON.parse(readFileSync(BANK, 'utf8'))

const mergeRanges = parseRanges(mergeSrc, 'ID_RANGES')

describe('编号区间守卫', () => {
  it('每个分类的区间正好 500 个位置', () => {
    for (const [cat, [lo, hi]] of Object.entries(mergeRanges)) {
      expect(hi - lo + 1, `${cat} 区间应为 500`).toBe(500)
    }
  })

  it('题库里每道题都落在其分类的区间内', () => {
    const bad = []
    for (const q of bank) {
      const r = mergeRanges[q.category]
      if (!r) {
        bad.push(`${q.id} 分类「${q.category}」没有区间定义`)
        continue
      }
      if (q.id < r[0] || q.id > r[1]) bad.push(`${q.id}（${q.category}）不在 ${r[0]}-${r[1]}`)
    }
    expect(bad).toEqual([])
  })

  it('同一分类内的 id 不重复', () => {
    const seen = new Map()
    const dup = []
    for (const q of bank) {
      if (seen.has(q.id)) dup.push(q.id)
      seen.set(q.id, true)
    }
    expect(dup).toEqual([])
  })

  it('question-authoring 的编号段表格与 ID_RANGES 一致', () => {
    // 表格里每行形如：| 分类名 | 1000 – 1499 | 分类名 | 2000 – 2499 |
    const mismatch = []
    for (const [cat, [lo, hi]] of Object.entries(mergeRanges)) {
      const escaped = cat.replace(/[/\\^$*+?.()|[\]{}]/g, '\\$&')
      const re = new RegExp(`\\| (?:\\*\\*)?${escaped}(?:\\*\\*)? \\| (?:\\*\\*)?(\\d+)\\s*–\\s*(\\d+)`, 'u')
      const m = doc.match(re)
      if (!m) {
        mismatch.push(`${cat} 未出现在 question-authoring 的编号段表格里`)
        continue
      }
      if (Number(m[1]) !== lo || Number(m[2]) !== hi) {
        mismatch.push(`${cat} 文档写的是 ${m[1]}-${m[2]}，实际是 ${lo}-${hi}`)
      }
    }
    expect(mismatch).toEqual([])
  })

  it('重排脚本的 NEW 区间与 ID_RANGES 起点一致', () => {
    // reid-ranges.mjs 的 NEW 是「分类: 起点」
    const body = reidSrc.slice(reidSrc.indexOf('const NEW = {'), reidSrc.indexOf('}', reidSrc.indexOf('const NEW = {')))
    const mismatch = []
    for (const m of body.matchAll(/(?:'([^']+)'|([A-Za-z一-龥/]+)):\s*(\d+)/g)) {
      const key = m[1] || m[2]
      const start = Number(m[3])
      if (mergeRanges[key] && mergeRanges[key][0] !== start) {
        mismatch.push(`${key} 重排起点 ${start} ≠ ID_RANGES ${mergeRanges[key][0]}`)
      }
    }
    expect(mismatch).toEqual([])
  })
})
