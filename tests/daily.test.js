import { describe, expect, it } from 'vitest'
import { dateKey, hashString, pickDailyQuestion } from '@/utils/daily'

const mk = (id, frequency = '高频', extra = {}) => ({
  id,
  category: 'Linux基础',
  difficulty: '中等',
  frequency,
  question: `q${id}`,
  answer: `a${id}`,
  ...extra,
})

const POOL = Array.from({ length: 40 }, (_, i) => mk(i + 1))

/**
 * 每日一题的选题目的是「稳定」与「可预期」：
 * 同一天刷新多少次都是同一题，跨天才换；不依赖后端与存储。
 */
describe('dateKey · 本地时区日期键', () => {
  it('格式为 YYYYMMDD，补零', () => {
    expect(dateKey(new Date(2026, 0, 5))).toBe('20260105')
    expect(dateKey(new Date(2026, 11, 31))).toBe('20261231')
  })

  it('用本地时区而非 UTC（东八区早上不会被算成前一天）', () => {
    // 本地时间当天 00:30，UTC 折算会是前一天晚上
    const early = new Date(2026, 4, 20, 0, 30, 0)
    expect(dateKey(early)).toBe('20260520')
  })

  it('非法日期返回空串，不抛错', () => {
    expect(dateKey(new Date('not-a-date'))).toBe('')
  })
})

describe('hashString · 稳定散列', () => {
  it('同样的输入得到同样的值', () => {
    expect(hashString('20260520')).toBe(hashString('20260520'))
  })

  it('返回 32 位无符号整数', () => {
    const h = hashString('20260520')
    expect(Number.isInteger(h)).toBe(true)
    expect(h).toBeGreaterThanOrEqual(0)
    expect(h).toBeLessThan(2 ** 32)
  })

  it('空输入也不崩', () => {
    expect(() => hashString('')).not.toThrow()
    expect(() => hashString(null)).not.toThrow()
  })
})

describe('pickDailyQuestion · 稳定性', () => {
  it('同一天多次调用返回同一道题（刷新不变）', () => {
    const d = new Date(2026, 4, 20)
    const a = pickDailyQuestion(POOL, d)
    const b = pickDailyQuestion(POOL, d)
    expect(a.id).toBe(b.id)
  })

  it('入参顺序不同也取到同一道题（种子只跟日期有关）', () => {
    const d = new Date(2026, 4, 20)
    const forward = pickDailyQuestion(POOL, d)
    const backward = pickDailyQuestion(POOL.slice().reverse(), d)
    expect(forward.id).toBe(backward.id)
  })

  it('跨天通常会换题（连续 7 天里至少出现两道不同的题）', () => {
    const ids = new Set()
    for (let i = 0; i < 7; i++) {
      ids.add(pickDailyQuestion(POOL, new Date(2026, 4, 20 + i)).id)
    }
    expect(ids.size).toBeGreaterThan(1)
  })
})

describe('pickDailyQuestion · 选池规则', () => {
  it('优先在高频题里挑', () => {
    const mixed = [mk(1, '低频'), mk(2, '中频'), ...Array.from({ length: 5 }, (_, i) => mk(10 + i, '高频'))]
    for (let i = 0; i < 20; i++) {
      const q = pickDailyQuestion(mixed, new Date(2026, 0, 1 + i))
      expect(q.frequency).toBe('高频')
    }
  })

  it('没有高频题时退回全量，保证有题可出', () => {
    const lowOnly = [mk(1, '低频'), mk(2, '中频')]
    const q = pickDailyQuestion(lowOnly, new Date(2026, 4, 20))
    expect(q).toBeTruthy()
    expect(lowOnly.map((x) => x.id)).toContain(q.id)
  })

  it('题库为空返回 null（首页据此不渲染卡片）', () => {
    expect(pickDailyQuestion([], new Date())).toBeNull()
    expect(pickDailyQuestion(null, new Date())).toBeNull()
  })

  it('单题题库反复取到的都是它', () => {
    const one = [mk(7)]
    for (let i = 0; i < 5; i++) {
      expect(pickDailyQuestion(one, new Date(2026, 0, 1 + i)).id).toBe(7)
    }
  })

  it('不修改入参', () => {
    const snapshot = JSON.stringify(POOL)
    pickDailyQuestion(POOL, new Date(2026, 4, 20))
    expect(JSON.stringify(POOL)).toBe(snapshot)
  })
})
