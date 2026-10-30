/**
 * 模拟 Linux（大小写敏感）校验：检查 index.js 里每个 import 的路径
 * 与实际文件名**逐字符**一致。
 *
 * 为什么需要这个脚本：Windows 文件系统不区分大小写，所以
 * `import X from './x.vue'` 而文件叫 `X.vue` 时，本地一切正常，
 * 一到 Linux CI 就报 "Failed to resolve import"。这正是 PR #32 翻车的原因。
 *
 * 用法：node scripts/check-import-case.mjs
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'

const IDX = 'src/components/figures/index.js'
const DIR = resolve('src/components/figures')

// 用 git 索引里的真实文件名（git 是大小写敏感的，比 readdir 更可靠）
const realFiles = execFileSync('git', ['ls-files', DIR], { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean)
  .map((p) => basename(p))

const src = readFileSync(IDX, 'utf8')
const imports = [...src.matchAll(/import\s+\w+\s+from\s+'\.\/([^']+)'/g)].map((m) => m[1])

const bad = []
for (const imp of imports) {
  if (!realFiles.includes(imp)) {
    // 找准可能的小写/大写差异，给可执行的提示
    const lower = imp.toLowerCase()
    const near = realFiles.find((f) => f.toLowerCase() === lower)
    bad.push(near ? `${imp} → 实际文件是 ${near}` : `${imp} 不存在`)
  }
}

if (bad.length) {
  console.error(`✗ 发现 ${bad.length} 处 import 路径与实际文件名大小写不一致：`)
  bad.forEach((b) => console.error('  ' + b))
  console.error('\n这是 Linux CI 上 "Failed to resolve import" 的直接原因。')
  process.exit(1)
}

console.log(`✓ ${imports.length} 个 import 路径与实际文件名大小写完全一致`)
