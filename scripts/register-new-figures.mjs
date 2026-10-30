/**
 * 注册 6 张新插图到 figures/index.js。
 * 跑完保留（便于追溯），只做一次幂等注册。
 */
import { readFileSync, writeFileSync } from 'node:fs'

const F = 'src/components/figures/index.js'
let s = readFileSync(F, 'utf8')

const ADDS = [
  ['WaitNotComputeTree', 'wait-not-compute-tree'],
  ['HalfUsersDimensions', 'half-users-dimensions'],
  ['DualActivePhases', 'dual-active-phases'],
  ['HourlySpikeTriage', 'hourly-spike-triage'],
  ['IntermittentIssueStrategy', 'intermittent-issue-strategy'],
  ['RedisTimeoutPaths', 'redis-timeout-paths'],
]

// 1) 补齐 import（插在第一个 import 之前）
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

// 2) 补齐注册表条目（追加在 alert-funnel 之后）
const regLines = []
for (const [comp, id] of ADDS) {
  if (!s.includes(`'${id}'`)) regLines.push(`  '${id}': ${comp},`)
}
if (regLines.length) {
  s = s.replace(
    "  'alert-funnel': AlertFunnel,",
    `  'alert-funnel': AlertFunnel,\n${regLines.join('\n')}`,
  )
}

writeFileSync(F, s, 'utf8')
console.log(`新增 import ${importLines.length} 行，注册 ${regLines.length} 条`)
