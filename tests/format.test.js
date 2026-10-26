import { describe, expect, it } from 'vitest'
import {
  formatPercent,
  isToday,
  matchKeyword,
  ratio,
  relativeTime,
  shuffle,
  startOfToday,
  truncate,
} from '@/utils/format'

describe('truncate', () => {
  it('短文本原样返回', () => {
    expect(truncate('abc', 50)).toBe('abc')
  })

  it('超长截断并加省略号', () => {
    const text = 'a'.repeat(60)
    const out = truncate(text, 50)
    expect(out).toHaveLength(51)
    expect(out.endsWith('…')).toBe(true)
  })

  it('按码点截断，不切坏 emoji', () => {
    const out = truncate('😀😀😀', 2)
    expect(out).toBe('😀😀…')
  })

  it('空值返回空串', () => {
    expect(truncate('')).toBe('')
    expect(truncate(null)).toBe('')
  })

  it('恰好等于上限时不加省略号', () => {
    expect(truncate('a'.repeat(50), 50)).toBe('a'.repeat(50))
  })
})

describe('formatPercent / ratio', () => {
  it('null 与非法值显示 —', () => {
    expect(formatPercent(null)).toBe('—')
    expect(formatPercent(undefined)).toBe('—')
    expect(formatPercent(NaN)).toBe('—')
    expect(formatPercent('abc')).toBe('—')
  })

  it('保留整数并带百分号', () => {
    expect(formatPercent(66.6)).toBe('67%')
    expect(formatPercent(0)).toBe('0%')
    expect(formatPercent(100)).toBe('100%')
  })

  it('ratio 分母为 0 返回 null', () => {
    expect(ratio(3, 0)).toBeNull()
    expect(ratio(0, 0)).toBeNull()
  })

  it('ratio 正常四舍五入', () => {
    expect(ratio(1, 3)).toBe(33)
    expect(ratio(2, 3)).toBe(67)
    expect(ratio(0, 5)).toBe(0)
  })
})

describe('startOfToday / isToday', () => {
  it('startOfToday 是当天 0 点', () => {
    const now = new Date(2026, 9, 26, 15, 30, 0).getTime()
    const start = new Date(startOfToday(now))
    expect(start.getHours()).toBe(0)
    expect(start.getMinutes()).toBe(0)
    expect(start.getSeconds()).toBe(0)
  })

  it('今天之内为 true，昨天为 false', () => {
    const now = new Date(2026, 9, 26, 15, 30, 0).getTime()
    const todayEarly = new Date(2026, 9, 26, 0, 0, 1).getTime()
    const yesterday = new Date(2026, 9, 25, 23, 59, 59).getTime()
    expect(isToday(todayEarly, now)).toBe(true)
    expect(isToday(yesterday, now)).toBe(false)
  })

  it('空值返回 false', () => {
    expect(isToday(0)).toBe(false)
    expect(isToday(null)).toBe(false)
  })
})

describe('relativeTime', () => {
  const now = new Date(2026, 9, 26, 12, 0, 0).getTime()

  it('一分钟内为刚刚', () => {
    expect(relativeTime(now - 30 * 1000, now)).toBe('刚刚')
  })

  it('分钟/小时/天', () => {
    expect(relativeTime(now - 5 * 60 * 1000, now)).toBe('5 分钟前')
    expect(relativeTime(now - 3 * 3600 * 1000, now)).toBe('3 小时前')
    expect(relativeTime(now - 2 * 24 * 3600 * 1000, now)).toBe('2 天前')
  })

  it('超过 7 天显示日期', () => {
    const ts = new Date(2026, 8, 1, 10, 0, 0).getTime()
    expect(relativeTime(ts, now)).toBe('9月1日')
  })

  it('空值返回空串', () => {
    expect(relativeTime(0, now)).toBe('')
  })
})

describe('shuffle', () => {
  it('不修改原数组', () => {
    const src = [1, 2, 3, 4]
    shuffle(src)
    expect(src).toEqual([1, 2, 3, 4])
  })

  it('元素集合不变', () => {
    const src = [1, 2, 3, 4, 5]
    expect(shuffle(src).sort()).toEqual([1, 2, 3, 4, 5])
  })
})

describe('matchKeyword', () => {
  const q = {
    question: '简述 TCP 三次握手',
    answer: 'SYN 与 ACK 的交互过程',
    tags: ['网络', '握手'],
  }

  it('空关键词匹配全部', () => {
    expect(matchKeyword(q, '')).toBe(true)
    expect(matchKeyword(q, '   ')).toBe(true)
  })

  it('命中题干/答案/标签，忽略大小写', () => {
    expect(matchKeyword(q, 'tcp')).toBe(true)
    expect(matchKeyword(q, 'syn')).toBe(true)
    expect(matchKeyword(q, '网络')).toBe(true)
  })

  it('未命中返回 false', () => {
    expect(matchKeyword(q, 'redis')).toBe(false)
  })
})
