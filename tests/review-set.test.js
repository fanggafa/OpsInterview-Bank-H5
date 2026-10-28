import { describe, expect, it } from 'vitest'
import { pickReviewSet } from '@/utils/practice'
import { REVIEW_SIZES } from '@/utils/constants'

const mk = (i) => ({ id: i, category: 'A', question: `q${i}`, answer: `a${i}` })
const POOL = Array.from({ length: 60 }, (_, i) => mk(i + 1))

/**
 * 复习赛抽题（每日复习 15 题 / 错题复习 10 题）。
 *
 * 与「连续刷」的 buildQueue 不同：它是一次性题组，每次进入重新抽，
 * 抽完即止，不记断点。
 */
describe('pickReviewSet · 题量', () => {
  it('每日复习默认抽 15 题（从 60 题池里）', () => {
    const set = pickReviewSet(POOL, { size: REVIEW_SIZES.daily })
    expect(set).toHaveLength(15)
  })

  it('错题复习抽 10 题', () => {
    const set = pickReviewSet(POOL, { size: REVIEW_SIZES.wrong })
    expect(set).toHaveLength(10)
  })

  it('题池不足时返回全部，不凑数也不重复', () => {
    const small = POOL.slice(0, 4)
    const set = pickReviewSet(small, { size: 15 })
    expect(set).toHaveLength(4)
    expect(new Set(set.map((q) => q.id)).size).toBe(4)
  })

  it('题池刚好等于题量时返回全部', () => {
    const exact = POOL.slice(0, 10)
    expect(pickReviewSet(exact, { size: 10 })).toHaveLength(10)
  })

  it('空题池返回空数组（页面据此显示空态）', () => {
    expect(pickReviewSet([], { size: 15 })).toEqual([])
    expect(pickReviewSet(null, { size: 15 })).toEqual([])
  })

  it('size 为 0 或非法时返回空数组', () => {
    expect(pickReviewSet(POOL, { size: 0 })).toEqual([])
    expect(pickReviewSet(POOL, { size: -3 })).toEqual([])
    expect(pickReviewSet(POOL, { size: 'abc' })).toEqual([])
  })
})

describe('pickReviewSet · 随机性与稳定性', () => {
  it('抽出的题都来自题池，且不重复', () => {
    const set = pickReviewSet(POOL, { size: 15 })
    expect(set.every((q) => POOL.some((p) => p.id === q.id))).toBe(true)
    expect(new Set(set.map((q) => q.id)).size).toBe(15)
  })

  it('注入随机源时可固定结果（便于测试）', () => {
    const a = pickReviewSet(POOL, { size: 15, random: () => 0.5 })
    const b = pickReviewSet(POOL, { size: 15, random: () => 0.5 })
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id))
  })

  it('多次抽题结果不同（每次进入重新随机）', () => {
    const ids = new Set()
    // 抽 3 次，每次都记下第一题；三次全同的概率极低
    for (let i = 0; i < 5; i++) ids.add(pickReviewSet(POOL, { size: 15 })[0].id)
    expect(ids.size).toBeGreaterThan(1)
  })

  it('不修改入参题池', () => {
    const snapshot = JSON.stringify(POOL)
    pickReviewSet(POOL, { size: 15 })
    expect(JSON.stringify(POOL)).toBe(snapshot)
  })
})
