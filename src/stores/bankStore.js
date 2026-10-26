import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { fetchQuestions, DataError } from '@/api/dataService'

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

  /** 加载失败后的重试 */
  function retry() {
    return load(true)
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
    retry,
    getById,
  }
})
