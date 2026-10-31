/**
 * 把用户给的题目清单与题库做匹配，判断哪些「已存在」、哪些需要新增。
 *
 * 匹配策略（保守，宁可不匹配也不误判为存在）：
 * 1. 归一化：去标点/空白/全半角差异，转小写；
 * 2. 完全包含：清单题去标点后，若题库某题的题干包含它（或反之）且长度接近，视为同一题；
 * 3. 关键词覆盖率：提取中文/英文关键词，题库题目覆盖率 >= 0.8 才视为已存在。
 *
 * 输出：逐条判定 + 依据，供人工复核。
 */
import { readFileSync, writeFileSync } from 'node:fs'

const list = readFileSync('scripts/import-list.txt', 'utf8')
  .split('\n')
  .map((s) => s.trim())
  .filter(Boolean)

const bank = JSON.parse(readFileSync('public/data/questions.json', 'utf8'))

/** 归一化：保留中英文数字，其余去掉 */
function norm(s) {
  return String(s)
    .toLowerCase()
    .replace(/[\s，。！？、；：""''（）()【】\[\]《》<>?.,!~`'"|/\\:;_\-—…]/g, '')
}

/** 关键词：中文按 2-gram 切，英文/数字按词切 */
function keywords(s) {
  const n = norm(s)
  const out = new Set()
  // 英文与数字词
  for (const w of n.match(/[a-z0-9]+/g) || []) {
    if (w.length >= 2) out.add(w)
  }
  // 中文 2-gram
  const cn = n.match(/[\u4e00-\u9fa5]+/g) || []
  for (const seg of cn) {
    for (let i = 0; i + 1 < seg.length; i++) out.add(seg.slice(i, i + 2))
  }
  return out
}

function coverage(a, b) {
  const ka = keywords(a)
  const kb = keywords(b)
  if (!ka.size || !kb.size) return 0
  let hit = 0
  for (const k of ka) if (kb.has(k)) hit += 1
  return hit / ka.size
}

const results = []
for (const raw of list) {
  const nRaw = norm(raw)
  let best = null
  let bestScore = 0
  let bestKind = ''

  for (const q of bank) {
    const nq = norm(q.question)
    // 完全包含（长度接近才可信，避免「Pod」这种短串误配）
    const ratio = Math.min(nRaw.length, nq.length) / Math.max(nRaw.length, nq.length)
    if (ratio > 0.75 && (nq.includes(nRaw) || nRaw.includes(nq))) {
      if (ratio > bestScore) {
        bestScore = ratio
        best = q
        bestKind = '包含'
      }
    }
    const cov = coverage(raw, q.question)
    if (cov > bestScore) {
      bestScore = cov
      best = q
      bestKind = '关键词'
    }
  }

  const exists = bestScore >= 0.8
  results.push({
    raw,
    exists,
    score: Number(bestScore.toFixed(2)),
    kind: bestKind,
    matchedId: exists && best ? best.id : null,
    matchedQuestion: exists && best ? best.question : null,
    category: best ? best.category : null,
  })
}

const exist = results.filter((r) => r.exists)
const missing = results.filter((r) => !r.exists)

console.log(`清单 ${list.length} 条：判定已存在 ${exist.length}，需新增 ${missing.length}\n`)

console.log('=== 判定已存在（需复核是否真重复）===')
for (const r of exist) {
  console.log(`[${r.score}] ${r.raw}`)
  console.log(`   → 题 ${r.matchedId}：${String(r.matchedQuestion).slice(0, 60)}`)
}

console.log('\n=== 需新增 ===')
for (const r of missing) {
  console.log(`[${r.score}] ${r.raw}`)
  if (r.matchedQuestion) console.log(`   最接近（未达阈值）：${String(r.matchedQuestion).slice(0, 50)}`)
}

writeFileSync('scripts/import-analysis.json', JSON.stringify(results, null, 2), 'utf8')
console.log('\n已写出 scripts/import-analysis.json')
