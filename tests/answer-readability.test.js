import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import AnswerText from '@/components/AnswerText.vue'

const read = (p) => readFileSync(resolve(process.cwd(), p), 'utf8')

/**
 * 回归：移动端「参考答案 + 图解太小，看不清」。
 *
 * 用户反馈原话：参考答案包括图解太小了，近视的都看不清了。
 * 两个成因：
 * 1. 答案正文只有 13.5px，图注 11px —— 手机上长段落很吃力；
 * 2. 34 张图解的 SVG 画布固定 340 宽，手机上渲染时再缩 ~0.85 倍，
 *    里面 7.5~9px 的标注字实际只剩 6~8px（SVG 内的字号不会自动放大）。
 *
 * 处理方式：
 * - 正文提到 16px / 图注 12px；
 * - 图解加「点开放大」：放大态把画布拉到 820 宽（≈2.4 倍），标注字回到 18~21px。
 *
 * jsdom 不做排版计算，所以字号只能用「读源码断言阈值」的方式守护；
 * 交互（点开 / 关闭）用真实挂载验证。
 */
const answerCss = () => {
  const src = read('src/components/AnswerText.vue')
  return src.slice(src.indexOf('<style'))
}

const figureCss = () => read('src/components/figures/figure-base.css')

/** 从 CSS 文本里取某个选择器块中的 font-size 数值 */
function fontSizeOf(css, selector) {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`${esc}[^{]*\\{[^}]*font-size:\\s*([\\d.]+)px`)
  const m = css.match(re)
  return m ? Number(m[1]) : null
}

describe('答案正文可读性（字号下限）', () => {
  it('正文块 ≥ 16px（原来 13.5px，手机上长段落读不下去）', () => {
    const size = fontSizeOf(answerCss(), '.ans-block')
    expect(size).not.toBeNull()
    expect(size).toBeGreaterThanOrEqual(16)
  })

  it('答案标题比正文更大，层级不倒挂', () => {
    const body = fontSizeOf(answerCss(), '.ans-block')
    const h12 = fontSizeOf(answerCss(), '.ans-h--1,\n.ans-h--2')
    expect(h12).toBeGreaterThan(body)
  })

  it('表格 ≥ 14px、代码块 ≥ 13px、列表续行 ≥ 14px', () => {
    const css = answerCss()
    expect(fontSizeOf(css, '.ans-table')).toBeGreaterThanOrEqual(14)
    expect(fontSizeOf(css, '.ans-pre__body')).toBeGreaterThanOrEqual(13)
    expect(fontSizeOf(css, '.ans-list__extra')).toBeGreaterThanOrEqual(14)
  })

  it('图注 ≥ 12px（原来 11px）', () => {
    const size = fontSizeOf(figureCss(), '.fig figcaption')
    expect(size).not.toBeNull()
    expect(size).toBeGreaterThanOrEqual(12)
  })

  it('行高至少 1.7，避免大字挤在一起反而更难读', () => {
    const css = answerCss()
    const m = css.match(/\.ans-block\s*\{[^}]*line-height:\s*([\d.]+)/)
    expect(m).toBeTruthy()
    expect(Number(m[1])).toBeGreaterThanOrEqual(1.7)
  })
})

const FIGURE_Q = { answer: '结论先行：\n\n[[图:tcp-handshake]]\n\n然后补充细节。' }

describe('图解放大', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  it('渲染图时带「点开放大」提示，并且可点（不是纯装饰）', () => {
    const wrapper = mount(AnswerText, { props: FIGURE_Q, attachTo: document.body })
    const box = wrapper.find('.ans-fig')
    expect(box.exists()).toBe(true)
    expect(box.attributes('role')).toBe('button')
    expect(box.find('.ans-fig__hint').exists()).toBe(true)
    wrapper.unmount()
  })

  it('点击后弹出全屏放大层，图在放大层里重新渲染一份', async () => {
    const wrapper = mount(AnswerText, { props: FIGURE_Q, attachTo: document.body })
    expect(document.querySelector('.ans-zoom')).toBeNull()

    await wrapper.find('.ans-fig').trigger('click')
    await nextTick()

    const zoom = document.querySelector('.ans-zoom')
    expect(zoom).not.toBeNull()
    expect(zoom.querySelector('.fig')).not.toBeNull()
    // 放大态也有图注，不丢语义
    expect(zoom.querySelector('figcaption')).not.toBeNull()

    wrapper.unmount()
  })

  it('放大时锁住背景滚动，关闭后复原（否则会出现「两层一起滚」）', async () => {
    const wrapper = mount(AnswerText, { props: FIGURE_Q, attachTo: document.body })
    await wrapper.find('.ans-fig').trigger('click')
    await nextTick()
    expect(document.body.style.overflow).toBe('hidden')

    document.querySelector('.ans-zoom__close').click()
    await nextTick()
    expect(document.querySelector('.ans-zoom')).toBeNull()
    expect(document.body.style.overflow).toBe('')

    wrapper.unmount()
  })

  it('点空白处与按 Esc 都能关闭', async () => {
    const wrapper = mount(AnswerText, { props: FIGURE_Q, attachTo: document.body })

    await wrapper.find('.ans-fig').trigger('click')
    await nextTick()
    document.querySelector('.ans-zoom__canvas').click()
    await nextTick()
    expect(document.querySelector('.ans-zoom')).toBeNull()

    await wrapper.find('.ans-fig').trigger('click')
    await nextTick()
    document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(document.querySelector('.ans-zoom')).toBeNull()

    wrapper.unmount()
  })

  it('卸载时清掉 body 上的滚动锁与键盘监听（切题不该把页面锁死）', async () => {
    const wrapper = mount(AnswerText, { props: FIGURE_Q, attachTo: document.body })
    await wrapper.find('.ans-fig').trigger('click')
    await nextTick()
    expect(document.body.style.overflow).toBe('hidden')

    wrapper.unmount()
    expect(document.body.style.overflow).toBe('')
    // 监听已移除：再按 Esc 不应抛错
    expect(() =>
      document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }))
    ).not.toThrow()
  })

  it('放大期间吞掉刷题快捷键（看图时按 → 不该顺手换下一题）', async () => {
    const wrapper = mount(AnswerText, { props: FIGURE_Q, attachTo: document.body })
    await wrapper.find('.ans-fig').trigger('click')
    await nextTick()

    // 模拟刷题页挂在 window 上的冒泡监听
    const leaked = []
    const spy = (e) => leaked.push(e.key)
    window.addEventListener('keydown', spy)

    // 从放大层内部触发：路径上有 document（捕获）→ … → window（冒泡）
    const canvas = document.querySelector('.ans-zoom__canvas')
    canvas.dispatchEvent(
      new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
    )

    window.removeEventListener('keydown', spy)
    expect(leaked).toEqual([])

    wrapper.unmount()
  })

  it('放大层宽度是真实放大（约 2.7 倍），不是原样再显示一遍', () => {
    const css = answerCss()
    // 选择器里带 :deep(...)，用宽松匹配定位到那条规则
    const idx = css.indexOf('.ans-zoom__inner')
    expect(idx).toBeGreaterThan(-1)
    const zoomRule = css.slice(idx)
    // 基准宽度 min(920px, 260vw)，再乘双指缩放的 --zoom
    const m = zoomRule.match(/width:\s*calc\(min\((\d+)px,\s*(\d+)vw\)/)
    expect(m).toBeTruthy()
    expect(zoomRule).toMatch(/var\(--zoom/)
    // 画布 340 宽 → 最大 920 宽（约 2.7 倍），8px 标注字变 ~21px；
    // 小屏（375px）上 260vw≈975，被 920 上限收住
    expect(Number(m[1])).toBeGreaterThanOrEqual(700)
    expect(Number(m[2])).toBeGreaterThanOrEqual(200)
  })
})

describe('不使用 v-html（安全约束不因改版而破）', () => {
  /** 只看模板部分：注释里出现 "v-html" 这个词是允许的 */
  const template = () => {
    const src = read('src/components/AnswerText.vue')
    const start = src.indexOf('<template>')
    return start === -1 ? '' : src.slice(start)
  }

  it('AnswerText 模板里没有 v-html', () => {
    expect(template()).not.toMatch(/v-html/)
  })

  it('放大层只重渲染已注册的图组件，不接受外部 HTML', () => {
    const src = read('src/components/AnswerText.vue')
    // 必须走 component :is + 白名单 getFigure
    expect(src).toMatch(/getFigure/)
    expect(src).toMatch(/<component :is="zoomComp"/)
  })
})
