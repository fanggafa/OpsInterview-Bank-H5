/**
 * 补挂 27 / 1204 / 1806 三张图（用真实锚点）。
 *
 * 27   → mysql-isolation-levels（答案以「四种级别：」开头）
 * 1204 → iptables-policy-vs-rule（「这是两个不同层次的东西：」）
 * 1806 → jvm-oom-types（挂到 OOM 相关位置）
 */
import { readFileSync, writeFileSync } from 'node:fs'

const FILE = 'public/data/questions.json'
const data = JSON.parse(readFileSync(FILE, 'utf8'))

const MAP = {
  27: ['四种级别：', 'mysql-isolation-levels'],
  1204: ['这是两个不同层次的东西：', 'iptables-policy-vs-rule'],
}

let done = 0
for (const [idStr, [anchor, fig]] of Object.entries(MAP)) {
  const id = Number(idStr)
  const q = data.find((x) => x.id === id)
  if (!q || q.answer.includes(`[[图:${fig}]]`)) {
    console.log(`- ${id} 跳过`)
    continue
  }
  const idx = q.answer.indexOf(anchor)
  if (idx === -1) {
    console.log(`✗ ${id} 锚点不存在`)
    continue
  }
  q.answer = `${q.answer.slice(0, idx)}[[图:${fig}]]\n\n${q.answer.slice(idx)}`
  console.log(`✓ ${id} 已挂 [[图:${fig}]]`)
  done++
}

// 1806 是 CMS 相关题，把 jvm-oom-types 挂到「OOM」相关题更合适 —— 找内容里提到 OOM 的题
const target = data.find(
  (x) => (x.type || 'short') === 'short' && x.category === 'Tomcat/JVM' && /OutOfMemory|OOM/.test(x.question) && !JSON.stringify(x).includes('[[图:jvm-oom-types]]'),
)
if (target) {
  const anchor = target.answer.indexOf('\n\n')
  if (anchor > -1) {
    target.answer = `${target.answer.slice(0, anchor)}\n\n[[图:jvm-oom-types]]${target.answer.slice(anchor)}`
    console.log(`✓ ${target.id} 已挂 [[图:jvm-oom-types]]（题干含 OOM）`)
    done++
  } else {
    console.log(`✗ ${target.id} 插入位置失败`)
  }
} else {
  console.log('- 没找到合适的 OOM 题挂 jvm-oom-types')
}

writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8')
console.log(`完成 ${done} 条`)
