/**
 * 列出新导入的 59 道题（无图），按「是否值得配图」排序。
 * 值得配图的特征：答案里有分步骤/分层/对比结构。
 */
import { readFileSync } from 'node:fs'

const bank = JSON.parse(readFileSync('public/data/questions.json', 'utf8'))
const targets = bank.filter((q) => !JSON.stringify(q).includes('[[图:'))

// 新导入的 id 区间
const NEW_RANGES = [
  [4726, 4773],   // 容器与K8s
  [3927, 3930],   // Redis
  [5610, 5611],   // Python
  [4127, 4129],   // Linux
  [2315, 2316],   // 消息队列
]

const isNew = (id) => NEW_RANGES.some(([lo, hi]) => id >= lo && id <= hi)
const fresh = targets.filter((q) => isNew(q.id))

console.log(`新导入且未配图的题：${fresh.length}\n`)

/** 结构信号：判断值不值得画 */
const SIGNALS = [
  ['步骤', /步骤|第[一二三四五六]步|流程|过程/],
  ['分层', /分层|分[四五六]层|层级/],
  ['对比', /区别|对比|vs|各有什么|分别/],
  ['分类', /有哪几[种类]|几种|类型有/],
  ['机制', /原理|机制|怎么实现|如何实现/],
]

for (const q of fresh) {
  const a = typeof q.answer === 'string' ? q.answer : JSON.stringify(q.answer)
  const hits = SIGNALS.filter(([, re]) => re.test(q.question) || re.test(a.slice(0, 400))).map(([n]) => n)
  console.log(`【题 ${q.id}】${q.category} | 字数 ${a.length} | 信号: ${hits.join('/') || '弱'}`)
  console.log(`   ${q.question.slice(0, 62)}`)
}
