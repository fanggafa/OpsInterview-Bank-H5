/**
 * 每日一题：以日期为种子，从题库里稳定地挑出一道题。
 *
 * 为什么不用随机：随机意味着刷新一次换一题，
 * 「今天这题」就没有任何意义，也形不成「每天来答一道」的习惯。
 * 这里用日期做种子，同一天任何时候打开都是同一题（刷新、换设备、明天再来都不变），
 * 跨天自动换下一题；不需要后端，也不需要额外的存储。
 *
 * 选池优先取「高频」题：每日一题的位置只有一个，
 * 落在低频偏题上就浪费了——它应当是一道真正值得练的面试题。
 */

/** 32 位 FNV-1a 散列：把日期键摊成一个稳定整数 */
export function hashString(str) {
  let h = 0x811c9dc5
  const s = String(str || '')
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/**
 * 本地日期键 YYYYMMDD。
 *
 * 刻意用本地时区而不是 UTC：用户在 23:30 打开还是「今天」，
 * 用 toISOString 会按 UTC 折算，东八区在早上 8 点前会被算成前一天。
 */
export function dateKey(date = new Date()) {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

/**
 * 取当日的题目。
 *
 * @param {Array} questions 题库全量
 * @param {Date} [date] 以哪一天为准（测试注入用）
 * @returns {Object|null} 题库为空时返回 null
 */
export function pickDailyQuestion(questions, date = new Date()) {
  const list = Array.isArray(questions) ? questions : []
  if (!list.length) return null

  // 优先高频题；一道高频题都没有时退回全量，保证「有题可出」
  const preferred = list.filter((q) => q.frequency === '高频')
  const base = preferred.length ? preferred : list

  /**
   * 按 id 排序后再取。
   *
   * 否则「取第 N 个」依赖题库文件里的顺序：一旦题库重新排序（补题、
   * 按分类整理），当天的题就会跟着变，而用户手里的链接和昨天的记忆都失效。
   * 排序让结果只由「这一天 + 题库内容」决定，与排列无关。
   * 注意用 slice() 保护入参，不要原地排序。
   */
  const pool = base.slice().sort((a, b) => Number(a.id) - Number(b.id))

  const seed = hashString(dateKey(date))
  return pool[seed % pool.length]
}
