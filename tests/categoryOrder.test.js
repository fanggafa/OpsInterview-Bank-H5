import { describe, expect, it } from 'vitest'
import { CATEGORIES } from '@/utils/constants'

/**
 * 分类枚举顺序守卫。
 *
 * 分类筛选条的展示顺序直接由 `CATEGORIES` 数组决定
 * （见 BankView 的 `CATEGORIES.filter(...)`），所以这个顺序是「产品行为」，
 * 不该被随手改动。这里固化「A→Z」规则，并校验拼音首字母表。
 */

/** 中文分类的拼音首字母（与 scripts 里的排序依据一致） */
const PINYIN = {
  安全与跳板机: 'A',
  存储与备份: 'C',
  监控告警: 'J',
  日志与ELK: 'R',
  容器与K8s: 'R',
  网络基础: 'W',
  消息队列: 'X',
  虚拟化: 'X',
  云与高可用: 'Y',
  自动化与配置管理: 'Z',
  综合场景题: 'Z',
}

const firstLetter = (cat) => {
  if (PINYIN[cat]) return PINYIN[cat]
  const ch = cat[0]
  return /[A-Za-z]/.test(ch) ? ch.toUpperCase() : null
}

describe('CATEGORIES 顺序（A→Z）', () => {
  it('首字母整体单调不减（中文按拼音、英文按字母）', () => {
    const letters = CATEGORIES.map(firstLetter)
    const missing = CATEGORIES.filter((c, i) => letters[i] === null)
    expect(missing, `这些分类缺少首字母定义: ${missing.join(',')}`).toEqual([])

    for (let i = 1; i < letters.length; i++) {
      expect(
        letters[i] >= letters[i - 1],
        `第 ${i + 1} 项「${CATEGORIES[i]}」(${letters[i]}) 不应排在「${CATEGORIES[i - 1]}」(${letters[i - 1]}) 之后`,
      ).toBe(true)
    }
  })

  it('同一首字母内按名称排序', () => {
    for (let i = 1; i < CATEGORIES.length; i++) {
      const a = CATEGORIES[i - 1]
      const b = CATEGORIES[i]
      if (firstLetter(a) !== firstLetter(b)) continue
      expect(a.localeCompare(b, 'zh-CN'), `「${a}」与「${b}」顺序不对`).toBeLessThanOrEqual(0)
    }
  })

  it('每个分类都有拼音首字母定义（新增分类时不能漏）', () => {
    const unknown = CATEGORIES.filter((c) => firstLetter(c) === null)
    expect(unknown).toEqual([])
  })
})
