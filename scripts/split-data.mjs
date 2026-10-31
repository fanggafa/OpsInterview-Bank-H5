/**
 * 生成「轻量索引 + 按分类拆分的答案分片」。
 *
 * 为什么：questions.json 4.20 MB / gzip 1455 KB，而列表页只需要
 * id / type / category / difficulty / frequency / question 这几个字段。
 *
 * 产出：
 *   public/data/questions-index.json     列表页索引（实测 gzip 89 KB）
 *   public/data/answers/<slug>.json     按分类拆的答案分片（最大 gzip 79 KB）
 *
 * 注意：本脚本只生成新文件，不改动 questions.json —— 切换使用是下一步。
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const SRC = 'public/data/questions.json'
const INDEX = 'public/data/questions-index.json'
const ANS_DIR = 'public/data/answers'

/** 分类 → 文件名 slug（用拼音/英文，避免中文文件名在 URL 里转义 */
const CAT_SLUG = {
  'Linux基础': 'linux',
  'Shell脚本': 'shell',
  '网络基础': 'network',
  DNS: 'dns',
  'iptables/firewalld': 'iptables',
  Nginx: 'nginx',
  'LVS/HAProxy': 'lvs-haproxy',
  'Tomcat/JVM': 'tomcat-jvm',
  MySQL: 'mysql',
  Redis: 'redis',
  MongoDB: 'mongodb',
  '消息队列': 'mq',
  '容器与K8s': 'k8s',
  '存储与备份': 'storage',
  '虚拟化': 'virtualization',
  'CI/CD': 'cicd',
  'Git/GitLab': 'git',
  '监控告警': 'monitoring',
  '日志与ELK': 'logs-elk',
  '自动化与配置管理': 'config-mgmt',
  '安全与跳板机': 'security',
  '云与高可用': 'cloud-ha',
  Python: 'python',
  'AI与大模型': 'ai-llm',
  '综合场景题': 'scenario',
}

const bank = JSON.parse(readFileSync(SRC, 'utf8'))
console.log(`源题库 ${bank.length} 题`)

/** 1) 索引：只留列表/筛选需要的字段，字段名压缩以减小体积 */
const index = bank.map((q) => ({
  i: q.id,
  t: q.type || 'short',
  c: q.category,
  d: q.difficulty,
  f: q.frequency,
  q: q.question,
  g: q.tags || [],
}))

writeFileSync(INDEX, JSON.stringify(index), 'utf8')

/** 2) 答案分片：按分类拆，含 answer + explanation + options（选择题需要） */
const byCat = new Map()
for (const q of bank) {
  if (!byCat.has(q.category)) byCat.set(q.category, [])
  byCat.get(q.category).push(q)
}

if (existsSync(ANS_DIR)) rmSync(ANS_DIR, { recursive: true })
mkdirSync(ANS_DIR, { recursive: true })

const manifest = {}
let maxGz = 0
let maxSlug = ''

/**
 * 单个分片的 gzip 体积预算。
 *
 * 背景：题量增长后「综合场景题」「Linux基础」单分片过大，导致
 * 「索引 + 最大分片」的首屏预算被突破（tests/splitData.test.js 会拦住）。
 * 所以这里对超过阈值的分类**自动再拆分片**，前端按 slugs 数组依次拉取。
 *
 * 阈值取 180 KB（原始），对应 gzip 约 70 KB —— 留足余量，
 * 避免题库继续增长时又要改这个数字。
 */
const SPLIT_THRESHOLD = 180 * 1024

for (const [cat, list] of byCat) {
  const slug = CAT_SLUG[cat]
  if (!slug) {
    console.error(`✗ 分类「${cat}」没有 slug 映射`)
    process.exit(1)
  }
  const rows = list.map((q) => {
    const o = { i: q.id, a: q.answer }
    if (q.explanation) o.e = q.explanation
    if (q.options) o.o = q.options
    return o
  })

  const fullJson = JSON.stringify(rows)
  const fullSize = Buffer.byteLength(fullJson)

  // 小分类：单个分片
  // 大分类：按条目数平均切成若干片（每片体积不超过阈值）
  const parts = fullSize > SPLIT_THRESHOLD ? Math.ceil(fullSize / SPLIT_THRESHOLD) : 1
  const slugs = []

  if (parts === 1) {
    const file = join(ANS_DIR, `${slug}.json`)
    writeFileSync(file, fullJson, 'utf8')
    slugs.push(slug)
  } else {
    const per = Math.ceil(rows.length / parts)
    for (let i = 0; i < parts; i++) {
      const slice = rows.slice(i * per, (i + 1) * per)
      const s = `${slug}-${i + 1}`
      const json = JSON.stringify(slice)
      writeFileSync(join(ANS_DIR, `${s}.json`), json, 'utf8')
      slugs.push(s)
    }
  }

  // 记录最大分片（用于报告）
  for (const s of slugs) {
    const raw = readFileSync(join(ANS_DIR, `${s}.json`))
    const gz = gzipSync(raw, { level: 9 }).length
    if (gz > maxGz) {
      maxGz = gz
      maxSlug = s
    }
  }

  // manifest 用 slugs 数组（单分片时也保持数组，前端逻辑统一）
  manifest[cat] = { slugs, count: rows.length }
}

writeFileSync(join(ANS_DIR, 'manifest.json'), JSON.stringify(manifest), 'utf8')

/** 3) 报告体积 */
const idxRaw = readFileSync(INDEX, 'utf8')
const idxGz = gzipSync(Buffer.from(idxRaw), { level: 9 }).length
const srcRaw = readFileSync(SRC)
const srcGz = gzipSync(srcRaw, { level: 9 }).length

console.log('')
console.log('产物体积对比：')
console.log(`  原 questions.json   ${(srcRaw.length / 1024.0).toFixed(0).padStart(6)} KB  gzip ${(srcGz / 1024.0).toFixed(0).padStart(5)} KB`)
console.log(`  新 questions-index  ${(idxRaw.length / 1024.0).toFixed(0).padStart(6)} KB  gzip ${(idxGz / 1024.0).toFixed(0).padStart(5)} KB  (${((idxGz / srcGz) * 100).toFixed(1)}%)`)
console.log(`  答案分片 ${byCat.size} 个，最大 ${maxSlug} gzip ${(maxGz / 1024.0).toFixed(0)} KB`)
console.log(`  首屏最坏（索引 + 最大分片）gzip 约 ${((idxGz + maxGz) / 1024.0).toFixed(0)} KB`)

/** 4) 正确性自检：索引与分片能还原出原题目 */
const idx = JSON.parse(idxRaw)
if (idx.length !== bank.length) {
  console.error(`✗ 索引条数 ${idx.length} ≠ 题库 ${bank.length}`)
  process.exit(1)
}
const allAns = new Map()
for (const [, { slugs }] of Object.entries(manifest)) {
  for (const slug of slugs) {
    const rows = JSON.parse(readFileSync(join(ANS_DIR, `${slug}.json`), 'utf8'))
    for (const r of rows) allAns.set(r.i, r)
  }
}
let bad = 0
for (const q of bank) {
  const a = allAns.get(q.id)
  if (!a) {
    bad++
    continue
  }
  if (JSON.stringify(a.a) !== JSON.stringify(q.answer)) bad++
}
console.log('')
console.log(bad === 0 ? `✓ 自检通过：${bank.length} 题索引与答案全部对得上` : `✗ 自检失败：${bad} 处不一致`)
if (bad) process.exit(1)
