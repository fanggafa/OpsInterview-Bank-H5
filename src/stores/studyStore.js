import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useBankStore } from '@/stores/bankStore'
import { STATUS, STORAGE_KEYS, WRONG_CLEAR_STREAK, CATEGORIES } from '@/utils/constants'
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
  /**
   * 参赛门槛：一个分类要**刷过该分类题量的 33%**才参与排行。
   *
   * 为什么不再用「刷过 3 题」：3 题在 100+ 题的分类里只占 3%，
   * 刷三道全错就把这个分类判成 100% 薄弱，结论站不住。
   * 按比例才有可比性 —— 大分类和小分类都得刷够三成，才算「真的刷过」。
   *
   * 仍保留一个**下限 3 题**：很小的分类（如 32 题的 Python）刷到 33% 是 11 题，
   * 但如果某分类只有 6 题，33% 才 2 题，2 题的样本同样不可信。
   * 所以门槛取 max(3 题, 33%)。
   */
  const MIN_SAMPLE = 3
  const MIN_COVERAGE = 0.33
  const weakCategories = computed(() => {
    const stats = new Map()

    /**
     * **只统计选择题**。
     *
     * 简答题靠自评「会/不会」，没有客观对错；把它算进薄弱分类会造成两个问题：
     * ① 分母虚高 —— 简答题答过之后 `total` 变大，33% 门槛跟着抬高；
     * ② 语义混乱 —— 自评「不会」并不等于「这题做错了」。
     *
     * 而错题本已限定只收选择题，这里的 `wrong` 天然只来自选择题；
     * 但仍显式过滤一遍，避免 `total`/`reviewed` 把简答题的刷题记录算进来。
     */
    bank.questions.forEach((q) => {
      if (q.type === 'short') return
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
      .filter((s) => {
        if (s.wrong === 0) return false
        const need = Math.max(MIN_SAMPLE, Math.ceil(s.total * MIN_COVERAGE))
        return s.reviewed >= need
      })
      .map((s) => {
        const need = Math.max(MIN_SAMPLE, Math.ceil(s.total * MIN_COVERAGE))
        return { ...s, rate: ratio(s.wrong, s.reviewed), need }
      })
      .sort((a, b) => b.rate - a.rate || b.wrong - a.wrong)
  })

  /** 薄弱环节里错误率最高的那个分类（首页卡片用它显示摘要） */
  const weakestCategory = computed(() => weakCategories.value[0] || null)

  /**
   * 按分类合并「选择熟练度」与「简答掌握度」——「分类熟练度」页的数据源。
   *
   * ## 为什么要把错误率**反转**成熟练度
   *
   * 两个指标原本方向相反：
   * - 选择题：`wrong / reviewed` 是**错误率**，越低越好
   * - 简答题：`know / (know+unknown)` 是**掌握率**，越高越好
   *
   * 并排展示时用户会下意识横向比较这两个数字，而「40%」在左列是好、
   * 在右列是坏 —— 必然误读。所以统一成「越高越好」的熟练度：
   *
   *   choicePct = 1 - 错误率    （没刷过题时为 null）
   *   shortPct  = 掌握率        （没自评过时为 null）
   *
   * 两个都用同一个进度条语言，条越长越好。
   *
   * ## 为什么自己算而不复用 `weakCategories`
   *
   * `weakCategories` 有 **33% 上榜门槛**（样本不够就不进榜），
   * 那是「值不值得给结论」的筛选，与本页「如实展示每个分类的熟练度」不是一回事：
   * 刷了 3 题全对的分类，薄弱榜里没有它，但熟练度就是 100%。
   * 复用会把这些分类显示成「—」，看起来像没数据。
   * 所以这里独立统计，不受门槛影响。
   *
   * ## 分类顺序与空值
   *
   * 顺序跟随 `CATEGORIES`（业务优先级），与题库筛选、薄弱榜一致。
   * 某一类题在题库里不存在或没做过时，该列显示「—」，不剔除整行 ——
   * 否则分类列表会随题库变化忽多忽少。
   */
  const categoryProficiency = computed(() => {
    const stats = new Map()

    bank.questions.forEach((q) => {
      if (!stats.has(q.category)) {
        stats.set(q.category, {
          category: q.category,
          choiceTotal: 0,
          choiceReviewed: 0,
          choiceWrong: 0,
          shortTotal: 0,
          shortKnow: 0,
          shortUnknown: 0,
        })
      }
      const s = stats.get(q.category)
      const r = records.value[q.id]
      const short = isShort(q)

      if (short) {
        s.shortTotal += 1
        if (r) {
          if (r.status === STATUS.KNOW) s.shortKnow += 1
          else if (r.status === STATUS.UNKNOWN) s.shortUnknown += 1
        }
      } else {
        s.choiceTotal += 1
        // 已刷：有记录且实际刷过，或已进错题本（与 weakCategories 口径一致）
        if (r && (r.times > 0 || r.inWrong)) s.choiceReviewed += 1
        if (r && r.inWrong) s.choiceWrong += 1
      }
    })

    return CATEGORIES.map((c) => {
      const s = stats.get(c)
      if (!s) return null

      const shortAnswered = s.shortKnow + s.shortUnknown
      return {
        category: c,
        choice: {
          // 错误率 → 熟练度（1 - 错率）。没刷过 → null
          pct: s.choiceReviewed ? Math.round((1 - s.choiceWrong / s.choiceReviewed) * 100) : null,
          reviewed: s.choiceReviewed,
          total: s.choiceTotal,
          wrong: s.choiceWrong,
        },
        short: {
          pct: shortAnswered ? Math.round((s.shortKnow / shortAnswered) * 100) : null,
          know: s.shortKnow,
          total: s.shortTotal,
          answered: shortAnswered,
        },
      }
    }).filter(Boolean)
  })

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

    /**
     * **错题本只收选择题**。
     *
     * 规则：简答题只在「背题模式」出现（看题背答案、自评会/不会），
     * 它没有客观对错、也不参与错题复习与薄弱统计 ——
     * 进了错题本既复习不了（错题复习只抽选择题），还会污染薄弱分类的分母。
     *
     * 所以在源头拦住：简答题无论怎么自评，都不会被写进 inWrong。
     * 上游都自动正确（错题本列表、错题复习、薄弱分类统计都不用再各自过滤）。
     */
    const q = bank.questionMap.get(key)
    const shortAnswer = q ? isShort(q) : false

    let streak
    let inWrong

    if (status === STATUS.UNKNOWN) {
      // 答错：选择题进错题本、连对计数清零；简答题不进错题本
      streak = 0
      inWrong = !shortAnswer
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

  /**
   * 收藏 / 取消收藏。
   *
   * **收藏只收简答题**：收藏的定位是「留一道值得反复看的题」——
   * 简答题自带完整答案可读，适合反复看；选择题的价值在选项里，
   * 单独收进来脱离作答场景意义不大，因此选择题的收藏按钮已从三个页面移除。
   *
   * 这里在源头再拦一道：选择题即使被调用也不会写进 favorites，
   * 免得以后某个页面漏删按钮又把选择题塞进来。
   */
  function toggleFavorite(id) {
    const key = Number(id)
    if (!Number.isFinite(key)) return

    const q = bank.questionMap.get(key)
    // 已取消收藏时不拦：允许把历史误收的选择题清出去
    const favorited = favorites.value.includes(key)
    if (!favorited && q && !isShort(q)) return

    if (favorited) {
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
    categoryProficiency,
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
