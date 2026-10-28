/**
 * batch9 基础单选题的格式校验器。
 *
 * 约束（比全局 validate 更严）：
 * - 每题必须是 single 单选（options 恰好 ABCD 四个、answer 恰好一个且在其中）
 * - difficulty 必须是「简单」
 * - tags 2-5 个、frequency 合法
 * - id 必须落在指定号段内，且全局唯一
 *
 * 关于「id 已在题库中」：
 * 本批题目的正常流程是「先校验分批文件 → 再 merge 入库」。
 * merge 之后这些 id 当然会出现在 questions.json 里，
 * 因此**不能把「已入库」一律判为错误**，否则 merge 完就再也跑不绿。
 *
 * 判断口径改为：
 * - 若该 id 已在题库中，**核对题库里的内容与本文件是否一致**（同 id 同题目）
 *   → 一致：说明已经正确合并，放行
 *   → 不一致：说明 id 被别的题占用（真正的冲突），报错
 *
 * 用法：node scripts/check-batch9.mjs
 */
import { readFileSync, readdirSync } from 'node:fs'

const QUESTIONS = JSON.parse(readFileSync('public/data/questions.json', 'utf8'))
const existing = new Map(QUESTIONS.map((q) => [q.id, q]))

/** 每个分类允许的 id 段（batch9 = 基础单选题 15 道） */
const RANGES = {
  DNS: [1100, 1114],
  'iptables/firewalld': [1300, 1314],
  Nginx: [1500, 1514],
  'LVS/HAProxy': [1700, 1714],
  'Tomcat/JVM': [1900, 1914],
  MongoDB: [2100, 2114],
  消息队列: [2300, 2314],
  存储与备份: [2500, 2514],
  虚拟化: [2700, 2714],
  'Git/GitLab': [2900, 2914],
  '日志与ELK': [3100, 3114],
  自动化与配置管理: [3300, 3314],
  云与高可用: [3500, 3514],
  MySQL: [3700, 3714],
  Redis: [3900, 3914],
  Linux基础: [4100, 4114],
  Shell脚本: [4300, 4314],
  网络基础: [4500, 4514],
  '容器与K8s': [4700, 4714],
  'CI/CD': [4900, 4914],
  监控告警: [5100, 5114],
  '安全与跳板机': [5300, 5314],
  综合场景题: [5500, 5554],
}

const files = readdirSync('scripts').filter((f) => /^batch9-.*\.json$/.test(f))

const seen = new Map()
const problems = []
const perCategory = {}

for (const f of files) {
  let data
  try {
    data = JSON.parse(readFileSync(`scripts/${f}`, 'utf8'))
  } catch (e) {
    problems.push(`${f}：JSON 解析失败（${e.message}）`)
    continue
  }

  for (const q of data) {
    const where = `${f} id=${q.id}`

    if (seen.has(q.id)) problems.push(`${where}：id 与 ${seen.get(q.id)} 重复`)
    else seen.set(q.id, f)

    // 已入库的情况：核对内容是否一致（一致=已正确合并，放行）
    // 注意：merge 之后再跑打散/格式化脚本会让题库版本带上 ** 标记，
    // 因此比较时要先去掉 Markdown 标记，否则会产生假冲突。
    const normalize = (s) => String(s || '').replace(/\*\*/g, '').replace(/\s+/g, '')
    if (existing.has(q.id)) {
      const merged = existing.get(q.id)
      if (normalize(merged.question) !== normalize(q.question)) {
        problems.push(
          `${where}：id 已被题库中另一道题占用（题库里是「${String(merged.question).slice(0, 24)}…」）`
        )
      }
    }

    const range = RANGES[q.category]
    if (!range) problems.push(`${where}：分类「${q.category}」不在 batch9 范围内`)
    else if (q.id < range[0] || q.id > range[1]) {
      problems.push(`${where}：id 超出「${q.category}」的段 ${range[0]}-${range[1]}`)
    }

    if (q.type !== 'single') problems.push(`${where}：type 必须是 single`)
    if (q.difficulty !== '简单') problems.push(`${where}：difficulty 必须是「简单」`)

    if (!Array.isArray(q.options) || q.options.length !== 4) {
      problems.push(`${where}：options 必须恰好 4 个`)
    } else if (q.options.map((o) => o.key).join('') !== 'ABCD') {
      problems.push(`${where}：options 的 key 必须是 A/B/C/D`)
    }

    if (!Array.isArray(q.answer) || q.answer.length !== 1) {
      problems.push(`${where}：answer 必须是恰好 1 个元素`)
    } else if (Array.isArray(q.options) && !q.options.some((o) => o.key === q.answer[0])) {
      problems.push(`${where}：answer 的 key 不在 options 里`)
    }

    if (!Array.isArray(q.tags) || q.tags.length < 2 || q.tags.length > 5) {
      problems.push(`${where}：tags 必须是 2-5 个`)
    }
    if (!['低频', '中频', '高频'].includes(q.frequency)) {
      problems.push(`${where}：frequency 非法（${q.frequency}）`)
    }
    if (!q.question || !q.question.trim()) problems.push(`${where}：question 为空`)
    if (!q.explanation || !q.explanation.trim()) problems.push(`${where}：explanation 为空`)

    perCategory[q.category] = (perCategory[q.category] || 0) + 1
  }
}

console.log(`检查 ${files.length} 个文件、${seen.size} 道题`)
console.log('\n各分类题数：')
const expected = (c) => (c === '综合场景题' ? 40 : 15)
let allOk = true
for (const [c, [lo, hi]] of Object.entries(RANGES)) {
  const actual = perCategory[c] || 0
  const want = expected(c)
  const ok = actual === want
  if (!ok) allOk = false
  console.log(`  ${ok ? '✓' : '✗'} ${c.padEnd(20, '　')} ${actual}/${want}`)
}

const missing = Object.keys(RANGES).filter((c) => !perCategory[c])
if (missing.length) console.log('\n完全缺失的分类：' + missing.join('、'))

if (problems.length) {
  console.log(`\n发现 ${problems.length} 个问题：`)
  problems.slice(0, 40).forEach((p) => console.log('  - ' + p))
  if (problems.length > 40) console.log(`  ...还有 ${problems.length - 40} 条`)
  process.exit(1)
}

if (!allOk) {
  console.log('\n分类题数不足，继续补齐')
  process.exit(1)
}

console.log('\n✓ batch9 全部通过')
