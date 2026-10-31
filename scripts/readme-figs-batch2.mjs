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
  ['restart-policy', '重启策略三选与容器/Pod 分层', '题 4731'],
  ['image-pull-policy', '镜像拉取策略与默认值规则', '题 4732'],
  ['pv-and-pvc', 'PV 与 PVC 的定位与访问模式', '题 4741'],
  ['daemonset-traits', 'DaemonSet 三特性与用途', '题 4743'],
  ['flannel-modes', 'flannel 三种模式选型', '题 4745'],
  ['k8s-install-steps', 'K8s 安装三段与三个坑', '题 4734'],
  ['deployment-yaml', 'Deployment YAML 三层结构', '题 4737'],
  ['pod-network-triage', 'Pod 网络五层排查', '题 4748'],
  ['pod-triage-steps', 'Pod 异常定位四步与退出码', '题 4750'],
  ['node-failure-triage', '节点宕机的两类原因', '题 4754'],
]

const anchor = '| `undelete-principle`'
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
