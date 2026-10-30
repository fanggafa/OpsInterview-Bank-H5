/**
 * 把 nginx-vs-apache-model 挂到 1404（master/worker 进程模型题）。
 */
import { readFileSync, writeFileSync } from 'node:fs'

const FILE = 'public/data/questions.json'
const data = JSON.parse(readFileSync(FILE, 'utf8'))

const q = data.find((x) => x.id === 1404)
if (!q) {
  console.log('✗ 未找到 1404')
  process.exit(1)
}
if (q.answer.includes('[[图:nginx-vs-apache-model]]')) {
  console.log('- 已有该图')
  process.exit(0)
}

const i = q.answer.indexOf('\n\n')
q.answer =
  i > -1
    ? `${q.answer.slice(0, i)}\n\n[[图:nginx-vs-apache-model]]${q.answer.slice(i)}`
    : `${q.answer}\n\n[[图:nginx-vs-apache-model]]`

writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8')
console.log('✓ 1404 已挂 [[图:nginx-vs-apache-model]]')
