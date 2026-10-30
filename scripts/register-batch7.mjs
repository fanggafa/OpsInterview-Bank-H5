/**
 * 批 7：7 张插图注册 + 挂图。
 *
 * 24  → b-plus-tree-reason
 * 25  → leftmost-prefix
 * 26  → explain-fields
 * 44  → k8s-resources-qos
 * 1621 → lvs-three-layers
 * 3401 → vpc-layers
 * 3006 已有图；ES 分片 → es-shard-design（挂到 3003 或首个分片题）
 */
import { readFileSync, writeFileSync } from 'node:fs'

const ADDS = [
  ['BPlusTreeReason', 'b-plus-tree-reason'],
  ['LeftmostPrefix', 'leftmost-prefix'],
  ['ExplainFields', 'explain-fields'],
  ['K8sResourcesQos', 'k8s-resources-qos'],
  ['LvsThreeLayers', 'lvs-three-layers'],
  ['VpcLayers', 'vpc-layers'],
  ['EsShardDesign', 'es-shard-design'],
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
    "  'nginx-timing-split': NginxTimingSplit,",
    `  'nginx-timing-split': NginxTimingSplit,\n${regLines.join('\n')}`,
  )
}
writeFileSync(IDX, s, 'utf8')
console.log(`注册：import ${importLines.length} 行，表 ${regLines.length} 条`)

// ---------- 挂图 ----------
const FILE = 'public/data/questions.json'
const data = JSON.parse(readFileSync(FILE, 'utf8'))

const MAP = {
  24: ['核心原因是「磁盘 IO 次数」与「范围查询」。', 'b-plus-tree-reason'],
  25: ['最左前缀', 'leftmost-prefix'],
  26: ['EXPLAIN', 'explain-fields'],
  44: ['requests', 'k8s-resources-qos'],
  1621: ['典型的高可用入口架构', 'lvs-three-layers'],
  3401: ['**四层结构：', 'vpc-layers'],
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
    failed.push(`${id}(锚点)`)
    continue
  }
  q.answer = `${q.answer.slice(0, idx)}[[图:${fig}]]\n\n${q.answer.slice(idx)}`
  console.log(`✓ ${id} 已挂 [[图:${fig}]]`)
  done++
}

// es-shard-design 挂到「分片」相关题
const esQ = data.find(
  (x) =>
    (x.type || 'short') === 'short' &&
    x.category === '日志与ELK' &&
    /分片/.test(x.question) &&
    !JSON.stringify(x).includes('[[图:es-shard-design]]'),
)
if (esQ) {
  const i = esQ.answer.indexOf('\n\n')
  esQ.answer =
    i > -1
      ? `${esQ.answer.slice(0, i)}\n\n[[图:es-shard-design]]${esQ.answer.slice(i)}`
      : `${esQ.answer}\n\n[[图:es-shard-design]]`
  console.log(`✓ ${esQ.id} 已挂 [[图:es-shard-design]]`)
  done++
} else {
  failed.push('es-shard-design(未找到分片题)')
}

writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8')
console.log(`\n完成 ${done} 条`)
if (failed.length) console.log('需手工：', failed.join(', '))
