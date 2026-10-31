import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * 编号区间守卫。
 *
 * 题库按分类分段编号，每类 500 个位置。这些规则散落在三处，容易不同步：
 *   1. `scripts/merge-batch.mjs` 的 `ID_RANGES`（合并时校验）
 *   2. `scripts/reid-ranges.mjs` 的 `NEW`（重排脚本）
 *   3. README 的「分类与编号段」表格（文档）
 *
 * 本测试保证三者一致，并且「实际题库里每道题都在其分类区间内」。
 * 这样有人改了区间却忘了同步时，CI 会直接拦住。
 */

const SRC = resolve(__dirname, '../scripts/merge-batch.mjs')
const REID = resolve(__dirname, '../scripts/reid-ranges.mjs')
const README = resolve(__dirname, '../README.md')
const BANK = resolve(__dirname, '../public/data/questions.json')

/** 从源码里解析出区间表（不执行脚本，避免副作用） */
function parseRanges(source, pattern) {
  const body = source.slice(source.indexOf('export const ' + pattern), source.indexOf('}', source.indexOf('export const ' + pattern)))
  const out = {}
  for (const m of body.matchAll(/(?:'([^']+)'|([A-Za-z一-龥/]+)):\s*\[\s*(\d+)\s*,\s*(\d+)\s*\]/g)) {
    const key = m[1] || m[2]
    out[key] = [Number(m[3]), Number(m[4])]
  }
  return out
}

const mergeSrc = readFileSync(SRC, 'utf8')
const reidSrc = readFileSync(REID, 'utf8')
const readme = readFileSync(README, 'utf8')
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

  it('README 的编号段表格与 ID_RANGES 一致', () => {
    // 表格里每行形如：| 分类名 | 1000 – 1499 | 分类名 | 2000 – 2499 |
    const mismatch = []
    for (const [cat, [lo, hi]] of Object.entries(mergeRanges)) {
      const escaped = cat.replace(/[/\\^$*+?.()|[\]{}]/g, '\\$&')
      const re = new RegExp(`\\| (?:\\*\\*)?${escaped}(?:\\*\\*)? \\| (?:\\*\\*)?(\\d+)\\s*–\\s*(\\d+)`, 'u')
      const m = readme.match(re)
      if (!m) {
        mismatch.push(`${cat} 未出现在 README 表格里`)
        continue
      }
      if (Number(m[1]) !== lo || Number(m[2]) !== hi) {
        mismatch.push(`${cat} README 写的是 ${m[1]}-${m[2]}，实际是 ${lo}-${hi}`)
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
