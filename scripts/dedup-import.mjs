/**
 * 严格去重：只有归一化后「包含关系 + 长度差 <15%」才算题库已存在。
 * 用户选的就是这个尺度（宁多勿漏）。
 */
import { readFileSync, writeFileSync } from 'node:fs'

const list = readFileSync('scripts/import-list.txt', 'utf8')
  .split('\n')
  .map((s) => s.trim())
  .filter(Boolean)
const bank = JSON.parse(readFileSync('public/data/questions.json', 'utf8'))

const norm = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[\s，。！？、；：""''（）()【】[\]《》<>?.,!~`|/\\:;_\-—…]/g, '')

const dups = []
const fresh = []
for (const raw of list) {
  const n = norm(raw)
  let hit = null
  for (const q of bank) {
    const nq = norm(q.question)
    const ratio = Math.min(n.length, nq.length) / Math.max(n.length, nq.length)
    if (ratio >= 0.85 && (nq.includes(n) || n.includes(nq))) {
      hit = { q, ratio }
      break
    }
  }
  if (hit) dups.push({ raw, id: hit.q.id, question: hit.q.question, ratio: Number(hit.ratio.toFixed(2)) })
  else fresh.push(raw)
}

console.log(`清单 ${list.length} 条：严格重复 ${dups.length}，需新增 ${fresh.length}\n`)
console.log('=== 严格重复（剔除）===')
for (const d of dups) console.log(`  ${d.raw}  ≈ 题${d.id} [${d.ratio}]  ${d.question.slice(0, 46)}`)

console.log('\n=== 需新增（全部）===')
fresh.forEach((f, i) => console.log(`  ${i + 1}. ${f}`))

writeFileSync('scripts/import-fresh.json', JSON.stringify(fresh, null, 2), 'utf8')
console.log('\n已写出 scripts/import-fresh.json')
