/**
 * 把早期题目（id 1–119）迁移到各自分类的编号段。
 *
 * 规则：
 * 1. 每个分类内按原 id 顺序，依次分配到该段「当前最大已用 id + 1」开始的位置；
 * 2. 只改 id，其它字段（含 [[图:id]] 标记）不动；
 * 3. 输出 old→new 映射，供 README 与学习记录迁移使用。
 */
import { readFileSync, writeFileSync } from 'node:fs'

const FILE = 'public/data/questions.json'
const data = JSON.parse(readFileSync(FILE, 'utf8'))

// 与 scripts/merge-batch.mjs 的 ID_RANGES 保持一致
const RANGES = {
  MySQL: [3600, 3799],
  Redis: [3800, 3999],
  Linux基础: [4000, 4199],
  Shell脚本: [4200, 4399],
  网络基础: [4400, 4599],
  '容器与K8s': [4600, 4799],
  'CI/CD': [4800, 4999],
  监控告警: [5000, 5199],
  '安全与跳板机': [5200, 5399],
  综合场景题: [5400, 5599],
  Python: [5600, 5799],
}

const EARLY = data.filter((q) => q.id >= 1 && q.id <= 119)

// 各分类当前段内最大 id（只看已在段内的题）
const nextId = {}
for (const [cat, [lo, hi]] of Object.entries(RANGES)) {
  const inRange = data.filter((q) => q.category === cat && q.id >= lo && q.id <= hi)
  nextId[cat] = inRange.length ? Math.max(...inRange.map((q) => q.id)) + 1 : lo
}

const map = {}
const planned = []

// 按分类分组，组内按旧 id 升序，保证编号连续、顺序稳定
const byCat = {}
for (const q of EARLY) {
  ;(byCat[q.category] = byCat[q.category] || []).push(q)
}

for (const [cat, list] of Object.entries(byCat)) {
  if (!RANGES[cat]) {
    console.log(`✗ 分类 ${cat} 没有编号段`)
    process.exit(1)
  }
  const [, hi] = RANGES[cat]
  list.sort((a, b) => a.id - b.id)
  for (const q of list) {
    if (nextId[cat] > hi) {
      console.log(`✗ ${cat} 编号段已满（上限 ${hi}）`)
      process.exit(1)
    }
    map[q.id] = nextId[cat]
    planned.push([q, nextId[cat]])
    nextId[cat] += 1
  }
}

console.log(`待迁移 ${planned.length} 题，映射 ${Object.keys(map).length} 条\n`)
const preview = []
for (const [cat, list] of Object.entries(byCat)) {
  const first = map[list.sort((a, b) => a.id - b.id)[0].id]
  const last = map[list[list.length - 1].id]
  preview.push(`  ${cat}: ${list.length} 题 → ${Math.min(first, last)} – ${Math.max(first, last)}`)
}
console.log('各分类迁移后落点：')
console.log(preview.join('\n'))

// 校验：新 id 不得与既有 id 冲突
const existing = new Set(data.filter((q) => !(q.id >= 1 && q.id <= 119)).map((q) => q.id))
const clash = Object.values(map).filter((n) => existing.has(n))
if (clash.length) {
  console.log(`✗ 与既有 id 冲突：${clash.slice(0, 5).join(', ')}`)
  process.exit(1)
}
console.log(`\n✓ 无 id 冲突（既有 id ${existing.size} 个）`)

writeFileSync('scripts/.early-id-map.json', JSON.stringify(map, null, 2), 'utf8')
console.log('已输出映射到 scripts/.early-id-map.json（尚未写入题库）')
