/**
 * 分类重命名：中英文之间加空格。
 *
 * ## 只改这 5 个
 *
 * | 旧 | 新 | 题数 |
 * |---|---|---|
 * | 日志与ELK | 日志与 ELK | 108 |
 * | Linux基础 | Linux 基础 | 161 |
 * | Shell脚本 | Shell 脚本 | 145 |
 * | AI与大模型 | AI 与大模型 | 90 |
 * | SRE与故障管理 | SRE 与故障管理 | 30 |
 *
 * ## 为什么含 `/` 的分类不动
 *
 * iptables/firewalld、LVS/HAProxy、Tomcat/JVM、Git/GitLab、CI/CD
 * 这 5 个用户明确要求保持原样 —— 它们在 URL、历史批次、文档里分布很广，
 * 改动收益不抵风险。
 *
 * ## 影响面
 *
 * - 题目数据 `category` 字段：534 处
 * - `constants.js` 的 CATEGORIES / CATEGORY_ADVICE / CATEGORY_HUE
 * - `split-data.mjs` 的 CAT_SLUG（key 要跟着改，value 不变）
 * - `merge-batch.mjs` 的 ID_RANGES
 * - 测试里的 fixture 与断言
 *
 * **不受影响**：
 * - 分片 slug（`Linux基础` → `linux` 是独立映射，文件名不变）
 * - 用户的刷题记录（按题目 id 存，不是按分类名）
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

/** 旧名 → 新名（只这 5 个，顺序无关） */
export const RENAMES = {
  日志与ELK: '日志与 ELK',
  Linux基础: 'Linux 基础',
  Shell脚本: 'Shell 脚本',
  AI与大模型: 'AI 与大模型',
  SRE与故障管理: 'SRE 与故障管理',
}

/** 对单个字符串做替换（用于常量、脚本、文档里的字面量） */
export function renameInText(text) {
  let out = text
  for (const [oldName, newName] of Object.entries(RENAMES)) {
    // 避免把已经改好的名字再改一次（新名里已含空格，不会匹配到旧名模式）
    out = out.split(oldName).join(newName)
  }
  return out
}

/** 处理题目数据：只改 category 字段，不动题干/解析 */
export function renameInQuestions(list) {
  let changed = 0
  for (const q of list) {
    if (RENAMES[q.category]) {
      q.category = RENAMES[q.category]
      changed++
    }
  }
  return changed
}

// ---------- CLI：node scripts/category-rename.mjs [--apply] ----------
const APPLY = process.argv.includes('--apply')

/**
 * 判断「是否作为主模块运行」。
 *
 * 不用 `import.meta.url === file://${argv[1]}`：Windows 下 argv[1] 是
 * `C:\...\file.mjs`，拼出的 file:// URL 与 import.meta.url 的斜杠/盘符形式不一致，
 * 判断永远为 false（这个脚本第一版就踩了这个坑，跑起来毫无输出）。
 * 改用 pathToFileURL 规范化比较。
 */
const isMain = (() => {
  try {
    return import.meta.url === pathToFileURL(process.argv[1]).href
  } catch {
    return false
  }
})()

if (isMain) {
  const DATA = 'public/data/questions.json'
  const list = JSON.parse(readFileSync(DATA, 'utf8'))
  const n = renameInQuestions(list)
  console.log(`题库：${n} 道题的 category 将被改名`)

  if (APPLY) {
    writeFileSync(DATA, JSON.stringify(list, null, 2) + '\n', 'utf8')
    console.log('✓ 已写入 questions.json')
  } else {
    console.log('（预演，加 --apply 才写盘）')
  }
}
