/**
 * 插图文字溢出检查。
 *
 * 背景：所有插图都画在固定宽度的 viewBox 里（多数是 340×2xx），
 * 正文用绝对坐标 <text x= y=> 摆放。一旦某行说明写长了，
 * 超出的部分会被 SVG 直接裁掉 —— 而且**放大也救不回来**，
 * 因为被裁发生在画布坐标系里，不是渲染尺寸的问题。
 *
 * 用户反馈原话：「虽然可以点击放大，但是图片内容显示不全」。
 *
 * 这类问题 jsdom 与单元测试都发现不了（SVG 没有布局），
 * 所以在构建前用字符宽度估算兜住：估算偏保守（宁严勿松），
 * 宁可让人回头把句子写短，也不要上线后才发现半句话没了。
 *
 * 用法：
 *   node scripts/check-figure-text.mjs          报告 + 退出码
 *   node scripts/check-figure-text.mjs --list   只列清单
 */

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const DIR = 'src/components/figures'
/** 右边界留白：贴边也算溢出，视觉上会被切掉半个字 */
const RIGHT_PAD = 4
const LEFT_PAD = 2

/**
 * 单字符宽度（以 font-size 为 1em 基准）。
 *
 * 经验值：中文/全角 = 1em；ASCII 数字与常见小写约 0.5~0.6em。
 * 均取偏大的一端，保证估算结果「宁可判溢出」。
 */
function charWidth(ch) {
  // 中文、全角标点、箭头/制表符/几何符号（多数中文字体里是 1em 宽，最容易被低估）
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
  // 粗体字宽约 4% 增量
  return bold ? w * 1.04 : w
}

function decodeEntities(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
}

/** 取属性值（支持单/双引号） */
function attr(attrs, name) {
  const m = attrs.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`))
  return m ? m[1] : null
}

const failures = []

for (const file of readdirSync(DIR)) {
  if (!file.endsWith('.vue')) continue
  const src = readFileSync(join(DIR, file), 'utf8')

  const viewBox = src.match(/<svg[^>]*viewBox="([^"]+)"/)
  if (!viewBox) continue
  const [, , vbW, vbH] = viewBox[1].split(/[\s,]+/).map(Number)
  if (!Number.isFinite(vbW)) continue

  // 逐个 <text>…</text>（含内部的 tspan：按 tspan 各自起点换行估算）
  const textRe = /<text\b([^>]*)>([\s\S]*?)<\/text>/g
  let m
  while ((m = textRe.exec(src))) {
    const attrs = m[1]
    const inner = m[2]
    const lineNo = src.slice(0, m.index).split('\n').length

    const size = Number(attr(attrs, 'font-size') || 9)
    const bold = /font-weight\s*=\s*["'](bold|[6-9]00)["']/.test(attrs)
    const anchor = attr(attrs, 'text-anchor') || 'start'
    const baseX = Number(attr(attrs, 'x') ?? 0)
    const baseY = Number(attr(attrs, 'y') ?? 0)
    let lineY = baseY
    let cursorX = baseX

    // 拆出 span 序列：普通文本 + <tspan>（tspan 的 x/y/dy 会移动起点）
    const parts = []
    const tspanRe = /<tspan\b([^>]*)>([\s\S]*?)<\/tspan>/g
    let last = 0
    let t
    while ((t = tspanRe.exec(inner))) {
      if (t.index > last) parts.push({ text: inner.slice(last, t.index), attrs: '' })
      parts.push({ text: t[2], attrs: t[1] })
      last = t.index + t[0].length
    }
    if (last < inner.length) parts.push({ text: inner.slice(last), attrs: '' })

    for (const part of parts) {
      const raw0 = decodeEntities(part.text.replace(/<[^>]*>/g, ''))
      // SVG 默认 xml:space="default"：换行/多空格会被折叠成一个空格
      const raw = raw0.replace(/\s+/g, ' ').trim()
      if (!raw) continue
      // 含 Vue 插值（{{ … }}）的文本宽度静态不可知（渲染后才定），跳过不误判
      if (raw.includes('{{')) continue

      if (part.attrs) {
        const px = attr(part.attrs, 'x')
        const py = attr(part.attrs, 'y')
        const pdy = attr(part.attrs, 'dy')
        if (px !== null) cursorX = Number(px)
        if (py !== null) lineY = Number(py)
        else if (pdy !== null) lineY += Number(pdy)
      }

      const w = textWidth(raw, size, bold)
      const x1 =
        anchor === 'middle' ? cursorX - w / 2 : anchor === 'end' ? cursorX - w : cursorX
      const x2 = x1 + w

      const label = raw.length > 24 ? `${raw.slice(0, 24)}…` : raw

      if (x2 > vbW - RIGHT_PAD) {
        failures.push({
          file,
          lineNo,
          kind: '右侧溢出',
          over: Math.round(x2 - (vbW - RIGHT_PAD)),
          detail: `x=[${Math.round(x1)}, ${Math.round(x2)}] / 画布宽 ${vbW}，字号 ${size}  「${label}」`,
        })
      }
      if (x1 < LEFT_PAD) {
        failures.push({
          file,
          lineNo,
          kind: '左侧溢出',
          over: Math.round(LEFT_PAD - x1),
          detail: `x=[${Math.round(x1)}, ${Math.round(x2)}]  「${label}」`,
        })
      }
      // 纵向：字底超出画布高度也算截断
      if (lineY + size * 0.3 > vbH) {
        failures.push({
          file,
          lineNo,
          kind: '底部溢出',
          over: Math.round(lineY + size * 0.3 - vbH),
          detail: `y=${lineY} / 画布高 ${vbH}  「${label}」`,
        })
      }
    }
  }
}

if (failures.length === 0) {
  console.log('✓ 插图文字全部在画布内（无截断）')
  process.exit(0)
}

const byFile = new Map()
for (const f of failures) {
  if (!byFile.has(f.file)) byFile.set(f.file, [])
  byFile.get(f.file).push(f)
}

console.error(`✗ 发现 ${failures.length} 处插图文字超出画布（会被 SVG 裁掉，放大也看不到）\n`)
for (const [file, list] of byFile) {
  console.error(`${file}  (${list.length} 处)`)
  for (const f of list) {
    console.error(`  ${String(f.lineNo).padStart(4)}  ${f.kind} ~${f.over}px  ${f.detail}`)
  }
}
console.error(`\n涉及 ${byFile.size} 个文件。修法：把句子拆成多行（tspan/多 <text>）或缩短，`)
console.error('必要时加高画布与行高——不要靠缩小字号，那正是看不清的原因。')
process.exit(1)
