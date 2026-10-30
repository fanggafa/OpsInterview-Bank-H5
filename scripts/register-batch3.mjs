/**
 * 批 3：10 张插图注册 + 挂图。
 *
 * 2006 → mongo-oplog-flow
 * 2010 → wired-tiger-mechanisms
 * 3807 → redis-memory-metrics
 * 3816 → redis-failover-triage
 * 4600 → k8s-workload-types
 * 4607 → k8s-not-ready-layers
 * 48   → ci-pipeline-stages
 * 109  → test-pyramid
 * 53   → git-branch-strategies
 * 4800 → rollout-strategies
 */
import { readFileSync, writeFileSync } from 'node:fs'

const ADDS = [
  ['MongoOplogFlow', 'mongo-oplog-flow'],
  ['WiredTigerMechanisms', 'wired-tiger-mechanisms'],
  ['RedisMemoryMetrics', 'redis-memory-metrics'],
  ['RedisFailoverTriage', 'redis-failover-triage'],
  ['K8sWorkloadTypes', 'k8s-workload-types'],
  ['K8sNotReadyLayers', 'k8s-not-ready-layers'],
  ['CiPipelineStages', 'ci-pipeline-stages'],
  ['TestPyramid', 'test-pyramid'],
  ['GitBranchStrategies', 'git-branch-strategies'],
  ['RolloutStrategies', 'rollout-strategies'],
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
    "  'prometheus-scaling': PrometheusScaling,",
    `  'prometheus-scaling': PrometheusScaling,\n${regLines.join('\n')}`,
  )
}
writeFileSync(IDX, s, 'utf8')
console.log(`注册：import ${importLines.length} 行，表 ${regLines.length} 条`)

// ---------- 挂图 ----------
const FILE = 'public/data/questions.json'
const data = JSON.parse(readFileSync(FILE, 'utf8'))

const MAP = {
  2006: ['**工作方式**：', 'mongo-oplog-flow'],
  2010: ['**WiredTiger 核心结构**：', 'wired-tiger-mechanisms'],
  3807: ['**正常情况**', 'redis-memory-metrics'],
  3816: ['分「为什么连不上/报错」和「为什么丢数据」两条线。', 'redis-failover-triage'],
  4600: ['三者都管理 Pod', 'k8s-workload-types'],
  4607: ['按「节点 → kubelet → 容器运行时 → 网络」四层查。', 'k8s-not-ready-layers'],
  48: ['设计一条完整的 CI/CD 流水线', 'ci-pipeline-stages'],
  109: ['测试金字塔', 'test-pyramid'],
  53: ['常见 Git 分支策略', 'git-branch-strategies'],
  4800: ['如何设计一条可靠的回滚流程', 'rollout-strategies'],
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
