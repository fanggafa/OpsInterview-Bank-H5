/** 格式化工具：摘要截断、日期、百分比 */

/**
 * 截断文本为摘要，超出加省略号。
 * 按字符（码点）计算，避免 emoji 被截断成半个。
 * @param {string} text
 * @param {number} [max=50]
 */
export function truncate(text, max = 50) {
  if (!text) return ''
  const chars = Array.from(String(text))
  if (chars.length <= max) return chars.join('')
  return chars.slice(0, max).join('') + '…'
}

/**
 * 百分比格式化：null/NaN 一律返回「—」，不返回 0%。
 * 保留整数。
 */
export function formatPercent(value) {
  if (value === null || value === undefined) return '—'
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return Math.round(n) + '%'
}

/** 保留整数百分比（0-100 的数值），分母为 0 返回 null */
export function ratio(numerator, denominator) {
  if (!denominator) return null
  return Math.round((numerator / denominator) * 100)
}

/** 本地时区今天 0:00 的时间戳 */
export function startOfToday(now = Date.now()) {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** 判断时间戳是否落在今天（本地时区） */
export function isToday(ts, now = Date.now()) {
  if (!ts) return false
  return ts >= startOfToday(now) && ts <= now + 24 * 60 * 60 * 1000
}

/** 相对时间：刚刚 / n 分钟前 / n 小时前 / n 天前 / 日期 */
export function relativeTime(ts, now = Date.now()) {
  if (!ts) return ''
  const diff = now - ts
  if (diff < 0) return '刚刚'
  const min = Math.floor(diff / 60000)
  if (min < 1) return '刚刚'
  if (min < 60) return `${min} 分钟前`
  const hour = Math.floor(min / 60)
  if (hour < 24) return `${hour} 小时前`
  const day = Math.floor(hour / 24)
  if (day < 7) return `${day} 天前`
  const d = new Date(ts)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

/** 洗牌（Fisher-Yates），不修改入参 */
export function shuffle(list) {
  const arr = list.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * 简单的 search 关键词匹配（忽略大小写）。
 * 匹配范围：题干 + 答案 + 标签；选择题额外匹配选项文本与解析。
 */
export function matchKeyword(question, keyword) {
  if (!keyword) return true
  const kw = String(keyword).trim().toLowerCase()
  if (!kw) return true

  const answerText = Array.isArray(question.answer)
    ? question.answer.join(' ')
    : question.answer || ''

  const optionText = Array.isArray(question.options)
    ? question.options.map((o) => `${o.key} ${o.text}`).join('\n')
    : ''

  const haystack = [
    question.question,
    answerText,
    optionText,
    question.explanation || '',
    ...(question.tags || []),
  ]
    .join('\n')
    .toLowerCase()

  return haystack.includes(kw)
}
