/**
 * 批 11（网络基础）：8 张注册 + 挂图。
 */
import { readFileSync, writeFileSync } from 'node:fs'

const ADDS = [
  ['HttpsTlsHandshake', 'https-tls-handshake'],
  ['HttpCacheLevels', 'http-cache-levels'],
  ['CdnPrinciples', 'cdn-principles'],
  ['KeepaliveVsHeartbeat', 'keepalive-vs-heartbeat'],
  ['SsVsNetstat', 'ss-vs-netstat'],
  ['TracerouteVsMtr', 'traceroute-vs-mtr'],
  ['CrossDcNetwork', 'cross-dc-network'],
  ['PingFailTriage', 'ping-fail-triage'],
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
    "  'tcp-vs-udp': TcpVsUdp,",
    `  'tcp-vs-udp': TcpVsUdp,\n${regLines.join('\n')}`,
  )
}
writeFileSync(IDX, s, 'utf8')
console.log(`注册：import ${importLines.length} 行，表 ${regLines.length} 条`)

const FILE = 'public/data/questions.json'
const data = JSON.parse(readFileSync(FILE, 'utf8'))

const MAP = {
  102: ['HTTP 和 HTTPS', 'https-tls-handshake'],
  103: ['排查思路', 'ping-fail-triage'],
  4414: ['traceroute', 'traceroute-vs-mtr'],
  4417: ['跨机房', 'cross-dc-network'],
  4418: ['ss', 'ss-vs-netstat'],
  4424: ['keepalive', 'keepalive-vs-heartbeat'],
  4431: ['HTTP 缓存', 'http-cache-levels'],
  4432: ['CDN', 'cdn-principles'],
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
  // 锚点若落在表格行内部则退回开头
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
