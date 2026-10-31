import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { fetchQuestions, fetchIndex, hydrateAnswers, DataError } from '@/api/dataService'

/**
 * 题库数据 + 加载态（loading / error / empty 三态）。
 * 全局唯一数据源，页面不直接 fetch。
 */
export const useBankStore = defineStore('bank', () => {
  /** @type {import('vue').Ref<Array>} */
  const questions = ref([])
  const loading = ref(false)
  const error = ref('')

  /** ref 只加载一次成功的 Promise，避免并发重复请求 */
  let inflight = null

  const total = computed(() => questions.value.length)
  const isEmpty = computed(() => !loading.value && !error.value && questions.value.length === 0)

  /** id -> question 的索引 */
  const questionMap = computed(() => {
    const map = new Map()
    questions.value.forEach((q) => map.set(q.id, q))
    return map
  })

  async function load(force = false) {
    if (inflight && !force) return inflight
    if (!force && questions.value.length) return questions.value

    loading.value = true
    error.value = ''

    inflight = fetchQuestions({ force })
      .then((data) => {
        questions.value = data
        return data
      })
      .catch((err) => {
        error.value = err instanceof DataError ? err.message : '题库加载失败，请稍后重试'
        throw err
      })
      .finally(() => {
        loading.value = false
        inflight = null
      })

    return inflight
  }

  /**
   * 只加载列表页索引（不含答案）。
   *
   * 用于列表/筛选/统计这类「只读摘要字段」的页面：体积约为全量的 8%
   * （gzip 121 KB vs 1455 KB）。
   *
   * 注意：走这条路径后 `questions` 里的元素**没有 answer/explanation/options**。
   * 需要答案的页面（QuestionView / PracticeView）必须调 load()（或 hydrateCategory），
   * 不能只依赖本方法。
   */
  const indexLoaded = ref(false)
  let indexInflight = null

  async function loadIndex(force = false) {
    if (indexInflight && !force) return indexInflight
    if (!force && indexLoaded.value && questions.value.length) return questions.value
    // 已经全量加载过，直接复用（全量是索引的超集）
    if (!force && fullLoaded) return questions.value
    // 内存里已经有数据（例如测试直接注入、或别处已经加载过）→ 不再重复请求
    if (!force && questions.value.length) return questions.value

    loading.value = true
    error.value = ''

    indexInflight = fetchIndex({ force })
      .then((rows) => {
        questions.value = rows
        indexLoaded.value = true
        return rows
      })
      .catch((err) => {
        error.value = err instanceof DataError ? err.message : '题库加载失败，请稍后重试'
        throw err
      })
      .finally(() => {
        loading.value = false
        indexInflight = null
      })

    return indexInflight
  }

  /** 是否已按「全量含答案」加载过 */
  let fullLoaded = false

  /**
   * 为某个分类补齐答案（只拉该分类的分片）。
   *
   * 场景：用户从列表进到某分类的题目详情/刷题时，只补这个分类的答案即可，
   * 不用下载全部 25 个分片。
   *
   * @param {string} category 分类名；空字符串表示补齐全部分类
   */
  async function hydrateCategory(category = '') {
    if (fullLoaded) return questions.value
    // 需要先有索引行
    if (!questions.value.length) await loadIndex()

    // 内存里的题目已经带答案（例如测试注入的完整 FIXTURE，或已 hydrate 过）
    // → 不必再请求分片
    if (questions.value.every((q) => q.answer !== undefined)) {
      fullLoaded = true
      return questions.value
    }

    const merged = await hydrateAnswers(questions.value, category)
    questions.value = merged
    if (!category) fullLoaded = true
    return merged
  }

  /** 加载失败后的重试 */
  function retry() {
    return load(true)
  }

  /** 列表页重试：仍然走索引路径（不因为重试就把全量拉下来） */
  function retryIndex() {
    return loadIndex(true)
  }

  function getById(id) {
    const numeric = Number(id)
    return questionMap.value.get(numeric) || null
  }

  return {
    questions,
    loading,
    error,
    total,
    isEmpty,
    questionMap,
    load,
    loadIndex,
    hydrateCategory,
    indexLoaded,
    retry,
    retryIndex,
    getById,
  }
})
