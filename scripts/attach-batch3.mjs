/**
 * 补挂剩下 3 张图（用真实锚点）。
 *
 * 48   → ci-pipeline-stages（答案以「典型阶段：」开头）
 * 53   → git-branch-strategies（答案以「Git Flow：」开头）
 * 4800 → rollout-strategies（答案以「回滚的三种粒度」开头）
 */
import { readFileSync, writeFileSync } from 'node:fs'

const FILE = 'public/data/questions.json'
const data = JSON.parse(readFileSync(FILE, 'utf8'))

const MAP = {
  48: ['典型阶段：', 'ci-pipeline-stages'],
  53: ['Git Flow：', 'git-branch-strategies'],
  4800: ['**回滚的三种粒度**：', 'rollout-strategies'],
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
console.log(`补挂完成 ${done} 条`)
