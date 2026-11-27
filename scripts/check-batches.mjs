/**
 * 批量校验新出题目的合法性（合并前先自查，避免污染主库）。
 *
 * 用法：node scripts/check-batches.mjs scripts/batch40-virt.json [...]
 */
import { readFileSync } from 'node:fs'

const CATEGORIES = [
  'DNS', 'iptables/firewalld', 'Nginx', 'LVS/HAProxy', 'Tomcat/JVM', 'MongoDB',
  '消息队列', '存储与备份', '虚拟化', 'Git/GitLab', '日志与 ELK', '自动化与配置管理',
  '云与高可用', 'MySQL', 'Redis', 'Linux 基础', 'Shell 脚本', '网络基础', 'Kubernetes',
  'CI/CD', '监控告警', '可观测性', 'SRE 与故障管理', '安全与跳板机', '综合场景题', 'Python', 'AI 与大模型', 'Docker',
]
const DIFFS = ['简单', '中等', '困难']
const FREQS = ['高频', '中频', '低频']

const files = process.argv.slice(2)
if (!files.length) {
  console.error('用法: node scripts/check-batches.mjs <json...>')
  process.exit(1)
}

let totalErrors = 0
const seenIds = new Map()

for (const f of files) {
  let rows
  try {
    rows = JSON.parse(readFileSync(f, 'utf8'))
  } catch (e) {
    console.log(`✗ ${f}: JSON 解析失败 → ${e.message.slice(0, 100)}`)
    totalErrors++
    continue
  }
  if (!Array.isArray(rows)) {
    console.log(`✗ ${f}: 不是数组`)
    totalErrors++
    continue
  }

  const errs = []
  for (const [i, q] of rows.entries()) {
    const at = `#${i + 1}(id=${q.id})`
    if (!Number.isInteger(q.id) || q.id <= 0) errs.push(`${at} id 非法`)
    if (seenIds.has(q.id)) errs.push(`${at} id 与 ${seenIds.get(q.id)} 重复`)
    seenIds.set(q.id, f)
    if (!CATEGORIES.includes(q.category)) errs.push(`${at} category 非法: ${q.category}`)
    if (!DIFFS.includes(q.difficulty)) errs.push(`${at} difficulty 非法: ${q.difficulty}`)
    if (!FREQS.includes(q.frequency)) errs.push(`${at} frequency 非法: ${q.frequency}`)
    const isShort = q.type === 'short'
    if (!isShort && q.type !== 'single' && q.type !== 'multiple') {
      errs.push(`${at} type 非法: ${q.type}`)
    }
    if (typeof q.question !== 'string' || !q.question.trim()) errs.push(`${at} question 为空`)
    else if (q.question.length > 120) errs.push(`${at} 题干 ${q.question.length} 字 > 120`)

    if (isShort) {
      // ---- 简答题规则 ----
      if (q.options !== undefined) errs.push(`${at} 简答题不能有 options 字段`)
      if (typeof q.answer !== 'string' || !q.answer.trim()) {
        errs.push(`${at} 简答题 answer 须为非空字符串`)
      } else {
        const ans = q.answer
        const fences = (ans.match(/```/g) || []).length
        if (fences % 2 !== 0) errs.push(`${at} 答案里代码围栏未成对（${fences} 个）`)
        const tableLines = ans.split('\n').filter((l) => l.trim().startsWith('|'))
        if (tableLines.length >= 2 && !tableLines.some((l) => /^\|[\s:|-]+\|$/.test(l.trim()))) {
          errs.push(`${at} 答案里有表格但缺少分隔行`)
        }
      }
    } else if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 6) {
      errs.push(`${at} options 数量须 2~6`)
    } else {
      const keys = q.options.map((o) => o.key)
      const expect = 'ABCDEF'.slice(0, q.options.length).split('')
      if (keys.join('') !== expect.join('')) errs.push(`${at} options key 须从 A 起连续，实际 ${keys.join('')}`)
      if (q.options.some((o) => typeof o.text !== 'string' || !o.text.trim())) {
        errs.push(`${at} 存在空选项文本`)
      }
    }

    if (!isShort && (!Array.isArray(q.answer) || !q.answer.length)) {
      errs.push(`${at} answer 须为数组`)
    } else if (!isShort) {
      const optKeys = (q.options || []).map((o) => o.key)
      for (const k of q.answer) {
        if (!optKeys.includes(k)) errs.push(`${at} answer 引用了不存在的 key: ${k}`)
      }
      if (q.type === 'single' && q.answer.length !== 1) errs.push(`${at} 单选须恰好 1 个答案`)
      if (q.type === 'multiple' && q.answer.length < 2) errs.push(`${at} 多选须 ≥2 个答案`)
    }

    if (!Array.isArray(q.tags) || q.tags.length < 2 || q.tags.length > 5) {
      errs.push(`${at} tags 须为 2~5 个元素数组`)
    } else if (q.tags.some((t) => typeof t !== 'string' || t.startsWith('#'))) {
      errs.push(`${at} tags 存在非法元素`)
    }

    const exp = q.explanation
    if (isShort) {
      // 简答题没有 explanation，内容全在 answer 里，已在上方校验
    } else if (typeof exp !== 'string' || exp.length < 10) {
      errs.push(`${at} explanation 过短`)
    }
    else {
      const fences = (exp.match(/```/g) || []).length
      if (fences % 2 !== 0) errs.push(`${at} 解析里代码围栏未成对（${fences} 个）`)
      const tableLines = exp.split('\n').filter((l) => l.trim().startsWith('|'))
      if (tableLines.length >= 2 && !tableLines.some((l) => /^\|[\s:|-]+\|$/.test(l.trim()))) {
        errs.push(`${at} 解析里有表格但缺少分隔行`)
      }
      if (/选项\s*[A-F]\s*(正确|是正确)/.test(exp)) errs.push(`${at} 解析不应写「选项 X 正确」`)
    }
  }

  // 分类统计
  const byCat = {}
  for (const q of rows) byCat[q.category] = (byCat[q.category] || 0) + 1
  const catStr = Object.entries(byCat).map(([c, n]) => `${c}×${n}`).join(', ')

  if (errs.length) {
    totalErrors += errs.length
    console.log(`✗ ${f}: ${rows.length} 条，${errs.length} 处问题 [${catStr}]`)
    errs.slice(0, 12).forEach((e) => console.log('    ' + e))
    if (errs.length > 12) console.log(`    ...还有 ${errs.length - 12} 处`)
  } else {
    console.log(`✓ ${f}: ${rows.length} 条全部通过 [${catStr}]`)
  }
}

console.log(`\n合计 ${seenIds.size} 题，${totalErrors} 处问题`)
process.exit(totalErrors ? 1 : 0)
