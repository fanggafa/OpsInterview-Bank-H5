/**
 * 更新 README：题库计数、分类数、编号段表格（加入 AI 分类）、插图清单。
 */
import { readFileSync, writeFileSync } from 'node:fs'

const q = JSON.parse(readFileSync('public/data/questions.json', 'utf8'))
const cats = new Set(q.map((x) => x.category))
const short = q.filter((x) => (x.type || 'short') === 'short').length
const single = q.filter((x) => x.type === 'single').length
const multi = q.filter((x) => x.type === 'multiple').length
const withFig = q.filter((x) => JSON.stringify(x).includes('[[图:')).length
const idx = readFileSync('src/components/figures/index.js', 'utf8')
const regCount = (idx.match(/^  '[a-z0-9-]+':/gm) || []).length

let s = readFileSync('README.md', 'utf8')

// 第 7 行：题库统计
s = s.replace(
  /- 题库：\*\*\d+ 题\*\*（.*?），\d+ 个分类；含 \*\*\d+ 张内联 SVG 图解\*\*（\d+ 题带图）/,
  `- 题库：**${q.length} 题**（${short} 简答 + ${single} 单选 + ${multi} 多选），${cats.size} 个分类；含 **${regCount} 张内联 SVG 图解**（${withFig} 题带图）`,
)

// 正文统计句
s = s.replace(
  /题库共 \*\*\d+ 题\*\*：\d+ 道简答题 \+ \d+ 道单选题 \+ \d+ 道多选题，分布在 \d+ 个分类中。/,
  `题库共 **${q.length} 题**：${short} 道简答题 + ${single} 道单选题 + ${multi} 道多选题，分布在 ${cats.size} 个分类中。`,
)

// 编号段表格：在 Python 行加 AI
s = s.replace(
  '| 综合场景题 | 5400 – 5599 | **Python** | **5600 – 5799** |',
  '| 综合场景题 | 5400 – 5599 | Python | 5600 – 5799 |\n| **AI与大模型** | **5800 – 5999** | （待扩充分类） | — |',
)

// 插图标题
s = s.replace(/### 已注册的插图（\d+ 张，\d+ 个分类全覆盖）/, `### 已注册的插图（${regCount} 张，${cats.size} 个分类全覆盖）`)

writeFileSync('README.md', s, 'utf8')
console.log(`✓ 题库 ${q.length} 题 / ${cats.size} 分类 / ${short} 简答 / 插图 ${regCount}`)
