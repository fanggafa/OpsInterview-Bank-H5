/**
 * 批 6：8 张插图注册 + 挂图。
 *
 * 17  → time-wait-reason
 * 18  → url-to-render
 * 37  → redis-arch-evolution
 * 43  → k8s-probes
 * 45  → k8s-service-types
 * 46  → crash-loop-triage
 * 55  → prometheus-metric-types
 * 1414 → nginx-timing-split
 */
import { readFileSync, writeFileSync } from 'node:fs'

const ADDS = [
  ['TimeWaitReason', 'time-wait-reason'],
  ['UrlToRender', 'url-to-render'],
  ['RedisArchEvolution', 'redis-arch-evolution'],
  ['K8sProbes', 'k8s-probes'],
  ['K8sServiceTypes', 'k8s-service-types'],
  ['CrashLoopTriage', 'crash-loop-triage'],
  ['PrometheusMetricTypes', 'prometheus-metric-types'],
  ['NginxTimingSplit', 'nginx-timing-split'],
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
    "  'nginx-vs-apache-model': NginxVsApacheModel,",
    `  'nginx-vs-apache-model': NginxVsApacheModel,\n${regLines.join('\n')}`,
  )
}
writeFileSync(IDX, s, 'utf8')
console.log(`注册：import ${importLines.length} 行，表 ${regLines.length} 条`)

// ---------- 挂图 ----------
const FILE = 'public/data/questions.json'
const data = JSON.parse(readFileSync(FILE, 'utf8'))

/** id → [锚点, 图 id]；锚点为 null 时插在开头 */
const MAP = {
  17: ['TIME_WAIT', 'time-wait-reason'],
  18: ['DNS', 'url-to-render'],
  37: ['主从复制：', 'redis-arch-evolution'],
  43: ['三种探针：', 'k8s-probes'],
  45: ['Service 类型（四层）：', 'k8s-service-types'],
  46: ['排查顺序：', 'crash-loop-triage'],
  55: ['四种指标类型', 'prometheus-metric-types'],
  1414: ['两个时间口径不同', 'nginx-timing-split'],
}

let done = 0
const failed = []
for (const [idStr, [anchor, fig]] of Object.entries(MAP)) {
  const id = Number(idStr)
  const q = data.find((x) => x.id === id)
  if (!q) {
    failed.push(`${id}(不存在)`)
    continue
  }
  if (q.answer.includes(`[[图:${fig}]]`)) {
    console.log(`- ${id} 已有`)
    continue
  }
  const idx = q.answer.indexOf(anchor)
  if (idx === -1) {
    failed.push(`${id}(锚点「${anchor}」)`)
    continue
  }
  q.answer = `${q.answer.slice(0, idx)}[[图:${fig}]]\n\n${q.answer.slice(idx)}`
  console.log(`✓ ${id} 已挂 [[图:${fig}]]`)
  done++
}

writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8')
console.log(`\n完成 ${done} 条`)
if (failed.length) console.log('需手工：', failed.join(', '))
