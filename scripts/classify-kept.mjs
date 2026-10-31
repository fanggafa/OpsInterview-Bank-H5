/**
 * 把收录的 59 条按分类归位，输出结构化清单（供分批写入题库）。
 * 剔除 7 条：原清单第 4、9、17、19、21、28、30 条。
 */
import { readFileSync, writeFileSync } from 'node:fs'

const list = readFileSync('scripts/import-list.txt', 'utf8')
  .split('\n')
  .map((s) => s.trim())
  .filter(Boolean)

// 按原文精确剔除（用唯一片段匹配，避免索引错位）
const DROP = ['Pod的几种探针', 'Pod的生命周期中有哪些状态', 'Deployment和Statefulset有什么区别', 'k8s怎么实现数据持久', 'PV和PVC之间的关系', '污点和容忍', '如何排查与解决Pod频繁重启']

const dropped = []
const kept = []
for (const raw of list) {
  const hit = DROP.some((d) => raw.replace(/\s/g, '').includes(d.replace(/\s/g, '')))
  if (hit) dropped.push(raw)
  else kept.push(raw)
}

console.log(`剔除 ${dropped.length}：`)
dropped.forEach((d) => console.log('  -', d))
console.log(`\n收录 ${kept.length}\n`)

/** 分类归属（按题库既有分类，K8s/容器 统一进「容器与K8s」） */
function classify(raw) {
  const s = raw.toLowerCase()
  if (s.includes('redis')) return 'Redis'
  if (s.includes('kafka') || s.includes('rabbitmq')) return '消息队列'
  if (s.includes('python')) return 'Python'
  if (s.includes('df') || s.includes('lsblk') || s.includes('linux') || s.includes('内核') || s.includes('误删'))
    return 'Linux基础'
  if (s.includes('harbor')) return '容器与K8s'
  return '容器与K8s'
}

const byCat = {}
for (const raw of kept) {
  const cat = classify(raw)
  ;(byCat[cat] = byCat[cat] || []).push(raw)
}

console.log('分类分布：')
for (const [cat, items] of Object.entries(byCat)) {
  console.log(`\n【${cat}】${items.length} 条`)
  items.forEach((x, i) => console.log(`  ${i + 1}. ${x}`))
}

writeFileSync(
  'scripts/import-kept.json',
  JSON.stringify({ kept, dropped, byCat }, null, 2),
  'utf8',
)
console.log('\n已写出 scripts/import-kept.json')
