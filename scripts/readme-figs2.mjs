/**
 * 更新 README 计数并追加本批 7 行插图说明。
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
  ['dns-recursive-vs-iterative', '递归查询与迭代查询', '题 1005'],
  ['dns-server-faults', 'DNS 服务端故障四类', '题 1024'],
  ['nginx-change-flow', 'Nginx 改配置的标准流程', '题 1409'],
  ['nginx-access-log', 'access.log 关键字段与排查', '题 1434'],
  ['mongo-vs-mysql', 'MongoDB 与 MySQL 的区别与选型', '题 2000'],
  ['python-deps', 'Python 依赖声明与锁定', '题 5601'],
  ['python-containers', 'list/dict/set 复杂度', '题 5605'],
]

const anchor = '| `monitor-triage-path`'
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
