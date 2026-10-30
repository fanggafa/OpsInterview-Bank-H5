/**
 * 临时：校验单批补题文件（结构与规范），按 merge-batch 的 ID_RANGES 验 id 段。
 *
 * 用法：node scripts/tmp-check-batch.mjs scripts/batch-choice-7b.json 2041 2085
 * 参数：文件路径、id 下界、id 上界
 * 跑完即删。
 */
import { readFileSync } from 'node:fs'

const [file, lo, hi] = process.argv.slice(2)
const min = Number(lo)
const max = Number(hi)
const data = JSON.parse(readFileSync(file, 'utf8'))

const allowed = [
  'id', 'type', 'category', 'difficulty', 'question', 'answer',
  'options', 'explanation', 'tags', 'frequency',
]
const DIFF = ['简单', '中等', '困难']
const FREQ = ['低频', '中频', '高频']

const errs = []
const ids = []
const dist = {}

for (const q of data) {
  ids.push(q.id)
  if (q.id < min || q.id > max) errs.push(`${q.id} id 越界 ${min}-${max}`)
  for (const k of Object.keys(q)) if (!allowed.includes(k)) errs.push(`${q.id} 多余字段 ${k}`)
  if (q.type !== 'single') errs.push(`${q.id} type=${q.type}`)
  if (!DIFF.includes(q.difficulty)) errs.push(`${q.id} 难度=${q.difficulty}`)
  else dist[q.difficulty] = (dist[q.difficulty] || 0) + 1
  if (!FREQ.includes(q.frequency)) errs.push(`${q.id} 频率=${q.frequency}`)
  if (!q.question || q.question.length > 60) errs.push(`${q.id} 题干长度 ${q.question?.length}`)
  if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 6) {
    errs.push(`${q.id} options 数量`)
  } else {
    const keys = q.options.map((o) => o.key).join('')
    if (!['AB', 'ABC', 'ABCD'].includes(keys)) errs.push(`${q.id} key 不连续 "${keys}"`)
    if (q.options.some((o) => !o.text || !o.text.trim())) errs.push(`${q.id} 选项为空`)
  }
  if (!Array.isArray(q.answer) || !q.answer.length) errs.push(`${q.id} answer 非数组/空`)
  else if (!q.answer.every((k) => (q.options || []).some((o) => o.key === k))) {
    errs.push(`${q.id} answer 不在 options`)
  }
  if (!q.explanation || q.explanation.length < 10) errs.push(`${q.id} 解析过短`)
  if (!Array.isArray(q.tags) || q.tags.length < 2 || q.tags.length > 5) errs.push(`${q.id} tags 数量`)
  else if (new Set(q.tags).size !== q.tags.length) errs.push(`${q.id} tags 重复`)
}

const sorted = ids.slice().sort((a, b) => a - b)
const continuous = sorted.length === max - min + 1 && sorted[0] === min && sorted[sorted.length - 1] === max

const exp = data.map((q) => q.explanation.length).sort((a, b) => a - b)

console.log(`文件：${file}`)
console.log(`数量：${data.length}（期望 ${max - min + 1}）`)
console.log(`id：${Math.min(...ids)}-${Math.max(...ids)}，连续不跳号：${continuous}`)
console.log(`难度：${JSON.stringify(dist)}（期望 简单20/中等15/困难10）`)
console.log(`解析字数：最短 ${exp[0]} / 中位 ${exp[Math.floor(exp.length / 2)]} / 最长 ${exp[exp.length - 1]}`)
console.log(`错误：${errs.length}`)
errs.slice(0, 20).forEach((e) => console.log('  ' + e))
