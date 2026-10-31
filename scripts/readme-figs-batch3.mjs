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
  ['service-types', 'Service 的作用与四种类型', '题 4770'],
  ['kube-proxy-mechanism', 'kube-proxy 只写规则不转发', '题 4771'],
  ['statefulset-deploy', 'StatefulSet 三件套与部署四步', '题 4772'],
  ['affinity-types', '亲和性两大类与硬软约束', '题 4747'],
  ['auto-recovery-layers', '四层自动恢复机制', '题 4751'],
  ['network-policy-mechanism', 'NetworkPolicy 的白名单语义', '题 4762'],
  ['canary-methods', '灰度四种手段与粒度', '题 4764'],
  ['etcd-commands', 'etcdctl 四个关键命令', '题 4769'],
  ['docker-image-optimize', '镜像优化两目标与同层清理', '题 4767'],
  ['docker-secrets', 'Docker 密钥管理四档安全性', '题 4766'],
]

const anchor = '| `node-failure-triage`'
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
