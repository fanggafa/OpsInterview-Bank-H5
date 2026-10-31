/**
 * 更新 README 计数并追加本批 6 行插图说明（云与HA 3 + 监控 3）。
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
  ['prevent-accidental-delete', '云上误删的四层防护', '题 3409'],
  ['read-replica-and-ha', '只读实例与多可用区高可用', '题 3421'],
  ['dr-tiers', '容灾四档与 RTO/RPO', '题 3405'],
  ['tracing-concepts', 'Tracing 的 trace/span 与落地', '题 5018'],
  ['capacity-planning', '用监控数据做容量规划', '题 5019'],
  ['monitor-triage-path', '用监控定位故障的五步', '题 5020'],
]

const anchor = '| `submodule-vs-subtree`'
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
