import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  AXIS_RATIO,
  classifyGesture,
  DISTANCE_THRESHOLD,
  MIN_DISTANCE,
  VELOCITY_THRESHOLD,
  isInsideHorizontalScroller,
  SCROLL_X_CLASS,
} from '@/utils/gestures'

describe('classifyGesture', () => {
  it('横向滑动超过阈值为 left / right', () => {
    expect(classifyGesture({ dx: -100, dy: 5, duration: 300 })).toBe('left')
    expect(classifyGesture({ dx: 100, dy: 5, duration: 300 })).toBe('right')
  })

  it('位移小于最小距离不算手势', () => {
    expect(classifyGesture({ dx: -MIN_DISTANCE, dy: 0, duration: 100 })).toBeNull()
  })

  it('纵向为主时轴锁定为纵向，不算横向手势', () => {
    // dx 大于最小距离，但 dy 占优
    expect(classifyGesture({ dx: -20, dy: 40, duration: 200 })).toBeNull()
  })

  it('边界：dx 恰为 dy 的 AXIS_RATIO 倍时应判为纵向', () => {
    const dy = 20
    const dx = -(dy * AXIS_RATIO)
    expect(classifyGesture({ dx, dy, duration: 200 })).toBeNull()
  })

  it('距离不足但速度够快也算滑动', () => {
    const dx = -(DISTANCE_THRESHOLD - 20) // 40px
    const duration = dx / VELOCITY_THRESHOLD / 2 // 速度约为阈值 2 倍
    expect(classifyGesture({ dx, dy: 2, duration })).toBe('left')
  })

  it('距离不足且速度不足则为回弹', () => {
    expect(classifyGesture({ dx: -30, dy: 2, duration: 400 })).toBeNull()
  })

  it('非法入参返回 null', () => {
    expect(classifyGesture({ dx: undefined, dy: 0, duration: 100 })).toBeNull()
    expect(classifyGesture({})).toBeNull()
  })

  it('duration 为 0 时不产生除零异常', () => {
    expect(classifyGesture({ dx: -100, dy: 0, duration: 0 })).toBe('left')
  })
})

describe('isInsideHorizontalScroller · 横滚区内让位给内容', () => {
  /**
   * 2026-11 用户反馈：答案里的表格/代码块有横向滚动条，但滚动条很细、
   * 手机上很难精准拖到，一滑就变成切题，内容滑不出来。
   *
   * 规则：手指**按在横滚区里** → 横向滑动滚内容；按在外面 → 左右滑切题。
   */

  /** 造一个最小的假 DOM 节点 */
  const fakeNode = ({ inScroller = false, overflow = 0 } = {}) => {
    const box = {
      scrollWidth: 100 + overflow,
      clientWidth: 100,
    }
    const node = {
      closest: (sel) => (inScroller && sel === '.' + SCROLL_X_CLASS ? box : null),
    }
    return node
  }

  it('起点在横滚区内且内容有溢出 → true（不切题）', () => {
    expect(isInsideHorizontalScroller(fakeNode({ inScroller: true, overflow: 60 }))).toBe(true)
  })

  it('起点在横滚区内但内容没溢出 → false（仍可切题）', () => {
    /**
     * 没溢出的窄表格不该吃掉手势，否则用户会发现「这块区域切不了题」
     * 却看不出任何理由。
     */
    expect(isInsideHorizontalScroller(fakeNode({ inScroller: true, overflow: 0 }))).toBe(false)
  })

  it('起点在横滚区外 → false', () => {
    expect(isInsideHorizontalScroller(fakeNode({ inScroller: false }))).toBe(false)
  })

  it('元素没有 closest（如 window / 文本节点）→ false，不报错', () => {
    expect(isInsideHorizontalScroller(null)).toBe(false)
    expect(isInsideHorizontalScroller({})).toBe(false)
    expect(isInsideHorizontalScroller(window)).toBe(false)
  })
})

describe('横滚区标记是否打到了真实元素上', () => {
  it('答案里的表格与代码块都带 js-scroll-x', async () => {
    const { readFileSync } = await import('node:fs')
    const src = readFileSync('src/components/AnswerText.vue', 'utf8')
    // 表格容器
    expect(src).toMatch(/ans-table-wrap\s+js-scroll-x|js-scroll-x.*ans-table-wrap/)
    // 代码块
    expect(src).toMatch(/ans-pre__body js-scroll-x|js-scroll-x.*ans-pre__body/)
  })
})

describe('横滚区的 touch-action 必须放开（回归）', () => {
  /**
   * 2026-11 真实 Bug：答案里的宽表格/代码块横滑不动，一滑就切题。
   *
   * 两层原因：
   * ① 舞台的 `*` 选择器把 touch-action: pan-y 强加给所有子孙，禁掉了原生横滚；
   * ② 横滚区在子组件 AnswerText 内，父组件必须用 :deep() 才选得中
   *    （实测不加 :deep() 时 computed 值仍是 pan-y，等于没写）。
   */
  const read = (p) => readFileSync(p, "utf8")

  it('详情页用 :deep(.js-scroll-x) 放开为 pan-x pan-y，且**连子孙一起**', () => {
    const src = read('src/views/QuestionView.vue')
    // 容器
    expect(src).toMatch(/:deep\(\.js-scroll-x\)/)
    // 子孙（关键）：touch-action 不继承，只给容器设没用
    expect(src).toMatch(/:deep\(\.js-scroll-x \*\)/)
    // 值
    expect(src).toMatch(/touch-action:\s*pan-x pan-y/)
  })

  it('刷题页同样放开，且连子孙一起（两页必须一致）', () => {
    const src = read('src/views/PracticeView.vue')
    expect(src).toMatch(/:deep\(\.js-scroll-x\)/)
    expect(src).toMatch(/:deep\(\.js-scroll-x \*\)/)
    expect(src).toMatch(/touch-action:\s*pan-x pan-y/)
  })

  it('不能只写 pan-x：那会禁掉纵向滚动，宽表格里翻不了页', () => {
    for (const p of ['src/views/QuestionView.vue', 'src/views/PracticeView.vue']) {
      const src = read(p)
      const i = src.indexOf(':deep(.js-scroll-x)')
      expect(i).toBeGreaterThan(-1)
      const rule = src.slice(i, src.indexOf("}", i))
      expect(rule).toContain("pan-x pan-y")
      expect(rule).not.toMatch(/touch-action:\s*pan-x\s*;/)
    }
  })

  it('横滚区标记同时服务于手势层与 CSS 层', async () => {
    const { SCROLL_X_CLASS } = await import('@/utils/gestures')
    expect(SCROLL_X_CLASS).toBe("js-scroll-x")
    const answer = read("src/components/AnswerText.vue")
    expect(answer).toContain(SCROLL_X_CLASS)
  })
})
