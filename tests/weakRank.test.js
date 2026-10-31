import { describe, expect, it, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'

/**
 * 薄弱环节的计算口径。
 *
 * 两条规则决定结论是否可信：
 * 1. 分母是**已刷题数**，不是分类总题数
 * 2. 样本不足（<3 题）不参与排行
 */

const FIXTURE = [
  // MySQL：5 题，刷 4 题，错 3 题 → 75%
  { id: 1, type: 'short', category: 'MySQL', difficulty: '简单', frequency: '高频', question: 'm1', answer: 'a1', tags: [] },
  { id: 2, type: 'short', category: 'MySQL', difficulty: '简单', frequency: '高频', question: 'm2', answer: 'a2', tags: [] },
  { id: 3, type: 'short', category: 'MySQL', difficulty: '简单', frequency: '高频', question: 'm3', answer: 'a3', tags: [] },
  { id: 4, type: 'short', category: 'MySQL', difficulty: '简单', frequency: '高频', question: 'm4', answer: 'a4', tags: [] },
  { id: 5, type: 'short', category: 'MySQL', difficulty: '简单', frequency: '低频', question: 'm5', answer: 'a5', tags: [] },
  // Nginx：5 题，刷 5 题，错 1 题 → 20%
  { id: 11, type: 'short', category: 'Nginx', difficulty: '简单', frequency: '高频', question: 'n1', answer: 'b1', tags: [] },
  { id: 12, type: 'short', category: 'Nginx', difficulty: '简单', frequency: '高频', question: 'n2', answer: 'b2', tags: [] },
  { id: 13, type: 'short', category: 'Nginx', difficulty: '简单', frequency: '高频', question: 'n3', answer: 'b3', tags: [] },
  { id: 14, type: 'short', category: 'Nginx', difficulty: '简单', frequency: '高频', question: 'n4', answer: 'b4', tags: [] },
  { id: 15, type: 'short', category: 'Nginx', difficulty: '简单', frequency: '高频', question: 'n5', answer: 'b5', tags: [] },
  // Redis：3 题，只刷 1 题且错 → 样本不足
  { id: 21, type: 'short', category: 'Redis', difficulty: '简单', frequency: '高频', question: 'r1', answer: 'c1', tags: [] },
  { id: 22, type: 'short', category: 'Redis', difficulty: '简单', frequency: '高频', question: 'r2', answer: 'c2', tags: [] },
  { id: 23, type: 'short', category: 'Redis', difficulty: '简单', frequency: '高频', question: 'r3', answer: 'c3', tags: [] },
]

const rec = ({ times = 1, inWrong = false } = {}) => ({
  times,
  inWrong,
  status: 'unknown',
  lastReviewed: 1,
  streak: 0,
})

function setup(records) {
  setActivePinia(createPinia())
  const bank = useBankStore()
  bank.questions = FIXTURE
  bank.loading = false
  bank.error = ''
  const study = useStudyStore()
  study.records = records
  return { bank, study }
}

beforeEach(() => {
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  }
})

describe('studyStore · weakCategories', () => {
  it('按错误率降序：MySQL 75% > Nginx 20%', () => {
    const { study } = setup({
      1: rec({ inWrong: true }),
      2: rec({ inWrong: true }),
      3: rec({ inWrong: true }),
      4: rec({ inWrong: false }),
      11: rec({ inWrong: true }),
      12: rec({ inWrong: false }),
      13: rec({ inWrong: false }),
      14: rec({ inWrong: false }),
      15: rec({ inWrong: false }),
    })
    const weak = study.weakCategories
    expect(weak.map((w) => w.category)).toEqual(['MySQL', 'Nginx'])
    expect(weak[0].rate).toBe(75)
    expect(weak[1].rate).toBe(20)
  })

  it('分母是已刷题数：刷 4 题错 3 题 = 75%，不是 3/5=60%', () => {
    const { study } = setup({
      1: rec({ inWrong: true }),
      2: rec({ inWrong: true }),
      3: rec({ inWrong: true }),
      4: rec({ inWrong: false }),
    })
    const m = study.weakCategories.find((w) => w.category === 'MySQL')
    expect(m.reviewed).toBe(4)
    expect(m.total).toBe(5)
    expect(m.rate).toBe(75)
  })

  it('样本不足（只刷 1 题）不进榜', () => {
    const { study } = setup({
      21: rec({ inWrong: true }),
      1: rec({ inWrong: true }),
      2: rec({ inWrong: true }),
      3: rec({ inWrong: true }),
    })
    expect(study.weakCategories.map((w) => w.category)).toEqual(['MySQL'])
  })

  it('无错题的分类不进榜', () => {
    const { study } = setup({
      11: rec({ inWrong: false }),
      12: rec({ inWrong: false }),
      13: rec({ inWrong: false }),
      14: rec({ inWrong: false }),
      15: rec({ inWrong: false }),
    })
    expect(study.weakCategories).toEqual([])
  })

  it('不截断：返回全部分类（详情页要全列）', () => {
    const many = []
    let id = 100
    for (const cat of ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7']) {
      for (let i = 0; i < 3; i++) {
        many.push({ id, type: 'short', category: cat, difficulty: '简单', frequency: '高频', question: `q${id}`, answer: `a${id}`, tags: [] })
        id += 1
      }
    }
    setActivePinia(createPinia())
    const bank = useBankStore()
    bank.questions = many
    const s = useStudyStore()
    const recs = {}
    many.forEach((q) => {
      recs[q.id] = rec({ inWrong: true })
    })
    s.records = recs
    expect(s.weakCategories).toHaveLength(7)
  })

  it('weakestCategory 返回榜首，空数据时为 null', () => {
    const { study } = setup({
      1: rec({ inWrong: true }),
      2: rec({ inWrong: true }),
      3: rec({ inWrong: true }),
    })
    expect(study.weakestCategory.category).toBe('MySQL')

    const { study: empty } = setup({})
    expect(empty.weakestCategory).toBeNull()
  })
})
