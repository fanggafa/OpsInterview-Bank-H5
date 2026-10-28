import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import AnswerText from '@/components/AnswerText.vue'
import { MAX_PINCH_SCALE } from '@/utils/pinch'

/**
 * 图解查看层的双指缩放（移动端）。
 *
 * 用户要求：「移动端的图做成可以双指缩小放大」。
 *
 * jsdom 不做布局，所以这里只验证「接线是否正确」：
 * 缩放层里有没有绑定手势、比例有没有写进 CSS 变量、
 * 复位/百分比显示是否跟随状态。手势本身的算法在 pinch.test.js 里覆盖。
 */

const FIGURE_Q = { answer: '结论：\n\n[[图:tcp-handshake]]\n\n补充说明。' }

/** jsdom 没有 PointerEvent，用 MouseEvent 补 pointerId / pointerType */
function pe(type, { x = 0, y = 0, id = 1, pointerType = 'touch' } = {}) {
  const e = new MouseEvent(type, { clientX: x, clientY: y, bubbles: true, cancelable: true })
  Object.defineProperty(e, 'pointerId', { value: id })
  Object.defineProperty(e, 'pointerType', { value: pointerType })
  return e
}

async function openZoomLayer() {
  const wrapper = mount(AnswerText, { props: FIGURE_Q, attachTo: document.body })
  await wrapper.find('.ans-fig').trigger('click')
  await nextTick()
  const canvas = document.querySelector('.ans-zoom__canvas')
  expect(canvas).not.toBeNull()
  return { wrapper, canvas }
}

describe('图解查看层 · 双指缩放接线', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('打开后画布显示「双指缩放」提示（告诉用户这个手势存在）', async () => {
    const { wrapper } = await openZoomLayer()
    const tip = document.querySelector('.ans-zoom__tip')
    expect(tip.textContent).toContain('双指缩放')
    wrapper.unmount()
  })

  it('初始缩放为 1，百分比不显示、复位按钮隐藏', async () => {
    const { wrapper } = await openZoomLayer()
    const inner = document.querySelector('.ans-zoom__inner')
    // CSS 变量初值 1（模板里绑定了 --zoom）
    expect(inner.getAttribute('style')).toContain('--zoom')
    expect(document.querySelector('.ans-zoom__pct')).toBeNull()
    const reset = document.querySelector('.ans-zoom__reset')
    expect(reset.className).toContain('ans-zoom__reset--hidden')
    wrapper.unmount()
  })

  it('两指张开后缩放比例变大，百分比与复位按钮出现', async () => {
    const { wrapper, canvas } = await openZoomLayer()

    // 两指从 100px 间距张开到 200px
    canvas.dispatchEvent(pe('pointerdown', { x: 200, y: 100, id: 1 }))
    canvas.dispatchEvent(pe('pointerdown', { x: 100, y: 100, id: 2 }))
    const move = pe('pointermove', { x: 300, y: 100, id: 1 })
    window.dispatchEvent(move)
    await nextTick()

    const inner = document.querySelector('.ans-zoom__inner')
    const m = inner.getAttribute('style').match(/--zoom:\s*([\d.]+)/)
    expect(m).toBeTruthy()
    expect(Number(m[1])).toBeGreaterThan(1)

    expect(document.querySelector('.ans-zoom__pct').textContent).toContain('%')
    expect(document.querySelector('.ans-zoom__reset').className).not.toContain(
      'ans-zoom__reset--hidden'
    )

    wrapper.unmount()
  })

  it('缩放比例有上限，不会无限放大', async () => {
    const { wrapper, canvas } = await openZoomLayer()

    canvas.dispatchEvent(pe('pointerdown', { x: 200, y: 100, id: 1 }))
    canvas.dispatchEvent(pe('pointerdown', { x: 190, y: 100, id: 2 })) // 起手 10px
    window.dispatchEvent(pe('pointermove', { x: 2000, y: 100, id: 1 })) // 拉到极远
    await nextTick()

    const inner = document.querySelector('.ans-zoom__inner')
    const m = inner.getAttribute('style').match(/--zoom:\s*([\d.]+)/)
    expect(Number(m[1])).toBeLessThanOrEqual(MAX_PINCH_SCALE)

    wrapper.unmount()
  })

  it('复位按钮把缩放拉回 1', async () => {
    const { wrapper, canvas } = await openZoomLayer()

    canvas.dispatchEvent(pe('pointerdown', { x: 200, y: 100, id: 1 }))
    canvas.dispatchEvent(pe('pointerdown', { x: 100, y: 100, id: 2 }))
    window.dispatchEvent(pe('pointermove', { x: 300, y: 100, id: 1 }))
    await nextTick()
    expect(document.querySelector('.ans-zoom__pct')).not.toBeNull()

    document.querySelector('.ans-zoom__reset').click()
    await nextTick()

    const inner = document.querySelector('.ans-zoom__inner')
    expect(inner.getAttribute('style')).toContain('--zoom: 1')
    expect(document.querySelector('.ans-zoom__pct')).toBeNull()

    wrapper.unmount()
  })

  it('关闭再打开时缩放重置为 1（不要带着上次的倍数）', async () => {
    const { wrapper, canvas } = await openZoomLayer()

    canvas.dispatchEvent(pe('pointerdown', { x: 200, y: 100, id: 1 }))
    canvas.dispatchEvent(pe('pointerdown', { x: 100, y: 100, id: 2 }))
    window.dispatchEvent(pe('pointermove', { x: 300, y: 100, id: 1 }))
    await nextTick()

    document.querySelector('.ans-zoom__close').click()
    await nextTick()
    expect(document.querySelector('.ans-zoom')).toBeNull()

    await wrapper.find('.ans-fig').trigger('click')
    await nextTick()
    const inner = document.querySelector('.ans-zoom__inner')
    expect(inner.getAttribute('style')).toContain('--zoom: 1')

    wrapper.unmount()
  })

  it('用 CSS 宽度缩放而不是 transform（否则滚动区不跟着变，放大也拖不到）', async () => {
    const { readFileSync } = await import('node:fs')
    const { resolve } = await import('node:path')
    const src = readFileSync(resolve(process.cwd(), 'src/components/AnswerText.vue'), 'utf8')

    const idx = src.indexOf('.ans-zoom__inner :deep(.fig)')
    const rule = src.slice(idx, idx + 400)
    expect(rule).toMatch(/width:\s*calc\(/)
    expect(rule).toMatch(/var\(--zoom/)
    // 放大层里不应该出现 transform: scale（那会让滚动范围不变）
    expect(rule).not.toMatch(/transform:\s*scale/)
  })

  it('卸载时会解绑手势（不留 window 上的监听）', async () => {
    const { wrapper, canvas } = await openZoomLayer()
    canvas.dispatchEvent(pe('pointerdown', { x: 200, y: 100, id: 1 }))
    canvas.dispatchEvent(pe('pointerdown', { x: 100, y: 100, id: 2 }))

    wrapper.unmount()
    // 卸载后再移动手指不应抛错
    expect(() => window.dispatchEvent(pe('pointermove', { x: 300, y: 100, id: 1 }))).not.toThrow()
  })
})
