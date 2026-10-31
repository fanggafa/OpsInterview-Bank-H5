/**
 * 更新 README 计数并追加最后 11 行插图说明。
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
  ['mongo-replset-setup', 'MongoDB 副本集搭建六步', '题 2033'],
  ['data-lifecycle', '数据生命周期四阶段', '题 2433'],
  ['virtualization-capacity', '虚拟化容量规划四维', '题 2621'],
  ['kibana-error-spike', 'Kibana 错误突增排查', '题 3017'],
  ['opsdev-vs-ops', '运维开发与传统运维', '题 3240'],
  ['dns-resolution-chain', 'DNS 解析五级与故障症状', '题 4519'],
  ['copy-vs-add', 'COPY 与 ADD', '题 4636'],
  ['cpu-spike-incident', 'CPU 异常高的应急顺序', '题 5204'],
  ['cloud-migration-plan', '自建机房上云迁移', '题 5411'],
  ['arch-evolution-plan', '3 年架构演进规划', '题 5421'],
  ['promotion-load-test', '大促容量评估与压测', '题 5542'],
]

const anchor = '| `virtualization-plan`'
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
