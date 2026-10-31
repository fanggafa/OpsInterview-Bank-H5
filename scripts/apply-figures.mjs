/**
 * 把 27 张新插图注入题库答案（[[图:id]]）并注册到 index.js。
 *
 * 注入位置：答案开头那段加粗摘要之后、正文之前（读者先看到一句话结论，再看图）。
 *
 * 用法：node scripts/apply-figures.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

/** 图 id → 组件名 → 题号 → 文件名 */
/**
 * 图 id → 组件名 → 题号 → 文件名
 *
 * ⚠️ 去重说明：以下 4 个主题**已有老图覆盖**，因此不在本清单里：
 *   - rsync-incremental   → 题 4505（rsync 增量同步 + --delete/--link-dest）
 *   - process-states      → 题 8500（进程状态 R/S/D/T/Z）
 *   - zero-downtime-upgrade → 题 10532（零停机升级 MySQL 5.7→8.0）
 *   - raid-levels         → 题 4500（RAID 0/1/5/6/10 区别与选型）
 * 我们的新题（8640 / 8597 / 12025 / 4616）与原题是同一主题，再画一张属于重复。
 */
const FIGS = [
  // 第 1 组：Linux 原理
  { id: 'linux-boot-flow', name: 'LinuxBootFlow', qid: 8630, file: 'LinuxBootFlow.vue' },
  { id: 'sudo-privilege', name: 'SudoPrivilege', qid: 8646, file: 'SudoPrivilege.vue' },
  { id: 'ansible-agentless', name: 'AnsibleAgentless', qid: 8656, file: 'AnsibleAgentless.vue' },
  // 第 2 组：存储 + 分层
  { id: 'link-inode', name: 'LinkInode', qid: 8639, file: 'LinkInode.vue' },
  { id: 'osi-seven-layers', name: 'OsiSevenLayers', qid: 9631, file: 'OsiSevenLayers.vue' },
  { id: 'tcpip-vs-osi', name: 'TcpipVsOsi', qid: 9632, file: 'TcpipVsOsi.vue' },
  { id: 'nat-workflow', name: 'NatWorkflow', qid: 9629, file: 'NatWorkflow.vue' },
  // 第 3 组：TCP + MQ
  { id: 'tcp-state-machine', name: 'TcpStateMachine', qid: 9633, file: 'TcpStateMachine.vue' },
  { id: 'kafka-architecture', name: 'KafkaArchitecture', qid: 4126, file: 'KafkaArchitecture.vue' },
  { id: 'rabbitmq-architecture', name: 'RabbitmqArchitecture', qid: 4120, file: 'RabbitmqArchitecture.vue' },
  { id: 'kafka-components', name: 'KafkaComponents', qid: 4127, file: 'KafkaComponents.vue' },
  { id: 'kafka-ordering', name: 'KafkaOrdering', qid: 4132, file: 'KafkaOrdering.vue' },
  // 第 4 组：高可用
  { id: 'ha-architecture', name: 'HaArchitecture', qid: 12082, file: 'HaArchitecture.vue' },
  { id: 'eventual-consistency', name: 'EventualConsistency', qid: 12086, file: 'EventualConsistency.vue' },
  { id: 'distributed-lock', name: 'DistributedLock', qid: 12085, file: 'DistributedLock.vue' },
  { id: 'multiactive-multi-region', name: 'MultiactiveMultiRegion', qid: 12090, file: 'MultiactiveMultiRegion.vue' },
  // 第 5 组：运维体系
  { id: 'log-trace-system', name: 'LogTraceSystem', qid: 12091, file: 'LogTraceSystem.vue' },
  { id: 'db-failover', name: 'DbFailover', qid: 12153, file: 'DbFailover.vue' },
  { id: 'db-change-safety', name: 'DbChangeSafety', qid: 12162, file: 'DbChangeSafety.vue' },
  { id: 'health-check-design', name: 'HealthCheckDesign', qid: 12164, file: 'HealthCheckDesign.vue' },
  // 第 6 组：Nginx/LVS/Redis
  { id: 'nginx-modules', name: 'NginxModules', qid: 2118, file: 'NginxModules.vue' },
  { id: 'lvs-three-modes', name: 'LvsThreeModes', qid: 2616, file: 'LvsThreeModes.vue' },
  { id: 'redis-replication', name: 'RedisReplication', qid: 8132, file: 'RedisReplication.vue' },
]

// ---------- 前置检查：文件是否都到位 ----------
const missing = FIGS.filter((f) => !existsSync(`src/components/figures/${f.file}`))
if (missing.length) {
  console.error(`✗ 缺少 ${missing.length} 个组件文件：`)
  missing.forEach((m) => console.error(`  ${m.file}`))
  process.exit(1)
}
console.log(`✓ ${FIGS.length} 个组件文件都已存在`)

// ---------- 1) 注入答案 ----------
const BANK = 'public/data/questions.json'
const bank = JSON.parse(readFileSync(BANK, 'utf8'))

let injected = 0
let skipped = 0
for (const f of FIGS) {
  const q = bank.find((x) => x.id === f.qid)
  if (!q) {
    console.error(`✗ 题号 ${f.qid} 不存在`)
    process.exit(1)
  }
  const ans = String(q.answer || '')
  if (ans.includes(`[[图:${f.id}]]`)) {
    skipped++
    continue
  }
  /**
   * 注入位置：开头那段加粗摘要（**...**）之后。
   * 用「第一个 \n\n 之后」作为插入点 —— 摘要段通常就是第一段。
   */
  const idx = ans.indexOf('\n\n')
  if (idx === -1) {
    // 没有分段：直接追加到开头之后
    q.answer = `${ans}\n\n[[图:${f.id}]]\n`
  } else {
    q.answer = `${ans.slice(0, idx)}\n\n[[图:${f.id}]]${ans.slice(idx)}`
  }
  injected++
}

writeFileSync(BANK, JSON.stringify(bank, null, 2) + '\n', 'utf8')
console.log(`✓ 答案注入 ${injected} 处（跳过已有 ${skipped} 处）`)

// ---------- 2) 注册到 index.js ----------
const IDX = 'src/components/figures/index.js'
let src = readFileSync(IDX, 'utf8')

// 2a) 加 import（插在最后一个 import 之后）
const imports = FIGS.map((f) => `import ${f.name} from './${f.name}.vue'`)
const lastImportRe = /import\s+\w+\s+from\s+'\.\/[^']+\.vue'\n/g
let lastMatch = null
for (const m of src.matchAll(lastImportRe)) lastMatch = m
if (!lastMatch) {
  console.error('✗ 找不到 import 区块结尾')
  process.exit(1)
}
const insertAt = lastMatch.index + lastMatch[0].length
const needImports = imports.filter((line) => !src.includes(line))
if (needImports.length) {
  src = src.slice(0, insertAt) + needImports.join('\n') + '\n' + src.slice(insertAt)
}
console.log(`✓ 新增 import ${needImports.length} 条`)

// 2b) 加注册项（插在 FIGURES 对象的最后一项之后）
const figStart = src.indexOf('export const FIGURES = {')
const figEnd = src.indexOf('}', figStart)
const needEntries = FIGS.filter((f) => !src.includes(`'${f.id}': ${f.name}`)).map(
  (f) => `  '${f.id}': ${f.name},`,
)
if (needEntries.length) {
  src = src.slice(0, figEnd) + needEntries.join('\n') + '\n' + src.slice(figEnd)
}
console.log(`✓ 新增注册项 ${needEntries.length} 条`)

writeFileSync(IDX, src, 'utf8')
console.log('✓ index.js 已更新')
