/**
 * 插图 .vue 文件的 SFC 结构校验。
 *
 * 为什么需要：我写插图文件时反复出现同一类低级错误 ——
 * 在 `<style scoped>` 之后又粘了一份 `</template></figure></template><style scoped>`，
 * 甚至出现 `</parameter>` 这种不存在的标签。这类文件在 Windows 上不足以立刻报错，
 * 却会让 Linux CI 直接崩，而且要看日志才发现。
 *
 * 校验项（全部是「作者本应保证」的结构约束）：
 * 1. 三个顶层块各出现且仅出现一次：`<script setup>` / `<template>` / `<style scoped>`
 * 2. 顶层块之外不允许有多余内容（空白与注释除外）
 * 3. 不允许出现非法标签 `</parameter>` 这类非白名单闭合标签
 * 4. SVG 必须有且仅有一个 `<svg viewBox=...>`
 * 5. 标签配对：`<figure>`/`<template>`/`<style>`/`<svg>` 的开闭数量一致
 *
 * 用法：node scripts/check-figure-sfc.mjs
 */
import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const DIR = resolve('src/components/figures')
const files = readdirSync(DIR).filter((f) => f.endsWith('.vue'))

const problems = []

/** 统计某个标签出现次数（不算自闭合） */
function countOpen(src, tag) {
  const re = new RegExp(`<${tag}(?![a-zA-Z0-9-])`, 'g')
  return (src.match(re) || []).length
}
function countClose(src, tag) {
  const re = new RegExp(`</${tag}>`, 'g')
  return (src.match(re) || []).length
}

for (const f of files) {
  const src = readFileSync(resolve(DIR, f), 'utf8')
  const errs = []

  // 1) 三个顶层块各一次
  for (const [tag, label] of [
    ['script setup', '<script setup>'],
    ['template', '<template>'],
    ['style scoped', '<style scoped>'],
  ]) {
    const openCount = (src.match(new RegExp(`<${tag}`.replace(' ', ' '), 'g')) || []).length
    if (openCount !== 1) errs.push(`${label} 出现 ${openCount} 次（应为 1 次）`)
  }

  // 2) 非法闭合标签白名单（只允许这些）
  const allowedClosers = [
    'template', 'figure', 'svg', 'style', 'script', 'text', 'g', 'defs',
    'linearGradient', 'stop', 'rect', 'line', 'circle', 'path', 'polyline',
    'polygon', 'ellipse', 'tspan', 'marker', 'clipPath', 'pattern', 'figcaption',
    'symbol', 'use', 'filter', 'feGaussianBlur', 'title', 'desc', 'image',
  ]
  const closers = [...src.matchAll(/<\/?([a-zA-Z][a-zA-Z0-9-]*)\s*>/g)].map((m) => m[1])
  const closersClose = [...src.matchAll(/<\/([a-zA-Z][a-zA-Z0-9-]*)>/g)].map((m) => m[1])
  for (const c of closersClose) {
    if (!allowedClosers.includes(c)) errs.push(`非法标签 </${c}>`)
  }

  // 3) figure / template / style / svg 开闭配对
  for (const tag of ['figure', 'template', 'style', 'svg', 'script']) {
    const o = countOpen(src, tag)
    const cl = countClose(src, tag)
    if (o !== cl) errs.push(`<${tag}> 开 ${o} 个、闭 ${cl} 个`)
  }

  // 4) 只允许一个 svg 且有 viewBox
  const svgCount = countOpen(src, 'svg')
  if (svgCount !== 1) errs.push(`<svg> 出现 ${svgCount} 次（应为 1 次）`)
  else if (!/<svg[^>]*viewBox=/.test(src)) errs.push('<svg> 缺少 viewBox')

  // 4) 标签前出现孤立字符（如 `< <text`，标签数量正确但渲染出错）
  //    正常的 `<` 后面必须紧跟字母、`/` 或 `!`；`>` 之后到下一个 `<` 之间是文本内容。
  for (const [i, line] of src.split('\n').entries()) {
    if (/<\s+<[a-zA-Z]/.test(line)) errs.push(`第 ${i + 1} 行：\`< <\` —— 标签前有多余字符`)
  }

  // 5) 顶层块之后不应再有内容（正常文件以 </style> 结尾）
  const styleClose = src.lastIndexOf('</style>')
  if (styleClose === -1) {
    errs.push('缺少 </style> 闭合')
  } else {
    const tail = src.slice(styleClose + '</style>'.length).trim()
    if (tail) errs.push(`</style> 之后还有内容：${tail.slice(0, 50).replace(/\n/g, ' ')}`)
  }

  if (errs.length) problems.push({ file: f, errs })
}

if (problems.length) {
  console.error(`✗ ${problems.length} 个插图文件的 SFC 结构有问题：\n`)
  for (const p of problems) {
    console.error(`  ${p.file}`)
    for (const e of p.errs) console.error(`    - ${e}`)
  }
  console.error('\n修法：确保文件只有一个 <template> / <style scoped> 块，')
  console.error('且 </style> 之后不再有任何内容（这类错误在 Windows 上不一定报错，CI 才会崩）。')
  process.exit(1)
}

console.log(`✓ ${files.length} 个插图文件的 SFC 结构全部合法`)
