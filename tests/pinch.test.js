import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  attachPinch,
  distance,
  keepFocusScrollLeft,
  pinchScale,
  MAX_PINCH_SCALE,
  MIN_PINCH_SCALE,
  PINCH_DEADZONE_RATIO,
  PINCH_MIN_START_DISTANCE,
  PINCH_SENSITIVITY,
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
 *
 * 两个真机上才暴露的 bug（已修复，见下面各自的用例组）：
 * 1. 单指也能缩放：单指时没挂 window 监听，抬起的记录清不掉，
 *    下次单指触摸就凑满两条指针，被误判成双指。
 * 2. 轻轻一挪就放得很大：起手间距直接当分母，两指只隔二三十像素时
 *    稍微分开一点比例就翻倍。现在分母有下限，再加死区与阻尼。
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

describe('pinchScale · 灵敏度（回归：轻轻一挪就放得很大）', () => {
  it('间距翻倍不是简单放大 2 倍，而是被阻尼到约 1.5 倍', () => {
    const scale = pinchScale(100, 200)
    expect(scale).toBeGreaterThan(1.3)
    expect(scale).toBeLessThan(1.7)
  })

  it('两指只隔 25px 时，分开到 50px 不会放大到 2 倍', () => {
    // 旧实现直接 50/25 = 2 倍；现在分母有下限 48，且还有阻尼
    const scale = pinchScale(25, 50)
    expect(scale).toBeLessThan(1.2)
  })

  it('两指靠得很近时完全不动（间距不足下限、且变化在死区内）', () => {
    expect(pinchScale(20, 22)).toBe(1)
  })

  it('死区内的微小抖动完全忽略', () => {
    // 100 → 104，变化 4%，小于死区 6%
    expect(pinchScale(100, 104)).toBe(1)
    expect(pinchScale(100, 96)).toBe(1)
  })

  it('跨过死区后开始变化，且不会突然跳一格', () => {
    const justInside = pinchScale(100, 105.9)
    const justOutside = pinchScale(100, 106.1)
    expect(justInside).toBe(1)
    expect(justOutside).toBeGreaterThan(1)
    // 刚跨过死区时放大量很小，不会「一格一跳」
    expect(justOutside).toBeLessThan(1.02)
  })

  it('挪动同样的距离，放大后的增量比旧实现小（真的更稳）', () => {
    // 旧实现：100→130 是 1.3 倍；现在应明显更小
    const scale = pinchScale(100, 130)
    expect(scale).toBeLessThan(1.3)
    expect(scale).toBeGreaterThan(1)
  })

  it('缩小方向同样是阻尼过的，且能真的缩到 1 倍以下', () => {
    const scale = pinchScale(200, 100)
    /**
     * 回归：用户反馈「原始大小下只能放大不能缩小」。
     * 原因是下限曾是 1，而打开时的基准宽度已经是屏宽的 2.6 倍，
     * 想「看全整张图」需要缩到 0.4 左右 —— 必须允许比 1 更小。
     */
    expect(scale).toBeLessThan(1)
    expect(scale).toBeGreaterThan(MIN_PINCH_SCALE)
  })

  it('缩到底（间距极小时）被下限兜住，不会缩成看不见', () => {
    expect(pinchScale(400, 48)).toBe(MIN_PINCH_SCALE)
    expect(MIN_PINCH_SCALE).toBeLessThan(1)
  })

  it('灵敏度可通过参数放宽（后续调手感用）', () => {
    const linear = pinchScale(100, 200, { sensitivity: 1, deadzone: 0 })
    expect(linear).toBeCloseTo(2, 5)
  })
})

describe('pinchScale · 比例计算与夹取', () => {
  it('连续缩放叠在起始比例上', () => {
    expect(pinchScale(100, 200, { baseScale: 2, sensitivity: 1, deadzone: 0 })).toBeCloseTo(4, 5)
  })

  it('上限夹到 5 倍', () => {
    expect(pinchScale(100, 9000, { sensitivity: 1, deadzone: 0 })).toBe(MAX_PINCH_SCALE)
  })

  it('起手距离为 0（两指重合）不产生 Infinity', () => {
    expect(pinchScale(0, 100, { baseScale: 2 })).toBe(2)
  })

  it('非法输入都退回基准，不产生 NaN', () => {
    expect(pinchScale(NaN, 100)).toBe(1)
    expect(pinchScale(100, NaN)).toBe(1)
    expect(pinchScale(-50, 100)).toBe(1)
    expect(pinchScale(100, -10)).toBe(1)
  })

  it('默认参数是一组明确的常量（改手感时知道去哪改）', () => {
    expect(PINCH_MIN_START_DISTANCE).toBeGreaterThan(40)
    expect(PINCH_DEADZONE_RATIO).toBeGreaterThan(0)
    expect(PINCH_SENSITIVITY).toBeLessThan(1)
  })
})

describe('keepFocusScrollLeft · 缩放时保持手指下的内容不跑掉', () => {
  it('以两指中点为中心放大：滚动位置按比例外扩', () => {
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

/**
 * 两指从 fromGap 张开到 toGap。
 *
 * 注意：基线是在「两指距离 ≥ PINCH_MIN_START_DISTANCE」时才建立的，
 * 所以 fromGap 太小的话手势根本不会开始（这正是失败的旧行为）。
 */
function pinch(fromGap, toGap, handlers = {}) {
  const scales = []
  const detach = attachPinch(el, {
    ...handlers,
    onChange: (info) => {
      scales.push(info.scale)
      if (handlers.onChange) handlers.onChange(info)
    },
  })

  const midX = 200
  const y = 100
  el.dispatchEvent(pe('pointerdown', { x: midX + fromGap / 2, y, id: 1 }))
  el.dispatchEvent(pe('pointerdown', { x: midX - fromGap / 2, y, id: 2 }))
  window.dispatchEvent(pe('pointermove', { x: midX + toGap / 2, y, id: 1 }))
  window.dispatchEvent(pe('pointermove', { x: midX - toGap / 2, y, id: 2 }))
  window.dispatchEvent(pe('pointerup', { x: 0, y: 0, id: 1 }))
  window.dispatchEvent(pe('pointerup', { x: 0, y: 0, id: 2 }))

  detach()
  return scales
}

describe('attachPinch · 回归：单指不能缩放', () => {
  it('单指按下并移动不产生任何缩放', () => {
    const onChange = vi.fn()
    const detach = attachPinch(el, { onChange })
    el.dispatchEvent(pe('pointerdown', { x: 200, y: 100, id: 1 }))
    window.dispatchEvent(pe('pointermove', { x: 300, y: 100, id: 1 }))
    window.dispatchEvent(pe('pointermove', { x: 400, y: 100, id: 1 }))
    expect(onChange).not.toHaveBeenCalled()
    detach()
  })

  it('连续多次单指触摸也不会累积成「假双指」（根因就在这里）', () => {
    const onChange = vi.fn()
    const detach = attachPinch(el, { onChange })

    // 第一次单指：按下 → 抬起（旧实现这里收不到 up，记录残留）
    el.dispatchEvent(pe('pointerdown', { x: 200, y: 100, id: 1 }))
    window.dispatchEvent(pe('pointerup', { x: 200, y: 100, id: 1 }))

    // 第二次单指：旧实现会让 map 里凑满两条（残留 + 新的）→ 误判双指
    el.dispatchEvent(pe('pointerdown', { x: 210, y: 100, id: 1 }))
    window.dispatchEvent(pe('pointermove', { x: 260, y: 100, id: 1 }))
    expect(onChange).not.toHaveBeenCalled()

    window.dispatchEvent(pe('pointerup', { x: 260, y: 100, id: 1 }))
    detach()
  })

  it('反复单指滑动（看图常见的拖动操作）始终不触发缩放', () => {
    const onChange = vi.fn()
    const detach = attachPinch(el, { onChange })
    for (let i = 0; i < 5; i++) {
      el.dispatchEvent(pe('pointerdown', { x: 100 + i, y: 100, id: 1 }))
      window.dispatchEvent(pe('pointermove', { x: 200 + i, y: 100, id: 1 }))
      window.dispatchEvent(pe('pointerup', { x: 200 + i, y: 100, id: 1 }))
    }
    expect(onChange).not.toHaveBeenCalled()
    detach()
  })

  it('单指抬起后 touch-action 恢复（不然单指拖不动图）', () => {
    const detach = attachPinch(el, {})
    // 先设一个真实存在的值，才能验证「恢复」而不是「恢复成 undefined」
    el.style.touchAction = 'pan-x pan-y'
    el.dispatchEvent(pe('pointerdown', { x: 200, y: 100, id: 1 }))
    window.dispatchEvent(pe('pointerup', { x: 200, y: 100, id: 1 }))
    expect(el.style.touchAction).toBe('pan-x pan-y')
    detach()
  })
})

describe('attachPinch · 双指张开 / 捏合', () => {
  it('两指张开能放大（间距翻倍约 1.5 倍，不是 2 倍）', () => {
    const scale = pinch(100, 200).at(-1)
    expect(scale).toBeGreaterThan(1.3)
    expect(scale).toBeLessThan(1.7)
  })

  it('两指捏合能缩小到 1 倍以下（回归：只能放大不能缩小）', () => {
    const scale = pinch(400, 160).at(-1)
    expect(scale).toBeLessThan(1)
    expect(scale).toBeGreaterThanOrEqual(MIN_PINCH_SCALE)
  })

  it('捏到底被下限兜住，不会缩成看不见', () => {
    expect(pinch(400, 20).at(-1)).toBe(MIN_PINCH_SCALE)
  })

  it('两指从很近（20px）开始张开时，不会立刻跳成大倍数', () => {
    // 这是「轻轻一挪就放得很大」的另一面：起手距离太小时基线不建立
    const scales = pinch(20, 60)
    // 基线在两指够开（≥48）后才建立，建立时已经是 48→60，放大量很小
    expect(scales.length === 0 || scales.every((s) => s < 1.2)).toBe(true)
  })

  it('onStart 在基线建立时回调一次', () => {
    const onStart = vi.fn()
    pinch(100, 200, { onStart })
    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('onEnd 在手势结束后回调', () => {
    const onEnd = vi.fn()
    pinch(100, 200, { onEnd })
    expect(onEnd).toHaveBeenCalledTimes(1)
  })

  it('getScale 提供起始比例，连续缩放叠加上去', () => {
    const scale = pinch(100, 200, { getScale: () => 2 }).at(-1)
    expect(scale).toBeGreaterThan(2)
    expect(scale).toBeLessThan(3.4)
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
    expect(el.style.touchAction).not.toBe('none')
    detach()
  })

  it('两指抬起后恢复原值', () => {
    const detach = attachPinch(el, {})
    el.dispatchEvent(pe('pointerdown', { x: 200, y: 100, id: 1 }))
    el.dispatchEvent(pe('pointerdown', { x: 100, y: 100, id: 2 }))
    expect(el.style.touchAction).toBe('none')

    window.dispatchEvent(pe('pointerup', { x: 200, y: 100, id: 1 }))
    window.dispatchEvent(pe('pointerup', { x: 100, y: 100, id: 2 }))
    expect(el.style.touchAction).toBe('')

    detach()
  })

  it('两指落点完全重合（距离 0）也要能解锁，不会卡住拖拽', () => {
    const detach = attachPinch(el, {})
    el.dispatchEvent(pe('pointerdown', { x: 150, y: 100, id: 1 }))
    el.dispatchEvent(pe('pointerdown', { x: 150, y: 100, id: 2 }))
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
  it('鼠标不触发（桌面端用别的交互）', () => {
    const onChange = vi.fn()
    const detach = attachPinch(el, { onChange })
    el.dispatchEvent(pe('pointerdown', { x: 200, y: 100, id: 1, pointerType: 'mouse' }))
    el.dispatchEvent(pe('pointerdown', { x: 100, y: 100, id: 2, pointerType: 'mouse' }))
    window.dispatchEvent(pe('pointermove', { x: 300, y: 100, id: 1, pointerType: 'mouse' }))
    expect(onChange).not.toHaveBeenCalled()
    detach()
  })

  it('pointercancel 之后不再响应', () => {
    const onChange = vi.fn()
    const detach = attachPinch(el, { onChange })
    el.dispatchEvent(pe('pointerdown', { x: 200, y: 100, id: 1 }))
    el.dispatchEvent(pe('pointerdown', { x: 100, y: 100, id: 2 }))
    window.dispatchEvent(pe('pointercancel', { id: 1 }))
    window.dispatchEvent(pe('pointermove', { x: 300, y: 100, id: 1 }))
    expect(onChange).not.toHaveBeenCalled()
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
