/**
 * 合并分批题目到主题库。
 *
 * 用法：node scripts/merge-batch.mjs scripts/batch1-dns.json [...更多文件]
 *
 * 规则：
 * - 按 id 去重：已存在的 id 直接跳过（避免重复导入）
 * - 校验分类必须存在于 CATEGORIES
 * - 校验 id 落在该分类的编号段内（防止串号）
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { CATEGORIES } from '../src/utils/constants.js'

const MAIN = 'public/data/questions.json'

/** 分类 → id 起始段（按分类分段，防止未来插题打乱已有编号） */
export const ID_RANGES = {
  DNS: [1000, 1199],
  'iptables/firewalld': [1200, 1399],
  Nginx: [1400, 1599],
  'LVS/HAProxy': [1600, 1799],
  'Tomcat/JVM': [1800, 1999],
  MongoDB: [2000, 2199],
  消息队列: [2200, 2399],
  存储与备份: [2400, 2599],
  虚拟化: [2600, 2799],
  'Git/GitLab': [2800, 2999],
  '日志与ELK': [3000, 3199],
  自动化与配置管理: [3200, 3399],
  云与高可用: [3400, 3599],
  // 以下为早期分类（原本用 1-119），后续扩充时另开编号段
  MySQL: [3600, 3799],
  Redis: [3800, 3999],
  Linux基础: [4000, 4199],
  Shell脚本: [4200, 4399],
  网络基础: [4400, 4599],
  '容器与K8s': [4600, 4799],
  'CI/CD': [4800, 4999],
  监控告警: [5000, 5199],
  '安全与跳板机': [5200, 5399],
  Python: [5600, 5799],
  'AI与大模型': [5800, 5999],
  综合场景题: [5400, 5599],
}

const files = process.argv.slice(2)
if (!files.length) {
  console.error('用法: node scripts/merge-batch.mjs <batch.json> [...]')
  process.exit(1)
}

const main = JSON.parse(readFileSync(MAIN, 'utf8'))
const existingIds = new Set(main.map((q) => q.id))
const errors = []
let added = 0
let skipped = 0

for (const file of files) {
  const batch = JSON.parse(readFileSync(file, 'utf8'))
  for (const q of batch) {
    if (!CATEGORIES.includes(q.category)) {
      errors.push(`${file} id=${q.id}: 分类「${q.category}」不在 CATEGORIES 中`)
      continue
    }
    const range = ID_RANGES[q.category]
    if (range && (q.id < range[0] || q.id > range[1])) {
      errors.push(`${file} id=${q.id}: 不在「${q.category}」的编号段 ${range[0]}-${range[1]}`)
      continue
    }
    if (existingIds.has(q.id)) {
      skipped++
      continue
    }
    main.push(q)
    existingIds.add(q.id)
    added++
  }
}

if (errors.length) {
  console.error('✗ 合并失败：')
  errors.forEach((e) => console.error('  ' + e))
  process.exit(1)
}

main.sort((a, b) => a.id - b.id)
writeFileSync(MAIN, JSON.stringify(main, null, 2), 'utf8')

console.log(`新增 ${added} 道，跳过重复 ${skipped} 道，题库总数 ${main.length}`)
