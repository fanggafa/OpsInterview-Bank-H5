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

/**
 * 分类 → id 区间。
 *
 * 2026-11 改造：从 200 区间扩到 **500 区间**。
 * 原因：题量增长后「综合场景题 173」「容器与K8s 171」「Linux基础 161」已接近 200 上限。
 *
 * 编号规则：`新 id = 区间起点 + 该类内的偏移`（偏移从 0 开始）。
 * 这样每个分类能容纳 500 题，且新增题目直接往后追加、不会打乱已有编号。
 *
 * ⚠️ 改这里时必须同步：
 *   - README 的「分类与编号段」表格
 *   - `scripts/reid-ranges.mjs` 的 `OLD` / `NEW`（若需重排已有题目）
 */
export const ID_RANGES = {
  DNS: [1000, 1499],
  'iptables/firewalld': [1500, 1999],
  Nginx: [2000, 2499],
  'LVS/HAProxy': [2500, 2999],
  'Tomcat/JVM': [3000, 3499],
  MongoDB: [3500, 3999],
  消息队列: [4000, 4499],
  存储与备份: [4500, 4999],
  虚拟化: [5000, 5499],
  'Git/GitLab': [5500, 5999],
  '日志与ELK': [6000, 6499],
  自动化与配置管理: [6500, 6999],
  云与高可用: [7000, 7499],
  MySQL: [7500, 7999],
  Redis: [8000, 8499],
  Linux基础: [8500, 8999],
  Shell脚本: [9000, 9499],
  网络基础: [9500, 9999],
  '容器与K8s': [10000, 10499],
  'CI/CD': [10500, 10999],
  监控告警: [11000, 11499],
  '安全与跳板机': [11500, 11999],
  综合场景题: [12000, 12499],
  Python: [12500, 12999],
  'AI与大模型': [13000, 13499],
  Docker: [13500, 13999],
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
