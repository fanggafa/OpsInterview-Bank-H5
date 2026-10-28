import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { FIGURES, getFigure } from '@/components/figures'

/**
 * 插图注册表与题库引用的一致性校验。
 *
 * 背景：答案里用 [[图:id]] 引用插图，id 必须在 FIGURES 里注册。
 * 一旦拼错（比如 [[图:raid-level]] 少个 s），
 * 答案里就会原样显示这段标记 —— 用户看到「[[图:xxx]]」这种诡异文字。
 *
 * 所以这里从题库里把所有被引用的 id 抽出来，逐个比对注册表。
 */

const QUESTIONS = JSON.parse(
  readFileSync(resolve(process.cwd(), 'public/data/questions.json'), 'utf8')
)

/** 从题库里抽出所有被引用的图 id 及引用它的题号 */
function collectFigureRefs() {
  const refs = new Map() // id -> [questionId, ...]
  for (const q of QUESTIONS) {
    // 图可能出现在 answer（简答题）或 explanation（选择题，answer 是选项数组）
    const fields = [
      Array.isArray(q.answer) ? q.answer.join(' ') : String(q.answer || ''),
      String(q.explanation || ''),
    ]
    for (const text of fields) {
      const matches = text.match(/\[\[图:[a-z0-9-]+\]\]/g) || []
      for (const m of matches) {
        const id = m.slice('[[图:'.length, -2)
        if (!refs.has(id)) refs.set(id, [])
        refs.get(id).push(q.id)
      }
    }
  }
  return refs
}

describe('插图注册表', () => {
  it('getFigure 对已注册 id 返回组件，对未知 id 返回 null', () => {
    expect(getFigure('raid-levels')).toBeTruthy()
    expect(getFigure('no-such-figure')).toBeNull()
  })

  it('注册表至少有 10 个插图（覆盖主要知识域）', () => {
    expect(Object.keys(FIGURES).length).toBeGreaterThanOrEqual(10)
  })
})

describe('题库里的图引用全部有效', () => {
  const refs = collectFigureRefs()

  it('至少有一批题目用到了插图', () => {
    expect(refs.size).toBeGreaterThan(0)
  })

  it('每个被引用的 id 都已在 FIGURES 中注册（防止拼错导致原样显示标记）', () => {
    const missing = []
    for (const [id, ids] of refs) {
      if (!FIGURES[id]) missing.push(`${id}（被题目 ${ids.join(',')} 引用）`)
    }
    expect(missing).toEqual([])
  })

  it('每个已注册的插图都至少被一题用到（避免死代码）', () => {
    const unused = Object.keys(FIGURES).filter((id) => !refs.has(id))
    expect(unused).toEqual([])
  })

  it('题目里不存在格式错误的图标记（如缺少右括号）', () => {
    const bad = []
    for (const q of QUESTIONS) {
      // 两个字段都要检查（选择题的图在 explanation 里）
      const fields = [
        Array.isArray(q.answer) ? q.answer.join(' ') : String(q.answer || ''),
        String(q.explanation || ''),
      ]
      for (const text of fields) {
        const opens = (text.match(/\[\[图:/g) || []).length
        const valids = (text.match(/\[\[图:[a-z0-9-]+\]\]/g) || []).length
        if (opens !== valids) bad.push(q.id)
      }
    }
    expect(bad).toEqual([])
  })
})
