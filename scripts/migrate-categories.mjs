/**
 * 迁移脚本（一次性）：
 * 1. 把旧分类名改为新分类名（id 不变，避免打乱用户学习记录）
 * 2. 新增按分类分段编号的题目（DNS 从 1000、iptables 从 1200、Nginx 从 1400）
 *
 * 用法：node scripts/migrate-categories.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'

const PATH = 'public/data/questions.json'
const questions = JSON.parse(readFileSync(PATH, 'utf8'))

/** 旧名 → 新名（仅改名，不动 id） */
const RENAME = {
  'Docker/K8s': '容器与K8s',
  安全: '安全与跳板机',
}

let renamed = 0
for (const q of questions) {
  if (RENAME[q.category]) {
    q.category = RENAME[q.category]
    renamed++
  }
}

console.log(`分类改名: ${renamed} 道`)
writeFileSync(PATH, JSON.stringify(questions, null, 2), 'utf8')
console.log(`已写回 ${PATH}，总数 ${questions.length}`)
