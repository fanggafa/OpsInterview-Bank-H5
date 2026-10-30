/**
 * 第 3 批插图：注册 + 挂到题目。
 *
 * 71   → memory-growth-decision
 * 5412 → restart-triggers
 * 5427 → disk-full-safe-triage
 * 5437 → microservice-observability
 * 5418 → alert-fatigue-triage
 * 5442 → monitor-blind-spots
 * 5426 → env-parity-gap
 */
import { readFileSync, writeFileSync } from 'node:fs'

const ADDS = [
  ['MemoryGrowthDecision', 'memory-growth-decision'],
  ['RestartTriggers', 'restart-triggers'],
  ['DiskFullSafeTriage', 'disk-full-safe-triage'],
  ['MicroserviceObservability', 'microservice-observability'],
  ['AlertFatigueTriage', 'alert-fatigue-triage'],
  ['MonitorBlindSpots', 'monitor-blind-spots'],
  ['EnvParityGap', 'env-parity-gap'],
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
    "  'code-vs-env-bisect': CodeVsEnvBisect,",
    `  'code-vs-env-bisect': CodeVsEnvBisect,\n${regLines.join('\n')}`,
  )
}
writeFileSync(IDX, s, 'utf8')
console.log(`注册：import ${importLines.length} 行，表 ${regLines.length} 条`)

// ---------- 挂图 ----------
const FILE = 'public/data/questions.json'
const data = JSON.parse(readFileSync(FILE, 'utf8'))

/** id → [锚点（图插在它之前）, 图 id] */
const MAP = {
  71: ['定位手段：', 'memory-growth-decision'],
  5412: ['**Step 2：按形式分流**', 'restart-triggers'],
  5427: ['**Step 2：按「安全等级」排序处理**', 'disk-full-safe-triage'],
  5437: ['**三个必须建设的能力**', 'microservice-observability'],
  5418: ['**Step 2：四类告警分别处理**', 'alert-fatigue-triage'],
  5442: ['**Step 2：四个「指标盲区」**', 'monitor-blind-spots'],
  5426: ['**Step 2：治理措施（按投入产出）**', 'env-parity-gap'],
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
