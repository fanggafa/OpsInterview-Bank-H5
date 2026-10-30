/**
 * 把 6 张新插图挂到对应题目的答案里（插在合适位置）。
 *
 * 67   → wait-not-compute-tree（排查方向清单前）
 * 5401 → half-users-dimensions（Step 2 分流前）
 * 5416 → redis-timeout-paths（五个方向前）
 * 5417 → dual-active-phases（三阶段前）
 * 5422 → hourly-spike-triage（Step 2 前）
 * 5439 → intermittent-issue-strategy（Step 2 前）
 */
import { readFileSync, writeFileSync } from 'node:fs'

const FILE = 'public/data/questions.json'
const data = JSON.parse(readFileSync(FILE, 'utf8'))

/** id → [锚点文本, 图 id]：图挂在「锚点之前」 */
const MAP = {
  67: ['排查方向：', 'wait-not-compute-tree'],
  5401: ['Step 2：按「一半」的常见成因分流', 'half-users-dimensions'],
  5416: ['Step 2：五个方向', 'redis-timeout-paths'],
  5417: ['阶段 1：应用双活 + 读分流', 'dual-active-phases'],
  5422: ['Step 2：列出整点任务', 'hourly-spike-triage'],
  5439: ['Step 2：把「不可见」变成「可见」', 'intermittent-issue-strategy'],
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
    console.log(`- ${id} 已有该图`)
    continue
  }
  const idx = q.answer.indexOf(anchor)
  if (idx === -1) {
    console.log(`✗ ${id} 找不到锚点「${anchor}」`)
    continue
  }
  q.answer = `${q.answer.slice(0, idx)}[[图:${fig}]]\n\n${q.answer.slice(idx)}`
  console.log(`✓ ${id} 已挂 [[图:${fig}]]`)
  done++
}

writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8')
console.log(`完成 ${done} 条`)
