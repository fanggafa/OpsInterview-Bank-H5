import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * 回归：手机真机上「左右滑动换题」失效。
 *
 * 根因：touch-action 不继承。
 * `.stage` 设了 pan-y，但手指实际落在子元素 `.qcard-p__scroll` 上，
 * 该子元素是默认的 auto → 浏览器自行接管横向手势并派发 pointercancel，
 * JS 只收到 1 个 pointermove 就中止，手势永远达不到触发阈值。
 *
 * jsdom 不做样式计算，无法直接断言 getComputedStyle 的结果，
 * 因此这里检查源码 CSS：必须有覆盖舞台内所有子元素的 touch-action 规则。
 */
const read = (p) => readFileSync(resolve(process.cwd(), p), 'utf8')

describe('滑动手势的 touch-action 约束', () => {
  const css = read('src/views/PracticeView.vue')

  it('舞台内所有子元素都被限制为纵向平移', () => {
    // 必须存在 `.stage *` 这类通配规则，否则子元素仍是 auto
    const hasUniversal = /\.stage\s*,\s*\.stage\s+\*\s*\{[^}]*touch-action:\s*pan-y/.test(css)
    expect(hasUniversal).toBe(true)
  })

  it('.stage 自身保留 pan-y（允许纵向滚动、拦截横向）', () => {
    expect(/\.stage\s*\{[^}]*touch-action:\s*pan-y/s.test(css)).toBe(true)
  })

  it('卡片内滚动容器不会把 touch-action 重置回 auto', () => {
    // 若出现 touch-action: auto 或 manipulation，会让浏览器抢走横向手势
    expect(/touch-action:\s*auto/.test(css)).toBe(false)
  })

  it('卡片内滚动容器保留纵向滚动能力', () => {
    expect(/\.qcard-p__scroll\s*\{[^}]*overflow-y:\s*auto/s.test(css)).toBe(true)
  })

  it('横滚区放开横向滚动（否则宽表格/代码被截断）', () => {
    /**
     * 2026-11：选择器从写死的 `.ans-table-wrap` / `.ans-pre__body`
     * 改成统一的 `.js-scroll-x` 标记 ——
     * 同一套标记同时服务于 CSS（放开 touch-action）与手势层（区内不切题）。
     *
     * 注意 `touch-action` 不继承：必须**连子孙一起**放开，
     * 否则手指按在 `<code>` / `<table>` 文字上时横向仍被禁。
     */
    expect(/\.js-scroll-x\s*\)[^;]{0,80}touch-action:\s*pan-x\s+pan-y/s.test(css)).toBe(true)
    expect(/\.js-scroll-x\s+\*\)[^;]{0,80}touch-action:\s*pan-x\s+pan-y/s.test(css)).toBe(true)
  })
})

describe('手势工具不受影响', () => {
  it('gestures.js 仍导出判定所需常量与函数', async () => {
    const mod = await import('@/utils/gestures')
    expect(typeof mod.classifyGesture).toBe('function')
    expect(typeof mod.attachSwipe).toBe('function')
    expect(mod.DISTANCE_THRESHOLD).toBe(60)
    expect(mod.AXIS_RATIO).toBe(1.2)
  })
})
