/**
 * 插图 .vue 文件的 SFC 结构校验。
 *
 * 为什么需要：我写插图文件时反复出现同一类低级错误 ——
 * 在 `<style scoped>` 之后又粘了一份 `</template></figure></template><style scoped>`，
 * 甚至出现 `</parameter>` 这种不存在的标签。这类文件在 Windows 上不足以立刻报错，
 * 却会让 Linux CI 直接崩，而且要看日志才发现。
 *
 * 校验项（全部是「作者本应保证」的结构约束）：
 * 1. 三个顶层块各出现且仅出现一次：`<script setup>` / `<template>` / `<style scoped>`
 * 2. 顶层块之外不允许有多余内容（空白与注释除外）
 * 3. 不允许出现非法标签 `</parameter>` 这类非白名单闭合标签
 * 4. SVG 必须有且仅有一个 `<svg viewBox=...>`
 * 5. 标签配对：`<figure>`/`<template>`/`<style>`/`<svg>` 的开闭数量一致
 *
 * 用法：node scripts/check-figure-sfc.mjs
 */
import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const DIR = resolve('src/components/figures')
/**
 * 可选单文件过滤：`node scripts/check-figure-sfc.mjs Foo.vue`
 * 用途：多个子任务并行写图时，各自只看自己那几张，互不干扰。
 */
const ONLY = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const files = readdirSync(DIR)
  .filter((f) => f.endsWith('.vue'))
  .filter((f) => !ONLY.length || ONLY.some((o) => o === f || o === f.replace(/\.vue$/, '')))

const problems = []

/**
 * 单字符宽度估算（与 check-figure-text.mjs 保持一致，宁严勿松）。
 */
function charWidth(ch) {
  if (/[\u3000-\u9fff\u3001-\u303f\uff00-\uffef\u2190-\u21ff\u2500-\u257f\u25a0-\u25ff]/.test(ch)) return 1
  if (ch === ' ') return 0.32
  if (/[ilj.,:;'!|`]/.test(ch)) return 0.32
  if (/[mwMW@%]/.test(ch)) return 0.82
  if (/[A-Z0-9#&$]/.test(ch)) return 0.62
  if (/[a-z]/.test(ch)) return 0.55
  return 0.6
}
function textWidth(str, size, bold) {
  let w = 0
  for (const ch of str) w += charWidth(ch) * size
  return bold ? w * 1.04 : w
}
/** 取属性值（支持单/双引号） */
function attrVal(attrs, name) {
  const m = attrs.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`))
  return m ? m[1] : null
}

/**
 * SVG 内静态文字的「压字」检测。
 *
 * 为什么需要：check-figure-text 只判「文字是否超出画布被裁掉」，
 * 但如果两行文字在画布内互相重叠，它完全发现不了 —— 因为每行都没超边界。
 * 实际上这正是子任务反馈里最难自查的问题（「相邻行只有 6~8px，实际已重叠」）。
 *
 * 判定方法：估算每个 <text> 的包围盒（用字符宽度表 + 基线上下沿），
 * 两两比较，纵向重叠超过 THRESH_Y 且横向重叠超过 THRESH_X 就报。
 *
 * 为什么要 THRESH_X：插图里大量「左右分栏」排版（x=14 与 x=184 各写一列），
 * 它们的 y 经常完全相同，但横向只沾几个像素。若只看纵向重叠会全部误报。
 *
 * 跳过的情况（静态无法确定）：
 *  - 文本含 Vue 插值 {{ }}（渲染后才定宽）
 *  - 位置是动态绑定（:x / :y）
 *  - 属性里没有 x 或 y（无法定位）
 */
const OVERLAP_Y = 3 // 纵向重叠超过 3px：估算误差（约 1~2px）不会触发
const OVERLAP_X = 6 // 横向重叠超过 6px：滤掉左右分栏的贴边情形

/**
 * 行距/字号 的最小比值。
 *
 * 依据：扫描现有 340 张图后，同列相邻行的 dy/字号 比值分布为
 *   <=1.0 → 6 处（都是真贴边，如 6px 行距配 8px 字号）
 *   <=1.1 → 6 处（同上）
 *   <=1.2 → 13 处（开始出现正常的两行说明）
 * 所以取 1.05：刚好落在「真问题」与「正常排版」之间，不误伤。
 */
const ROW_GAP_RATIO = 1.05

function findTextOverlaps(src) {
  const out = []
  const texts = []
  const textRe = /<text\b([^>]*)>([\s\S]*?)<\/text>/g
  let m
  while ((m = textRe.exec(src))) {
    const attrs = m[1]
    const inner = m[2]
    // 去掉内部标签（tspan 等）与实体，按 SVG 规则折叠空白
    const raw = inner
      .replace(/<[^>]*>/g, '')
      .replace(/&[a-z]+;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (!raw) continue
    if (raw.includes('{{')) continue
    if (/\b:[xy]\s*=/.test(attrs)) continue

    const x = attrVal(attrs, 'x')
    const y = attrVal(attrs, 'y')
    if (x === null || y === null) continue
    const nx = Number(x)
    const ny = Number(y)
    if (!Number.isFinite(nx) || !Number.isFinite(ny)) continue

    const size = Number(attrVal(attrs, 'font-size') || 9)
    if (!Number.isFinite(size)) continue
    const bold = /font-weight\s*=\s*["'](bold|[6-9]00)["']/.test(attrs)
    const anchor = attrVal(attrs, 'text-anchor') || 'start'
    const w = textWidth(raw, size, bold)
    const x1 = anchor === 'middle' ? nx - w / 2 : anchor === 'end' ? nx - w : nx
    const lineNo = src.slice(0, m.index).split('\n').length
    texts.push({
      raw,
      lineNo,
      x1,
      x2: x1 + w,
      y: ny,
      size,
      top: ny - size * 0.82,
      bottom: ny + size * 0.3,
    })
  }

  for (let i = 0; i < texts.length; i++) {
    for (let j = i + 1; j < texts.length; j++) {
      const a = texts[i]
      const b = texts[j]
      const xOv = Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1)
      if (xOv <= OVERLAP_X) continue
      const yOv = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
      if (yOv <= OVERLAP_Y) continue
      const short = (s) => (s.length > 22 ? `${s.slice(0, 22)}…` : s)
      out.push(
        `第 ${a.lineNo}/${b.lineNo} 行文字重叠：纵向 ${yOv.toFixed(1)}px、横向 ${xOv.toFixed(1)}px` +
          `　「${short(a.raw)}」×「${short(b.raw)}」`,
      )
    }
  }

  // 行距过紧：同一列相邻两行（上下顺序）的间距 < 字号的 1.05 倍 → 视觉上几乎贴在一起
  const cols = texts.slice().sort((p, q) => p.y - q.y || p.x1 - q.x1)
  for (let i = 1; i < cols.length; i++) {
    const prev = cols[i - 1]
    const cur = cols[i]
    if (Math.abs(cur.x1 - prev.x1) >= 12) continue // 不同列，不算相邻行
    const dy = cur.y - prev.y
    if (dy <= 0 || dy > 16) continue // 同 y 由重叠规则管；>16px 是大间隔
    const size = Math.max(prev.size, cur.size)
    if (dy >= size * ROW_GAP_RATIO) continue
    const short = (s) => (s.length > 22 ? `${s.slice(0, 22)}…` : s)
    out.push(
      `第 ${prev.lineNo}/${cur.lineNo} 行距过紧：${dy}px < 字号 ${size}px 的 ${ROW_GAP_RATIO} 倍` +
        `　「${short(prev.raw)}」↕「${short(cur.raw)}」`,
    )
  }
  return out
}

/** 统计某个标签出现次数（不算自闭合） */
function countOpen(src, tag) {
  const re = new RegExp(`<${tag}(?![a-zA-Z0-9-])`, 'g')
  return (src.match(re) || []).length
}
function countClose(src, tag) {
  const re = new RegExp(`</${tag}>`, 'g')
  return (src.match(re) || []).length
}

for (const f of files) {
  const src = readFileSync(resolve(DIR, f), 'utf8')
  const errs = []

  // 1) 三个顶层块各一次
  for (const [tag, label] of [
    ['script setup', '<script setup>'],
    ['template', '<template>'],
    ['style scoped', '<style scoped>'],
  ]) {
    const openCount = (src.match(new RegExp(`<${tag}`.replace(' ', ' '), 'g')) || []).length
    if (openCount !== 1) errs.push(`${label} 出现 ${openCount} 次（应为 1 次）`)
  }

  // 2) 非法闭合标签白名单（只允许这些）
  const allowedClosers = [
    'template', 'figure', 'svg', 'style', 'script', 'text', 'g', 'defs',
    'linearGradient', 'stop', 'rect', 'line', 'circle', 'path', 'polyline',
    'polygon', 'ellipse', 'tspan', 'marker', 'clipPath', 'pattern', 'figcaption',
    'symbol', 'use', 'filter', 'feGaussianBlur', 'title', 'desc', 'image',
  ]
  const closers = [...src.matchAll(/<\/?([a-zA-Z][a-zA-Z0-9-]*)\s*>/g)].map((m) => m[1])
  const closersClose = [...src.matchAll(/<\/([a-zA-Z][a-zA-Z0-9-]*)>/g)].map((m) => m[1])
  for (const c of closersClose) {
    if (!allowedClosers.includes(c)) errs.push(`非法标签 </${c}>`)
  }

  // 3) figure / template / style / svg 开闭配对
  for (const tag of ['figure', 'template', 'style', 'svg', 'script']) {
    const o = countOpen(src, tag)
    const cl = countClose(src, tag)
    if (o !== cl) errs.push(`<${tag}> 开 ${o} 个、闭 ${cl} 个`)
  }

  // 4) 只允许一个 svg 且有 viewBox
  const svgCount = countOpen(src, 'svg')
  if (svgCount !== 1) errs.push(`<svg> 出现 ${svgCount} 次（应为 1 次）`)
  else if (!/<svg[^>]*viewBox=/.test(src)) errs.push('<svg> 缺少 viewBox')

  // 4) 标签前出现孤立字符（如 `< <text`，标签数量正确但渲染出错）
  //    正常的 `<` 后面必须紧跟字母、`/` 或 `!`；`>` 之后到下一个 `<` 之间是文本内容。
  for (const [i, line] of src.split('\n').entries()) {
    if (/<\s+<[a-zA-Z]/.test(line)) errs.push(`第 ${i + 1} 行：\`< <\` —— 标签前有多余字符`)
  }

  // 5) 顶层块之后不应再有内容（正常文件以 </style> 结尾）
  const styleClose = src.lastIndexOf('</style>')
  if (styleClose === -1) {
    errs.push('缺少 </style> 闭合')
  } else {
    const tail = src.slice(styleClose + '</style>'.length).trim()
    if (tail) errs.push(`</style> 之后还有内容：${tail.slice(0, 50).replace(/\n/g, ' ')}`)
  }

  // 6) SVG 文字互相压字（check-figure-text 只管「超出画布」，管不到这个）
  for (const o of findTextOverlaps(src)) errs.push(o)

  if (errs.length) problems.push({ file: f, errs })
}

if (problems.length) {
  console.error(`✗ ${problems.length} 个插图文件的 SFC 结构有问题：\n`)
  for (const p of problems) {
    console.error(`  ${p.file}`)
    for (const e of p.errs) console.error(`    - ${e}`)
  }
  console.error('\n修法：确保文件只有一个 <template> / <style scoped> 块，')
  console.error('且 </style> 之后不再有任何内容（这类错误在 Windows 上不一定报错，CI 才会崩）。')
  process.exit(1)
}

console.log(`✓ ${files.length} 个插图文件的 SFC 结构全部合法`)
