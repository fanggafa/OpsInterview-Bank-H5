/**
 * 跨分类配图（批 1）：注册 + 挂图。
 *
 * 4001 → zombie-vs-orphan
 * 4002 → inode-vs-block
 * 4004 → nice-priority-levels
 * 4400 → flow-vs-congestion
 * 4411 → http-code-triage
 * 4412 → curl-layers
 */
import { readFileSync, writeFileSync } from 'node:fs'

const ADDS = [
  ['ZombieVsOrphan', 'zombie-vs-orphan'],
  ['InodeVsBlock', 'inode-vs-block'],
  ['NicePriorityLevels', 'nice-priority-levels'],
  ['FlowVsCongestion', 'flow-vs-congestion'],
  ['HttpCodeTriage', 'http-code-triage'],
  ['CurlLayers', 'curl-layers'],
]

// ---------- 注册 ----------
const IDX = 'src/components/figures/index.js'
let s = readFileSync(IDX, 'utf8')

const importLines = []
for (const [comp] of ADDS) {
  const line = `import ${comp} from './${comp}.vue'`
  if (!s.includes(line)) importLines.push(line)
}
if (importLines.length) {
  s = s.replace(
    "import DnsResolve from './DnsResolve.vue'",
    `${importLines.join('\n')}\nimport DnsResolve from './DnsResolve.vue'`,
  )
}

const regLines = []
for (const [comp, id] of ADDS) {
  if (!s.includes(`'${id}'`)) regLines.push(`  '${id}': ${comp},`)
}
if (regLines.length) {
  s = s.replace(
    "  'env-parity-gap': EnvParityGap,",
    `  'env-parity-gap': EnvParityGap,\n${regLines.join('\n')}`,
  )
}
writeFileSync(IDX, s, 'utf8')
console.log(`注册：import ${importLines.length} 行，表 ${regLines.length} 条`)

// ---------- 挂图 ----------
const FILE = 'public/data/questions.json'
const data = JSON.parse(readFileSync(FILE, 'utf8'))

const MAP = {
  4001: ['| 危害 |', 'zombie-vs-orphan'],
  4002: ['**排查**：', 'inode-vs-block'],
  4004: ['**调整命令**：', 'nice-priority-levels'],
  4400: ['**拥塞控制四阶段**：', 'flow-vs-congestion'],
  4411: ['**排障时要先分清「谁的问题」**：', 'http-code-triage'],
  4412: ['**四个层次的信息**：', 'curl-layers'],
}

let done = 0
for (const [idStr, [anchor, fig]] of Object.entries(MAP)) {
  const id = Number(idStr)
  const q = data.find((x) => x.id === id)
  if (!q) {
    console.log(`✗ 未找到题目 ${id}`)
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
console.log(`挂图完成 ${done} 条`)
