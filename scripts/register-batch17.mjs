/**
 * 批 17（消息队列）：4 张注册 + 挂图。
 */
import { readFileSync, writeFileSync } from 'node:fs'

const ADDS = [
  ['MqBacklogTriage', 'mq-backlog-triage'],
  ['MqOrderingGuarantee', 'mq-ordering-guarantee'],
  ['MqBroadcastVsCluster', 'mq-broadcast-vs-cluster'],
  ['KafkaPartitionPlanning', 'kafka-partition-planning'],
]

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
    "  'configmap-vs-secret': ConfigMapVsSecret,",
    `  'configmap-vs-secret': ConfigMapVsSecret,\n${regLines.join('\n')}`,
  )
}
writeFileSync(IDX, s, 'utf8')
console.log(`注册：import ${importLines.length} 行，表 ${regLines.length} 条`)

const FILE = 'public/data/questions.json'
const data = JSON.parse(readFileSync(FILE, 'utf8'))

const MAP = {
  2208: ['消息堆积', 'mq-backlog-triage'],
  2221: ['顺序消费', 'mq-ordering-guarantee'],
  2229: ['广播', 'mq-broadcast-vs-cluster'],
  2231: ['分区数', 'kafka-partition-planning'],
}

let done = 0
for (const [idStr, [anchor, fig]] of Object.entries(MAP)) {
  const id = Number(idStr)
  const q = data.find((x) => x.id === id)
  if (!q) {
    console.log(`✗ ${id} 不存在`)
    continue
  }
  if (q.answer.includes(`[[图:${fig}]]`)) {
    console.log(`- ${id} 已有`)
    continue
  }
  let idx = q.answer.indexOf(anchor)
  if (idx !== -1) {
    const ls = q.answer.lastIndexOf('\n', idx) + 1
    if (q.answer.slice(ls, idx).trimStart().startsWith('|')) idx = -1
  }
  if (idx === -1) {
    q.answer = `[[图:${fig}]]\n\n${q.answer}`
    console.log(`~ ${id} 插在开头`)
  } else {
    q.answer = `${q.answer.slice(0, idx)}[[图:${fig}]]\n\n${q.answer.slice(idx)}`
    console.log(`✓ ${id} 已挂`)
  }
  done++
}

writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8')
console.log(`完成 ${done} 条`)
