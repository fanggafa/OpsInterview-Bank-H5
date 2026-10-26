/**
 * 刷题队列构建的纯函数。
 *
 * 模式（PRD §二.2）：
 * - sequential：按题库顺序，全量
 * - random：打乱题库顺序，全量
 * - wrong：仅「最近一次自评为 unknown」的题，按题库顺序
 *
 * 队列只由「题库 + 筛选条件 + 模式」决定，与学习记录无关的快照；
 * 断点续刷由 index 定位，不重新构建队列，保证题序稳定。
 */
import { PRACTICE_MODES } from '@/utils/constants'
import { shuffle } from '@/utils/format'

/** 归一化模式，非法值回退 sequential */
export function normalizeMode(mode) {
  return PRACTICE_MODES.includes(mode) ? mode : 'sequential'
}

/**
 * 按分类过滤题目。category 为空表示全部。
 */
function byCategory(questions, category) {
  if (!category) return questions.slice()
  return questions.filter((q) => q.category === category)
}

/**
 * 构建刷题队列。
 *
 * @param {Array} questions 题库全量
 * @param {Object} options
 * @param {string} [options.mode='sequential'] 刷题模式
 * @param {string} [options.category=''] 分类（空=全部）
 * @param {Set<number>|number[]} [options.wrongIds] 错题 id 集合（mode=wrong 时必传）
 * @param {() => number} [options.random] 注入随机源，便于测试
 * @returns {Array} 题目数组
 */
export function buildQueue(questions, { mode = 'sequential', category = '', wrongIds = [], random } = {}) {
  const normalized = normalizeMode(mode)
  const scoped = byCategory(questions, category)

  if (normalized === 'wrong') {
    const idSet = wrongIds instanceof Set ? wrongIds : new Set(wrongIds)
    return scoped.filter((q) => idSet.has(q.id))
  }

  if (normalized === 'random') {
    // 允许注入随机源以固定测试结果
    if (typeof random === 'function') {
      const arr = scoped.slice()
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
      }
      return arr
    }
    return shuffle(scoped)
  }

  return scoped
}

/**
 * 解析断点续刷的位置。
 *
 * 规则（PRD §二.2）：
 * - 无 progress → 从 0 开始，非续刷
 * - progress 的 mode/category 与本次一致 → 从 progress.index 续刷
 * - 不一致 → 从 0 开始
 *
 * @param {Object|null} progress
 * @param {{mode: string, category: string}} current
 * @param {number} queueLength
 * @returns {{index: number, resumed: boolean}}
 */
export function resolveStartIndex(progress, current, queueLength) {
  const none = { index: 0, resumed: false }
  if (!progress || !queueLength) return none
  if (normalizeMode(progress.mode) !== normalizeMode(current.mode)) return none
  if ((progress.category || '') !== (current.category || '')) return none

  const saved = Number(progress.index)
  if (!Number.isInteger(saved) || saved <= 0) return none
  if (saved >= queueLength) return none

  return { index: saved, resumed: true }
}

/**
 * 「继续上次刷题」入口的文案与目标。
 * 无进度时返回 null。
 */
export function describeProgress(progress) {
  if (!progress) return null
  const modeLabel =
    progress.mode === 'random' ? '随机' : progress.mode === 'wrong' ? '错题' : '顺序'
  return {
    category: progress.category || '全部题目',
    modeLabel,
    index: Number(progress.index) || 0,
    positionText: `第 ${(Number(progress.index) || 0) + 1} 题`,
  }
}

/**
 * 本轮完成小结数据。
 * @param {number} know 会
 * @param {number} unknown 不会
 */
export function summarizeRound(know, unknown) {
  const total = know + unknown
  return {
    know,
    unknown,
    total,
    knowRate: total ? Math.round((know / total) * 100) : null,
  }
}
