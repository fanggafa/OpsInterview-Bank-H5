/**
 * 第 2 批插图：注册 + 挂到题目。
 *
 * 113  → midnight-cpu-surge
 * 5402 → replication-lag-triage
 * 5405 → fixed-time-slowness
 * 5404 → multi-region-layers
 * 5430 → config-drift-decision
 * 5433 → code-vs-env-bisect
 */
import { readFileSync, writeFileSync } from 'node:fs'

const ADDS = [
  ['MidnightCpuSurge', 'midnight-cpu-surge'],
  ['ReplicationLagTriage', 'replication-lag-triage'],
  ['FixedTimeSlowness', 'fixed-time-slowness'],
  ['MultiRegionLayers', 'multi-region-layers'],
  ['ConfigDriftDecision', 'config-drift-decision'],
  ['CodeVsEnvBisect', 'code-vs-env-bisect'],
]

// ---------- 1) 注册 ----------
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
    "  'redis-timeout-paths': RedisTimeoutPaths,",
    `  'redis-timeout-paths': RedisTimeoutPaths,\n${regLines.join('\n')}`,
  )
}
writeFileSync(IDX, s, 'utf8')
console.log(`注册：import ${importLines.length} 行，表 ${regLines.length} 条`)

// ---------- 2) 挂到题目 ----------
const FILE = 'public/data/questions.json'
const data = JSON.parse(readFileSync(FILE, 'utf8'))

/** id → [锚点（图插在它之前）, 图 id] */
const MAP = {
  113: ['2）定位：', 'midnight-cpu-surge'],
  5402: ['**Step 2：定位延迟原因', 'replication-lag-triage'],
  5405: ['**Step 2：列出「那个时刻」', 'fixed-time-slowness'],
  5404: ['**异地多活的四个层次**', 'multi-region-layers'],
  5430: ['**Step 2：评估影响面', 'config-drift-decision'],
  5433: ['**Step 2：用「最小差异实验」', 'code-vs-env-bisect'],
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
