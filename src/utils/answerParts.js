/**
 * 答案分块：把 answer 字符串拆成「文本」与「插图」两类片段，
 * 并把文本进一步解析成结构化块（标题 / 段落 / 列表 / 表格 / 代码块）。
 *
 * 设计目标：既要支持插图与轻量排版，又**不能引入 v-html**（会带来 XSS 风险）。
 * 做法是：
 * 1. 约定极简插图标记 `[[图:diagram-id]]`，只认白名单 ID
 * 2. 文本部分用「白名单块级语法」解析成数据，再由模板渲染成真实 DOM
 *    （表格渲染成真 <table>、列表渲染成真 <ul>/<ol>、代码渲染成 <pre><code>）
 *
 * 因此题库内容里的任何 HTML 都只会被当作普通字符显示。
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

/* ------------------------------------------------------------------ */
/* 行内解析                                                            */
/* ------------------------------------------------------------------ */

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

/**
 * 行内解析：`**强调**` + `` `行内代码` ``。
 *
 * 为什么把行内代码认出来：答案里大量出现命令、参数、配置项
 * （如 `maxSurge`、`kubectl drain`），渲染成等宽代码块能显著提升可读性。
 * 仍未使用 v-html —— 拆出来的是数据，模板里用插值渲染。
 *
 * @param {string} text
 * @returns {Array<{text:string, strong:boolean, code:boolean}>}
 */
export function splitInline(text) {
  const src = typeof text === 'string' ? text : ''
  if (!src) return []

  const out = []
  const re = /\*\*([^*]+)\*\*|`([^`]+)`/g
  let last = 0
  let m

  while ((m = re.exec(src)) !== null) {
    if (m.index > last) out.push({ text: src.slice(last, m.index), strong: false, code: false })
    if (m[1] !== undefined) out.push({ text: m[1], strong: true, code: false })
    else out.push({ text: m[2], strong: false, code: true })
    last = m.index + m[0].length
  }

  if (last < src.length) out.push({ text: src.slice(last), strong: false, code: false })
  return out.length ? out : [{ text: src, strong: false, code: false }]
}

/* ------------------------------------------------------------------ */
/* 块级解析                                                            */
/* ------------------------------------------------------------------ */

/** 按 | 切分表格行：忽略行内代码里的 | 与转义的 \| */
function splitRow(line) {
  let t = line.trim()
  if (t.startsWith('|')) t = t.slice(1)
  if (t.endsWith('|') && !t.endsWith('\\|')) t = t.slice(0, -1)

  const cells = []
  let buf = ''
  let inCode = false
  for (let i = 0; i < t.length; i++) {
    const ch = t[i]
    if (ch === '\\' && t[i + 1] === '|') {
      buf += '|'
      i++
      continue
    }
    if (ch === '`') {
      inCode = !inCode
      buf += ch
      continue
    }
    if (ch === '|' && !inCode) {
      cells.push(buf.trim())
      buf = ''
      continue
    }
    buf += ch
  }
  cells.push(buf.trim())
  return cells
}

/** 分隔行：|---|:---:|---:| */
function isSeparatorRow(line) {
  const t = line.trim()
  if (!/^[\s|:-]+$/.test(t)) return false
  if (!t.includes('-')) return false
  return splitRow(t).every((c) => /^:?-{1,}:?$/.test(c.replace(/\s/g, '')) || c === '')
}

function parseAlign(line) {
  return splitRow(line)
    .map((c) => c.replace(/\s/g, ''))
    .map((c) => {
      const left = c.startsWith(':')
      const right = c.endsWith(':')
      if (left && right) return 'center'
      if (right) return 'right'
      return 'left'
    })
    .filter((a) => !!a)
}

const HEADING_RE = /^(#{1,6})\s+(.*)$/
const UL_RE = /^(\s*)[-*+]\s+(.*)$/
const OL_RE = /^(\s*)(\d+)[.)]\s+(.*)$/
const HR_RE = /^\s*([-*_])\s*\1\s*\1[\s\-*_]*$/
const FENCE_RE = /^\s*```\s*([a-zA-Z0-9+#-]*)\s*$/
const QUOTE_RE = /^\s*>\s?(.*)$/

/** 列表项缩进 → 层级（每 2 空格一层，最多 2 层） */
function listDepth(spaces) {
  const n = Math.floor(spaces / 2)
  return Math.min(n, 2)
}

/**
 * 解析单段文本（不含插图标记）为块数组。
 *
 * 支持的块：
 * - heading（# ~ ######）
 * - paragraph
 * - ul / ol（最多两级缩进）
 * - table（真表格，含对齐方式）
 * - code（``` 围栏；也兼容「整段统一缩进的续行」）
 * - hr
 * - quote
 *
 * @param {string} text
 * @returns {Array<object>}
 */
export function parseBlocks(text) {
  const src = typeof text === 'string' ? text : ''
  if (!src.trim()) return []

  const lines = src.replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let i = 0

  while (i < lines.length) {
    const raw = lines[i]
    const line = raw.trimEnd()
    const trimmed = line.trim()

    // 空行
    if (!trimmed) {
      i++
      continue
    }

    // 代码围栏
    const fence = line.match(FENCE_RE)
    if (fence) {
      const lang = fence[1] || ''
      const buf = []
      i++
      while (i < lines.length && !FENCE_RE.test(lines[i])) {
        buf.push(lines[i].replace(/\s+$/, ''))
        i++
      }
      i++ // 跳过结束围栏（未闭合时也会自然结束）
      blocks.push({ type: 'code', lang, lines: dedent(buf) })
      continue
    }

    // 分隔线
    if (HR_RE.test(line) && !line.includes('|')) {
      blocks.push({ type: 'hr' })
      i++
      continue
    }

    // 标题
    const h = line.match(HEADING_RE)
    if (h) {
      blocks.push({ type: 'heading', level: h[1].length, segs: splitInline(h[2].trim()) })
      i++
      continue
    }

    // 表格：当前行以 | 开头，且下一行是分隔行
    if (trimmed.startsWith('|') && i + 1 < lines.length && isSeparatorRow(lines[i + 1])) {
      const header = splitRow(line).map((c) => splitInline(c))
      const align = parseAlign(lines[i + 1])
      const rows = []
      i += 2
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        if (isSeparatorRow(lines[i])) {
          i++
          continue
        }
        rows.push(splitRow(lines[i]).map((c) => splitInline(c)))
        i++
      }
      blocks.push({ type: 'table', header, align, rows })
      continue
    }

    // 无序列表
    const ul = line.match(UL_RE)
    if (ul) {
      blocks.push(readList(lines, i, false))
      i = blocks[blocks.length - 1].end
      delete blocks[blocks.length - 1].end
      continue
    }

    // 有序列表
    const ol = line.match(OL_RE)
    if (ol) {
      blocks.push(readList(lines, i, true))
      i = blocks[blocks.length - 1].end
      delete blocks[blocks.length - 1].end
      continue
    }

    // 引用
    const quote = line.match(QUOTE_RE)
    if (quote) {
      const buf = []
      while (i < lines.length) {
        const m = lines[i].match(QUOTE_RE)
        if (!m) break
        buf.push(m[1])
        i++
      }
      blocks.push({ type: 'quote', text: buf.join('\n') })
      continue
    }

    // 整段缩进的续行（多为对齐的环境输出、树形结构），保留缩进按代码渲染
    if (/^\s{2,}\S/.test(line)) {
      const buf = []
      while (i < lines.length && (/^\s{2,}\S/.test(lines[i]) || !lines[i].trim())) {
        buf.push(lines[i].replace(/\s+$/, ''))
        i++
      }
      while (buf.length && !buf[buf.length - 1].trim()) buf.pop()
      blocks.push({ type: 'code', lang: '', lines: dedent(buf) })
      continue
    }

    // 普通段落：连续非空、且不是其他块起始的行
    const buf = []
    while (i < lines.length) {
      const cur = lines[i]
      const t = cur.trim()
      if (!t) break
      if (
        FENCE_RE.test(cur) ||
        HEADING_RE.test(cur) ||
        UL_RE.test(cur) ||
        OL_RE.test(cur) ||
        QUOTE_RE.test(cur) ||
        /^\s{2,}\S/.test(cur) ||
        (t.startsWith('|') && i + 1 < lines.length && isSeparatorRow(lines[i + 1]))
      ) {
        break
      }
      buf.push(t)
      i++
    }
    blocks.push({ type: 'paragraph', segs: splitInline(buf.join('\n')) })
  }

  return blocks
}

/** 去掉代码块公共缩进（但保留相对缩进） */
function dedent(lines) {
  const use = lines.filter((l) => l.trim())
  if (!use.length) return lines.map(() => '')
  const min = Math.min(...use.map((l) => l.match(/^\s*/)[0].length))
  return lines.map((l) => l.slice(min))
}

/**
 * 读取一个列表块（从 start 行开始）。
 *
 * 除了列表项本身，还要吞掉「列表项的缩进续行」：
 * 很多答案写成
 *
 *     1. 用 ipset 替代大量同类规则：
 *        把几百条拒绝规则合并成一个集合
 *        ipset create badlist hash:ip
 *
 * 若不吞续行，续行会被当成独立的代码块，列表与说明就被生生切断了。
 *
 * @returns {{type:'list', ordered:boolean, items:Array, end:number}}
 */
function readList(lines, start, ordered) {
  const itemRe = ordered ? OL_RE : UL_RE
  const items = []
  let i = start

  while (i < lines.length) {
    const line = lines[i]
    const t = line.trim()

    // 空行结束列表
    if (!t) break

    const m = line.match(itemRe)
    if (m) {
      const depth = listDepth(m[1].length)
      const text = ordered ? m[3] : m[2]
      items.push({ depth, segs: splitInline(text.trim()), extra: [] })
      i++
      continue
    }

    // 其他块起始（围栏/标题/引用/表格分隔/分隔线）结束列表
    if (
      FENCE_RE.test(line) ||
      HEADING_RE.test(line) ||
      QUOTE_RE.test(line) ||
      (t.startsWith('|') && i + 1 < lines.length && isSeparatorRow(lines[i + 1]))
    ) {
      break
    }

    // 缩进续行：挂到当前项上
    if (items.length && /^\s{2,}\S/.test(line)) {
      items[items.length - 1].extra.push(t)
      i++
      continue
    }

    break
  }

  return { type: 'list', ordered, items, end: i }
}

/**
 * 解析完整答案：插图与块级结构混合的渲染流。
 *
 * @param {string} answer
 * @returns {Array<{type:'figure', id:string} | {type:'blocks', blocks:object[]}>}
 */
export function parseAnswerFlow(answer) {
  const parts = parseAnswer(answer)
  const flow = []
  let pending = []

  const flush = () => {
    if (!pending.length) return
    const blocks = parseBlocks(pending.join(''))
    if (blocks.length) flow.push({ type: 'blocks', blocks })
    pending = []
  }

  parts.forEach((p) => {
    if (p.type === 'figure') {
      flush()
      flow.push({ type: 'figure', id: p.id })
      return
    }
    pending.push(p.text + '\n')
  })
  flush()

  return flow
}
