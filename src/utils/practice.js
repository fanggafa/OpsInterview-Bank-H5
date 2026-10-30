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
import { PRACTICE_MODES, STUDY_MODES } from '@/utils/constants'
import { shuffle } from '@/utils/format'
import { isShort } from '@/utils/question'

/** 归一化模式，非法值回退 sequential */
export function normalizeMode(mode) {
  return PRACTICE_MODES.includes(mode) ? mode : 'sequential'
}

/** 归一化练习模式，非法值回退 practice */
export function normalizeStudyMode(studyMode) {
  return STUDY_MODES.includes(studyMode) ? studyMode : 'practice'
}

/**
 * 按分类过滤题目。category 为空表示全部。
 */
function byCategory(questions, category) {
  if (!category) return questions.slice()
  return questions.filter((q) => q.category === category)
}

/**
 * 按练习模式过滤题目。
 *
 * - practice（做题模式）：**只有选择题**
 * - memorize（背题模式）：**只有简答题**
 *
 * 两个模式的题型互斥，不再有交集。用户要求：
 * 「刷题模式改成全部为选择题，只有背题模式才是简答题」。
 *
 * 这样划分的道理：选择题「点一下就判对错」，是快节奏的做；
 * 简答题要自己讲出来再对照答案自评，节奏慢，是背。
 * 混在一个队列里，两种节奏会互相打断。
 *
 * 导出供复习赛复用（复习赛不走 buildQueue，但题型规则必须一致）。
 */
export function byStudyMode(questions, studyMode) {
  const list = Array.isArray(questions) ? questions : []
  if (normalizeStudyMode(studyMode) === 'memorize') return list.filter((q) => isShort(q))
  return list.filter((q) => !isShort(q))
}

/**
 * 构建刷题队列。
 *
 * @param {Array} questions 题库全量
 * @param {Object} options
 * @param {string} [options.mode='sequential'] 队列模式（题从哪来）
 * @param {string} [options.studyMode='practice'] 练习模式（怎么练）
 * @param {string} [options.category=''] 分类（空=全部）
 * @param {Set<number>|number[]} [options.wrongIds] 错题 id 集合（mode=wrong 时必传）
 * @param {() => number} [options.random] 注入随机源，便于测试
 * @returns {Array} 题目数组
 */
export function buildQueue(
  questions,
  { mode = 'sequential', studyMode = 'practice', category = '', wrongIds = [], random } = {}
) {
  const normalized = normalizeMode(mode)
  // 先按练习模式收窄（背题模式只看简答），再按分类
  const scoped = byCategory(byStudyMode(questions, studyMode), category)

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
 * 复习赛：从指定题池里随机抽固定题量的一次性题组。
 *
 * 与 buildQueue 的区别：
 * - buildQueue 是「连续刷」的全量队列（可按分类/模式收窄，可断点续刷）
 * - 复习赛是「今天练这一批」，抽完即止、每次进入重新随机、不记进度
 *
 * @param {Array} questions 题池（已按来源筛好，如错题本或全库）
 * @param {Object} options
 * @param {number} options.size 抽多少题
 * @param {() => number} [options.random] 注入随机源，便于测试
 * @returns {Array} 题目数组（题池不足时返回全部）
 */
export function pickReviewSet(questions, { size = 15, random } = {}) {
  const pool = Array.isArray(questions) ? questions : []
  if (!pool.length) return []

  const want = Math.max(0, Number(size) || 0)
  if (!want) return []

  /**
   * 洗牌后取前 want 个；题池不足时自然返回全部。
   * random 允许注入，测试里用它把结果固定住。
   * shuffle() 返回新数组（不改入参），所以要接住返回值。
   */
  let arr
  if (typeof random === 'function') {
    arr = pool.slice()
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
  } else {
    arr = shuffle(pool)
  }

  return arr.slice(0, Math.min(want, arr.length))
}

/**
 * 解析断点续刷的位置。
 *
 * 规则（PRD §二.2）：
 * - 无 progress → 从 0 开始，非续刷
 * - progress 的 mode/studyMode/category 与本次一致 → 从 progress.index 续刷
 * - 不一致 → 从 0 开始（换了队列就不是同一批题了）
 *
 * @param {Object|null} progress
 * @param {{mode: string, studyMode?: string, category: string}} current
 * @param {number} queueLength
 * @returns {{index: number, resumed: boolean}}
 */
export function resolveStartIndex(progress, current, queueLength) {
  const none = { index: 0, resumed: false }
  if (!progress || !queueLength) return none
  if (normalizeMode(progress.mode) !== normalizeMode(current.mode)) return none
  if (normalizeStudyMode(progress.studyMode) !== normalizeStudyMode(current.studyMode)) return none
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
  const studyModeLabel = normalizeStudyMode(progress.studyMode) === 'memorize' ? '背题' : '做题'
  return {
    category: progress.category || '全部题目',
    modeLabel,
    studyModeLabel,
    studyMode: normalizeStudyMode(progress.studyMode),
    mode: normalizeMode(progress.mode),
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
