/**
 * 更新 README：计数 + 追加 24 行 AI 插图说明。
 */
import { readFileSync, writeFileSync } from 'node:fs'

const q = JSON.parse(readFileSync('public/data/questions.json', 'utf8'))
const withFig = q.filter((x) => JSON.stringify(x).includes('[[图:')).length
const idx = readFileSync('src/components/figures/index.js', 'utf8')
const regCount = (idx.match(/^  '[a-z0-9-]+':/gm) || []).length
const cats = new Set(q.map((x) => x.category))

let s = readFileSync('README.md', 'utf8')
s = s.replace(/含 \*\*\d+ 张内联 SVG 图解\*\*（\d+ 题带图）/, `含 **${regCount} 张内联 SVG 图解**（${withFig} 题带图）`)
s = s.replace(/### 已注册的插图（\d+ 张，\d+ 个分类全覆盖）/, `### 已注册的插图（${regCount} 张，${cats.size} 个分类全覆盖）`)

const ROWS = [
  ['llm-vs-ml', 'LLM 与传统 ML 四维度对比', '题 5800'],
  ['token-billing', 'Token 计费与输入/输出价差', '题 5801'],
  ['rag-pipeline', 'RAG 离线建库与在线检索链路', '题 5802'],
  ['agent-loop', 'Agent 的 ReAct 循环', '题 5803'],
  ['hallucination-mitigation', '幻觉成因与五级缓解', '题 5805'],
  ['prompt-principles', '结构化提示词骨架与原则', '题 5806'],
  ['temperature-effect', 'Temperature 对概率分布的影响', '题 5809'],
  ['context-window-limits', '上下文窗口的共享预算与四限制', '题 5810'],
  ['finetune-vs-rag', '提示词/RAG/微调的分工', '题 5811'],
  ['sft-vs-rlhf', '训练三阶段与 SFT/RLHF 对照', '题 5812'],
  ['lora-structure', 'LoRA 冻结 W + 旁路 ΔW', '题 5813'],
  ['vector-embedding', '语义聚簇到向量与余弦相似度', '题 5814'],
  ['gpu-vs-cpu', 'CPU 与 GPU 的架构差异', '题 5818'],
  ['vram-composition', '显存构成与六种解法', '题 5819'],
  ['vllm-architecture', 'PagedAttention 与连续批处理', '题 5820'],
  ['llm-api-monitoring', 'LLM 服务的三层监控指标', '题 5821'],
  ['ai-data-security-layers', '私有化 AI 的四层数据安全', '题 5822'],
  ['ai-gateway-roles', 'AI 网关的六项治理能力', '题 5825'],
  ['log-ai-analysis-flow', '日志喂给 AI 前的四步处理', '题 5827'],
  ['ai-slow-triage', 'AI 变慢的三段耗时与两指标', '题 5832'],
  ['token-cost-breakdown', '成本公式与降本三条路', '题 5834'],
  ['llm-observability-gap', 'LLM 可观测性相对 APM 的缺口', '题 5835'],
  ['prompt-injection-defense', '直接/间接注入与防御层次', '题 5836'],
  ['data-masking-flow', '脱敏四方式与四个插入位置', '题 5838'],
]

const anchor = '| `pod-scheduling-methods`'
const i = s.indexOf(anchor)
if (i === -1) {
  // 退回到表格最后一行
  const j = s.lastIndexOf('| `')
  const e2 = s.indexOf('\n', j)
  s = `${s.slice(0, e2)}\n${ROWS.map(([id, d, w]) => `| \`${id}\` | ${d} | ${w} |`).join('\n')}${s.slice(e2)}`
  writeFileSync('README.md', s, 'utf8')
  console.log(`✓ 计数 ${regCount}/${withFig}，补 ${ROWS.length} 行（追加到表尾）`)
} else {
  const e = s.indexOf('\n', i)
  const missing = ROWS.filter(([id]) => !s.includes('`' + id + '`'))
  s = `${s.slice(0, e)}\n${missing.map(([id, d, w]) => `| \`${id}\` | ${d} | ${w} |`).join('\n')}${s.slice(e)}`
  writeFileSync('README.md', s, 'utf8')
  console.log(`✓ 计数 ${regCount}/${withFig}，补 ${missing.length} 行`)
}
