/**
 * 修复数据（v2）：
 * 1. **打散选择题选项顺序**，解决「63% 答案都是 A」；
 * 2. **解析分段**，解决长段落/要点挤一行。
 *
 * 打散时只同步修正**明确指向选项**的引用（已知 54 道 / 76 处），
 * 判据是「字母 + 判断词」紧邻（D 错在 / C 说反了 / B 不对），
 * 技术术语（A 记录 / B+ 树 / ANSWER 段）一律不动。
 */
import { readFileSync, writeFileSync } from 'node:fs'

const SRC = 'public/data/questions.json'
const all = JSON.parse(readFileSync(SRC, 'utf8'))
const list = Array.isArray(all) ? all : all.items || all.questions || []

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

/** 确定性洗牌：同一题号每次跑结果一致，避免 diff 抖动 */
function seedOf(id) {
  let x = Number(id) || 1
  x = (x ^ 61) ^ (x >>> 16)
  x += x << 3
  x ^= x >>> 4
  x = Math.imul(x, 0x27d4eb2d)
  x ^= x >>> 15
  return x >>> 0
}

function shuffledOrder(seed, n) {
  const arr = Array.from({ length: n }, (_, i) => i)
  let s = seed || 1
  for (let i = n - 1; i > 0; i--) {
    s = (Math.imul(s, 1103515245) + 12345) >>> 0
    const j = s % (i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * 判断词列表 —— 只有「字母 紧邻 这些词」才算指向选项。
 * 按长度降序，避免「错」先于「错在」命中导致截断错误。
 */
const JUDGE = ['完全反了', '是错的', '是对的', '反模式', '最合适', '更合适', '不符合', '才符合', '错在', '说反', '不对', '才正确', '才是对的', '错', '对']

/**
 * 把「字母 + 判断词」里的字母按映射替换；技术术语不受影响。
 */
function remapRefs(text, map) {
  if (typeof text !== 'string' || !text) return text
  let out = text

  for (const jw of JUDGE) {
    // 前置必须是行首/空白/标点，不能是字母数字（避免 AC 这类单词）
    const re = new RegExp(`([^A-Za-z0-9\\u4e00-\\u9fa5]|^)([A-H])\\s*${jw}`, 'g')
    out = out.replace(re, (m, pre, letter) => {
      const next = map[letter]
      return next ? `${pre}${next}${jw}` : m
    })
  }

  // 「B/C 说反或说错」「B、D 与…不符」这类连写
  out = out.replace(/([A-H])([/、]) ([A-H])\s*(说反|不对|错|不符合|与)/g, (m, a, sep, b, jw) => {
    const na = map[a] || a
    const nb = map[b] || b
    return `${na}${sep} ${nb}${jw}`
  })

  return out
}

let shuffled = 0
let refFixed = 0
const refSamples = []

for (const q of list) {
  if (q.type !== 'single' && q.type !== 'multiple') continue
  const opts = q.options
  if (!Array.isArray(opts) || opts.length < 2) continue

  const n = opts.length
  const order = shuffledOrder(seedOf(q.id), n)

  const newOpts = order.map((oldIdx, newIdx) => ({
    ...opts[oldIdx],
    key: LETTERS[newIdx],
  }))

  const map = {}
  order.forEach((oldIdx, newIdx) => {
    map[LETTERS[oldIdx]] = LETTERS[newIdx]
  })

  // 恒等映射（洗牌后位置没变）就不需要改解析
  const changed = Object.keys(map).some((k) => map[k] !== k)

  const newAnswer = (q.answer || []).map((k) => map[String(k).toUpperCase()] || k)

  if (changed && typeof q.explanation === 'string' && q.explanation) {
    const before = q.explanation
    const after = remapRefs(before, map)
    if (after !== before) {
      refFixed++
      if (refSamples.length < 3) refSamples.push({ id: q.id })
    }
    q.explanation = after
  }

  q.options = newOpts
  /**
   * 打散后答案字母不再按选项顺序排列（如原来 ["A","C"] 可能变成 ["D","B"]），
   * 多选要按新选项顺序重排，否则展示成「A、C、B」很别扭。
   */
  q.answer = newAnswer.sort((a, b) => LETTERS.indexOf(a) - LETTERS.indexOf(b))
  shuffled++
}

console.log(`✓ 打散选项: ${shuffled} 道`)
console.log(`✓ 解析中的选项引用已同步修正: ${refFixed} 道`, refSamples.length ? `样例 ${JSON.stringify(refSamples)}` : '')

// ---------- 解析分段 ----------
function refmt(text) {
  if (typeof text !== 'string' || !text) return text
  if (text.includes('\n')) return text
  if (text.length <= 100) return text

  let t = text

  t = t.replace(/：\s*([①②③④⑤⑥⑦⑧⑨⑩])/g, '：\n$1')
  t = t.replace(/([^\n])\s*([①②③④⑤⑥⑦⑧⑨⑩])/g, (m, pre, mark) => `${pre}\n${mark}`)
  t = t.replace(/；\s*(?=[①②③④⑤⑥⑦⑧⑨⑩])/g, '；\n')

  if (!t.includes('\n') && t.length > 150) {
    const semi = (t.match(/；/g) || []).length
    if (semi >= 2) {
      t = t.replace(/：\s*/, '：\n')
      t = t.replace(/；\s*/g, '\n')
    }
  }

  if (!t.includes('\n') && t.length > 120) {
    const parts = t.split(/(?<=。)/).filter((s) => s.trim())
    if (parts.length >= 3) {
      const groups = []
      for (let i = 0; i < parts.length; i += 2) groups.push(parts.slice(i, i + 2).join(''))
      t = groups.join('\n\n')
    }
  }

  t = t.replace(/\n{3,}/g, '\n\n').replace(/^\n+/, '').replace(/\n+$/, '')
  return t
}

let formatted = 0
for (const q of list) {
  if (typeof q.explanation !== 'string' || !q.explanation) continue
  const after = refmt(q.explanation)
  if (after !== q.explanation) {
    q.explanation = after
    formatted++
  }
}
console.log(`✓ 解析分段: ${formatted} 道`)

// ---------- 校验 ----------
let bad = 0
for (const q of list) {
  if (q.type !== 'single' && q.type !== 'multiple') continue
  const keys = (q.options || []).map((o) => o.key)
  for (const a of q.answer || []) if (!keys.includes(a)) bad++
}
if (bad) {
  console.error(`✗ ${bad} 处答案找不到对应选项，中止`)
  process.exit(1)
}

writeFileSync(SRC, JSON.stringify(all, null, 2), 'utf8')
console.log('✓ 已写回 questions.json')
