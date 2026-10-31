/**
 * 更新 README：计数 + 追加本批 7 行插图说明。
 */
import { readFileSync, writeFileSync } from 'node:fs'

const q = JSON.parse(readFileSync('public/data/questions.json', 'utf8'))
const withFig = q.filter((x) => JSON.stringify(x).includes('[[图:')).length
const idx = readFileSync('src/components/figures/index.js', 'utf8')
const regCount = (idx.match(/^  '[a-z0-9-]+':/gm) || []).length

let s = readFileSync('README.md', 'utf8')
s = s.replace(/含 \*\*\d+ 张内联 SVG 图解\*\*（\d+ 题带图）/, `含 **${regCount} 张内联 SVG 图解**（${withFig} 题带图）`)
s = s.replace(/### 已注册的插图（\d+ 张，\d+ 个分类全覆盖）/, `### 已注册的插图（${regCount} 张，24 个分类全覆盖）`)

const ROWS = [
  ['k8s-components', 'K8s 核心组件与作用', '题 4727'],
  ['deployment-create', 'Deployment 三级创建链路', '题 4738'],
  ['rolling-update', '滚动升级与回滚本质', '题 4739'],
  ['apiserver-ha', 'apiserver 的高可用三要素', '题 4736'],
  ['pv-lifecycle', 'PV 四状态与回收策略', '题 4742'],
  ['flannel-vs-calico', 'flannel 与 calico 对比', '题 4753'],
  ['pod-scheduling-methods', '五种调度到指定节点的方法', '题 4755'],
]

const anchor = '| `docker-secrets`'
const i = s.indexOf(anchor)
if (i === -1) {
  console.log('✗ 找不到锚点')
  process.exit(1)
}
const e = s.indexOf('\n', i)
const missing = ROWS.filter(([id]) => !s.includes('`' + id + '`'))
s = `${s.slice(0, e)}\n${missing.map(([id, d, w]) => `| \`${id}\` | ${d} | ${w} |`).join('\n')}${s.slice(e)}`

writeFileSync('README.md', s, 'utf8')
console.log(`✓ 计数 ${regCount}/${withFig}，补 ${missing.length} 行`)
