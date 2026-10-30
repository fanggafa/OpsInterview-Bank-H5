/**
 * 图标记 `[[图:xxx]]` 位置校验：不能被插进 Markdown 表格中间。
 *
 * 为什么需要：把图标记插在「表头 | 分隔行」之间，会把一整张表拆成两段残表
 * （用户看到两半张表）。这类错误 validate:data 能发现表格结构被破坏，
 * 但提示不够直接；这里专门报「图标记破坏了表格」。
 *
 * 规则：若某个 `[[图:...]]` 行的「前一行」以 `|` 开头，且该行之后仍以 `|` 开头
 * 的表格行继续出现（说明图把表从中截断），即判为问题。
 * 图应该放在整张表之前，或整张表之后。
 *
 * 用法：node scripts/check-figure-placement.mjs
 */
import { readFileSync } from 'node:fs'

const Q = JSON.parse(readFileSync('public/data/questions.json', 'utf8'))

const isTableRow = (line) => line.trim().startsWith('|')

const problems = []

for (const q of Q) {
  const text = [
    Array.isArray(q.answer) ? q.answer.join('\n') : String(q.answer || ''),
    String(q.explanation || ''),
  ]
  for (const body of text) {
    if (!body.includes('[[图:')) continue
    const lines = body.split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (!/\[\[图:[a-z0-9-]+\]\]/.test(lines[i])) continue

      // 向上找最近的「非空、非图标记」行
      let prev = -1
      for (let j = i - 1; j >= 0; j--) {
        const l = lines[j].trim()
        if (l === '' || /^\[\[图:/.test(l)) continue
        prev = j
        break
      }
      // 向下找最近的非空行
      let next = -1
      for (let j = i + 1; j < lines.length; j++) {
        const l = lines[j].trim()
        if (l === '' || /^\[\[图:/.test(l)) continue
        next = j
        break
      }

      if (prev !== -1 && next !== -1 && isTableRow(lines[prev]) && isTableRow(lines[next])) {
        problems.push(`${q.id}：图标记插在第 ${i} 行，夹断了表格（前一行、后一行都是表格行）`)
        continue
      }

      // 情况二：图标记与表格行「混在同一行」里 —— 例如锚点落在表格单元格内部，
      // 变成 `| `'[[图:x]]` 单引号'` 这种，会把一行拆成三段。
      const lineHasTableStart = lines[i].trim().startsWith('|')
      const lineHasFigure = /\[\[图:[a-z0-9-]+\]\]/.test(lines[i])
      if (lineHasTableStart && lineHasFigure) {
        problems.push(`${q.id}：图标记与表格行混在第 ${i + 1} 行（应从表格行中移出）`)
      }
    }
  }
}

if (problems.length) {
  console.error(`✗ ${problems.length} 处图标记位置不当：\n`)
  problems.forEach((p) => console.error('  ' + p))
  console.error('\n修法：把 [[图:xxx]] 移到整张表格之前或之后，不要插在表格中间。')
  process.exit(1)
}

console.log('✓ 图标记位置合法（没有把表格截断）')
