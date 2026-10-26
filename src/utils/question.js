/**
 * 题型判定与相关的纯函数（v1.3）。
 *
 * 核心约定：
 * - 判定结果统一映射到既有自评体系：答对 → know，答错 → unknown。
 * - 多选题「全对才算对」：漏选、多选、错选一律算错，不给部分分。
 * - 掌握率只统计简答题（见 studyStore），选择题另有「选择题正确率」。
 */
import { QUESTION_TYPES, STATUS } from '@/utils/constants'

/** 取题型，缺省视为 short（兼容旧数据） */
export function getType(question) {
  const t = question?.type
  return QUESTION_TYPES.includes(t) ? t : 'short'
}

/** 是否选择题 */
export function isChoice(question) {
  const t = getType(question)
  return t === 'single' || t === 'multiple'
}

/** 是否多选 */
export function isMultiple(question) {
  return getType(question) === 'multiple'
}

/** 是否简答 */
export function isShort(question) {
  return getType(question) === 'short'
}

/** 选择题的正确答案 key 数组（防御性归一化） */
export function correctKeys(question) {
  const arr = question?.answer
  if (!Array.isArray(arr)) return []
  return arr.map((k) => String(k).trim().toUpperCase()).filter(Boolean)
}

/**
 * 判定选择题是否答对。
 * @param {Object} question
 * @param {string[]} selected 用户选中的 key
 * @returns {boolean}
 */
export function judgeChoice(question, selected) {
  const correct = correctKeys(question)
  if (!correct.length) return false

  const picked = new Set(
    (Array.isArray(selected) ? selected : []).map((k) => String(k).trim().toUpperCase())
  )
  if (!picked.size) return false

  // 集合全等：数量相同且每个正确项都被选中
  if (picked.size !== correct.length) return false
  return correct.every((k) => picked.has(k))
}

/**
 * 单选：从点击的选项直接得到结果（点即判定）。
 * @returns {{ selected: string[], passed: boolean }}
 */
export function answerSingle(question, key) {
  const selected = [String(key).trim().toUpperCase()]
  return { selected, passed: judgeChoice(question, selected) }
}

/**
 * 多选：切换一个选项的选中状态（不改动判定，判定在提交时进行）。
 * @param {string[]} selected
 * @param {string} key
 * @returns {string[]} 新数组
 */
export function toggleOption(selected, key) {
  const k = String(key).trim().toUpperCase()
  // 已有项也要归一化，否则 'a' 与 'A' 会被当成两个不同选项
  const set = new Set(
    (Array.isArray(selected) ? selected : []).map((s) => String(s).trim().toUpperCase())
  )
  if (set.has(k)) set.delete(k)
  else set.add(k)
  return Array.from(set)
}

/**
 * 判定结果 → 自评状态。
 * 答对记 know，答错记 unknown，复用既有 records 结构。
 */
export function resultToStatus(passed) {
  return passed ? STATUS.KNOW : STATUS.UNKNOWN
}

/**
 * 每个选项在判定后应展示的状态：
 * 'correct'（正确答案）| 'wrong'（用户选错的）| 'missed'（漏选的正确项）| 'idle'
 *
 * 说明：missed 只用于多选，帮助用户看到「漏选了哪个」。
 */
export function optionState(question, selected, passed) {
  const correct = new Set(correctKeys(question))
  const picked = new Set(
    (Array.isArray(selected) ? selected : []).map((k) => String(k).toUpperCase())
  )

  /** @type {Record<string, string>} */
  const states = {}
  ;(question?.options || []).forEach((opt) => {
    const key = String(opt.key).toUpperCase()
    const isCorrect = correct.has(key)
    const isPicked = picked.has(key)

    if (isCorrect && isPicked) states[opt.key] = 'correct'
    else if (isCorrect && !isPicked) states[opt.key] = passed ? 'correct' : 'missed'
    else if (!isCorrect && isPicked) states[opt.key] = 'wrong'
    else states[opt.key] = 'idle'
  })
  return states
}

/**
 * 判定后的结果文案（简答用「会/不会」，选择题用「答对/答错」）
 */
export function resultText(question, status) {
  if (isChoice(question)) {
    if (status === STATUS.KNOW) return '答对'
    if (status === STATUS.UNKNOWN) return '答错'
    return '未作答'
  }
  if (status === STATUS.KNOW) return '会'
  if (status === STATUS.UNKNOWN) return '不会'
  return '未刷'
}
