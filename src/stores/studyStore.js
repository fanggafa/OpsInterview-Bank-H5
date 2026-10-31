import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useBankStore } from '@/stores/bankStore'
import { STATUS, STORAGE_KEYS, WRONG_CLEAR_STREAK } from '@/utils/constants'
import { readJSON, writeJSON, writeJSONThrottled } from '@/utils/storage'
import { isToday, ratio } from '@/utils/format'

/**
 * 学习记录 / 收藏 / 刷题进度。
 * 统计口径见 PRD §五.4，全部在此实现，页面只读 getters。
 */

import { isShort } from '@/utils/question'

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

/**
 * 单条记录校验 + 归一化。
 *
 * 记录结构：{ status, times, lastReviewed, streak, inWrong }
 * - streak：自上次答错以来「连续答对」的次数，答错即归零
 * - inWrong：是否在错题本里（答错进入，连续对满 3 次移出）
 *
 * 老数据没有这两个字段（旧版本只有 status/times/lastReviewed），
 * 读取时按「最近一次是不是答错」补出来，避免升级后错题本凭空清空。
 */
function normalizeRecord(r) {
  if (!isPlainObject(r)) return null
  if (r.status !== STATUS.KNOW && r.status !== STATUS.UNKNOWN) return null

  const times = Number.isFinite(r.times) ? Math.max(0, r.times) : 1
  const lastReviewed = Number.isFinite(r.lastReviewed) ? r.lastReviewed : 0
  const streak = Number.isFinite(r.streak) ? Math.max(0, r.streak) : 0

  /**
   * inWrong 缺省时回退推断：
   * 只有「最近一次答错」的老记录才进错题本（与旧行为一致），
   * 已经连续答对足够多次的老记录不会凭空复活成错题。
   */
  const inWrong =
    typeof r.inWrong === 'boolean'
      ? r.inWrong
      : r.status === STATUS.UNKNOWN

  return { status: r.status, times, lastReviewed, streak, inWrong }
}

const isValidFavorites = (v) => Array.isArray(v) && v.every((id) => typeof id === 'number')

/** 读取时整批归一化，兼容旧结构（旧数据没有 streak / inWrong） */
function readRecords() {
  const raw = readJSON(STORAGE_KEYS.RECORDS, {})
  if (!isPlainObject(raw)) return {}
  const out = {}
  Object.entries(raw).forEach(([key, value]) => {
    const rec = normalizeRecord(value)
    if (rec) out[key] = rec
  })
  return out
}

const isValidProgress = (v) =>
  isPlainObject(v) &&
  typeof v.index === 'number' &&
  (v.studyMode === undefined || typeof v.studyMode === 'string')

export const useStudyStore = defineStore('study', () => {
  const bank = useBankStore()

  /** @type {Ref<Record<number, {status:string, times:number, lastReviewed:number, streak:number, inWrong:boolean}>>} */
  const records = ref(readRecords())
  /** @type {Ref<number[]>} */
  const favorites = ref(readJSON(STORAGE_KEYS.FAVORITES, [], isValidFavorites))
  /** @type {Ref<{mode:string, category:string|null, index:number, updatedAt:number}|null>} */
  const progress = ref(readJSON(STORAGE_KEYS.PROGRESS, null, (v) => v === null || isValidProgress(v)))

  // ---------- 基础读取 ----------

  function recordOf(id) {
    return records.value[id] || null
  }

  function statusOf(id) {
    const r = records.value[id]
    return r ? r.status : null
  }

  function isFavorite(id) {
    return favorites.value.includes(Number(id))
  }

  /**
   * 有效记录：仅保留题库中存在的 id。
   * 未知 id 保留在 localStorage（便于题库回滚），但不参与统计与展示。
   */
  const effectiveIds = computed(() => {
    const ids = Object.keys(records.value).map(Number)
    if (!bank.total) return new Set()
    return new Set(ids.filter((id) => bank.questionMap.has(id)))
  })

  const reviewedIds = computed(() =>
    Array.from(effectiveIds.value).filter((id) => (records.value[id]?.times || 0) > 0)
  )

  // ---------- 统计（PRD §五.4） ----------

  /** 已刷题数 */
  const reviewedCount = computed(() => reviewedIds.value.length)

  /** 总进度 = 已刷 / 总题；总题为 0 返回 null */
  const progressRate = computed(() => ratio(reviewedCount.value, bank.total))

  const knowCount = computed(
    () => Array.from(effectiveIds.value).filter((id) => records.value[id].status === STATUS.KNOW).length
  )

  const unknownCount = computed(
    () =>
      Array.from(effectiveIds.value).filter((id) => records.value[id].status === STATUS.UNKNOWN)
        .length
  )

  // ---------- 简答题 / 选择题分开统计（v1.3，PRD §五.4） ----------

  /** 简答题的有效记录 id（掌握率只统计这些） */
  const shortIds = computed(() =>
    Array.from(effectiveIds.value).filter((id) => {
      const q = bank.questionMap.get(id)
      return q && isShort(q)
    })
  )

  /** 选择题的有效记录 id */
  const choiceIds = computed(() =>
    Array.from(effectiveIds.value).filter((id) => {
      const q = bank.questionMap.get(id)
      return q && !isShort(q)
    })
  )

  const shortKnowCount = computed(
    () => shortIds.value.filter((id) => records.value[id].status === STATUS.KNOW).length
  )

  const shortUnknownCount = computed(
    () => shortIds.value.filter((id) => records.value[id].status === STATUS.UNKNOWN).length
  )

  const choiceKnowCount = computed(
    () => choiceIds.value.filter((id) => records.value[id].status === STATUS.KNOW).length
  )

  const choiceUnknownCount = computed(
    () => choiceIds.value.filter((id) => records.value[id].status === STATUS.UNKNOWN).length
  )

  const shortTotal = computed(() => bank.questions.filter((q) => isShort(q)).length)
  const choiceTotal = computed(() => bank.questions.filter((q) => !isShort(q)).length)

  /** 掌握率 = 简答答对 / (简答答对 + 简答答错)；分母为 0 返回 null */
  const masteryRate = computed(() =>
    ratio(shortKnowCount.value, shortKnowCount.value + shortUnknownCount.value)
  )

  /** 选择题正确率（独立指标，展示在「我的」页） */
  const choiceRate = computed(() =>
    ratio(choiceKnowCount.value, choiceKnowCount.value + choiceUnknownCount.value)
  )

  /** 今日已刷题数（lastReviewed 落在本地时区今天） */
  const todayReviewedCount = computed(() => {
    const now = Date.now()
    return reviewedIds.value.filter((id) => isToday(records.value[id].lastReviewed, now)).length
  })

  /** 各分类掌握度：[{ category, total, reviewed, know, unknown, mastery }] */
  const categoryStats = computed(() => {
    const stats = new Map()
    bank.questions.forEach((q) => {
      if (!stats.has(q.category)) {
        stats.set(q.category, {
          category: q.category,
          total: 0,
          shortTotal: 0,
          choiceTotal: 0,
          know: 0,
          unknown: 0,
          reviewed: 0,
        })
      }
      const s = stats.get(q.category)
      s.total += 1
      if (isShort(q)) s.shortTotal += 1
      else s.choiceTotal += 1
    })

    Array.from(effectiveIds.value).forEach((id) => {
      const q = bank.questionMap.get(id)
      if (!q) return
      const s = stats.get(q.category)
      if (!s) return
      const st = records.value[id].status
      // 掌握度只累计简答题；选择题单独统计
      if (isShort(q)) {
        if (st === STATUS.KNOW) s.know += 1
        else if (st === STATUS.UNKNOWN) s.unknown += 1
      }
      if (records.value[id].times > 0) s.reviewed += 1
    })

    return Array.from(stats.values()).map((s) => ({
      ...s,
      mastery: ratio(s.know, s.know + s.unknown),
    }))
  })

  /**
   * 错题本：inWrong 为真的题。
   *
   * 判定与「最近一次是否答错」解耦了：答错时进入，之后答对不会立刻移出，
   * 要连续答对满 WRONG_CLEAR_STREAK（3）次才移出。
   *
   * 为什么这样改：用户反馈「之前刷题肯定有做错的题目，所以从错题本抽 10 题
   * 来复习用；答错和自评不会的都记录进去，但是之后任意方式刷到后，
   * 累计三次都对就自动从错题本里面剔除」——
   * 一次性答对就移出会把「刚背下来的题」过早清掉，三次才算真的过了。
   */
  const wrongList = computed(() => bank.questions.filter((q) => isWrong(q.id)))

  /**
   * 薄弱环节：按分类统计错题的**错误率**，降序排列（不截断，详情页要全列）。
   *
   * 两条计算规则，都是为了让「弱」这个判断可信：
   *
   * 1. **分母是已刷题数，不是分类总题数**。
   *    某分类 30 题只刷 5 题、错 3 题：按总数算是 10%（看着挺健康），
   *    按已刷数算是 60%（这才是真实水平）。分母必须是有记录的题。
   *
   * 2. **样本不足不进榜（门槛 3 题）**。
   *    只刷 1 题就错 → 100%，会排到第一，但那是样本不足不是真弱。
   *    刷题量少时宁可不返回数据，也不给误导结论。
   *
   * 返回项同时带 reviewed / total，界面可显示「已刷 5/30」，
   * 让用户知道这份错误率是在多大样本上得出的。
   */
  const MIN_SAMPLE = 3
  const weakCategories = computed(() => {
    const stats = new Map()

    bank.questions.forEach((q) => {
      if (!stats.has(q.category)) {
        stats.set(q.category, { category: q.category, total: 0, reviewed: 0, wrong: 0 })
      }
      const s = stats.get(q.category)
      s.total += 1
      const r = records.value[q.id]
      // 已刷：有记录且实际刷过（times>0），或已进错题本
      if (r && (r.times > 0 || r.inWrong)) s.reviewed += 1
      if (r && r.inWrong) s.wrong += 1
    })

    return Array.from(stats.values())
      .filter((s) => s.reviewed >= MIN_SAMPLE && s.wrong > 0)
      .map((s) => ({ ...s, rate: ratio(s.wrong, s.reviewed) }))
      .sort((a, b) => b.rate - a.rate || b.wrong - a.wrong)
  })

  /** 薄弱环节里错误率最高的那个分类（首页卡片用它显示摘要） */
  const weakestCategory = computed(() => weakCategories.value[0] || null)

  /** 某题是否在错题本 */
  function isWrong(id) {
    const r = records.value[Number(id)]
    return !!(r && r.inWrong)
  }

  /** 某题当前连续答对了几次（错题本卡片上展示进度） */
  function streakOf(id) {
    const r = records.value[Number(id)]
    return r ? r.streak || 0 : 0
  }

  /** 收藏列表：按收藏时间倒序（存储为 push 顺序，展示时反转） */
  const favoriteList = computed(() =>
    favorites.value
      .slice()
      .reverse()
      .map((id) => bank.questionMap.get(id))
      .filter(Boolean)
  )

  // ---------- 写入 ----------

  function persistRecords() {
    writeJSONThrottled(STORAGE_KEYS.RECORDS, records.value)
  }

  function persistFavorites() {
    writeJSONThrottled(STORAGE_KEYS.FAVORITES, favorites.value)
  }

  function persistProgress() {
    writeJSONThrottled(STORAGE_KEYS.PROGRESS, progress.value)
  }

  /**
   * 记录一次作答。
   *
   * 错题本规则（三条路径都适用——刷题、每日一题、复习赛，只要调到这里）：
   * - 答错 / 自评「不会」→ 进错题本，连续答对清零
   * - 答对 / 自评「会」→ 连续答对 +1；若本来在错题本且已经连对满 3 次，移出
   *
   * 注意移出后不再重算：已经「毕业」的题，即使后来又答对，
   * streak 继续累加但不影响任何展示（inWrong 已经是 false）。
   */
  function mark(id, status) {
    const key = Number(id)
    if (!Number.isFinite(key)) return

    const prev = records.value[key]
    const prevStreak = prev?.streak || 0
    const prevInWrong = !!prev?.inWrong

    let streak
    let inWrong

    if (status === STATUS.UNKNOWN) {
      // 答错：必进错题本，连对计数清零
      streak = 0
      inWrong = true
    } else {
      // 答对：连对 +1
      streak = prevStreak + 1
      if (prevInWrong) {
        // 在错题本里的题，连对满 3 次才毕业
        inWrong = streak < WRONG_CLEAR_STREAK
      } else {
        // 本来就不在错题本：保持不在（答对不会把题送进错题本）
        inWrong = false
      }
    }

    records.value = {
      ...records.value,
      [key]: {
        status,
        times: (prev?.times || 0) + 1,
        lastReviewed: Date.now(),
        streak,
        inWrong,
      },
    }
    persistRecords()
  }

  function markKnow(id) {
    mark(id, STATUS.KNOW)
  }

  function markUnknown(id) {
    mark(id, STATUS.UNKNOWN)
  }

  function toggleFavorite(id) {
    const key = Number(id)
    if (!Number.isFinite(key)) return
    const index = favorites.value.indexOf(key)
    if (index >= 0) {
      favorites.value = favorites.value.filter((f) => f !== key)
    } else {
      favorites.value = [...favorites.value, key]
    }
    writeJSON(STORAGE_KEYS.FAVORITES, favorites.value)
  }

  /** 保存刷题进度（「继续上次刷题」） */
  function saveProgress({ mode, studyMode, category = null, index = 0 }) {
    progress.value = {
      mode: mode || 'sequential',
      // 练习模式要一起存：否则「继续上次」无法恢复上次是在刷题还是背题
      studyMode: studyMode || 'practice',
      category: category || null,
      index: Math.max(0, Number(index) || 0),
      updatedAt: Date.now(),
    }
    persistProgress()
  }

  function clearProgress() {
    progress.value = null
    writeJSON(STORAGE_KEYS.PROGRESS, null)
  }

  function clearRecords() {
    records.value = {}
    progress.value = null
    writeJSON(STORAGE_KEYS.RECORDS, {})
    writeJSON(STORAGE_KEYS.PROGRESS, null)
  }

  function clearFavorites() {
    favorites.value = []
    writeJSON(STORAGE_KEYS.FAVORITES, [])
  }

  /** 供详情页/刷题页统一取掌握状态文案 */
  function getMastery() {
    return {
      knowCount: knowCount.value,
      unknownCount: unknownCount.value,
      reviewedCount: reviewedCount.value,
      masteryRate: masteryRate.value,
      progressRate: progressRate.value,
      shortKnowCount: shortKnowCount.value,
      shortUnknownCount: shortUnknownCount.value,
      choiceKnowCount: choiceKnowCount.value,
      choiceUnknownCount: choiceUnknownCount.value,
      choiceRate: choiceRate.value,
    }
  }

  return {
    records,
    favorites,
    progress,
    // getters
    effectiveIds,
    reviewedIds,
    reviewedCount,
    progressRate,
    knowCount,
    unknownCount,
    masteryRate,
    shortIds,
    choiceIds,
    shortKnowCount,
    shortUnknownCount,
    choiceKnowCount,
    choiceUnknownCount,
    shortTotal,
    choiceTotal,
    choiceRate,
    todayReviewedCount,
    categoryStats,
    wrongList,
    weakCategories,
    weakestCategory,
    favoriteList,
    // helpers
    recordOf,
    statusOf,
    isFavorite,
    isWrong,
    streakOf,
    getMastery,
    // actions
    markKnow,
    markUnknown,
    toggleFavorite,
    saveProgress,
    clearProgress,
    clearRecords,
    clearFavorites,
  }
})
