import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useStudyStore } from '@/stores/studyStore'
import { useBankStore } from '@/stores/bankStore'
import { STATUS } from '@/utils/constants'

/** 混合题库：简答 + 单选 + 多选 */
const FIXTURE = [
  { id: 1, type: 'short', category: 'A', question: 'q1', answer: 'a1', tags: ['t'], difficulty: '简单', frequency: '高频' },
  { id: 2, type: 'short', category: 'A', question: 'q2', answer: 'a2', tags: ['t'], difficulty: '中等', frequency: '高频' },
  { id: 3, type: 'short', category: 'B', question: 'q3', answer: 'a3', tags: ['t'], difficulty: '中等', frequency: '中频' },
  {
    id: 4,
    type: 'single',
    category: 'A',
    question: 'choice1',
    options: [{ key: 'A', text: 'a' }, { key: 'B', text: 'b' }],
    answer: ['A'],
    tags: ['t'],
    difficulty: '简单',
    frequency: '高频',
  },
  {
    id: 5,
    type: 'multiple',
    category: 'B',
    question: 'choice2',
    options: [{ key: 'A', text: 'a' }, { key: 'B', text: 'b' }, { key: 'C', text: 'c' }],
    answer: ['A', 'C'],
    tags: ['t'],
    difficulty: '困难',
    frequency: '低频',
  },
]

let bank
let study

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  bank = useBankStore()
  bank.questions = FIXTURE
  study = useStudyStore()
})

describe('题型区分统计', () => {
  it('题库统计出简答/选择题数量', () => {
    expect(study.shortTotal).toBe(3)
    expect(study.choiceTotal).toBe(2)
  })

  it('short 缺省 type 视为简答', () => {
    bank.questions = [{ id: 1, category: 'A', question: 'q', answer: 'a', tags: ['t'], difficulty: '简单', frequency: '高频' }]
    setActivePinia(createPinia())
    bank = useBankStore()
    bank.questions = [{ id: 1, category: 'A', question: 'q', answer: 'a', tags: ['t'], difficulty: '简单', frequency: '高频' }]
    const s = useStudyStore()
    expect(s.shortTotal).toBe(1)
    expect(s.choiceTotal).toBe(0)
  })
})

describe('掌握率只统计简答题', () => {
  it('选择题答对不影响掌握率', () => {
    study.markKnow(4) // 选择题答对
    expect(study.choiceKnowCount).toBe(1)
    // 没有简答题答过，掌握率仍为 null
    expect(study.masteryRate).toBeNull()
  })

  it('选择题答错不影响掌握率', () => {
    study.markUnknown(5)
    expect(study.choiceUnknownCount).toBe(1)
    expect(study.masteryRate).toBeNull()
  })

  it('简答 + 选择题混合，掌握率只用简答计算', () => {
    study.markKnow(1) // 简答会
    study.markUnknown(2) // 简答不会
    study.markKnow(4) // 选择答对
    study.markUnknown(5) // 选择答错
    // 简答：1 会 1 不会 → 50%；若把选择题算进来会是 50% → 无法区分，故单独断言分子分母
    expect(study.shortKnowCount).toBe(1)
    expect(study.shortUnknownCount).toBe(1)
    expect(study.masteryRate).toBe(50)
  })

  it('简答全对占多数时，选择题答错不拉低掌握率', () => {
    study.markKnow(1)
    study.markKnow(2)
    study.markKnow(3)
    study.markUnknown(4) // 选择题答错
    expect(study.masteryRate).toBe(100)
  })
})

describe('选择题正确率（独立指标）', () => {
  it('只在选择题内计算', () => {
    study.markKnow(4)
    study.markUnknown(5)
    expect(study.choiceRate).toBe(50)
  })

  it('无选择题作答时为 null', () => {
    study.markKnow(1)
    expect(study.choiceRate).toBeNull()
  })
})

describe('今日已刷与总进度包含选择题', () => {
  it('选择题计入已刷数', () => {
    study.markKnow(4)
    expect(study.reviewedCount).toBe(1)
  })

  it('选择题计入总进度', () => {
    study.markKnow(4)
    study.markKnow(1)
    expect(study.progressRate).toBe(40) // 2/5
  })
})

describe('错题本包含答错的选择题', () => {
  it('选择题答错进入错题本', () => {
    study.markUnknown(5)
    expect(study.wrongList.map((q) => q.id)).toEqual([5])
  })

  /**
   * 回归：答对一次不再立刻移出，要连对 3 次（用户要求）。
   * 见 studyStore.test.js 里的完整规则用例。
   */
  it('选择题连对 3 次后移出错题本', () => {
    study.markUnknown(5)
    study.markKnow(5)
    expect(study.wrongList.map((q) => q.id)).toEqual([5]) // 第 1 次对，still 在
    study.markKnow(5)
    expect(study.wrongList.map((q) => q.id)).toEqual([5]) // 第 2 次对
    study.markKnow(5)
    expect(study.wrongList).toHaveLength(0) // 第 3 次对，移出
  })

  it('简答与选择题错题混合，按题库顺序', () => {
    study.markUnknown(5)
    study.markUnknown(2)
    expect(study.wrongList.map((q) => q.id)).toEqual([2, 5])
  })
})

describe('分类掌握度排除选择题', () => {
  it('分类 A：2 简答 + 1 选择，掌握度只看简答', () => {
    study.markKnow(1)
    study.markUnknown(2)
    study.markUnknown(4) // 选择题答错，不应计入 A 的掌握度
    const a = study.categoryStats.find((s) => s.category === 'A')
    expect(a).toMatchObject({ total: 3, shortTotal: 2, choiceTotal: 1, know: 1, unknown: 1 })
    expect(a.mastery).toBe(50)
  })

  it('分类 B 只有 1 简答 + 1 选择', () => {
    const b = study.categoryStats.find((s) => s.category === 'B')
    expect(b).toMatchObject({ total: 2, shortTotal: 1, choiceTotal: 1 })
  })

  it('无简答题的分类掌握度为 null', () => {
    bank.questions = [
      { id: 1, type: 'single', category: 'A', question: 'q', options: [{ key: 'A', text: 'a' }], answer: ['A'], tags: ['t'], difficulty: '简单', frequency: '高频' },
    ]
    setActivePinia(createPinia())
    bank = useBankStore()
    bank.questions = [
      { id: 1, type: 'single', category: 'A', question: 'q', options: [{ key: 'A', text: 'a' }], answer: ['A'], tags: ['t'], difficulty: '简单', frequency: '高频' },
    ]
    const s = useStudyStore()
    s.markKnow(1)
    expect(s.categoryStats[0].mastery).toBeNull()
  })
})

describe('getMastery 汇总', () => {
  it('返回简答与选择题分组数据', () => {
    study.markKnow(1)
    study.markUnknown(4)
    const m = study.getMastery()
    expect(m).toMatchObject({
      shortKnowCount: 1,
      shortUnknownCount: 0,
      choiceKnowCount: 0,
      choiceUnknownCount: 1,
      masteryRate: 100,
      choiceRate: 0,
    })
  })
})
