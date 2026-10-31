/**
 * 更新 README：计数 + 追加本批 10 行插图说明。
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
  ['k8s-workflow', 'K8s 基本工作流程（声明式调谐）', '题 4726'],
  ['pod-create-flow', 'Pod 创建六步与两种卡点', '题 4729'],
  ['pod-delete-flow', 'Pod 删除的优雅终止时序', '题 4730'],
  ['k8s-component-ha', '组件高可用：并行 vs 选主', '题 4728'],
  ['pod-types', '静态 Pod / 自主式 / 动态', '题 4733'],
  ['kubeadm-vs-binary', 'kubeadm 与二进制安装', '题 4735'],
  ['sentinel-vs-cluster', 'Redis 哨兵与集群', '题 3928'],
  ['redis-slot', 'slot 分片与 hash tag', '题 3929'],
  ['rabbit-message-loss', 'RabbitMQ 消息丢失三段', '题 2316'],
  ['undelete-principle', '误删文件恢复原理', '题 4127'],
]

const anchor = '| `copy-vs-add`'
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
