import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { fetchAllSharded, fetchIndex, hydrateAnswers, DataError } from '@/api/dataService'

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

  /** 是否已按「全量含答案」加载过（决定 load() 能否直接复用缓存） */
  let fullLoaded = false

  const total = computed(() => questions.value.length)
  const isEmpty = computed(() => !loading.value && !error.value && questions.value.length === 0)

  /** id -> question 的索引 */
  const questionMap = computed(() => {
    const map = new Map()
    questions.value.forEach((q) => map.set(q.id, q))
    return map
  })

  /**
   * 加载**全部题目**（含答案）。
   *
   * 现在内部走分片路径（索引 + 全部分片），不再请求单文件 questions.json ——
   * 后者已从部署产物中剔除（只有 4.3 MB，运行时用不到）。
   * 返回值语义不变：完整题目数组，元素含 answer/explanation/options。
   */
  async function load(force = false) {
    if (inflight && !force) return inflight
    if (!force && questions.value.length && fullLoaded) return questions.value

    loading.value = true
    error.value = ''

    inflight = fetchAllSharded({ force })
      .then((data) => {
        questions.value = data
        fullLoaded = true
        indexLoaded.value = true
        noteSuccess()
        return data
      })
      .catch((err) => {
        error.value = err instanceof DataError ? err.message : '题库加载失败，请稍后重试'
        noteFailure(err)
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
        noteSuccess()
        return rows
      })
      .catch((err) => {
        error.value = err instanceof DataError ? err.message : '题库加载失败，请稍后重试'
        noteFailure(err)
        throw err
      })
      .finally(() => {
        loading.value = false
        indexInflight = null
      })

    return indexInflight
  }

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

  /**
   * 重试退避状态。
   *
   * 为什么要退避：错误态里有「重试」按钮，用户可能连点；若再接入自动重试，
   * 一瞬间会打出几十个请求。退避让「连续失败」的间隔指数增长，
   * 并把「下次可重试的时间」暴露给界面，按钮在冷却期内可置灰。
   */
  const retryAttempt = ref(0)
  const retryAfterMs = ref(0)

  /** 退避间隔：1s → 2s → 4s → 8s，封顶 15s（与请求超时同量级） */
  const BACKOFF_BASE_MS = 1000
  const BACKOFF_MAX_MS = 15000

  function computeBackoff(n) {
    return Math.min(BACKOFF_BASE_MS * 2 ** Math.max(0, n - 1), BACKOFF_MAX_MS)
  }

  /** 记一次失败，返回该错误是否可重试 */
  function noteFailure(err) {
    retryAttempt.value += 1
    const retryable = err instanceof DataError ? err.retryable !== false : true
    // 不可重试类错误（格式解析失败 / 4xx）不设冷却 —— 冷却也没用，不如直接告诉用户没法重试
    retryAfterMs.value = retryable ? computeBackoff(retryAttempt.value) : 0
    return retryable
  }

  /** 成功即清零退避 */
  function noteSuccess() {
    retryAttempt.value = 0
    retryAfterMs.value = 0
  }

  /** 当前是否在退避冷却中 */
  const inCooldown = computed(() => retryAfterMs.value > 0)

  /**
   * 是否还值得再点重试。
   *
   * 没有错误 → 无所谓（true）；有错误时，只有「可重试类错误」才返回 true ——
   * 由 noteFailure 决定：不可重试的错误（数据格式坏了 / 4xx）不设冷却，
   * 这时 retryAfterMs 为 0，说明点了也没用。
   */
  const canRetry = computed(() => {
    if (!error.value) return true
    return retryAfterMs.value > 0
  })

  /** 加载失败后的重试（全量含答案） */
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
    // 重试退避：界面据此在冷却期内置灰「重试」按钮
    retryAttempt,
    retryAfterMs,
    inCooldown,
    canRetry,
  }
})
