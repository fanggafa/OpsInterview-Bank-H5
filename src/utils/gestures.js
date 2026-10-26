/**
 * 手势判定：横向滑动的纯逻辑 + DOM 绑定。
 *
 * 判定顺序（与 PRD §五.6 一致）：
 * 1. 轴锁定：|dx| > |dy| * AXIS_RATIO 且 |dx| > MIN_DISTANCE 才算横向手势
 * 2. 触发：位移 > DISTANCE_THRESHOLD，或速度 > VELOCITY_THRESHOLD
 * 3. 否则回弹（返回 null）
 *
 * 绑定实现要点：
 * - pointerdown 在元素上，pointermove / pointerup 挂到 window，
 *   这样鼠标拖出元素外也能正常收尾（否则手势会卡死）。
 * - 鼠标拖拽时阻止文本选中与图片拖拽，避免出现蓝色选区。
 * - 触摸场景配合 CSS touch-action: pan-y，保留纵向滚动、拦截横向手势。
 */

export const AXIS_RATIO = 1.2
export const MIN_DISTANCE = 10
export const DISTANCE_THRESHOLD = 60
export const VELOCITY_THRESHOLD = 0.3 // px/ms

/**
 * 纯函数：根据位移和时间判断手势方向。
 * @param {{dx:number, dy:number, duration:number}} input duration 为 ms
 * @returns {'left'|'right'|null} 左滑（dx<0）返回 'left'
 */
export function classifyGesture({ dx, dy, duration }) {
  if (typeof dx !== 'number' || typeof dy !== 'number') return null

  const absX = Math.abs(dx)
  const absY = Math.abs(dy)

  // 轴锁定：纵向为主或位移过小，都不算横向手势
  if (absX <= MIN_DISTANCE) return null
  if (absX <= absY * AXIS_RATIO) return null

  const elapsed = duration > 0 ? duration : 1
  const velocity = absX / elapsed

  if (absX < DISTANCE_THRESHOLD && velocity < VELOCITY_THRESHOLD) return null

  return dx < 0 ? 'left' : 'right'
}

/**
 * 绑定滑动手势到元素（同时支持触摸与鼠标拖拽）。
 * 返回解绑函数。
 *
 * @param {HTMLElement} el
 * @param {{onLeft?:Function, onRight?:Function}} handlers
 */
export function attachSwipe(el, handlers = {}) {
  if (!el || typeof window === 'undefined') return () => {}

  let startX = 0
  let startY = 0
  let startTime = 0
  let locked = null // null=未定 | 'horizontal' | 'vertical'
  let tracking = false

  const onPointerDown = (e) => {
    // 只响应主指针（鼠标左键 / 单指触摸），忽略右键与多指
    if (e.isPrimary === false) return
    if (e.pointerType === 'mouse' && e.button !== 0) return

    tracking = true
    locked = null
    startX = e.clientX
    startY = e.clientY
    startTime = Date.now()
  }

  const onPointerMove = (e) => {
    if (!tracking) return
    const dx = e.clientX - startX
    const dy = e.clientY - startY

    if (!locked) {
      if (Math.abs(dx) <= MIN_DISTANCE && Math.abs(dy) <= MIN_DISTANCE) return
      // 轴锁定：横向占优 → 横向，否则交给页面纵向滚动
      locked = Math.abs(dx) > Math.abs(dy) * AXIS_RATIO ? 'horizontal' : 'vertical'
    }

    if (locked === 'horizontal') {
      // 阻止横向拖拽时的页面滚动 / 文本选中
      if (e.cancelable) e.preventDefault()
      // 鼠标拖拽时抑制文本选中
      if (e.pointerType === 'mouse' && typeof window.getSelection === 'function') {
        const sel = window.getSelection()
        if (sel && !sel.isCollapsed) sel.removeAllRanges()
      }
    }
  }

  const finish = (e) => {
    if (!tracking) return
    tracking = false
    const wasLocked = locked
    locked = null
    detachWindow()

    if (wasLocked !== 'horizontal') return

    const dx = (e.clientX ?? startX) - startX
    const dy = (e.clientY ?? startY) - startY
    const direction = classifyGesture({ dx, dy, duration: Date.now() - startTime })

    if (direction === 'left' && typeof handlers.onLeft === 'function') handlers.onLeft()
    else if (direction === 'right' && typeof handlers.onRight === 'function') handlers.onRight()
  }

  const onCancel = () => {
    tracking = false
    locked = null
    detachWindow()
  }

  function attachWindow() {
    if (typeof window === 'undefined') return
    window.addEventListener('pointermove', onPointerMove, { passive: false })
    window.addEventListener('pointerup', finish)
    window.addEventListener('pointercancel', onCancel)
  }

  function detachWindow() {
    if (typeof window === 'undefined') return
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', finish)
    window.removeEventListener('pointercancel', onCancel)
  }

  const onDown = (e) => {
    onPointerDown(e)
    if (tracking) attachWindow()
  }

  el.addEventListener('pointerdown', onDown)

  return () => {
    el.removeEventListener('pointerdown', onDown)
    detachWindow()
    tracking = false
    locked = null
  }
}
