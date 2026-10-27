import { describe, expect, it } from 'vitest'
import {
  applyFilters,
  countByCategory,
  filterByCategory,
  filterByDifficulty,
  filterByFrequency,
  filterByKeyword,
  parseQueryState,
  toQueryState,
} from '@/utils/filter'

const QUESTIONS = [
  { id: 1, category: 'A', difficulty: '简单', question: 'q1 tcp', answer: 'a1', tags: ['网络'], frequency: '高频' },
  { id: 2, category: 'A', difficulty: '中等', question: 'q2 redis', answer: '缓存', tags: ['缓存'], frequency: '中频' },
  { id: 3, category: 'B', difficulty: '困难', question: 'q3 mysql', answer: '索引', tags: ['DB'], frequency: '高频' },
  { id: 4, category: 'B', difficulty: '中等', question: 'q4 k8s', answer: 'Pod', tags: ['容器'], frequency: '低频' },
]

describe('filterByCategory', () => {
  it('空分类返回全部', () => {
    expect(filterByCategory(QUESTIONS, '')).toHaveLength(4)
    expect(filterByCategory(QUESTIONS, null)).toHaveLength(4)
  })

  it('按分类筛选', () => {
    expect(filterByCategory(QUESTIONS, 'A').map((q) => q.id)).toEqual([1, 2])
  })

  it('不修改原数组', () => {
    const copy = QUESTIONS.slice()
    filterByCategory(QUESTIONS, 'A')
    expect(QUESTIONS).toEqual(copy)
  })
})

describe('filterByFrequency', () => {
  it('空频率返回全部', () => {
    expect(filterByFrequency(QUESTIONS, '')).toHaveLength(4)
  })

  it('按频率筛选', () => {
    expect(filterByFrequency(QUESTIONS, '高频').map((q) => q.id)).toEqual([1, 3])
  })

  it('无匹配返回空数组', () => {
    expect(filterByFrequency(QUESTIONS, '低频').map((q) => q.id)).toEqual([4])
  })
})

describe('filterByKeyword', () => {
  it('空关键词返回全部', () => {
    expect(filterByKeyword(QUESTIONS, '')).toHaveLength(4)
    expect(filterByKeyword(QUESTIONS, '   ')).toHaveLength(4)
  })

  it('命中题干', () => {
    expect(filterByKeyword(QUESTIONS, 'tcp').map((q) => q.id)).toEqual([1])
  })

  it('命中答案', () => {
    expect(filterByKeyword(QUESTIONS, '缓存').map((q) => q.id)).toEqual([2])
  })

  it('命中标签', () => {
    expect(filterByKeyword(QUESTIONS, 'DB').map((q) => q.id)).toEqual([3])
  })

  it('大小写不敏感', () => {
    expect(filterByKeyword(QUESTIONS, 'REDIS').map((q) => q.id)).toEqual([2])
  })
})

describe('filterByDifficulty', () => {
  it('空难度返回全部', () => {
    expect(filterByDifficulty(QUESTIONS, '')).toHaveLength(4)
    expect(filterByDifficulty(QUESTIONS, null)).toHaveLength(4)
  })

  it('按难度筛选', () => {
    expect(filterByDifficulty(QUESTIONS, '中等').map((q) => q.id)).toEqual([2, 4])
    expect(filterByDifficulty(QUESTIONS, '困难').map((q) => q.id)).toEqual([3])
  })

  it('不修改原数组', () => {
    const copy = QUESTIONS.slice()
    filterByDifficulty(QUESTIONS, '简单')
    expect(QUESTIONS).toEqual(copy)
  })
})

describe('applyFilters', () => {
  it('空条件返回全部', () => {
    expect(applyFilters(QUESTIONS, {})).toHaveLength(4)
  })

  it('分类 + 频率组合', () => {
    expect(applyFilters(QUESTIONS, { category: 'A', frequency: '高频' }).map((q) => q.id)).toEqual([1])
  })

  it('三条件组合', () => {
    expect(applyFilters(QUESTIONS, { category: 'B', frequency: '高频', keyword: 'mysql' }).map((q) => q.id)).toEqual([3])
  })

  it('难度可与分类组合', () => {
    expect(applyFilters(QUESTIONS, { category: 'B', difficulty: '中等' }).map((q) => q.id)).toEqual([4])
  })

  it('难度 + 关键词组合', () => {
    expect(applyFilters(QUESTIONS, { difficulty: '困难', keyword: '索引' }).map((q) => q.id)).toEqual([3])
  })

  it('组合无结果返回空数组', () => {
    expect(applyFilters(QUESTIONS, { category: 'A', keyword: 'k8s' })).toEqual([])
    expect(applyFilters(QUESTIONS, { difficulty: '简单', category: 'B' })).toEqual([])
  })
})

describe('countByCategory', () => {
  it('统计各分类数量', () => {
    expect(countByCategory(QUESTIONS)).toEqual({ A: 2, B: 2 })
  })

  it('空数组返回空对象', () => {
    expect(countByCategory([])).toEqual({})
  })
})

describe('parseQueryState', () => {
  const CATS = ['A', 'B']
  const FREQS = ['高频', '中频', '低频']
  const DIFFS = ['简单', '中等', '困难']

  it('合法值原样采用', () => {
    expect(
      parseQueryState({ category: 'A', frequency: '高频', difficulty: '中等', q: 'tcp' }, CATS, FREQS, DIFFS)
    ).toEqual({
      category: 'A',
      frequency: '高频',
      difficulty: '中等',
      keyword: 'tcp',
    })
  })

  it('非法值兜底为空（防止手改 URL 导致异常状态）', () => {
    expect(
      parseQueryState({ category: 'ZZZ', frequency: '超高', difficulty: '超难' }, CATS, FREQS, DIFFS)
    ).toEqual({
      category: '',
      frequency: '',
      difficulty: '',
      keyword: '',
    })
  })

  it('缺省参数返回空状态', () => {
    expect(parseQueryState({}, CATS, FREQS, DIFFS)).toEqual({
      category: '',
      frequency: '',
      difficulty: '',
      keyword: '',
    })
  })

  it('不传难度枚举时不解析难度（向后兼容）', () => {
    expect(parseQueryState({ difficulty: '中等' }, CATS, FREQS)).toEqual({
      category: '',
      frequency: '',
      difficulty: '',
      keyword: '',
    })
  })
})

describe('toQueryState', () => {
  it('空值省略，URL 保持干净', () => {
    expect(toQueryState({ category: '', frequency: '', difficulty: '', keyword: '' })).toEqual({})
  })

  it('只保留有值的项', () => {
    expect(toQueryState({ category: 'A', frequency: '', keyword: 'tcp' })).toEqual({
      category: 'A',
      q: 'tcp',
    })
  })

  it('难度写入 URL', () => {
    expect(toQueryState({ difficulty: '困难' })).toEqual({ difficulty: '困难' })
  })

  it('关键词去首尾空格，全空格视为空', () => {
    expect(toQueryState({ keyword: '  tcp  ' })).toEqual({ q: 'tcp' })
    expect(toQueryState({ keyword: '   ' })).toEqual({})
  })

  it('与 parseQueryState 可往返', () => {
    const state = { category: 'A', frequency: '高频', difficulty: '中等', keyword: 'tcp' }
    expect(
      parseQueryState(toQueryState(state), ['A'], ['高频'], ['简单', '中等', '困难'])
    ).toEqual(state)
  })
})
