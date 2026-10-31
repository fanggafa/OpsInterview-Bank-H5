/**
 * B 标准复核：只剔除「题库正面回答了清单这个问题」的条目。
 * 逐个打印候选题的完整题干 + 答案开头，供人判断是否正面回答。
 */
import { readFileSync } from 'node:fs'

const bank = JSON.parse(readFileSync('public/data/questions.json', 'utf8'))
const pick = (id) => bank.find((q) => q.id === id)

const CHECK = [
  ['#4 Pod的几种探针', [4718, 4674, 4710, 4709, 4664]],
  ['#9 Pod生命周期状态', [4718, 4603]],
  ['#17 Deployment vs StatefulSet', [4600, 4614]],
  ['#18 Service 类型', [4613, 4614, 4627, 4641]],
  ['#19 k8s 实现数据持久', [4649, 4611]],
  ['#21 PV 和 PVC 关系', [4611]],
  ['#23 有状态/无状态应用', [4600, 4614, 4679]],
  ['#28 污点与容忍', [4620]],
  ['#30 Pod 频繁重启', [4721, 4671]],
]

for (const [label, ids] of CHECK) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(label)
  console.log('='.repeat(60))
  for (const id of ids) {
    const q = pick(id)
    if (!q) continue
    const a = typeof q.answer === 'string' ? q.answer : JSON.stringify(q.answer)
    console.log(`\n题${q.id} [${q.difficulty}] ${q.question}`)
    console.log(`  答案开头：${a.slice(0, 220).replace(/\n/g, ' ')}`)
  }
}
