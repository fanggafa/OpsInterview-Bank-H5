/**
 * 批 10：8 张插图注册 + 挂图。
 */
import { readFileSync, writeFileSync } from 'node:fs'

const ADDS = [
  ['TcpdumpConnectFail', 'tcpdump-connect-fail'],
  ['RateVsIrate', 'rate-vs-irate'],
  ['ObservabilityPillars', 'observability-pillars'],
  ['MongoEsrPrinciple', 'mongo-esr-principle'],
  ['MongoDeployModes', 'mongo-deploy-modes'],
  ['SloErrorBudget', 'slo-error-budget'],
  ['OncallResponseFlow', 'oncall-response-flow'],
  ['TcpVsUdp', 'tcp-vs-udp'],
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
    "  'git-stash': GitStash,",
    `  'git-stash': GitStash,\n${regLines.join('\n')}`,
  )
}
writeFileSync(IDX, s, 'utf8')
console.log(`注册：import ${importLines.length} 行，表 ${regLines.length} 条`)

const FILE = 'public/data/questions.json'
const data = JSON.parse(readFileSync(FILE, 'utf8'))

/** id → [锚点, 图 id]；锚点不能落在表格行内部 */
const MAP = {
  19: ['核心思路', 'tcpdump-connect-fail'],
  22: ['TCP 和 UDP 的核心区别', 'tcp-vs-udp'],
  56: ['rate', 'rate-vs-irate'],
  58: ['metrics', 'observability-pillars'],
  59: ['SLI', 'slo-error-budget'],
  60: ['响应流程', 'oncall-response-flow'],
  2002: ['部署形态', 'mongo-deploy-modes'],
  2008: ['最左前缀', 'mongo-esr-principle'],
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
  // 只在该锚点所在行不是表格行时才用它，否则退回「插到开头」
  let idx = q.answer.indexOf(anchor)
  if (idx !== -1) {
    const lineStart = q.answer.lastIndexOf('\n', idx) + 1
    const linePrefix = q.answer.slice(lineStart, idx)
    if (linePrefix.trimStart().startsWith('|')) idx = -1 // 表格行内部，不安全
  }
  if (idx === -1) {
    q.answer = `[[图:${fig}]]\n\n${q.answer}`
    console.log(`~ ${id} 锚点不安全/缺失，图插在开头`)
  } else {
    q.answer = `${q.answer.slice(0, idx)}[[图:${fig}]]\n\n${q.answer.slice(idx)}`
    console.log(`✓ ${id} 已挂 [[图:${fig}]]`)
  }
  done++
}

writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8')
console.log(`\n完成 ${done} 条`)
if (failed.length) console.log('需手工：', failed.join(', '))
