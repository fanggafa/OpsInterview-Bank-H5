import { describe, expect, it } from 'vitest'
import {
  buildQueue,
  describeProgress,
  normalizeMode,
  resolveStartIndex,
  summarizeRound,
} from '@/utils/practice'

const QUESTIONS = [
  { id: 1, category: 'A', question: 'q1' },
  { id: 2, category: 'A', question: 'q2' },
  { id: 3, category: 'B', question: 'q3' },
  { id: 4, category: 'B', question: 'q4' },
  { id: 5, category: 'C', question: 'q5' },
]

describe('normalizeMode', () => {
  it('合法模式原样返回', () => {
    expect(normalizeMode('sequential')).toBe('sequential')
    expect(normalizeMode('random')).toBe('random')
    expect(normalizeMode('wrong')).toBe('wrong')
  })

  it('非法/缺失回退 sequential', () => {
    expect(normalizeMode('bogus')).toBe('sequential')
    expect(normalizeMode('')).toBe('sequential')
    expect(normalizeMode(undefined)).toBe('sequential')
    expect(normalizeMode(null)).toBe('sequential')
  })
})

describe('buildQueue · sequential', () => {
  it('按原顺序全量返回', () => {
    expect(buildQueue(QUESTIONS, { mode: 'sequential' }).map((q) => q.id)).toEqual([1, 2, 3, 4, 5])
  })

  it('按分类过滤且保持顺序', () => {
    expect(buildQueue(QUESTIONS, { mode: 'sequential', category: 'B' }).map((q) => q.id)).toEqual([3, 4])
  })

  it('不修改原数组', () => {
    const copy = QUESTIONS.slice()
    buildQueue(QUESTIONS, { mode: 'sequential' })
    expect(QUESTIONS).toEqual(copy)
  })

  it('非法分类返回空队列', () => {
    expect(buildQueue(QUESTIONS, { category: '不存在' })).toEqual([])
  })
})

describe('buildQueue · random', () => {
  it('元素集合不变、长度不变', () => {
    const queue = buildQueue(QUESTIONS, { mode: 'random' })
    expect(queue).toHaveLength(5)
    expect(queue.map((q) => q.id).sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('注入固定随机源时结果可复现且不等于原序', () => {
    let i = 0
    const fakeRandom = () => {
      const seq = [0.9, 0.1, 0.5, 0.3]
      return seq[i++ % seq.length]
    }
    const a = buildQueue(QUESTIONS, { mode: 'random', random: fakeRandom })
    // 逐步推演 Fisher-Yates：i=4→swap(4,4); i=3→swap(3,0); i=2→swap(2,1); i=1→swap(1,0)
    const expected = [3, 4, 2, 1, 5]
    expect(a.map((q) => q.id)).toEqual(expected)
  })

  it('随机模式也支持分类过滤', () => {
    const queue = buildQueue(QUESTIONS, { mode: 'random', category: 'A' })
    expect(queue.map((q) => q.id).sort()).toEqual([1, 2])
  })

  it('随机模式不修改原数组', () => {
    const copy = QUESTIONS.slice()
    buildQueue(QUESTIONS, { mode: 'random' })
    expect(QUESTIONS).toEqual(copy)
  })
})

describe('buildQueue · wrong', () => {
  it('只返回错题 id 集合中的题', () => {
    expect(buildQueue(QUESTIONS, { mode: 'wrong', wrongIds: [2, 4] }).map((q) => q.id)).toEqual([2, 4])
  })

  it('接受 Set 或数组', () => {
    expect(buildQueue(QUESTIONS, { mode: 'wrong', wrongIds: new Set([1]) }).map((q) => q.id)).toEqual([1])
  })

  it('错题 + 分类交集', () => {
    expect(buildQueue(QUESTIONS, { mode: 'wrong', category: 'B', wrongIds: [1, 3] }).map((q) => q.id)).toEqual([3])
  })

  it('无错题返回空队列', () => {
    expect(buildQueue(QUESTIONS, { mode: 'wrong', wrongIds: [] })).toEqual([])
  })

  it('有序输出（按题库顺序，不受 set 顺序影响）', () => {
    expect(buildQueue(QUESTIONS, { mode: 'wrong', wrongIds: [5, 1, 3] }).map((q) => q.id)).toEqual([1, 3, 5])
  })
})

describe('resolveStartIndex', () => {
  const current = { mode: 'sequential', category: '' }

  it('无进度从 0 开始且非续刷', () => {
    expect(resolveStartIndex(null, current, 10)).toEqual({ index: 0, resumed: false })
  })

  it('队列为空从 0 开始', () => {
    expect(resolveStartIndex({ mode: 'sequential', index: 3 }, current, 0)).toEqual({
      index: 0,
      resumed: false,
    })
  })

  it('模式与分类一致时续刷', () => {
    const p = { mode: 'sequential', category: '', index: 3 }
    expect(resolveStartIndex(p, current, 10)).toEqual({ index: 3, resumed: true })
  })

  it('模式不一致时不续刷', () => {
    const p = { mode: 'random', category: '', index: 3 }
    expect(resolveStartIndex(p, current, 10)).toEqual({ index: 0, resumed: false })
  })

  it('分类不一致时不续刷', () => {
    const p = { mode: 'sequential', category: 'A', index: 3 }
    expect(resolveStartIndex(p, current, 10)).toEqual({ index: 0, resumed: false })
  })

  it('保存的 index 超出队列长度时不续刷', () => {
    const p = { mode: 'sequential', category: '', index: 99 }
    expect(resolveStartIndex(p, current, 10)).toEqual({ index: 0, resumed: false })
  })

  it('index 为 0 视为非续刷（本来就是第一题）', () => {
    const p = { mode: 'sequential', category: '', index: 0 }
    expect(resolveStartIndex(p, current, 10)).toEqual({ index: 0, resumed: false })
  })

  it('index 非法（非整数/负数）不续刷', () => {
    expect(resolveStartIndex({ mode: 'sequential', index: -1 }, current, 10).resumed).toBe(false)
    expect(resolveStartIndex({ mode: 'sequential', index: 'abc' }, current, 10).resumed).toBe(false)
    expect(resolveStartIndex({ mode: 'sequential', index: 1.5 }, current, 10).resumed).toBe(false)
  })

  it('progress 中 mode 缺失时按 sequential 处理', () => {
    const p = { category: '', index: 2 }
    expect(resolveStartIndex(p, current, 10)).toEqual({ index: 2, resumed: true })
  })
})

describe('describeProgress', () => {
  it('无进度返回 null', () => {
    expect(describeProgress(null)).toBeNull()
  })

  it('顺序模式 + 指定分类', () => {
    expect(describeProgress({ mode: 'sequential', category: 'MySQL', index: 2 })).toEqual({
      category: 'MySQL',
      modeLabel: '顺序',
      index: 2,
      positionText: '第 3 题',
    })
  })

  it('随机模式 + 无分类显示「全部题目」', () => {
    const d = describeProgress({ mode: 'random', category: null, index: 0 })
    expect(d.category).toBe('全部题目')
    expect(d.modeLabel).toBe('随机')
    expect(d.positionText).toBe('第 1 题')
  })

  it('错题模式文案', () => {
    expect(describeProgress({ mode: 'wrong', index: 1 }).modeLabel).toBe('错题')
  })
})

describe('summarizeRound', () => {
  it('计算会/不会与正确率', () => {
    expect(summarizeRound(7, 3)).toEqual({ know: 7, unknown: 3, total: 10, knowRate: 70 })
  })

  it('全对为 100%', () => {
    expect(summarizeRound(5, 0).knowRate).toBe(100)
  })

  it('全错为 0%', () => {
    expect(summarizeRound(0, 5).knowRate).toBe(0)
  })

  it('总数为 0 时正确率为 null（不显示 0%）', () => {
    expect(summarizeRound(0, 0)).toEqual({ know: 0, unknown: 0, total: 0, knowRate: null })
  })
})
