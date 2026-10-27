/**
 * 题库数据校验：npm run validate:data
 * 校验失败以非零码退出，并列出具体题目 id 与原因。
 *
 * 分类/题型枚举直接复用 src/utils/constants.js（唯一来源），
 * 避免校验脚本与业务代码各维护一份、改一处漏一处。
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { CATEGORIES, DIFFICULTIES, FREQUENCIES, QUESTION_TYPES } from '../src/utils/constants.js'
import { PENDING_CATEGORIES } from './pending-categories.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_PATH = resolve(__dirname, '../public/data/questions.json')

const TYPES = QUESTION_TYPES
const PENDING = new Set(PENDING_CATEGORIES)

// 题库随分类扩展会持续增长，上限放宽到 2000；
// 下限保持 90 以免误删导致题库残缺。
const MIN_TOTAL = 90
const MAX_TOTAL = 2000
const MIN_PER_CATEGORY = 6
const MIN_CHOICE_TOTAL = 20
const MAX_QUESTION_LEN = 120
const MIN_ANSWER_LEN = 30
const MIN_TAGS = 2
const MAX_TAGS = 5
const MIN_OPTIONS = 2
const MAX_OPTIONS = 6

const errors = []
const warnings = []

function fail(id, msg) {
  errors.push(`[id=${id}] ${msg}`)
}

function charLen(s) {
  return Array.from(s).length
}

let raw
try {
  raw = readFileSync(DATA_PATH, 'utf8')
} catch (e) {
  console.error(`✗ 无法读取题库文件：${DATA_PATH}\n  ${e.message}`)
  process.exit(1)
}

let data
try {
  data = JSON.parse(raw)
} catch (e) {
  console.error(`✗ JSON 解析失败：${e.message}`)
  process.exit(1)
}

if (!Array.isArray(data)) {
  console.error('✗ 题库顶层必须是数组')
  process.exit(1)
}

if (data.length < MIN_TOTAL || data.length > MAX_TOTAL) {
  errors.push(`✗ 总题数 ${data.length} 超出约定区间 ${MIN_TOTAL}-${MAX_TOTAL}`)
}

const seenIds = new Set()
const categoryCount = Object.fromEntries(CATEGORIES.map((c) => [c, 0]))
const typeCount = Object.fromEntries(TYPES.map((t) => [t, 0]))

data.forEach((q, index) => {
  const where = q && q.id !== undefined ? q.id : `数组下标 ${index}`
  if (!q || typeof q !== 'object' || Array.isArray(q)) {
    fail(where, '题目必须是对象')
    return
  }

  // id
  const id = q.id
  if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
    fail(where, `id 必须是正整数，实际为 ${JSON.stringify(id)}`)
  } else {
    if (seenIds.has(id)) fail(id, 'id 重复')
    seenIds.add(id)
    // 说明：早期要求 id 从 1 连续递增；分类扩展后改为「按分类分段编号」
    // （如 DNS 1000-1199），顺序递增不再成立，只保证唯一即可。
  }

  // category
  if (!CATEGORIES.includes(q.category)) {
    fail(where, `category 非法：${JSON.stringify(q.category)}，必须是 ${CATEGORIES.join(' / ')}`)
  } else {
    categoryCount[q.category] += 1
  }

  // 题型（缺省视为 short）
  const type = q.type === undefined ? 'short' : q.type
  if (!TYPES.includes(type)) {
    fail(where, `type 非法：${JSON.stringify(q.type)}，必须是 ${TYPES.join(' / ')}`)
  } else {
    typeCount[type] += 1
  }

  // difficulty
  if (!DIFFICULTIES.includes(q.difficulty)) {
    fail(where, `difficulty 非法：${JSON.stringify(q.difficulty)}，必须是 ${DIFFICULTIES.join(' / ')}`)
  }

  // frequency
  if (!FREQUENCIES.includes(q.frequency)) {
    fail(where, `frequency 非法：${JSON.stringify(q.frequency)}，必须是 ${FREQUENCIES.join(' / ')}`)
  }

  // question
  if (typeof q.question !== 'string' || !q.question.trim()) {
    fail(where, 'question 必须是非空字符串')
  } else if (charLen(q.question) > MAX_QUESTION_LEN) {
    fail(where, `question 长度 ${charLen(q.question)} 超过 ${MAX_QUESTION_LEN} 字`)
  }

  // answer + options（按题型分别校验）
  if (type === 'short') {
    if (typeof q.answer !== 'string' || !q.answer.trim()) {
      fail(where, '简答题 answer 必须是非空字符串')
    } else if (charLen(q.answer) < MIN_ANSWER_LEN) {
      fail(where, `answer 长度 ${charLen(q.answer)} 低于下限 ${MIN_ANSWER_LEN}`)
    }
    if (q.options !== undefined) {
      fail(where, '简答题不应包含 options 字段')
    }
  } else {
    // 选择题：options 校验
    const keys = []
    if (!Array.isArray(q.options)) {
      fail(where, '选择题必须包含 options 数组')
    } else {
      if (q.options.length < MIN_OPTIONS || q.options.length > MAX_OPTIONS) {
        fail(where, `options 数量 ${q.options.length} 不在 ${MIN_OPTIONS}-${MAX_OPTIONS} 之间`)
      }
      q.options.forEach((opt, i) => {
        if (!opt || typeof opt !== 'object') {
          fail(where, `options[${i}] 必须是对象`)
          return
        }
        const k = opt.key
        if (typeof k !== 'string' || !/^[A-Z]$/.test(k)) {
          fail(where, `options[${i}].key 必须是大写单字母，实际为 ${JSON.stringify(k)}`)
        } else {
          if (keys.includes(k)) fail(where, `options key 重复：${k}`)
          keys.push(k)
        }
        if (typeof opt.text !== 'string' || !opt.text.trim()) {
          fail(where, `options[${i}].text 必须是非空字符串`)
        }
      })
      // key 需从 A 开始连续
      const expected = keys.map((_, i) => String.fromCharCode(65 + i))
      if (keys.length && keys.join('') !== expected.join('')) {
        fail(where, `options key 应为连续的 A/B/C…，实际为 ${keys.join('/')}`)
      }
    }

    // 选择题：answer 必须是 key 数组
    if (!Array.isArray(q.answer)) {
      fail(where, '选择题 answer 必须是 key 数组，如 ["A"] 或 ["A","C"]')
    } else {
      const answers = q.answer.map((a) => String(a).trim().toUpperCase())
      if (!answers.length) {
        fail(where, '选择题 answer 不能为空数组')
      }
      answers.forEach((a) => {
        if (keys.includes(a) === false) {
          fail(where, `answer 中的 "${a}" 不是 options 里的 key`)
        }
      })
      if (new Set(answers).size !== answers.length) {
        fail(where, 'answer 存在重复 key')
      }
      if (type === 'single' && answers.length !== 1) {
        fail(where, `单选题 answer 必须恰好 1 个，实际 ${answers.length} 个`)
      }
      if (type === 'multiple' && answers.length < 2) {
        fail(where, `多选题 answer 至少 2 个，实际 ${answers.length} 个`)
      }
    }

    if (q.explanation !== undefined && typeof q.explanation !== 'string') {
      fail(where, 'explanation 必须是字符串')
    }
    if (typeof q.explanation === 'string' && q.explanation.trim() && charLen(q.explanation) < 10) {
      fail(where, 'explanation 过于简短（<10 字），请写清解析')
    }
  }

  // tags
  if (!Array.isArray(q.tags)) {
    fail(where, 'tags 必须是数组')
  } else {
    if (q.tags.length < MIN_TAGS || q.tags.length > MAX_TAGS) {
      fail(where, `tags 数量 ${q.tags.length} 不在 ${MIN_TAGS}-${MAX_TAGS} 之间`)
    }
    q.tags.forEach((t, i) => {
      if (typeof t !== 'string' || !t.trim()) {
        fail(where, `tags[${i}] 必须是非空字符串`)
      } else if (t.startsWith('#')) {
        fail(where, `tags[${i}] 不应带 # 前缀：${t}`)
      }
    })
    const dup = q.tags.filter((t, i) => q.tags.indexOf(t) !== i)
    if (dup.length) fail(where, `tags 存在重复项：${[...new Set(dup)].join(', ')}`)
  }

  // 未知字段提示（不阻断）
  const allowed = ['id', 'type', 'category', 'difficulty', 'question', 'answer', 'options', 'explanation', 'tags', 'frequency']
  Object.keys(q).forEach((k) => {
    if (!allowed.includes(k)) warnings.push(`[id=${where}] 存在未知字段 "${k}"`)
  })
})

CATEGORIES.forEach((c) => {
  const count = categoryCount[c]
  if (PENDING.has(c)) {
    // 待填充分类：只要不为空就可以（分批施工中）
    if (count > 0 && count < MIN_PER_CATEGORY) {
      warnings.push(`分类「${c}」正在填充中，当前 ${count} 题（目标 ≥${MIN_PER_CATEGORY}）`)
    }
    return
  }
  if (count < MIN_PER_CATEGORY) {
    errors.push(`✗ 分类「${c}」只有 ${count} 题，低于每类下限 ${MIN_PER_CATEGORY}`)
  }
})

const choiceTotal = typeCount.single + typeCount.multiple
if (choiceTotal < MIN_CHOICE_TOTAL) {
  errors.push(`✗ 选择题只有 ${choiceTotal} 道，低于下限 ${MIN_CHOICE_TOTAL}（需覆盖单选与多选）`)
}
if (typeCount.multiple === 0) {
  errors.push('✗ 缺少多选题（type=multiple）')
}
if (typeCount.single === 0) {
  errors.push('✗ 缺少单选题（type=single）')
}

// 输出统计
console.log('题库统计：')
CATEGORIES.forEach((c) => {
  console.log(`  ${c.padEnd(12, ' ')} ${String(categoryCount[c]).padStart(3)} 题`)
})
console.log(`  ${'总计'.padEnd(12, ' ')} ${String(data.length).padStart(3)} 题`)
console.log(`  ${'简答/单选/多选'.padEnd(7, ' ')} ${typeCount.short} / ${typeCount.single} / ${typeCount.multiple}（选择题 ${choiceTotal} 道）`)

const difficultyCount = DIFFICULTIES.map(
  (d) => `  ${d}: ${data.filter((q) => q.difficulty === d).length}`
)
console.log('难度分布：\n' + difficultyCount.join('\n'))
const frequencyCount = FREQUENCIES.map(
  (f) => `  ${f}: ${data.filter((q) => q.frequency === f).length}`
)
console.log('频率分布：\n' + frequencyCount.join('\n'))

if (warnings.length) {
  console.log(`\n⚠ ${warnings.length} 条提示：`)
  warnings.forEach((w) => console.log('  ' + w))
}

if (errors.length) {
  console.error(`\n✗ 校验失败，共 ${errors.length} 处问题：`)
  errors.forEach((e) => console.error('  ' + e))
  process.exit(1)
}

console.log('\n✓ 题库校验通过')
