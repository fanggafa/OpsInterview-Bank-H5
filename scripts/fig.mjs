#!/usr/bin/env node
/**
 * figure 工具：注册插图 + 挂到题目，全部由 JSON 描述，不经过 shell 引号。
 *
 * 为什么要有这个工具：在 PowerShell 里用 `node -e "..."` 内联脚本时，
 * 双引号、单引号、$、反引号会先被 PowerShell 解析，导致
 * 「Unterminated string constant」「Expected ',', got 'ident'」等随机失败。
 * 本工具只接受一个 JSON 文件路径（纯 ASCII 参数），内容全部在文件里。
 *
 * 用法：
 *   node scripts/fig.mjs register scripts/batch.json
 *   node scripts/fig.mjs register scripts/batch.json --dry-run
 *
 * batch.json 格式：
 *   {
 *     "figures": [
 *       { "component": "ProcessStates", "id": "process-states" },
 *       ...
 *     ],
 *     "attach": [
 *       { "question": 4000, "figure": "process-states", "anchor": "R、S、D" },
 *       ...
 *     ]
 *   }
 *
 * 说明：
 * - figures：在 src/components/figures/index.js 里加 import 与注册项；
 * - attach：把 [[图:id]] 插到题目答案中 anchor 之前；
 *   anchor 落在表格行内部时自动退回「插在答案开头」（避免拆坏表格）；
 * - 幂等：已注册/已挂载的会跳过；
 * - --dry-run 只打印将做什么，不写文件。
 */
import { readFileSync, writeFileSync } from 'node:fs'

const IDX = 'src/components/figures/index.js'
const BANK = 'public/data/questions.json'

const args = process.argv.slice(2)
const cmd = args[0]
const batchPath = args[1]
const dryRun = args.includes('--dry-run')

if (cmd !== 'register' || !batchPath) {
  console.error('用法: node scripts/fig.mjs register <batch.json> [--dry-run]')
  process.exit(2)
}

const batch = JSON.parse(readFileSync(batchPath, 'utf8'))
const figures = batch.figures || []
const attach = batch.attach || []

let idxSrc = readFileSync(IDX, 'utf8')
const data = JSON.parse(readFileSync(BANK, 'utf8'))

// ---------- 1) 注册 ----------
const addedImports = []
const addedRegs = []
for (const f of figures) {
  const importLine = `import ${f.component} from './${f.component}.vue'`
  const regLine = `  '${f.id}': ${f.component},`

  if (!idxSrc.includes(importLine)) addedImports.push(importLine)
  if (!idxSrc.includes(regLine)) addedRegs.push(regLine)
}

if (addedImports.length) {
  const marker = "import DnsResolve from './DnsResolve.vue'"
  if (!idxSrc.includes(marker)) {
    console.error(`✗ index.js 里找不到 import 锚点：${marker}`)
    process.exit(1)
  }
  idxSrc = idxSrc.replace(marker, `${addedImports.join('\n')}\n${marker}`)
}

if (addedRegs.length) {
  // 注册表末尾：定位最后一个 `  'x': Y,` 行并追加其后
  const lastReg = idxSrc.match(/^  '[a-z0-9-]+': [A-Za-z0-9_]+,$/gm)
  if (!lastReg || !lastReg.length) {
    console.error('✗ index.js 里找不到任何注册项，无法定位插入点')
    process.exit(1)
  }
  const last = lastReg[lastReg.length - 1]
  idxSrc = idxSrc.replace(last, `${last}\n${addedRegs.join('\n')}`)
}

// ---------- 2) 挂图 ----------
const attached = []
const skipped = []
const failed = []

for (const a of attach) {
  const q = data.find((x) => Number(x.id) === Number(a.question))
  if (!q) {
    failed.push(`${a.question}（题目不存在）`)
    continue
  }
  const markup = `[[图:${a.figure}]]`
  if (typeof q.answer === 'string' && q.answer.includes(markup)) {
    skipped.push(`${a.question}（已挂载）`)
    continue
  }
  if (typeof q.answer !== 'string') {
    failed.push(`${a.question}（answer 不是字符串）`)
    continue
  }

  let pos = a.anchor ? q.answer.indexOf(a.anchor) : -1
  // 锚点落在表格行内部时不安全，退回开头
  if (pos !== -1) {
    const lineStart = q.answer.lastIndexOf('\n', pos) + 1
    if (q.answer.slice(lineStart, pos).trimStart().startsWith('|')) pos = -1
  }

  if (pos === -1) {
    q.answer = `${markup}\n\n${q.answer}`
    attached.push(`${a.question}（插在开头${a.anchor ? '，锚点不安全/缺失' : ''}）`)
  } else {
    q.answer = `${q.answer.slice(0, pos)}${markup}\n\n${q.answer.slice(pos)}`
    attached.push(`${a.question}`)
  }
}

// ---------- 3) 落盘 ----------
if (dryRun) {
  console.log('[dry-run] 不会写文件\n')
  console.log(`将新增 import：${addedImports.length}`)
  addedImports.forEach((l) => console.log(`  ${l}`))
  console.log(`将新增注册项：${addedRegs.length}`)
  addedRegs.forEach((l) => console.log(`  ${l.trim()}`))
  console.log(`将挂图：${attached.length}`)
  attached.forEach((l) => console.log(`  ${l}`))
} else {
  if (addedImports.length || addedRegs.length) writeFileSync(IDX, idxSrc, 'utf8')
  if (attached.length) writeFileSync(BANK, JSON.stringify(data, null, 2), 'utf8')

  console.log(`✓ import 新增 ${addedImports.length}`)
  console.log(`✓ 注册项新增 ${addedRegs.length}`)
  console.log(`✓ 挂图 ${attached.length}`)
  attached.forEach((l) => console.log(`    ${l}`))
}

if (skipped.length) {
  console.log(`- 跳过 ${skipped.length}：${skipped.join('、')}`)
}
if (failed.length) {
  console.log(`✗ 失败 ${failed.length}：${failed.join('、')}`)
  process.exit(1)
}
