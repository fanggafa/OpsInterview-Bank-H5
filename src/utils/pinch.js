/**
 * 双指缩放（pinch）手势：纯逻辑 + DOM 绑定。
 *
 * 为什么要自己做：图查看层是 `overflow: auto` 的可滚动区域，
 * 浏览器的「双指缩放」是缩放整个页面的视口（会让整个 App 跟着变形，
 * 而且退出后字号都不一样了）。我们要的是「只放大这张图」，
 * 所以把画布宽度按比例改掉，让滚动区自然跟着变宽变高。
 *
 * 实现要点：
 * - 用 Pointer Events 跟踪两指；只认 touch，鼠标不参与（鼠标滚轮是另一回事）
 * - 手指可能滑出元素，所以 move/up 挂在 window 上，否则手势会卡死
 * - 缩放期间 preventDefault，避免浏览器同时做自己的手势
 * - 缩放比例做夹取，防止缩到看不见或撑到离谱
 */

/** 缩放下限：1 表示「按当前布局的基准尺寸」，不允许比基准更小 */
export const MIN_PINCH_SCALE = 1
/** 缩放上限：5 倍，再大标注字也糊了，且横向要拖很久 */
export const MAX_PINCH_SCALE = 5

/** 两点距离（px） */
export function distance(a, b) {
  if (!a || !b) return 0
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/**
 * 根据手指距离变化算出新的缩放比例。
 *
 * @param {number} startDistance 手势开始时两指距离
 * @param {number} currentDistance 当前两指距离
 * @param {Object} [options]
 * @param {number} [options.baseScale] 手势开始时的缩放（连续缩放要在此基础上乘）
 * @param {number} [options.min]
 * @param {number} [options.max]
 * @returns {number} 夹取后的缩放比例
 */
export function pinchScale(startDistance, currentDistance, options = {}) {
  const { baseScale = 1, min = MIN_PINCH_SCALE, max = MAX_PINCH_SCALE } = options
  const base = Number.isFinite(baseScale) && baseScale > 0 ? baseScale : 1

  // 起手距离为 0（两指重合）时不做任何缩放，避免出现 Infinity
  if (!Number.isFinite(startDistance) || startDistance <= 0) return base
  if (!Number.isFinite(currentDistance) || currentDistance <= 0) return base

  const next = base * (currentDistance / startDistance)
  if (!Number.isFinite(next)) return base
  return Math.min(max, Math.max(min, next))
}

/**
 * 缩放到某个比例后，保持「两指中点下的内容」不跑掉。
 *
 * 不做这一步的话，每次缩放都会从左上角开始变，用户的视线要重新找位置。
 * @returns {number} 应该设置的 scrollLeft
 */
export function keepFocusScrollLeft({
  scrollLeft = 0,
  midX = 0,
  fromScale = 1,
  toScale = 1,
}) {
  if (!Number.isFinite(fromScale) || fromScale <= 0) return scrollLeft
  const ratio = toScale / fromScale
  const next = (scrollLeft + midX) * ratio - midX
  return Math.max(0, next)
}

/**
 * 绑定双指缩放到元素。
 *
 * @param {HTMLElement} el
 * @param {Object} handlers
 * @param {() => number} [handlers.getScale] 取当前已生效的缩放（连续缩放要用）
 * @param {(info: {scale:number, midX:number, midY:number}) => void} [handlers.onStart]
 * @param {(info: {scale:number, midX:number, midY:number, baseScale:number}) => void} [handlers.onChange]
 * @param {() => void} [handlers.onEnd]
 * @param {number} [handlers.min]
 * @param {number} [handlers.max]
 * @returns {() => void} 解绑函数
 */
export function attachPinch(el, handlers = {}) {
  if (!el || typeof window === 'undefined') return () => {}

  const {
    getScale = () => 1,
    onStart,
    onChange,
    onEnd,
    min = MIN_PINCH_SCALE,
    max = MAX_PINCH_SCALE,
  } = handlers

  /** @type {Map<number, {x:number, y:number}>} */
  const pointers = new Map()
  let pinching = false
  let startDistance = 0
  let baseScale = 1
  let lastScale = 1
  /** 手势前元素原本的 touch-action，结束后要还回去 */
  let savedTouchAction = ''

  /**
   * 关掉浏览器自己的触摸接管。
   *
   * 这一步是双指缩放能不能用的关键：缩放层本身是 overflow:auto 的可滚动区域，
   * 按设计它的 touch-action 是 `pan-x pan-y`（允许单指拖动看图）。
   * 而这个值**同时禁止了 pinch-zoom**，浏览器看到两指会当作「平移」自己接管，
   * 随即派发 pointercancel 把我们的手势掐断 —— 表现就是「两指一捏，图没动」。
   *
   * touch-action 只在触摸开始的那一刻参与计算，所以必须在第二根手指落下的
   * 瞬间改成 none（而不是靠 pointermove 里 preventDefault）。
   */
  function lockTouch() {
    if (!el.style) return
    savedTouchAction = el.style.touchAction || ''
    el.style.touchAction = 'none'
  }

  function unlockTouch() {
    if (!el.style) return
    el.style.touchAction = savedTouchAction
    savedTouchAction = ''
  }

  /** 两指中点（相对元素左上角），用于保持焦点 */
  function midPoint() {
    const pts = Array.from(pointers.values())
    if (pts.length < 2) return { midX: 0, midY: 0 }
    const ax = (pts[0].x + pts[1].x) / 2
    const ay = (pts[0].y + pts[1].y) / 2
    const rect = el.getBoundingClientRect ? el.getBoundingClientRect() : { left: 0, top: 0 }
    return { midX: ax - (rect.left || 0), midY: ay - (rect.top || 0) }
  }

  function begin() {
    if (pinching || pointers.size < 2) return
    const pts = Array.from(pointers.values())
    startDistance = distance(pts[0], pts[1])
    if (startDistance <= 0) return
    pinching = true
    baseScale = Number(getScale()) || 1
    lastScale = baseScale
    const { midX, midY } = midPoint()
    if (typeof onStart === 'function') onStart({ scale: baseScale, midX, midY })
  }

  /**
   * 结束一次缩放。
   *
   * 注意即使 pinching 为 false 也要把 touch-action 还回去：
   * 两指落点重合时 begin() 会提前返回（距离为 0 无法计算比例），
   * 此时 touch 已经被锁住，如果只按 pinching 判断就会漏掉解锁，
   * 结果单指再也拖不动图。所以解锁不依赖 pinching。
   */
  function endPinch() {
    const wasPinching = pinching
    pinching = false
    startDistance = 0
    unlockTouch()
    if (wasPinching && typeof onEnd === 'function') onEnd()
  }

  const onPointerDown = (e) => {
    if (e.pointerType && e.pointerType !== 'touch') return
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.size === 2) {
      // 第一根手指落下时还允许滚动，第二根落下就进入缩放：此时必须马上
      // 把 touch-action 改成 none，否则浏览器接管并 cancel 掉手势
      lockTouch()
      begin()
      attachWindow()
    }
  }

  const onPointerMove = (e) => {
    if (!pointers.has(e.pointerId)) return
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (!pinching) return

    // 缩放期间不要同时滚动/选择，否则手感是「又拖又缩」
    if (e.cancelable) e.preventDefault()

    const pts = Array.from(pointers.values())
    if (pts.length < 2) return
    const current = distance(pts[0], pts[1])
    const scale = pinchScale(startDistance, current, { baseScale, min, max })
    lastScale = scale
    const { midX, midY } = midPoint()
    if (typeof onChange === 'function') onChange({ scale, midX, midY, baseScale })
  }

  const onPointerUp = (e) => {
    if (!pointers.has(e.pointerId)) return
    pointers.delete(e.pointerId)
    // 手指少于两根就结束这次缩放
    if (pointers.size < 2) {
      endPinch()
      detachWindow()
    }
  }

  const onCancel = () => {
    pointers.clear()
    endPinch()
    detachWindow()
  }

  function attachWindow() {
    window.addEventListener('pointermove', onPointerMove, { passive: false })
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onCancel)
  }

  function detachWindow() {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', onCancel)
  }

  el.addEventListener('pointerdown', onPointerDown)

  return () => {
    el.removeEventListener('pointerdown', onPointerDown)
    detachWindow()
    pointers.clear()
    pinching = false
    lastScale = 1
    unlockTouch()
  }
}
