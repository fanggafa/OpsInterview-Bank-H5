import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { attachSwipe } from '@/utils/gestures'

/**
 * 手势绑定测试：覆盖触摸与鼠标两种指针类型。
 * jsdom 不实现 PointerEvent，用 MouseEvent + pointerType 模拟。
 */
function pointerEvent(type, { x = 0, y = 0, pointerType = 'mouse', button = 0, isPrimary = true, cancelable = true } = {}) {
  const e = new MouseEvent(type, { clientX: x, clientY: y, button, bubbles: true, cancelable })
  Object.defineProperty(e, 'pointerType', { value: pointerType })
  Object.defineProperty(e, 'isPrimary', { value: isPrimary })
  return e
}

/** 模拟一次完整拖拽：down(元素) → move(窗口) → up(窗口) */
function drag(el, { fromX = 200, toX = 100, y = 300, pointerType = 'mouse', moveOnWindow = true } = {}) {
  el.dispatchEvent(pointerEvent('pointerdown', { x: fromX, y, pointerType }))
  const target = moveOnWindow ? window : el
  target.dispatchEvent(pointerEvent('pointermove', { x: toX, y, pointerType }))
  const upTarget = moveOnWindow ? window : el
  upTarget.dispatchEvent(pointerEvent('pointerup', { x: toX, y, pointerType }))
}

let el

beforeEach(() => {
  el = document.createElement('div')
  document.body.appendChild(el)
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.useRealTimers()
})

describe('attachSwipe · 基础触发', () => {
  it('鼠标左滑触发 onLeft', () => {
    const onLeft = vi.fn()
    const onRight = vi.fn()
    attachSwipe(el, { onLeft, onRight })

    drag(el, { fromX: 200, toX: 100 }) // dx = -100
    expect(onLeft).toHaveBeenCalledTimes(1)
    expect(onRight).not.toHaveBeenCalled()
  })

  it('鼠标右滑触发 onRight', () => {
    const onLeft = vi.fn()
    const onRight = vi.fn()
    attachSwipe(el, { onLeft, onRight })

    drag(el, { fromX: 100, toX: 200 }) // dx = +100
    expect(onRight).toHaveBeenCalledTimes(1)
    expect(onLeft).not.toHaveBeenCalled()
  })

  it('触摸左滑同样触发', () => {
    const onLeft = vi.fn()
    attachSwipe(el, { onLeft })

    drag(el, { fromX: 200, toX: 100, pointerType: 'touch' })
    expect(onLeft).toHaveBeenCalledTimes(1)
  })

  it('位移不足不触发', () => {
    const onLeft = vi.fn()
    attachSwipe(el, { onLeft })

    drag(el, { fromX: 200, toX: 195 })
    expect(onLeft).not.toHaveBeenCalled()
  })

  it('纵向为主不触发横向切换', () => {
    const onLeft = vi.fn()
    attachSwipe(el, { onLeft })

    el.dispatchEvent(pointerEvent('pointerdown', { x: 200, y: 100 }))
    window.dispatchEvent(pointerEvent('pointermove', { x: 180, y: 300 }))
    window.dispatchEvent(pointerEvent('pointerup', { x: 180, y: 300 }))

    expect(onLeft).not.toHaveBeenCalled()
  })
})

describe('attachSwipe · 鼠标拖出元素外（关键回归）', () => {
  it('pointerup 发生在元素外也能正常收尾', () => {
    const onLeft = vi.fn()
    attachSwipe(el, { onLeft })

    el.dispatchEvent(pointerEvent('pointerdown', { x: 300, y: 100 }))
    // move 与 up 都派发到 window（模拟拖出元素）
    window.dispatchEvent(pointerEvent('pointermove', { x: 150, y: 100 }))
    window.dispatchEvent(pointerEvent('pointerup', { x: 150, y: 100 }))

    expect(onLeft).toHaveBeenCalledTimes(1)
  })

  it('拖出元素后仍能连续识别第二次手势', () => {
    const onLeft = vi.fn()
    attachSwipe(el, { onLeft })

    drag(el, { fromX: 300, toX: 150 })
    drag(el, { fromX: 300, toX: 150 })
    expect(onLeft).toHaveBeenCalledTimes(2)
  })
})

describe('attachSwipe · 边界与防御', () => {
  it('右键拖拽不触发', () => {
    const onLeft = vi.fn()
    attachSwipe(el, { onLeft })

    el.dispatchEvent(pointerEvent('pointerdown', { x: 300, y: 100, button: 2 }))
    window.dispatchEvent(pointerEvent('pointermove', { x: 100, y: 100 }))
    window.dispatchEvent(pointerEvent('pointerup', { x: 100, y: 100 }))
    expect(onLeft).not.toHaveBeenCalled()
  })

  it('非主指针（多指触摸的后续手指）不触发', () => {
    const onLeft = vi.fn()
    attachSwipe(el, { onLeft })

    el.dispatchEvent(pointerEvent('pointerdown', { x: 300, y: 100, pointerType: 'touch', isPrimary: false }))
    window.dispatchEvent(pointerEvent('pointermove', { x: 100, y: 100, pointerType: 'touch' }))
    window.dispatchEvent(pointerEvent('pointerup', { x: 100, y: 100, pointerType: 'touch' }))
    expect(onLeft).not.toHaveBeenCalled()
  })

  it('pointercancel 之后不触发', () => {
    const onLeft = vi.fn()
    attachSwipe(el, { onLeft })

    el.dispatchEvent(pointerEvent('pointerdown', { x: 300, y: 100 }))
    window.dispatchEvent(pointerEvent('pointermove', { x: 150, y: 100 }))
    window.dispatchEvent(pointerEvent('pointercancel'))
    window.dispatchEvent(pointerEvent('pointerup', { x: 100, y: 100 }))
    expect(onLeft).not.toHaveBeenCalled()
  })

  it('未按下就移动不触发', () => {
    const onLeft = vi.fn()
    attachSwipe(el, { onLeft })

    window.dispatchEvent(pointerEvent('pointermove', { x: 100, y: 100 }))
    window.dispatchEvent(pointerEvent('pointerup', { x: 100, y: 100 }))
    expect(onLeft).not.toHaveBeenCalled()
  })

  it('横向拖拽时 preventDefault（阻止页面滚动）', () => {
    attachSwipe(el, {})
    el.dispatchEvent(pointerEvent('pointerdown', { x: 300, y: 100 }))
    const move = pointerEvent('pointermove', { x: 150, y: 100 })
    const preventSpy = vi.spyOn(move, 'preventDefault')
    window.dispatchEvent(move)
    expect(preventSpy).toHaveBeenCalled()
  })
})

describe('attachSwipe · 解绑', () => {
  it('解绑后不再响应', () => {
    const onLeft = vi.fn()
    const detach = attachSwipe(el, { onLeft })

    detach()
    drag(el, { fromX: 300, toX: 100 })
    expect(onLeft).not.toHaveBeenCalled()
  })

  it('解绑后 window 上无残留监听（不误触其他元素）', () => {
    const onLeft = vi.fn()
    const detach = attachSwipe(el, { onLeft })
    detach()

    // 另一个元素上的拖拽不应触发旧 handler
    const other = document.createElement('div')
    document.body.appendChild(other)
    other.dispatchEvent(pointerEvent('pointerdown', { x: 300, y: 100 }))
    window.dispatchEvent(pointerEvent('pointermove', { x: 100, y: 100 }))
    window.dispatchEvent(pointerEvent('pointerup', { x: 100, y: 100 }))
    expect(onLeft).not.toHaveBeenCalled()
  })

  it('重复解绑不报错', () => {
    const detach = attachSwipe(el, {})
    detach()
    expect(() => detach()).not.toThrow()
  })

  it('元素为 null 时返回空函数且不报错', () => {
    const detach = attachSwipe(null, {})
    expect(typeof detach).toBe('function')
    expect(() => detach()).not.toThrow()
  })
})
