/**
 * 批 5（最后一批）：10 张插图注册 + 挂图。
 *
 * 2801 → merge-vs-rebase
 * 2810 → gitlab-components
 * 3006 → es-query-vs-filter
 * 2608 → vm-disk-formats
 * 1425 → nginx-vs-apache-model（挂到 Nginx 对比题）
 */
import { readFileSync, writeFileSync } from 'node:fs'

const ADDS = [
  ['MergeVsRebase', 'merge-vs-rebase'],
  ['GitlabComponents', 'gitlab-components'],
  ['EsQueryVsFilter', 'es-query-vs-filter'],
  ['VmDiskFormats', 'vm-disk-formats'],
  ['NginxVsApacheModel', 'nginx-vs-apache-model'],
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
    "  'jvm-oom-types': JvmOomTypes,",
    `  'jvm-oom-types': JvmOomTypes,\n${regLines.join('\n')}`,
  )
}
writeFileSync(IDX, s, 'utf8')
console.log(`注册：import ${importLines.length} 行，表 ${regLines.length} 条`)

// ---------- 挂图 ----------
const FILE = 'public/data/questions.json'
const data = JSON.parse(readFileSync(FILE, 'utf8'))

const MAP = {
  2801: ['**核心区别：merge 保留历史分叉，rebase 把历史拉成直线。**', 'merge-vs-rebase'],
  2810: ['**Step 1：先定位「哪个组件慢」**', 'gitlab-components'],
  3006: ['**核心区别：filter 不算相关性分数，且结果可缓存。**', 'es-query-vs-filter'],
  2608: ['| 格式 | 特点 | 适用 |', 'vm-disk-formats'],
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

// nginx-vs-apache-model 挂到 Nginx 优势题
const ng = data.find(
  (x) => (x.type || 'short') === 'short' && x.category === 'Nginx' && /相比 Apache|和 Apache/.test(x.question),
)
if (ng && !ng.answer.includes('[[图:nginx-vs-apache-model]]')) {
  const i = ng.answer.indexOf('\n\n')
  if (i > -1) {
    ng.answer = `${ng.answer.slice(0, i)}\n\n[[图:nginx-vs-apache-model]]${ng.answer.slice(i)}`
    console.log(`✓ ${ng.id} 已挂 [[图:nginx-vs-apache-model]]`)
    done++
  } else {
    failed.push(`${ng.id}(位置)`)
  }
} else if (ng) {
  console.log('- nginx 已有该图')
}

writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8')
console.log(`\n完成 ${done} 条`)
if (failed.length) console.log('需手工：', failed.join(', '))
