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
  ['five-xx-triage', '5xx 分层定位与来源判断', '题 4757'],
  ['hpa-mechanism', 'HPA 原理与五个常见问题', '题 4759'],
  ['docker-monitoring', 'Docker 监控与 cgroup 读 limit', '题 4768'],
  ['redis-data-types', 'Redis 类型与场景对应', '题 3927'],
  ['df-vs-lsblk', 'df / lsblk / du 三视角', '题 4129'],
  ['kafka-partition-consumer', '分区与消费者三种关系', '题 2315'],
  ['python-concurrency-modes', '线程/进程/协程选型', '题 5610'],
  ['k8s-security-layers', 'K8s 安全五层收敛', '题 4765'],
]

const anchor = '| `pod-scheduling-methods`'
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
