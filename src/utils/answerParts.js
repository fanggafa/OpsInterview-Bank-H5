/**
 * 答案分块：把 answer 字符串拆成「文本」与「插图」两类片段。
 *
 * 设计目标：既要支持插图，又**不能引入 v-html**（会带来 XSS 风险）。
 * 做法是约定一种极简标记：答案里出现
 *
 *     [[图:diagram-id]]
 *
 * 时，渲染层把它替换成对应的内联 SVG 组件，其余部分仍按纯文本渲染。
 * 标记只认白名单 ID，写错或未注册的 ID 会原样显示为文本（不会注入任何 HTML）。
 */

/** 插图标記載体：[[图:xxx]] */
const FIGURE_RE = /\[\[图:([a-z0-9-]+)\]\]/g

/**
 * 解析答案文本为片段数组。
 * @param {string} answer
 * @returns {Array<{type:'text', text:string} | {type:'figure', id:string}>}
 */
export function parseAnswer(answer) {
  const text = typeof answer === 'string' ? answer : ''
  if (!text) return []

  const parts = []
  let lastIndex = 0
  let m
  FIGURE_RE.lastIndex = 0

  while ((m = FIGURE_RE.exec(text)) !== null) {
    const before = text.slice(lastIndex, m.index)
    if (before) parts.push({ type: 'text', text: before })
    parts.push({ type: 'figure', id: m[1] })
    lastIndex = m.index + m[0].length
  }

  const rest = text.slice(lastIndex)
  if (rest) parts.push({ type: 'text', text: rest })

  // 去掉插图标记前后多余的空行，避免渲染出大片空白
  return parts
    .map((p) => (p.type === 'text' ? { ...p, text: p.text.replace(/^\n+|\n+$/g, '') } : p))
    .filter((p) => p.type === 'figure' || p.text.trim())
}

/** 该答案是否含插图 */
export function hasFigure(answer) {
  return typeof answer === 'string' && /\[\[图:[a-z0-9-]+\]\]/.test(answer)
}

/**
 * 把一段纯文本按 `**强调**` 拆成行内片段。
 *
 * 只支持这一种行内标记：够用于背题时的重音强调，
 * 又不引入 markdown 解析器，也不需要 v-html（渲染仍是普通插值）。
 *
 * @param {string} text
 * @returns {Array<{text:string, strong:boolean}>}
 */
export function splitEmphasis(text) {
  const src = typeof text === 'string' ? text : ''
  if (!src) return []

  const out = []
  const re = /\*\*([^*]+)\*\*/g
  let last = 0
  let m

  while ((m = re.exec(src)) !== null) {
    if (m.index > last) out.push({ text: src.slice(last, m.index), strong: false })
    out.push({ text: m[1], strong: true })
    last = m.index + m[0].length
  }

  if (last < src.length) out.push({ text: src.slice(last), strong: false })
  return out.length ? out : [{ text: src, strong: false }]
}
