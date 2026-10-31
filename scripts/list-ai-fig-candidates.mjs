/**
 * 列出 AI 分类无图题目，并按「是否适合画图」分档，供任务分配参考。
 */
import { readFileSync } from 'node:fs'

const bank = JSON.parse(readFileSync('public/data/questions.json', 'utf8'))
const ai = bank.filter((q) => q.category === 'AI与大模型')
const noFig = ai.filter((q) => !JSON.stringify(q).includes('[[图:'))

console.log(`AI 分类共 ${ai.length} 题，无图 ${noFig.length} 题\n`)

// 结构信号
const SIGNALS = [
  ['步骤/流程', /步骤|流程|过程|链路|三步|四步|五步/],
  ['对比/区别', /区别|对比|vs|不同|分别/],
  ['分类/类型', /有哪几|几种|类型|哪些/],
  ['机制/原理', /原理|机制|怎么实现|如何实现|如何工作/],
  ['分层/维度', /分层|维度|几层|四层|五层|三段/],
]

const rows = []
for (const q of noFig) {
  const a = typeof q.answer === 'string' ? q.answer : JSON.stringify(q.answer)
  const hits = SIGNALS.filter(([, re]) => re.test(q.question)).map(([n]) => n)
  // 答案里表格多（| 出现次数）也说明适合画
  const tableRows = (a.match(/^\|/gm) || []).length
  rows.push({ q, hits, tableRows, len: a.length })
}

console.log('=== 按结构信号排（表格行数多 + 有信号 = 更适合作图）===\n')
rows
  .sort((x, y) => y.tableRows - x.tableRows)
  .forEach((r) => {
    const sig = r.hits.join('/') || '—'
    console.log(`[${r.q.id}] 表格${String(r.tableRows).padStart(2)}行 字${r.len} 信号:${sig}`)
    console.log(`     ${r.q.question.slice(0, 56)}`)
  })
