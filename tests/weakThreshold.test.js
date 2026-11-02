import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'

/**
 * 薄弱分类的参赛门槛：**刷满该分类题量的 33%（至少 3 题）**。
 *
 * 早先门槛是「刷过 3 题」—— 在 100+ 题的分类里只占 3%，
 * 刷三道全错就把整个分类判成 100% 薄弱，结论站不住。
 * 改成按比例后，大分类和小分类都得刷够三成，才谈得上「薄弱」。
 */

/** 造一个指定题数、全属于同一分类的题库 */
function makeBank(category, total) {
  return Array.from({ length: total }, (_, i) => ({
    id: 1000 + i,
    type: 'short',
    category,
    difficulty: '简单',
    frequency: '高频',
    question: `${category}-${i}`,
    answer: 'a',
    tags: [],
  }))
}

let bank
let study

beforeEach(() => {
  const pinia = createPinia()
  setActivePinia(pinia)
  localStorage.clear()
  bank = useBankStore()
  study = useStudyStore()
})

describe('薄弱分类 · 33% 覆盖率门槛', () => {
  it('100 题的分类只刷 10 题（10%）不进榜', () => {
    bank.questions = makeBank('MySQL', 100)
    // 刷 10 题、其中 5 题错
    const recs = {}
    for (let i = 0; i < 10; i++) {
      recs[1000 + i] = { status: 'unknown', times: 1, lastReviewed: 1, streak: 0, inWrong: i < 5 }
    }
    study.records = recs

    expect(study.weakCategories.length).toBe(0)
  })

  it('100 题的分类刷满 33 题才进榜（33% 是门槛）', () => {
    bank.questions = makeBank('MySQL', 100)
    // 只刷 32 题 → 32% < 33%，不进榜
    const recs32 = {}
    for (let i = 0; i < 32; i++) {
      recs32[1000 + i] = { status: 'unknown', times: 1, lastReviewed: 1, streak: 0, inWrong: true }
    }
    study.records = recs32
    expect(study.weakCategories.length).toBe(0)

    // 补到 33 题 → 33% 达标，进榜
    const recs33 = { ...recs32 }
    recs33[1032] = { status: 'unknown', times: 1, lastReviewed: 1, streak: 0, inWrong: true }
    study.records = recs33
    expect(study.weakCategories.length).toBe(1)
    expect(study.weakCategories[0].category).toBe('MySQL')
    expect(study.weakCategories[0].need).toBe(33)
  })

  it('小分类仍保底 3 题（33% 不足 3 时取下限）', () => {
    // 6 题的分类，33% 是 2 题，但下限 3 题
    bank.questions = makeBank('Git', 6)
    const recs = {}
    for (let i = 0; i < 2; i++) {
      recs[1000 + i] = { status: 'unknown', times: 1, lastReviewed: 1, streak: 0, inWrong: true }
    }
    study.records = recs
    // 只刷 2 题 → 不足下限 3，不进榜
    expect(study.weakCategories.length).toBe(0)

    // 补第三题：**新建对象**再赋值，直接改老对象不会触发响应式更新
    study.records = {
      ...recs,
      1002: { status: 'unknown', times: 1, lastReviewed: 1, streak: 0, inWrong: true },
    }
    expect(study.weakCategories.length).toBe(1)
    expect(study.weakCategories[0].need).toBe(3)
  })

  it('刷够 33% 但没有错题 → 不进榜（不弱就没有「薄弱」）', () => {
    bank.questions = makeBank('Redis', 100)
    const recs = {}
    for (let i = 0; i < 40; i++) {
      recs[1000 + i] = { status: 'know', times: 1, lastReviewed: 1, streak: 1, inWrong: false }
    }
    study.records = recs
    expect(study.weakCategories.length).toBe(0)
  })

  it('满覆盖（刷完整个分类）自然进榜', () => {
    bank.questions = makeBank('Kubernetes', 10)
    const recs = {}
    for (let i = 0; i < 10; i++) {
      recs[1000 + i] = { status: 'unknown', times: 1, lastReviewed: 1, streak: 0, inWrong: i < 3 }
    }
    study.records = recs
    expect(study.weakCategories.length).toBe(1)
    expect(study.weakCategories[0].rate).toBe(30)
  })

  it('多个分类各自按自己的题量算门槛', () => {
    // MySQL 100 题刷 40（达标）· Git 6 题刷 2（不达标）
    bank.questions = [...makeBank('MySQL', 100), ...makeBank('Git', 6).map((q) => ({ ...q, id: q.id + 500 }))]
    const recs = {}
    for (let i = 0; i < 40; i++) {
      recs[1000 + i] = { status: 'unknown', times: 1, lastReviewed: 1, streak: 0, inWrong: true }
    }
    recs[1500] = { status: 'unknown', times: 1, lastReviewed: 1, streak: 0, inWrong: true }
    recs[1501] = { status: 'unknown', times: 1, lastReviewed: 1, streak: 0, inWrong: true }
    study.records = recs

    expect(study.weakCategories.length).toBe(1)
    expect(study.weakCategories[0].category).toBe('MySQL')
  })
})
