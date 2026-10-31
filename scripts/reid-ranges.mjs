/**
 * 题目 id 重排：从 200 区间改为 500 区间。
 *
 * 规则：`新 id = 新区间起点 + (旧 id - 旧区间起点)`
 * —— 保偏移，所以同一个分类内的相对顺序完全不变。
 *
 * 产物：public/data/questions.json（id 改写后的题库）
 *
 * ⚠️ 重排会改变所有题目 id，旧学习记录（按 id 存 localStorage）会失效。
 * 本项目定位个人题库工具，接受该代价，所以**不做记录迁移**。
 *
 * 用法：node scripts/reid-ranges.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'

const SRC = 'public/data/questions.json'

/** 旧区间（200 宽） */
const OLD = {
  DNS: 1000,
  'iptables/firewalld': 1200,
  Nginx: 1400,
  'LVS/HAProxy': 1600,
  'Tomcat/JVM': 1800,
  MongoDB: 2000,
  消息队列: 2200,
  存储与备份: 2400,
  虚拟化: 2600,
  'Git/GitLab': 2800,
  '日志与ELK': 3000,
  自动化与配置管理: 3200,
  云与高可用: 3400,
  MySQL: 3600,
  Redis: 3800,
  Linux基础: 4000,
  Shell脚本: 4200,
  网络基础: 4400,
  '容器与K8s': 4600,
  'CI/CD': 4800,
  监控告警: 5000,
  '安全与跳板机': 5200,
  综合场景题: 5400,
  Python: 5600,
  'AI与大模型': 5800,
}

/** 新区间（500 宽） */
const NEW = {
  DNS: 1000,
  'iptables/firewalld': 1500,
  Nginx: 2000,
  'LVS/HAProxy': 2500,
  'Tomcat/JVM': 3000,
  MongoDB: 3500,
  消息队列: 4000,
  存储与备份: 4500,
  虚拟化: 5000,
  'Git/GitLab': 5500,
  '日志与ELK': 6000,
  自动化与配置管理: 6500,
  云与高可用: 7000,
  MySQL: 7500,
  Redis: 8000,
  Linux基础: 8500,
  Shell脚本: 9000,
  网络基础: 9500,
  '容器与K8s': 10000,
  'CI/CD': 10500,
  监控告警: 11000,
  '安全与跳板机': 11500,
  综合场景题: 12000,
  Python: 12500,
  'AI与大模型': 13000,
}

const bank = JSON.parse(readFileSync(SRC, 'utf8'))

/** 早期题目（1–119）已经在 v1 迁移里改写过了，不在重排范围 */
const changed = []
const skippedEarly = []

for (const q of bank) {
  const oldBase = OLD[q.category]
  const newBase = NEW[q.category]
  if (oldBase === undefined || newBase === undefined) {
    console.error(`✗ 分类「${q.category}」缺区间定义`)
    process.exit(1)
  }

  const offset = q.id - oldBase
  if (offset < 0 || offset >= 200) {
    // 不属于该分类的旧区间（理论上不该发生）
    skippedEarly.push({ id: q.id, cat: q.category, offset })
    continue
  }

  const newId = newBase + offset
  changed.push({ old: q.id, neu: newId, cat: q.category })
  q.id = newId
}

if (skippedEarly.length) {
  console.error('✗ 有题目不在其分类的旧区间内：')
  skippedEarly.slice(0, 5).forEach((x) => console.error(`  id=${x.id} cat=${x.cat} offset=${x.offset}`))
  process.exit(1)
}

// 按 id 排序，便于阅读与二分查找
bank.sort((a, b) => a.id - b.id)

// 校验：无重复 id
const ids = bank.map((q) => q.id)
const dup = ids.filter((v, i) => ids.indexOf(v) !== i)
if (dup.length) {
  console.error(`✗ 重排后有重复 id: ${dup.slice(0, 5).join(',')}`)
  process.exit(1)
}

writeFileSync(SRC, JSON.stringify(bank, null, 2) + '\n', 'utf8')

console.log(`✓ 重排完成，共 ${changed.length} 题`)
console.log('')
console.log('分类区间对照（旧起点 → 新起点 → 用量）：')
for (const cat of Object.keys(OLD)) {
  const list = bank.filter((q) => q.category === cat)
  const lo = Math.min(...list.map((q) => q.id))
  const hi = Math.max(...list.map((q) => q.id))
  console.log(
    `  ${cat.padEnd(18)} ${String(OLD[cat]).padStart(4)} → ${String(NEW[cat]).padStart(5)}   ` +
      `id ${lo}-${hi} 用量 ${list.length} 余 ${NEW[cat] + 499 - hi}`,
  )
}
