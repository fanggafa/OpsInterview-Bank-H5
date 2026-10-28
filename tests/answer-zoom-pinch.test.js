import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import AnswerText from '@/components/AnswerText.vue'
import { MAX_PINCH_SCALE, MIN_PINCH_SCALE } from '@/utils/pinch'

/**
 * 图解查看层的双指缩放（移动端）。
 *
 * 用户要求：「移动端的图做成可以双指缩小放大」。
 *
 * jsdom 不做布局，所以这里只验证「接线是否正确」：
 * 缩放层里有没有绑定手势、比例有没有写进 CSS 变量、
 * 「看全」按钮与百分比显示是否跟随状态。手势算法在 pinch.test.js 里覆盖。
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

/** 读取当前写入的缩放比例 */
function currentZoom() {
  const inner = document.querySelector('.ans-zoom__inner')
  const m = inner.getAttribute('style').match(/--zoom:\s*([\d.]+)/)
  return m ? Number(m[1]) : null
}

/** 两指从 fromGap 变成 toGap */
async function pinch(canvas, fromGap, toGap) {
  const midX = 300
  const y = 100
  canvas.dispatchEvent(pe('pointerdown', { x: midX + fromGap / 2, y, id: 1 }))
  canvas.dispatchEvent(pe('pointerdown', { x: midX - fromGap / 2, y, id: 2 }))
  window.dispatchEvent(pe('pointermove', { x: midX + toGap / 2, y, id: 1 }))
  window.dispatchEvent(pe('pointermove', { x: midX - toGap / 2, y, id: 2 }))
  await nextTick()
}

describe('图解查看层 · 双指缩放接线', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  it('打开后画布显示「双指缩放」提示（告诉用户这个手势存在）', async () => {
    const { wrapper } = await openZoomLayer()
    const tip = document.querySelector('.ans-zoom__tip')
    expect(tip.textContent).toContain('双指缩放')
    wrapper.unmount()
  })

  it('初始缩放为 1，百分比不显示', async () => {
    const { wrapper } = await openZoomLayer()
    expect(currentZoom()).toBe(1)
    expect(document.querySelector('.ans-zoom__pct')).toBeNull()
    wrapper.unmount()
  })

  it('两指张开后缩放比例变大，百分比出现', async () => {
    const { wrapper, canvas } = await openZoomLayer()
    await pinch(canvas, 100, 200)

    expect(currentZoom()).toBeGreaterThan(1)
    expect(document.querySelector('.ans-zoom__pct').textContent).toContain('%')
    wrapper.unmount()
  })

  /**
   * 回归：用户反馈「原始大小下只能放大不能缩小」。
   * 原因是下限曾是 1，而打开时的基准宽度已经是屏宽的 2.6 倍，
   * 想「看全整张图」需要缩到 0.4 左右。现在下限放到 0.35。
   */
  it('两指捏合能缩小到 1 倍以下（不再只能放大）', async () => {
    const { wrapper, canvas } = await openZoomLayer()
    await pinch(canvas, 400, 160)

    const zoom = currentZoom()
    expect(zoom).toBeLessThan(1)
    expect(zoom).toBeGreaterThanOrEqual(MIN_PINCH_SCALE)
    wrapper.unmount()
  })

  it('捏到底被下限兜住，不会缩成看不见', async () => {
    const { wrapper, canvas } = await openZoomLayer()
    await pinch(canvas, 400, 20)
    expect(currentZoom()).toBe(MIN_PINCH_SCALE)
    wrapper.unmount()
  })

  it('缩放比例有上限，不会无限放大', async () => {
    const { wrapper, canvas } = await openZoomLayer()
    canvas.dispatchEvent(pe('pointerdown', { x: 200, y: 100, id: 1 }))
    canvas.dispatchEvent(pe('pointerdown', { x: 190, y: 100, id: 2 }))
    window.dispatchEvent(pe('pointermove', { x: 2000, y: 100, id: 1 }))
    await nextTick()

    expect(currentZoom()).toBeLessThanOrEqual(MAX_PINCH_SCALE)
    wrapper.unmount()
  })

  it('「看全」按钮已移除（缩放交给滚轮/双指，不靠切档位按钮）', async () => {
    const { wrapper } = await openZoomLayer()
    expect(document.querySelector('.ans-zoom__fit')).toBeNull()
    expect(document.querySelector('.ans-zoom__reset')).toBeNull()
    wrapper.unmount()
  })

  it('桌面滚轮向上滚放大、向下滚缩小', async () => {
    const { wrapper, canvas } = await openZoomLayer()

    canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: -100, bubbles: true, cancelable: true }))
    await nextTick()
    expect(currentZoom()).toBeGreaterThan(1)

    const bigger = currentZoom()
    canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, bubbles: true, cancelable: true }))
    await nextTick()
    expect(currentZoom()).toBeLessThan(bigger)

    wrapper.unmount()
  })

  it('滚轮缩放调用 preventDefault（不然图放大时页面也跟着滚）', async () => {
    const { wrapper, canvas } = await openZoomLayer()
    const e = new WheelEvent('wheel', { deltaY: -100, bubbles: true, cancelable: true })
    canvas.dispatchEvent(e)
    await nextTick()
    expect(e.defaultPrevented).toBe(true)
    wrapper.unmount()
  })

  it('滚轮到底后放行，让浏览器正常滚页面', async () => {
    const { wrapper, canvas } = await openZoomLayer()
    // 一路缩到下限
    for (let i = 0; i < 40; i++) {
      canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, bubbles: true, cancelable: true }))
    }
    await nextTick()
    expect(currentZoom()).toBe(MIN_PINCH_SCALE)

    // 已经在下限，再滚应放行（不 preventDefault）
    const e = new WheelEvent('wheel', { deltaY: 100, bubbles: true, cancelable: true })
    canvas.dispatchEvent(e)
    expect(e.defaultPrevented).toBe(false)
    wrapper.unmount()
  })

  it('双击复位回基准尺寸', async () => {
    const { wrapper, canvas } = await openZoomLayer()
    canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: -300, bubbles: true, cancelable: true }))
    await nextTick()
    expect(currentZoom()).toBeGreaterThan(1)

    canvas.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))
    await nextTick()
    expect(currentZoom()).toBe(1)
    wrapper.unmount()
  })

  it('关闭再打开时缩放重置为 1（不要带着上次的倍数）', async () => {
    const { wrapper, canvas } = await openZoomLayer()
    await pinch(canvas, 100, 250)
    expect(currentZoom()).toBeGreaterThan(1)

    document.querySelector('.ans-zoom__close').click()
    await nextTick()
    expect(document.querySelector('.ans-zoom')).toBeNull()

    await wrapper.find('.ans-fig').trigger('click')
    await nextTick()
    expect(currentZoom()).toBe(1)
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
    expect(rule).not.toMatch(/transform:\s*scale/)
  })

  it('单指拖动不改变缩放（回归：曾误触发缩放）', async () => {
    const { wrapper, canvas } = await openZoomLayer()
    canvas.dispatchEvent(pe('pointerdown', { x: 200, y: 100, id: 1 }))
    window.dispatchEvent(pe('pointermove', { x: 300, y: 100, id: 1 }))
    await nextTick()
    expect(currentZoom()).toBe(1)
    wrapper.unmount()
  })

  it('卸载时会解绑手势（不留 window 上的监听）', async () => {
    const { wrapper, canvas } = await openZoomLayer()
    canvas.dispatchEvent(pe('pointerdown', { x: 200, y: 100, id: 1 }))
    canvas.dispatchEvent(pe('pointerdown', { x: 100, y: 100, id: 2 }))

    wrapper.unmount()
    expect(() => window.dispatchEvent(pe('pointermove', { x: 300, y: 100, id: 1 }))).not.toThrow()
  })
})
