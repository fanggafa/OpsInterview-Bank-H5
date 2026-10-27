import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useBankStore } from '@/stores/bankStore'
import { STATUS, STORAGE_KEYS } from '@/utils/constants'
import { readJSON, writeJSON, writeJSONThrottled } from '@/utils/storage'
import { isToday, ratio } from '@/utils/format'

/**
 * 学习记录 / 收藏 / 刷题进度。
 * 统计口径见 PRD §五.4，全部在此实现，页面只读 getters。
 */

import { isShort } from '@/utils/question'

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const isValidRecord = (r) =>
  isPlainObject(r) && (r.status === STATUS.KNOW || r.status === STATUS.UNKNOWN)
const isValidRecords = (v) =>
  isPlainObject(v) && Object.values(v).every((r) => isValidRecord(r))
const isValidFavorites = (v) => Array.isArray(v) && v.every((id) => typeof id === 'number')
const isValidProgress = (v) =>
  isPlainObject(v) &&
  typeof v.index === 'number' &&
  (v.studyMode === undefined || typeof v.studyMode === 'string')

export const useStudyStore = defineStore('study', () => {
  const bank = useBankStore()

  /** @type {Ref<Record<number, {status:string, times:number, lastReviewed:number}>>} */
  const records = ref(readJSON(STORAGE_KEYS.RECORDS, {}, isValidRecords))
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

  /** 选择题正确率（独立指标，仅在统计页展示） */
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

  /** 错题本：最近一次自评为 unknown 的题目 */
  const wrongList = computed(() =>
    bank.questions.filter((q) => statusOf(q.id) === STATUS.UNKNOWN)
  )

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

  function mark(id, status) {
    const key = Number(id)
    if (!Number.isFinite(key)) return
    const prev = records.value[key]
    records.value = {
      ...records.value,
      [key]: {
        status,
        times: (prev?.times || 0) + 1,
        lastReviewed: Date.now(),
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
    favoriteList,
    // helpers
    recordOf,
    statusOf,
    isFavorite,
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
