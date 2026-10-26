import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'
import { STATUS } from '@/utils/constants'
import { shuffle } from '@/utils/format'
import { isShort, isChoice, judgeChoice, resultToStatus } from '@/utils/question'

/**
 * 模拟面试会话：仅内存，不持久化（刷新即失效，路由守卫会跳回设置页）。
 *
 * 判定口径（与刷题页一致）：
 * - 简答题：用户自评「会 / 不会」
 * - 选择题：选项比对，「答对 → know，答错 → unknown」
 * - 多选题：全对才算对
 *
 * 得分统一为 round(know / 总题数 * 100)（PRD §二.5）。
 */

export const useInterviewStore = defineStore('interview', () => {
  const bank = useBankStore()
  const study = useStudyStore()

  /** 会话题目 id 列表 */
  const ids = ref([])
  /** 每题结果：{ [id]: 'know'|'unknown' } */
  const answers = ref({})
  /** 当前题号（0 起） */
  const cursor = ref(0)
  /** 会话快照：题数与分类范围，用于结果页展示 */
  const meta = ref({ size: 0, categories: [] })

  const active = computed(() => ids.value.length > 0)
  const total = computed(() => ids.value.length)
  const currentId = computed(() => ids.value[cursor.value] ?? null)
  const current = computed(() => (currentId.value ? bank.getById(currentId.value) : null))
  const currentIsShort = computed(() => (current.value ? isShort(current.value) : true))
  const isFinished = computed(() => active.value && cursor.value >= ids.value.length)

  const answeredCount = computed(() => Object.keys(answers.value).length)
  const progressPercent = computed(() =>
    total.value ? Math.round((answeredCount.value / total.value) * 100) : 0
  )

  /** 结果页数据 */
  const result = computed(() => {
    if (!ids.value.length) return null

    const details = ids.value.map((id) => {
      const q = bank.getById(id)
      return {
        id,
        category: q?.category || '',
        type: q?.type || 'short',
        question: q?.question || '',
        status: answers.value[id] || null,
      }
    })

    const know = details.filter((d) => d.status === STATUS.KNOW).length
    const unknown = details.filter((d) => d.status === STATUS.UNKNOWN).length
    const answered = know + unknown
    const unanswered = details.length - answered

    // 按分类聚合
    const byCategory = new Map()
    details.forEach((d) => {
      if (!d.category) return
      if (!byCategory.has(d.category)) {
        byCategory.set(d.category, { category: d.category, know: 0, unknown: 0, total: 0 })
      }
      const s = byCategory.get(d.category)
      s.total += 1
      if (d.status === STATUS.KNOW) s.know += 1
      else if (d.status === STATUS.UNKNOWN) s.unknown += 1
    })

    const categories = Array.from(byCategory.values())
      .map((s) => {
        const catAnswered = s.know + s.unknown
        return {
          ...s,
          answered: catAnswered,
          rate: catAnswered ? Math.round((s.know / catAnswered) * 100) : null,
        }
      })
      .filter((s) => s.answered > 0)
      .sort((a, b) => (a.rate ?? 0) - (b.rate ?? 0) || b.answered - a.answered)

    // 薄弱分类：正确率 < 100 的，升序取前 3
    const weakCategories = categories.filter((s) => s.rate !== null && s.rate < 100).slice(0, 3)

    // 题型分布
    const choiceDetails = details.filter((d) => isChoice({ type: d.type }))
    const choiceKnow = choiceDetails.filter((d) => d.status === STATUS.KNOW).length

    return {
      total: details.length,
      know,
      unknown,
      answered,
      unanswered,
      /** 百分制得分：答对（会）占比 */
      score: details.length ? Math.round((know / details.length) * 100) : 0,
      /** 已答题里的正确率，便于区分「没答完」与「答错」 */
      accuracy: answered ? Math.round((know / answered) * 100) : null,
      categories,
      weakCategories,
      details,
      shortCount: details.length - choiceDetails.length,
      choiceCount: choiceDetails.length,
      choiceKnow,
      choiceTotal: choiceDetails.length,
    }
  })

  /**
   * 生成会话
   * @param {{size:number, categories:string[]}} options
   * @returns {boolean} 是否成功（pool 为空时 false）
   */
  function start({ size = 10, categories = [] } = {}) {
    const cats = Array.isArray(categories) ? categories.filter(Boolean) : []
    const pool = cats.length
      ? bank.questions.filter((q) => cats.includes(q.category))
      : bank.questions.slice()

    if (!pool.length) {
      ids.value = []
      answers.value = {}
      cursor.value = 0
      meta.value = { size: 0, categories: cats }
      return false
    }

    const requested = Math.max(1, Number(size) || 10)
    const count = Math.min(requested, pool.length)
    // 随机不重复
    ids.value = shuffle(pool).slice(0, count).map((q) => q.id)
    answers.value = {}
    cursor.value = 0
    meta.value = { size: count, categories: cats }
    return true
  }

  /** 记录单题结果（不前进） */
  function answer(id, status) {
    if (!ids.value.includes(Number(id))) return
    answers.value = { ...answers.value, [Number(id)]: status }
  }

  /** 提交当前题自评（简答题）并前进 */
  function submit(status) {
    const id = currentId.value
    if (!id) return
    answer(id, status)
    advance()
  }

  /**
   * 提交当前题的选择题选项并判定，然后前进。
   * @param {string[]} selected 选中的 key 数组
   * @returns {{ passed: boolean, selected: string[] } | null}
   */
  function submitChoice(selected) {
    const q = current.value
    if (!q) return null
    const keys = Array.isArray(selected) ? selected : []
    if (!keys.length) return null

    const passed = judgeChoice(q, keys)
    answer(q.id, resultToStatus(passed))
    advance()
    return { passed, selected: keys }
  }

  function advance() {
    cursor.value = Math.min(cursor.value + 1, ids.value.length)
  }

  function reset() {
    ids.value = []
    answers.value = {}
    cursor.value = 0
    meta.value = { size: 0, categories: [] }
  }

  /**
   * 结束后把结果写入学习记录。
   * 只在进入结果页时调用一次，避免中途污染统计口径。
   */
  function commitToStudy() {
    ids.value.forEach((id) => {
      const st = answers.value[id]
      if (st === STATUS.KNOW) study.markKnow(id)
      else if (st === STATUS.UNKNOWN) study.markUnknown(id)
    })
  }

  return {
    ids,
    answers,
    cursor,
    meta,
    active,
    total,
    currentId,
    current,
    currentIsShort,
    isFinished,
    answeredCount,
    progressPercent,
    result,
    start,
    answer,
    submit,
    submitChoice,
    reset,
    commitToStudy,
  }
})
