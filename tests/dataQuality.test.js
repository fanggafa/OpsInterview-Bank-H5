import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * 题库数据质量守卫。
 *
 * 两类问题都是用户实际反馈过的：
 * 1. **答案偏 A**：修复前单选题 63.3% 答案是 A（1089/1720），正常应约 25%。
 *    用户只需一直选 A 就有六成正确率，题目失去区分度。
 * 2. **解析不分段**：873 道解析是单行长文本（706 道单行超 200 字），
 *    要点用 `①②③` 或 `；` 挤在同一段里，手机上根本没法读。
 *
 * 这里的断言是「不能明显退化」的底线，不是精确值 ——
 * 加新题会自然波动，但不能回到偏 A 的老样子。
 */

const DATA = JSON.parse(
  readFileSync(resolve(__dirname, '../public/data/questions.json'), 'utf8'),
)
const list = Array.isArray(DATA) ? DATA : DATA.items || DATA.questions || []
const choice = list.filter((q) => q.type === 'single' || q.type === 'multiple')
const singles = list.filter((q) => q.type === 'single')

describe('题库质量 · 答案分布不能偏 A', () => {
  it('单选题 A 的占比不超过 35%（修复前是 63%）', () => {
    const aCount = singles.filter((q) => (q.answer || [])[0] === 'A').length
    const ratio = aCount / singles.length
    expect(ratio).toBeLessThan(0.35)
  })

  it('单选题四个选项都有人当答案（没有空洞）', () => {
    for (const k of ['A', 'B', 'C', 'D']) {
      const n = singles.filter((q) => (q.answer || [])[0] === k).length
      expect(n).toBeGreaterThan(0)
    }
  })

  it('单选题各选项占比都在 15%~35% 之间（分布均衡）', () => {
    for (const k of ['A', 'B', 'C', 'D']) {
      const n = singles.filter((q) => (q.answer || [])[0] === k).length
      const ratio = n / singles.length
      expect(ratio).toBeGreaterThan(0.15)
      expect(ratio).toBeLessThan(0.35)
    }
  })

  it('多选答案按选项顺序排列（A,B,C 而不是 A,C,B）', () => {
    let unsorted = 0
    for (const q of choice) {
      const keys = (q.options || []).map((o) => o.key)
      const pos = (q.answer || []).map((k) => keys.indexOf(k))
      if (pos.some((p) => p < 0)) continue
      if (pos.join(',') !== [...pos].sort((a, b) => a - b).join(',')) unsorted++
    }
    expect(unsorted).toBe(0)
  })

  it('答案都能对应到实际选项（打散选项后不会悬空）', () => {
    let bad = 0
    for (const q of choice) {
      const keys = (q.options || []).map((o) => o.key)
      for (const a of q.answer || []) if (!keys.includes(a)) bad++
    }
    expect(bad).toBe(0)
  })
})

describe('题库质量 · 解析要能读', () => {
  it('单行超长（>100 字且整段无换行）不超过 60 道（修复前 873 道）', () => {
    const bad = list.filter((q) => {
      if (typeof q.explanation !== 'string' || !q.explanation) return false
      return q.explanation.split('\n').length <= 1 && q.explanation.length > 100
    })
    expect(bad.length).toBeLessThan(60)
  })

  it('最长的单行不超过 250 道题目（修复前 706 道）', () => {
    const bad = list.filter((q) => {
      if (typeof q.explanation !== 'string') return false
      const longest = Math.max(0, ...q.explanation.split('\n').map((l) => l.length))
      return longest > 200
    })
    expect(bad.length).toBeLessThan(250)
  })

  it('解析里不会出现「①②③」连排在同一行（应已拆行）', () => {
    // 允许个别漏网，但不应大面积存在
    const bad = list.filter((q) => {
      if (typeof q.explanation !== 'string') return false
      return /[①②].{0,80}[②③④]/.test(q.explanation.split('\n')[0] || '')
    })
    expect(bad.length).toBeLessThan(20)
  })
})
