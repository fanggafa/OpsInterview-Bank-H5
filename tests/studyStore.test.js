import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useStudyStore } from '@/stores/studyStore'
import { useBankStore } from '@/stores/bankStore'
import { STATUS, STORAGE_KEYS } from '@/utils/constants'

/** 构造一个最小的题库：3分类，各若干题 */
const FIXTURE = [
  { id: 1, category: 'A', difficulty: '简单', question: 'q1', answer: 'a1', tags: ['t'], frequency: '高频' },
  { id: 2, category: 'A', difficulty: '中等', question: 'q2', answer: 'a2', tags: ['t'], frequency: '高频' },
  { id: 3, category: 'B', difficulty: '中等', question: 'q3', answer: 'a3', tags: ['t'], frequency: '中频' },
  { id: 4, category: 'B', difficulty: '困难', question: 'q4', answer: 'a4', tags: ['t'], frequency: '中频' },
  { id: 5, category: 'C', difficulty: '困难', question: 'q5', answer: 'a5', tags: ['t'], frequency: '低频' },
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

describe('markKnow / markUnknown', () => {
  it('首次自评写入 status/times/lastReviewed', () => {
    const before = Date.now()
    study.markKnow(1)
    const rec = study.recordOf(1)
    expect(rec.status).toBe(STATUS.KNOW)
    expect(rec.times).toBe(1)
    expect(rec.lastReviewed).toBeGreaterThanOrEqual(before)
  })

  it('重复自评累加 times 并覆盖 status', () => {
    study.markUnknown(2)
    study.markUnknown(2)
    study.markKnow(2)
    const rec = study.recordOf(2)
    expect(rec.times).toBe(3)
    expect(rec.status).toBe(STATUS.KNOW)
  })

  it('非法 id 不写入', () => {
    study.markKnow('abc')
    expect(Object.keys(study.records)).toHaveLength(0)
  })
})

describe('统计口径（PRD §五.4）', () => {
  it('题库为空时 progressRate 为 null', () => {
    bank.questions = []
    expect(study.progressRate).toBeNull()
  })

  it('progressRate = 已刷 / 总题', () => {
    study.markKnow(1)
    study.markKnow(2)
    expect(study.reviewedCount).toBe(2)
    expect(study.progressRate).toBe(40) // 2/5
  })

  it('masteryRate = 会 / (会 + 不会)，分母为 0 时为 null', () => {
    expect(study.masteryRate).toBeNull()
    study.markKnow(1)
    expect(study.masteryRate).toBe(100)
    study.markUnknown(2)
    expect(study.masteryRate).toBe(50)
  })

  it('今日已刷只统计今天的记录', () => {
    study.markKnow(1)
    // 手工把 id=2 的记录挪到昨天
    const yesterday = Date.now() - 24 * 60 * 60 * 1000
    study.records = {
      ...study.records,
      2: { status: STATUS.KNOW, times: 1, lastReviewed: yesterday },
    }
    expect(study.todayReviewedCount).toBe(1)
  })

  it('分类掌握度按分类计算，分母为 0 为 null', () => {
    study.markKnow(1)
    study.markUnknown(2)
    const a = study.categoryStats.find((s) => s.category === 'A')
    expect(a).toMatchObject({ total: 2, know: 1, unknown: 1, reviewed: 2, mastery: 50 })

    const c = study.categoryStats.find((s) => s.category === 'C')
    expect(c.mastery).toBeNull()
  })

  it('未知 id 不参与统计（题库删题场景）', () => {
    study.records = {
      999: { status: STATUS.KNOW, times: 3, lastReviewed: Date.now() },
    }
    expect(study.reviewedCount).toBe(0)
    expect(study.knowCount).toBe(0)
  })
})

describe('错题本派生', () => {
  it('最近一次自评 unknown 才在错题本', () => {
    study.markUnknown(1)
    expect(study.wrongList.map((q) => q.id)).toEqual([1])
  })

  it('改判 know 后自动移出', () => {
    study.markUnknown(1)
    study.markKnow(1)
    expect(study.wrongList).toHaveLength(0)
  })

  it('按题库顺序返回', () => {
    study.markUnknown(3)
    study.markUnknown(1)
    expect(study.wrongList.map((q) => q.id)).toEqual([1, 3])
  })
})

describe('收藏', () => {
  it('toggle 添加与取消', () => {
    expect(study.isFavorite(1)).toBe(false)
    study.toggleFavorite(1)
    expect(study.isFavorite(1)).toBe(true)
    study.toggleFavorite(1)
    expect(study.isFavorite(1)).toBe(false)
  })

  it('收藏列表按收藏时间倒序', () => {
    study.toggleFavorite(1)
    study.toggleFavorite(3)
    study.toggleFavorite(2)
    expect(study.favoriteList.map((q) => q.id)).toEqual([2, 3, 1])
  })

  it('题库中不存在的收藏 id 不出现在列表', () => {
    study.favorites = [999, 1]
    expect(study.favoriteList.map((q) => q.id)).toEqual([1])
  })
})

describe('进度与清空', () => {
  it('saveProgress 写入并带 updatedAt', () => {
    study.saveProgress({ mode: 'random', category: 'A', index: 3 })
    expect(study.progress).toMatchObject({ mode: 'random', category: 'A', index: 3 })
    expect(study.progress.updatedAt).toBeGreaterThan(0)
  })

  it('index 负数归零', () => {
    study.saveProgress({ mode: 'sequential', index: -5 })
    expect(study.progress.index).toBe(0)
  })

  it('clearRecords 同时清进度', () => {
    study.markKnow(1)
    study.saveProgress({ mode: 'random', index: 2 })
    study.clearRecords()
    expect(study.records).toEqual({})
    expect(study.progress).toBeNull()
  })

  it('clearFavorites 清空收藏', () => {
    study.toggleFavorite(1)
    study.clearFavorites()
    expect(study.favorites).toEqual([])
  })
})

describe('localStorage 持久化', () => {
  it('写入后能从 storage 读到（flush 后）', async () => {
    study.markKnow(1)
    study.toggleFavorite(1)
    const { flushAll } = await import('@/utils/storage')
    flushAll()
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.RECORDS))['1'].status).toBe(STATUS.KNOW)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES))).toEqual([1])
  })

  it('损坏的记录数据被忽略并回退为空', async () => {
    localStorage.setItem(STORAGE_KEYS.RECORDS, '{"1": {"status": "bogus"}}')
    const { __resetPending, readJSON } = await import('@/utils/storage')
    __resetPending()
    setActivePinia(createPinia())
    const freshBank = useBankStore()
    freshBank.questions = FIXTURE
    const fresh = useStudyStore()
    expect(fresh.records).toEqual({})
    expect(readJSON(STORAGE_KEYS.RECORDS, {})).toEqual({})
  })
})

describe('getMastery', () => {
  it('返回聚合指标', () => {
    study.markKnow(1)
    study.markUnknown(2)
    const m = study.getMastery()
    expect(m).toMatchObject({ knowCount: 1, unknownCount: 1, reviewedCount: 2, masteryRate: 50 })
    expect(m.progressRate).toBe(40)
  })
})
