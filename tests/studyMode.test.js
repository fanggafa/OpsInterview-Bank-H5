import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildQueue, normalizeStudyMode, describeProgress, resolveStartIndex } from '@/utils/practice'
import { FREQUENCIES, STUDY_MODES, STUDY_MODE_LABEL } from '@/utils/constants'

/**
 * 练习模式（刷题 / 背题）与频率顺序的回归。
 *
 * 背景：
 * 1. 频率原先从高到低（高频在前），看起来像「默认该选高频」；改成低→高。
 * 2. 新增「背题模式」：只刷简答题，用于考前反复背答案。
 */

const QUESTIONS = [
  { id: 1, type: 'short', category: 'A', question: 'q1', answer: 'a1' },
  { id: 2, type: 'single', category: 'A', question: 'q2', answer: ['B'] },
  { id: 3, type: 'short', category: 'A', question: 'q3', answer: 'a3' },
  { id: 4, type: 'multiple', category: 'B', question: 'q4', answer: ['A', 'C'] },
  { id: 5, type: 'short', category: 'B', question: 'q5', answer: 'a5' },
]

describe('频率顺序改为 低频 → 中频 → 高频', () => {
  it('枚举顺序由低到高', () => {
    expect(FREQUENCIES).toEqual(['低频', '中频', '高频'])
  })

  it('低频排在高频之前（与难度 简单→困难 的观感一致）', () => {
    expect(FREQUENCIES.indexOf('低频')).toBeLessThan(FREQUENCIES.indexOf('高频'))
  })
})

describe('normalizeStudyMode', () => {
  it('合法值原样返回', () => {
    expect(normalizeStudyMode('practice')).toBe('practice')
    expect(normalizeStudyMode('memorize')).toBe('memorize')
  })

  it('非法/缺失回退 practice', () => {
    expect(normalizeStudyMode('bogus')).toBe('practice')
    expect(normalizeStudyMode(undefined)).toBe('practice')
    expect(normalizeStudyMode(null)).toBe('practice')
  })

  it('两个模式都有展示文案', () => {
    STUDY_MODES.forEach((m) => {
      expect(STUDY_MODE_LABEL[m]).toBeTruthy()
    })
  })
})

describe('buildQueue · 练习模式', () => {
  it('刷题模式包含全部题型', () => {
    const q = buildQueue(QUESTIONS, { studyMode: 'practice' })
    expect(q).toHaveLength(5)
  })

  it('背题模式只保留简答题', () => {
    const q = buildQueue(QUESTIONS, { studyMode: 'memorize' })
    expect(q.map((x) => x.id)).toEqual([1, 3, 5])
    expect(q.every((x) => x.type === 'short')).toBe(true)
  })

  it('背题模式 + 分类：两个条件同时生效', () => {
    const q = buildQueue(QUESTIONS, { studyMode: 'memorize', category: 'B' })
    expect(q.map((x) => x.id)).toEqual([5])
  })

  it('背题模式 + 抽题：仍只含简答题', () => {
    const q = buildQueue(QUESTIONS, { studyMode: 'memorize', category: 'A' })
    expect(q.map((x) => x.id)).toEqual([1, 3])
  })

  it('背题模式与错题模式可叠加', () => {
    const q = buildQueue(QUESTIONS, { studyMode: 'memorize', mode: 'wrong', wrongIds: [1, 2] })
    // 2 是选择题，被背题模式排除；只剩 1
    expect(q.map((x) => x.id)).toEqual([1])
  })

  it('缺省 studyMode 时按刷题模式（含全部题型）', () => {
    expect(buildQueue(QUESTIONS, {})).toHaveLength(5)
  })

  it('不修改原数组', () => {
    const copy = QUESTIONS.slice()
    buildQueue(QUESTIONS, { studyMode: 'memorize' })
    expect(QUESTIONS).toEqual(copy)
  })
})

describe('resolveStartIndex · 练习模式参与续刷判定', () => {
  const current = { mode: 'sequential', studyMode: 'practice', category: '' }

  it('练习模式一致才续刷', () => {
    const p = { mode: 'sequential', studyMode: 'practice', category: '', index: 2 }
    expect(resolveStartIndex(p, current, 10)).toEqual({ index: 2, resumed: true })
  })

  it('练习模式变了 → 不续刷（换了队列就不是同一批题）', () => {
    const p = { mode: 'sequential', studyMode: 'memorize', category: '', index: 2 }
    expect(resolveStartIndex(p, current, 10)).toEqual({ index: 0, resumed: false })
  })

  it('老数据没有 studyMode 时按 practice 兼容', () => {
    const p = { mode: 'sequential', category: '', index: 2 }
    expect(resolveStartIndex(p, current, 10)).toEqual({ index: 2, resumed: true })
  })
})

describe('describeProgress · 带上练习模式', () => {
  it('背题模式文案正确', () => {
    const d = describeProgress({ mode: 'sequential', studyMode: 'memorize', index: 0 })
    expect(d.studyModeLabel).toBe('背题')
    expect(d.studyMode).toBe('memorize')
  })

  it('老数据无 studyMode 时默认刷题', () => {
    const d = describeProgress({ mode: 'sequential', index: 0 })
    expect(d.studyModeLabel).toBe('刷题')
    expect(d.studyMode).toBe('practice')
  })
})

describe('刷题页练习方式（源码级约束）', () => {
  const view = readFileSync(resolve(process.cwd(), 'src/views/PracticeView.vue'), 'utf8')

  it('用两个按钮呈现刷题 / 背题（不再是弹出面板）', () => {
    expect(view).toMatch(/studyModeOptions/)
    expect(view).toMatch(/aria-label="练习方式"/)
    // 旧的面板类名应当已经不存在
    expect(view).not.toMatch(/setup__mode/)
  })

  it('不再有「继续上次」面板入口与「直接开始」（续刷改为自动恢复）', () => {
    expect(view).not.toMatch(/setup__resume/)
    expect(view).not.toMatch(/resumeLast/)
    expect(view).not.toMatch(/startNow/)
  })

  it('首页不再有自己的 continueStudy，也没有刷题/面试快捷入口', () => {
    const home = readFileSync(resolve(process.cwd(), 'src/views/HomeView.vue'), 'utf8')
    expect(home).not.toMatch(/function continueStudy/)
    expect(home).not.toMatch(/class="entries"/)
    expect(home).not.toMatch(/模拟面试/)
  })
})

describe('模拟面试已移除（源码级约束）', () => {
  it('路由里不再注册面试相关页面', () => {
    const router = readFileSync(resolve(process.cwd(), 'src/router/index.js'), 'utf8')
    expect(router).not.toMatch(/interview/i)
  })

  it('首页与「我的」页都不再有面试入口', () => {
    const home = readFileSync(resolve(process.cwd(), 'src/views/HomeView.vue'), 'utf8')
    const me = readFileSync(resolve(process.cwd(), 'src/views/MeView.vue'), 'utf8')
    expect(home).not.toMatch(/interview/i)
    expect(me).not.toMatch(/interview/i)
  })
})

describe('统计页已移除（并入「我的」）', () => {
  it('StatsView 文件已不存在', () => {
    const views = readdirSync(resolve(process.cwd(), 'src/views'))
    expect(views).not.toContain('StatsView.vue')
  })

  it('路由里不再注册 /stats', () => {
    const router = readFileSync(resolve(process.cwd(), 'src/router/index.js'), 'utf8')
    expect(router).not.toMatch(/'\/stats'/)
  })

  it('底部 Tab 变成 4 项，不再有「统计」', () => {
    const constants = readFileSync(resolve(process.cwd(), 'src/utils/constants.js'), 'utf8')
    expect(constants).toMatch(/TAB_ITEMS = \[[\s\S]*?\]/)
    expect(constants).not.toMatch(/path: '\/stats'/)
    const tabCount = (constants.match(/path: '\/[a-z]*'/g) || []).length
    expect(tabCount).toBe(4)
  })

  it('「我的」页承载了原统计页的分类掌握度图表', () => {
    const me = readFileSync(resolve(process.cwd(), 'src/views/MeView.vue'), 'utf8')
    expect(me).toMatch(/BarChart/)
    expect(me).toMatch(/各分类掌握度/)
    expect(me).toMatch(/各分类选择正确率/)
  })

  it('「我的」页提供错题本与收藏入口', () => {
    const me = readFileSync(resolve(process.cwd(), 'src/views/MeView.vue'), 'utf8')
    expect(me).toMatch(/to="\/wrong"/)
    expect(me).toMatch(/to="\/favorites"/)
  })
})
