/**
 * 找出「最像但未达严格阈值」的候选对，供人工复核。
 * 门槛放宽到 0.5，每组给出题库里的真实题目，让用户判断算不算重复。
 */
import { readFileSync } from 'node:fs'

const list = readFileSync('scripts/import-list.txt', 'utf8')
  .split('\n')
  .map((s) => s.trim())
  .filter(Boolean)
const bank = JSON.parse(readFileSync('public/data/questions.json', 'utf8'))

const norm = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[\s，。！？、；：""''（）()【】[\]《》<>?.,!~`|/\\:;_\-—…]/g, '')

const kw = (s) => {
  const n = norm(s)
  const out = new Set()
  for (const w of n.match(/[a-z0-9]+/g) || []) if (w.length >= 2) out.add(w)
  for (const seg of n.match(/[\u4e00-\u9fa5]+/g) || []) {
    for (let i = 0; i + 1 < seg.length; i++) out.add(seg.slice(i, i + 2))
  }
  return out
}

const cov = (a, b) => {
  const ka = kw(a)
  const kb = kw(b)
  if (!ka.size || !kb.size) return 0
  let hit = 0
  for (const k of ka) if (kb.has(k)) hit += 1
  return hit / ka.size
}

console.log('清单题 | 分 | 题库里最接近的题目（只显示 >=0.5 的）\n')

const rows = []
for (const raw of list) {
  const n = norm(raw)
  const cands = []
  for (const q of bank) {
    const nq = norm(q.question)
    const ratio = Math.min(n.length, nq.length) / Math.max(n.length, nq.length)
    const exact = ratio >= 0.85 && (nq.includes(n) || n.includes(nq))
    const c = exact ? 1 : cov(raw, q.question)
    if (c >= 0.5) cands.push({ q, c, exact })
  }
  cands.sort((a, b) => b.c - a.c)
  const top = cands.slice(0, 2)
  rows.push({ raw, top })

  if (top.length) {
    console.log(`■ ${raw}`)
    for (const t of top) {
      const mark = t.exact ? '【几乎相同】' : ''
      console.log(`   ${t.c.toFixed(2)} ${mark} 题${t.q.id} [${t.q.category}] ${t.q.question.slice(0, 52)}`)
    }
    console.log()
  } else {
    console.log(`■ ${raw}`)
    console.log(`   （题库无相近题）\n`)
  }
}
