/**
 * 重新挂剩下 3 张图（用真实存在的锚点）。
 */
import { readFileSync, writeFileSync } from 'node:fs'

const FILE = 'public/data/questions.json'
const data = JSON.parse(readFileSync(FILE, 'utf8'))

const MAP = {
  5405: ['**Step 2：列出该时刻所有「周期性活动」**', 'fixed-time-slowness'],
  5430: ['**Step 2：评估风险（三类）**', 'config-drift-decision'],
  5433: ['**Step 2：用「最小复现」把问题缩小**', 'code-vs-env-bisect'],
}

let done = 0
for (const [idStr, [anchor, fig]] of Object.entries(MAP)) {
  const id = Number(idStr)
  const q = data.find((x) => x.id === id)
  if (!q) {
    console.log(`✗ 未找到 ${id}`)
    continue
  }
  if (q.answer.includes(`[[图:${fig}]]`)) {
    console.log(`- ${id} 已有`)
    continue
  }
  const idx = q.answer.indexOf(anchor)
  if (idx === -1) {
    console.log(`✗ ${id} 锚点不存在`)
    continue
  }
  q.answer = `${q.answer.slice(0, idx)}[[图:${fig}]]\n\n${q.answer.slice(idx)}`
  console.log(`✓ ${id} 已挂 [[图:${fig}]]`)
  done++
}

writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8')
console.log(`完成 ${done} 条`)
