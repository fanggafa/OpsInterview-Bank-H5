/**
 * 批 9：8 张插图注册 + 挂图。
 *
 * 98  → shell-quotes
 * 63  → least-privilege-layers
 * 65  → tls-cert-lifecycle
 * 2405 → rsync-incremental
 * 2408 → ceph-components
 * 2600 → kvm-vs-xen-vmware
 * 1604 → lvs-scheduling
 * 2811 → git-stash
 */
import { readFileSync, writeFileSync } from 'node:fs'

const ADDS = [
  ['ShellQuotes', 'shell-quotes'],
  ['LeastPrivilegeLayers', 'least-privilege-layers'],
  ['TlsCertLifecycle', 'tls-cert-lifecycle'],
  ['RsyncIncremental', 'rsync-incremental'],
  ['CephComponents', 'ceph-components'],
  ['KvmVsXenVmware', 'kvm-vs-xen-vmware'],
  ['LvsScheduling', 'lvs-scheduling'],
  ['GitStash', 'git-stash'],
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
    "  'ansible-var-priority': AnsibleVarPriority,",
    `  'ansible-var-priority': AnsibleVarPriority,\n${regLines.join('\n')}`,
  )
}
writeFileSync(IDX, s, 'utf8')
console.log(`注册：import ${importLines.length} 行，表 ${regLines.length} 条`)

const FILE = 'public/data/questions.json'
const data = JSON.parse(readFileSync(FILE, 'utf8'))

const MAP = {
  98: ['单引号', 'shell-quotes'],
  63: ['最小权限', 'least-privilege-layers'],
  65: ['TLS 证书过期', 'tls-cert-lifecycle'],
  2405: ['rsync', 'rsync-incremental'],
  2408: ['Ceph', 'ceph-components'],
  2600: ['KVM', 'kvm-vs-xen-vmware'],
  1604: ['调度算法', 'lvs-scheduling'],
  2811: ['git stash', 'git-stash'],
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
