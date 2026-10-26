/**
 * 题库筛选的纯函数集合。
 * 全部无副作用，便于单测；组件只负责组合与渲染。
 */
import { matchKeyword } from '@/utils/format'

/**
 * 按分类筛选。category 为空表示「全部分类」。
 * @param {Array} questions
 * @param {string|null|undefined} category
 */
export function filterByCategory(questions, category) {
  if (!category) return questions.slice()
  return questions.filter((q) => q.category === category)
}

/**
 * 按频率筛选。frequency 为空表示「全部频率」。
 * @param {Array} questions
 * @param {string|null|undefined} frequency
 */
export function filterByFrequency(questions, frequency) {
  if (!frequency) return questions.slice()
  return questions.filter((q) => q.frequency === frequency)
}

/**
 * 按关键词筛选：命中题干 / 答案 / 标签 / 选项 / 解析，忽略大小写。
 * @param {Array} questions
 * @param {string} keyword
 */
export function filterByKeyword(questions, keyword) {
  if (!keyword || !String(keyword).trim()) return questions.slice()
  return questions.filter((q) => matchKeyword(q, keyword))
}

/**
 * 组合筛选：分类 → 频率 → 关键词。
 * 顺序固定，保证行为可预测。
 * @param {Array} questions
 * @param {{category?: string, frequency?: string, keyword?: string}} filters
 */
export function applyFilters(questions, { category = '', frequency = '', keyword = '' } = {}) {
  let result = filterByCategory(questions, category)
  result = filterByFrequency(result, frequency)
  result = filterByKeyword(result, keyword)
  return result
}

/**
 * 统计各分类题量，返回 { 分类名: 数量 }。
 * @param {Array} questions
 */
export function countByCategory(questions) {
  const counts = {}
  questions.forEach((q) => {
    counts[q.category] = (counts[q.category] || 0) + 1
  })
  return counts
}

/**
 * 从 route.query 中解析出筛选状态，并对非法值做兜底。
 * URL 是筛选态的唯一来源，保证刷新/返回后可恢复。
 * @param {Object} query
 * @param {string[]} categories 合法分类枚举
 * @param {string[]} frequencies 合法频率枚举
 */
export function parseQueryState(query = {}, categories = [], frequencies = []) {
  const category = categories.includes(query.category) ? query.category : ''
  const frequency = frequencies.includes(query.frequency) ? query.frequency : ''
  const keyword = typeof query.q === 'string' ? query.q : ''
  return { category, frequency, keyword }
}

/**
 * 把筛选状态序列化为 route.query（空值省略，保持 URL 干净）。
 * @param {Object} state
 * @param {number} [page] 页码，1 时省略
 */
export function toQueryState({ category, frequency, keyword }, page = 1) {
  const query = {}
  if (category) query.category = category
  if (frequency) query.frequency = frequency
  if (keyword && keyword.trim()) query.q = keyword.trim()
  if (Number(page) > 1) query.page = String(page)
  return query
}
