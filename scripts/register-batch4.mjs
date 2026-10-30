/**
 * 批 4：10 张插图注册 + 挂图。
 *
 * 10  → pipeline-exit-code
 * 12  → xargs-safe-usage
 * 61  → hardening-checklist
 * 62  → incident-response-order
 * 1204 → iptables-policy-vs-rule
 * 2204 已用；LVS → lvs-forward-modes（挂到 1610）
 * 3207 → terraform-vs-ansible
 * 27  → mysql-isolation-levels
 * 3410 → rds-ha-comparison
 * 1806/1807/1819/1826 → jvm-oom-types（挂到 1806）
 */
import { readFileSync, writeFileSync } from 'node:fs'

const ADDS = [
  ['PipelineExitCode', 'pipeline-exit-code'],
  ['XargsSafeUsage', 'xargs-safe-usage'],
  ['HardeningChecklist', 'hardening-checklist'],
  ['IncidentResponseOrder', 'incident-response-order'],
  ['IptablesPolicyVsRule', 'iptables-policy-vs-rule'],
  ['LvsForwardModes', 'lvs-forward-modes'],
  ['TerraformVsAnsible', 'terraform-vs-ansible'],
  ['MysqlIsolationLevels', 'mysql-isolation-levels'],
  ['RdsHaComparison', 'rds-ha-comparison'],
  ['JvmOomTypes', 'jvm-oom-types'],
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
    "  'rollout-strategies': RolloutStrategies,",
    `  'rollout-strategies': RolloutStrategies,\n${regLines.join('\n')}`,
  )
}
writeFileSync(IDX, s, 'utf8')
console.log(`注册：import ${importLines.length} 行，表 ${regLines.length} 条`)

// ---------- 挂图 ----------
const FILE = 'public/data/questions.json'
const data = JSON.parse(readFileSync(FILE, 'utf8'))

const MAP = {
  10: ['获取管道各段退出码', 'pipeline-exit-code'],
  12: ['正确做法（任选）', 'xargs-safe-usage'],
  61: ['账号与认证', 'hardening-checklist'],
  62: ['原则：先隔离止损', 'incident-response-order'],
  1204: ['`policy ACCEPT`', 'iptables-policy-vs-rule'],
  3207: ['Terraform', 'terraform-vs-ansible'],
  27: ['四种事务隔离级别', 'mysql-isolation-levels'],
  3410: ['多可用区', 'rds-ha-comparison'],
  1806: ['OutOfMemoryError', 'jvm-oom-types'],
}

let done = 0
const failed = []
for (const [idStr, [anchor, fig]] of Object.entries(MAP)) {
  const id = Number(idStr)
  const q = data.find((x) => x.id === id)
  if (!q) {
    failed.push(`${id}(题目不存在)`)
    continue
  }
  if (q.answer.includes(`[[图:${fig}]]`)) {
    console.log(`- ${id} 已有该图`)
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

// LVS 图单独挂到 1610（三种模式题）
const lvs = data.find((x) => x.id === 1610)
if (lvs && !lvs.answer.includes('[[图:lvs-forward-modes]]')) {
  const i = lvs.answer.indexOf('\n\n')
  if (i > -1) {
    lvs.answer = `${lvs.answer.slice(0, i)}\n\n[[图:lvs-forward-modes]]${lvs.answer.slice(i)}`
    console.log('✓ 1610 已挂 [[图:lvs-forward-modes]]')
    done++
  } else {
    failed.push('1610(插入位置)')
  }
} else if (lvs) {
  console.log('- 1610 已有该图')
}

writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8')
console.log(`\n挂图完成 ${done} 条`)
if (failed.length) console.log('需手工处理：', failed.join(', '))
