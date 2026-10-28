import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  attachPinch,
  distance,
  keepFocusScrollLeft,
  pinchScale,
  MAX_PINCH_SCALE,
  MIN_PINCH_SCALE,
} from '@/utils/pinch'

/**
 * 双指缩放（移动端看图）。
 *
 * 用户要求：「移动端的图做成可以双指缩小放大」。
 *
 * 为什么不直接用浏览器缩放：浏览器双指缩放的是整个视口，
 * 会把整个 App（含顶栏、按钮）一起放大，而且退出后字号也不复原。
 * 这里只把图解画布的**布局宽度**按比例改掉，滚动区自然跟着变宽，
 * 所以能「放大后拖过去看」。用 transform: scale() 做不到这一点。
 */

describe('distance · 两指间距', () => {
  it('水平两点', () => {
    expect(distance({ x: 0, y: 0 }, { x: 100, y: 0 })).toBe(100)
  })

  it('垂直两点', () => {
    expect(distance({ x: 0, y: 0 }, { x: 0, y: 50 })).toBe(50)
  })

  it('斜向按勾股定理', () => {
    expect(distance({ x: 0, y: 0 }, { x: 30, y: 40 })).toBe(50)
  })

  it('任意一点缺失返回 0，不抛错', () => {
    expect(distance(null, { x: 1, y: 1 })).toBe(0)
    expect(distance({ x: 1, y: 1 }, null)).toBe(0)
  })
})

describe('pinchScale · 缩放比例计算', () => {
  it('手指间距翻倍 → 放大 2 倍', () => {
    expect(pinchScale(100, 200)).toBe(2)
  })

  it('手指间距减半 → 缩小到 0.5，但被下限夹到 1（不比基准更小）', () => {
    expect(pinchScale(200, 100)).toBe(MIN_PINCH_SCALE)
  })

  it('连续缩放要叠在起始比例上（第二次缩放在第一次的结果上继续）', () => {
    expect(pinchScale(100, 200, { baseScale: 2 })).toBe(4)
  })

  it('上限夹取到 5 倍（再大标注字也糊了）', () => {
    expect(pinchScale(100, 900)).toBe(MAX_PINCH_SCALE)
  })

  it('起手距离为 0（两指重合）不产生 Infinity，返回基准', () => {
    expect(pinchScale(0, 100, { baseScale: 2 })).toBe(2)
  })

  it('非法输入都退回基准，不产生 NaN', () => {
    expect(pinchScale(NaN, 100)).toBe(1)
    expect(pinchScale(100, NaN)).toBe(1)
    expect(pinchScale(-50, 100)).toBe(1)
    expect(pinchScale(100, -10)).toBe(1)
  })

  it('可自定义上下限（测试 / 后续调整用）', () => {
    expect(pinchScale(100, 200, { min: 0.5, max: 1.5 })).toBe(1.5)
  })
})

describe('keepFocusScrollLeft · 缩放时保持手指下的内容不跑掉', () => {
  it('以两指中点为中心放大：滚动位置按比例外扩', () => {
    // 原本滚到 100，中点在元素内 100 处。该点对应的内容坐标是 (100+100)/1 = 200，
    // 放大到 2 倍后它应该仍然停在 midX=100 的位置 → scrollLeft = 200*2 - 100 = 300
    const next = keepFocusScrollLeft({ scrollLeft: 100, midX: 100, fromScale: 1, toScale: 2 })
    expect(next).toBe(300)
  })

  it('计算结果不小于 0（不允许负滚动）', () => {
    expect(
      keepFocusScrollLeft({ scrollLeft: 0, midX: 0, fromScale: 2, toScale: 1 })
    ).toBeGreaterThanOrEqual(0)
  })

  it('缩放比例不变时滚动不变', () => {
    expect(keepFocusScrollLeft({ scrollLeft: 80, midX: 50, fromScale: 2, toScale: 2 })).toBe(80)
  })

  it('起始比例为非法值时原样返回，不产生 NaN', () => {
    expect(keepFocusScrollLeft({ scrollLeft: 80, midX: 50, fromScale: 0, toScale: 2 })).toBe(80)
    expect(keepFocusScrollLeft({ scrollLeft: 80, midX: 50, fromScale: NaN, toScale: 2 })).toBe(80)
  })
})

// ---------- DOM 绑定 ----------

/** jsdom 没有 PointerEvent，用 MouseEvent + pointerId/pointerType 模拟 */
function pe(type, { x = 0, y = 0, id = 1, pointerType = 'touch', cancelable = true } = {}) {
  const e = new MouseEvent(type, { clientX: x, clientY: y, bubbles: true, cancelable })
  Object.defineProperty(e, 'pointerId', { value: id })
  Object.defineProperty(e, 'pointerType', { value: pointerType })
  return e
}

let el

beforeEach(() => {
  el = document.createElement('div')
  el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 300, height: 200, right: 300, bottom: 200 })
  document.body.appendChild(el)
})

afterEach(() => {
  document.body.innerHTML = ''
})

/** 两指从 fromGap 张开到 toGap，返回 onChange 收到的最后一次比例 */
function pinch(fromGap, toGap, handlers = {}) {
  const scales = []
  const detach = attachPinch(el, {
    ...handlers,
    onChange: (info) => {
      scales.push(info.scale)
      if (handlers.onChange) handlers.onChange(info)
    },
  })

  el.dispatchEvent(pe('pointerdown', { x: 200, y: 100, id: 1 }))
  el.dispatchEvent(pe('pointerdown', { x: 200 - fromGap, y: 100, id: 2 }))
  window.dispatchEvent(pe('pointermove', { x: 200 + toGap / 2, y: 100, id: 1 }))
  window.dispatchEvent(pe('pointermove', { x: 200 - toGap / 2, y: 100, id: 2 }))
  window.dispatchEvent(pe('pointerup', { x: 0, y: 0, id: 1 }))
  window.dispatchEvent(pe('pointerup', { x: 0, y: 0, id: 2 }))

  detach()
  return scales
}

describe('attachPinch · 双指张开 / 捏合', () => {
  it('两指张开会放大（间距翻倍 → 2 倍）', () => {
    expect(pinch(100, 200).at(-1)).toBe(2)
  })

  it('两指捏合会缩小，但不小于基准 1 倍', () => {
    expect(pinch(200, 100).at(-1)).toBe(1)
  })

  it('onStart 在手势开始时就回调一次', () => {
    const onStart = vi.fn()
    pinch(100, 200, { onStart })
    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('onEnd 在两指都抬起后回调', () => {
    const onEnd = vi.fn()
    pinch(100, 200, { onEnd })
    expect(onEnd).toHaveBeenCalledTimes(1)
  })

  it('getScale 提供起始比例，连续缩放叠加上去', () => {
    // 已经从 1 倍放大到 2 倍，再张开一倍 → 4
    expect(pinch(100, 200, { getScale: () => 2 }).at(-1)).toBe(4)
  })

  it('缩放过程中 preventDefault（不让浏览器同时做自己的手势）', () => {
    const preventSpy = vi.fn()
    const e = pe('pointermove', { x: 300, y: 100, id: 1 })
    Object.defineProperty(e, 'preventDefault', { value: preventSpy })

    const detach = attachPinch(el, {})
    el.dispatchEvent(pe('pointerdown', { x: 200, y: 100, id: 1 }))
    el.dispatchEvent(pe('pointerdown', { x: 100, y: 100, id: 2 }))
    window.dispatchEvent(e)
    detach()
    expect(preventSpy).toHaveBeenCalled()
  })
})

describe('attachPinch · touch-action 接管（真机上能不能捏的关键）', () => {
  /**
   * 缩放层是 overflow:auto 的滚动区，touch-action 是 pan-x pan-y。
   * 这个值同时禁用了 pinch-zoom：两指落下时浏览器会当成「平移」接管，
   * 并派发 pointercancel 中断我们的手势 —— 真机上表现就是「两指捏了没反应」。
   * 所以第二根手指落下的瞬间必须把 touch-action 改成 none。
   */
  it('两指落下时把 touch-action 设为 none（阻止浏览器接管）', () => {
    const detach = attachPinch(el, {})
    el.dispatchEvent(pe('pointerdown', { x: 200, y: 100, id: 1 }))
    el.dispatchEvent(pe('pointerdown', { x: 100, y: 100, id: 2 }))
    expect(el.style.touchAction).toBe('none')
    detach()
  })

  it('单指落下不改 touch-action（保留单指拖动看图）', () => {
    const detach = attachPinch(el, {})
    el.dispatchEvent(pe('pointerdown', { x: 200, y: 100, id: 1 }))
    // 未写过 inline style 时 jsdom 给的是 undefined / ''，都不等于 'none'
    expect(el.style.touchAction).not.toBe('none')
    detach()
  })

  it('两指抬起后恢复原值（否则后续单指拖不动图）', () => {
    const detach = attachPinch(el, {})
    el.dispatchEvent(pe('pointerdown', { x: 200, y: 100, id: 1 }))
    el.dispatchEvent(pe('pointerdown', { x: 100, y: 100, id: 2 }))
    expect(el.style.touchAction).toBe('none')

    window.dispatchEvent(pe('pointerup', { x: 200, y: 100, id: 1 }))
    window.dispatchEvent(pe('pointerup', { x: 100, y: 100, id: 2 }))
    expect(el.style.touchAction).toBe('')

    detach()
  })

  it('两指落点完全重合（距离 0）也要能解锁 todo，不会卡住拖拽', () => {
    const detach = attachPinch(el, {})
    el.dispatchEvent(pe('pointerdown', { x: 150, y: 100, id: 1 }))
    el.dispatchEvent(pe('pointerdown', { x: 150, y: 100, id: 2 })) // 同一点
    expect(el.style.touchAction).toBe('none')

    window.dispatchEvent(pe('pointerup', { x: 150, y: 100, id: 1 }))
    window.dispatchEvent(pe('pointerup', { x: 150, y: 100, id: 2 }))
    expect(el.style.touchAction).toBe('')

    detach()
  })

  it('pointercancel 也会恢复 touch-action', () => {
    const detach = attachPinch(el, {})
    el.dispatchEvent(pe('pointerdown', { x: 200, y: 100, id: 1 }))
    el.dispatchEvent(pe('pointerdown', { x: 100, y: 100, id: 2 }))
    window.dispatchEvent(pe('pointercancel', { id: 1 }))
    expect(el.style.touchAction).toBe('')
    detach()
  })

  it('解绑时恢复 touch-action', () => {
    const detach = attachPinch(el, {})
    el.dispatchEvent(pe('pointerdown', { x: 200, y: 100, id: 1 }))
    el.dispatchEvent(pe('pointerdown', { x: 100, y: 100, id: 2 }))
    detach()
    expect(el.style.touchAction).toBe('')
  })
})

describe('attachPinch · 边界', () => {
  it('单指不触发缩放（那是滑动换题）', () => {
    const onChange = vi.fn()
    const detach = attachPinch(el, { onChange })
    el.dispatchEvent(pe('pointerdown', { x: 200, y: 100, id: 1 }))
    window.dispatchEvent(pe('pointermove', { x: 100, y: 100, id: 1 }))
    expect(onChange).not.toHaveBeenCalled()
    detach()
  })

  it('鼠标不触发（桌面端用别的交互）', () => {
    const onChange = vi.fn()
    const detach = attachPinch(el, { onChange })
    el.dispatchEvent(pe('pointerdown', { x: 200, y: 100, id: 1, pointerType: 'mouse' }))
    el.dispatchEvent(pe('pointerdown', { x: 100, y: 100, id: 2, pointerType: 'mouse' }))
    window.dispatchEvent(pe('pointermove', { x: 300, y: 100, id: 1, pointerType: 'mouse' }))
    expect(onChange).not.toHaveBeenCalled()
    detach()
  })

  it('pointercancel 会结束手势并清掉监听', () => {
    const onEnd = vi.fn()
    const detach = attachPinch(el, { onEnd })
    el.dispatchEvent(pe('pointerdown', { x: 200, y: 100, id: 1 }))
    el.dispatchEvent(pe('pointerdown', { x: 100, y: 100, id: 2 }))
    window.dispatchEvent(pe('pointercancel', { id: 1 }))
    expect(onEnd).toHaveBeenCalled()
    detach()
  })

  it('解绑后不再响应', () => {
    const onChange = vi.fn()
    const detach = attachPinch(el, { onChange })
    detach()
    el.dispatchEvent(pe('pointerdown', { x: 200, y: 100, id: 1 }))
    el.dispatchEvent(pe('pointerdown', { x: 100, y: 100, id: 2 }))
    window.dispatchEvent(pe('pointermove', { x: 300, y: 100, id: 1 }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('元素为 null 返回空函数，不抛错', () => {
    const detach = attachPinch(null, {})
    expect(typeof detach).toBe('function')
    expect(() => detach()).not.toThrow()
  })

  it('重复解绑不报错', () => {
    const detach = attachPinch(el, {})
    detach()
    expect(() => detach()).not.toThrow()
  })
})
