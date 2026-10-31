/**
 * 执行早期题目 id 迁移：把 1–119 的题改到各自分类编号段，并保持整体按 id 升序。
 */
import { readFileSync, writeFileSync } from 'node:fs'

const FILE = 'public/data/questions.json'
const MAP = JSON.parse(readFileSync('scripts/.early-id-map.json', 'utf8'))
const data = JSON.parse(readFileSync(FILE, 'utf8'))

let changed = 0
for (const q of data) {
  const nu = MAP[String(q.id)]
  if (nu !== undefined) {
    q.id = nu
    changed += 1
  }
}

// 保持整体按 id 升序（与迁移前一致，便于 diff 与人工核对）
data.sort((a, b) => a.id - b.id)

writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8')
console.log(`✓ 已迁移 ${changed} 题，并按 id 重新排序`)

// 校验：不再有 1–119 的题；总数不变
const left = data.filter((q) => q.id >= 1 && q.id <= 119)
console.log(`残留早期 id: ${left.length}`)
console.log(`题库总数: ${data.length}`)
const dup = data.length - new Set(data.map((q) => q.id)).size
console.log(`重复 id: ${dup}`)
