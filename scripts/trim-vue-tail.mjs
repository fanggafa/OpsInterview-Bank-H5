/**
 * 截掉 .vue 文件在「第一个完整 SFC」之后的多余内容。
 *
 * 我写插图时有稳定的重复失误：在 `<style scoped> ... </style>` 之后
 * 又粘了一份 `</parameter></template></figure></template><style scoped>...`。
 * 这个脚本把第一个 `</style>` 之后的一切都切掉，是可复用的修复工具
 * （不是一次性临时脚本）。
 *
 * 用法：node scripts/trim-vue-tail.mjs <文件名或路径...>
 *       node scripts/trim-vue-tail.mjs --all   （扫描 figures 目录并报告）
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const DIR = resolve('src/components/figures')

function trimOne(path, name) {
  let s = readFileSync(path, 'utf8')
  const styleIdx = s.indexOf('<style scoped>')
  if (styleIdx === -1) return { name, action: 'skip', reason: '没有 <style scoped>' }

  const closeIdx = s.indexOf('</style>', styleIdx)
  if (closeIdx === -1) return { name, action: 'skip', reason: '</style> 缺失' }

  const endPos = closeIdx + '</style>'.length
  if (endPos >= s.length) return { name, action: 'ok' }

  const tail = s.slice(endPos)
  s = s.slice(0, endPos) + '\n'
  writeFileSync(path, s, 'utf8')
  return { name, action: 'trimmed', removed: tail.trim().slice(0, 40) }
}

const args = process.argv.slice(2)

if (args[0] === '--all') {
  const files = readdirSync(DIR).filter((f) => f.endsWith('.vue'))
  let n = 0
  for (const f of files) {
    const r = trimOne(resolve(DIR, f), f)
    if (r.action === 'trimmed') {
      n++
      console.log(`✓ 截掉 ${r.name} 尾部：${r.removed}...`)
    } else if (r.action === 'skip') {
      console.log(`- ${r.name}：${r.reason}`)
    }
  }
  console.log(`\n共修复 ${n} 个文件`)
} else if (args.length) {
  for (const a of args) {
    const path = a.includes('/') || a.includes('\\') ? resolve(a) : resolve(DIR, a)
    const r = trimOne(path, a)
    console.log(r.action === 'trimmed' ? `✓ ${a} 已截断` : `- ${a}：${r.action} ${r.reason || ''}`)
  }
} else {
  console.log('用法：node scripts/trim-vue-tail.mjs <文件...> | --all')
}
