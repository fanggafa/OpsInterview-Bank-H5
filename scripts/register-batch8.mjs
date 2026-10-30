/**
 * 批 8：8 张插图注册 + 挂图。
 *
 * 1003 → dns-failure-layers
 * 1009 → dns-ndots-search
 * 1010 → multi-a-records
 * 1205 → conntrack-full
 * 1209 → firewalld-vs-iptables
 * 1802 → tomcat-request-flow
 * 1811 → cpu-100-locate
 * 3202 → ansible-var-priority
 */
import { readFileSync, writeFileSync } from 'node:fs'

const ADDS = [
  ['DnsFailureLayers', 'dns-failure-layers'],
  ['DnsNdotsSearch', 'dns-ndots-search'],
  ['MultiARecords', 'multi-a-records'],
  ['ConntrackFull', 'conntrack-full'],
  ['FirewalldVsIptables', 'firewalld-vs-iptables'],
  ['TomcatRequestFlow', 'tomcat-request-flow'],
  ['Cpu100Locate', 'cpu-100-locate'],
  ['AnsibleVarPriority', 'ansible-var-priority'],
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
    "  'es-shard-design': EsShardDesign,",
    `  'es-shard-design': EsShardDesign,\n${regLines.join('\n')}`,
  )
}
writeFileSync(IDX, s, 'utf8')
console.log(`注册：import ${importLines.length} 行，表 ${regLines.length} 条`)

// ---------- 挂图 ----------
const FILE = 'public/data/questions.json'
const data = JSON.parse(readFileSync(FILE, 'utf8'))

const MAP = {
  1003: ['DNS', 'dns-failure-layers'],
  1009: ['search', 'dns-ndots-search'],
  1010: ['多 A 记录', 'multi-a-records'],
  1205: ['conntrack', 'conntrack-full'],
  1209: ['firewalld', 'firewalld-vs-iptables'],
  1802: ['Tomcat', 'tomcat-request-flow'],
  1811: ['CPU', 'cpu-100-locate'],
  3202: ['变量优先级', 'ansible-var-priority'],
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
