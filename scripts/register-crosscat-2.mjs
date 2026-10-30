/**
 * 跨分类配图（批 2）：注册 + 挂图。
 *
 * 2403 → object-vs-filesystem
 * 2605 → live-migration-phases
 * 2200 → mq-comparison
 * 2204 → kafka-isr-mechanism
 * 3005 → es-thread-pool-triage
 * 5010 → prometheus-scaling
 */
import { readFileSync, writeFileSync } from 'node:fs'

const ADDS = [
  ['ObjectVsFileSystem', 'object-vs-filesystem'],
  ['LiveMigrationPhases', 'live-migration-phases'],
  ['MqComparison', 'mq-comparison'],
  ['KafkaIsrMechanism', 'kafka-isr-mechanism'],
  ['EsThreadPoolTriage', 'es-thread-pool-triage'],
  ['PrometheusScaling', 'prometheus-scaling'],
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
  // 追加到注册表末尾（curl-layers 之后）
  s = s.replace("  'curl-layers': CurlLayers,", `  'curl-layers': CurlLayers,\n${regLines.join('\n')}`)
}
writeFileSync(IDX, s, 'utf8')
console.log(`注册：import ${importLines.length} 行，表 ${regLines.length} 条`)

// ---------- 挂图 ----------
const FILE = 'public/data/questions.json'
const data = JSON.parse(readFileSync(FILE, 'utf8'))

const MAP = {
  2403: ['| 访问方式 |', 'object-vs-filesystem'],
  2605: ['**原理（迭代拷贝）**：', 'live-migration-phases'],
  2200: ['**核心差异在「设计目标」**：', 'mq-comparison'],
  2204: ['**为什么需要**：', 'kafka-isr-mechanism'],
  3005: ['| 线程池 | 拒绝原因 |', 'es-thread-pool-triage'],
  5010: ['**四条演进路线，按规模递增**。', 'prometheus-scaling'],
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
