/**
 * 更新 README 计数并追加本批 8 行插图说明（JVM 4 + CI/CD 4）。
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
  ['cms-vs-g1', 'CMS 与 G1 的取舍', '题 1806'],
  ['jvm-memory-leak-triage', 'JVM 内存泄漏排查四步', '题 1807'],
  ['jvm-tools-map', 'JVM 工具按症状选择', '题 1819'],
  ['tomcat-slow-start', 'Tomcat 启动慢的四类原因', '题 1826'],
  ['gitops-vs-cicd', 'GitOps 与传统 CI/CD', '题 4812'],
  ['test-layers-pipeline', '测试分层与流水线顺序', '题 4817'],
  ['artifact-registry-plan', '制品仓库规划', '题 4805'],
  ['zero-downtime-upgrade', '零停机依赖升级四阶段', '题 4832'],
]

const anchor = '| `log-platform-design`'
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
