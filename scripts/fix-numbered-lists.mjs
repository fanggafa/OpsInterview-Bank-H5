/**
 * 解析分段（第二轮）：处理「编号列表挤在一行」的残留长行。
 *
 * 第一轮只处理了纯文本长段；这里补上：
 *   「排查链路：1. xxx；2. yyy；3. zzz」→ 每项独立一行
 *
 * 只改 explanation，不碰选项与答案。
 */
import { readFileSync, writeFileSync } from 'node:fs'

const SRC = 'public/data/questions.json'
const all = JSON.parse(readFileSync(SRC, 'utf8'))
const list = Array.isArray(all) ? all : all.items || all.questions || []

/**
 * 把行内编号列表拆成多行。
 *
 * 形如：`排查链路：1. `dig 域名` 确认；2. `curl` 看证书；3. `openssl` 对比。`
 * 拆成：
 * ```
 * 排查链路：
 * 1. `dig 域名` 确认；
 * 2. `curl` 看证书；
 * 3. `openssl` 对比。
 * ```
 *
 * 只处理**行内 ≥2 个编号**的长行，且编号必须是 `1.` `2.` 这种（不含 `1）` 混用），
 * 避免误伤「版本 1.2」「IP 192.168.1.1」这类数字。
 */
function splitNumbered(line) {
  // 必须先出现「：」引导，否则可能是在讲流程的普通句子
  const colon = line.indexOf('：')
  if (colon < 0) return null

  const head = line.slice(0, colon + 1)
  const body = line.slice(colon + 1)

  // body 里至少要有 2 个「n. 」编号
  const marks = body.match(/(?:^|[；;])\s*(\d)\.\s/g)
  if (!marks || marks.length < 2) return null

  // 按「；n. 」或「; n. 」切开
  const parts = body.split(/(?<=[；;])\s*(?=\d\.\s)/)
  if (parts.length < 2) return null

  const items = parts.map((p) => p.trim()).filter(Boolean)
  if (items.length < 2) return null

  // 每项去掉尾部「；」再拼行
  const out = items.map((p) => p.replace(/[；;]\s*$/, '').trim())
  // 最后一项保留原有结尾
  out[out.length - 1] = items[items.length - 1].trim()

  // 头部若以「：」结尾，单独成行
  const built = [head, ...out].join('\n')

  // 「案例：」「注意：」这类引导段落在列表末尾时，也单独拆出来
  return built.replace(/\s*(案例[：:]|注意[：:]|小结[：:]|补充[：:])/g, '\n\n$1')
}

/**
 * 把一个长行里的「引导小标题」拆成独立段落。
 *
 * 只认这几个**明确的段落引导词**（都是作者用来分节的），
 * 不做通用「任意 XX：」匹配 —— 那样会把「本质是：xxx」这种句中成分也拆开。
 */
const LEAD_INS = [
  '工程建议',
  '排查链路',
  '排查思路',
  '注意两个坑',
  '注意点',
  '常见误区',
  '典型场景',
  '记忆点',
  '一句话',
  '结论',
  '补充',
  '对比',
  '演进',
]

function splitLeadIn(line) {
  // 找出中段（不是行首）出现的「引导词：」
  let best = -1
  let bestWord = ''
  for (const w of LEAD_INS) {
    const idx = line.indexOf(`${w}：`)
    // 排除行首（那里本来就在段首）
    if (idx > 20 && (best < 0 || idx < best)) {
      best = idx
      bestWord = w
    }
  }
  if (best < 0) return null

  const before = line.slice(0, best).trim()
  const after = line.slice(best).trim()
  if (before.length < 15 || after.length < 15) return null

  return `${before}\n\n${after}`
}

let fixed = 0
const touched = []

for (const q of list) {
  if (typeof q.explanation !== 'string' || !q.explanation) continue
  const lines = q.explanation.split('\n')
  let changed = false

  const next = lines.map((line) => {
    if (line.length < 120) return line
    const r = splitNumbered(line)
    if (r) {
      changed = true
      return r
    }
    // 兜底：把「工程建议：」「注意两个坑：」「排查链路：」这类小标题拆成独立段落
    const r2 = splitLeadIn(line)
    if (r2) {
      changed = true
      return r2
    }
    return line
  })

  if (changed) {
    q.explanation = next.join('\n')
    fixed++
    if (touched.length < 3) touched.push(q.id)
  }
}

console.log(`✓ 编号列表拆行: ${fixed} 道`, touched.length ? `样例 ${touched}` : '')

writeFileSync(SRC, JSON.stringify(all, null, 2), 'utf8')
console.log('✓ 已写回 questions.json')
