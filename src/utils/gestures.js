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
 * 横向滚动容器的标记类名。
 *
 * 带这个类的元素（表格、代码块）内部内容可能比容器宽，需要靠横向滑动查看。
 * 手指按在这类区域里时，横向滑动**属于"滚动内容"，不该被当成"切题"**。
 *
 * 通过类名而不是写死选择器：答案渲染里表格与代码块是两套不同的类，
 * 以后还会加别的横滚区，统一打标记即可。
 */
export const SCROLL_X_CLASS = 'js-scroll-x'

/**
 * 从事件目标向上找「可横向滚动的容器」，找不到返回 null。
 *
 * 两个条件都要满足：
 * 1. 带 `js-scroll-x` 标记
 * 2. `scrollWidth > clientWidth + 1` —— **没溢出的容器不该吃掉手势**，
 *    否则窄表格（内容正好放得下）也会莫名无法切题
 *
 * @param {EventTarget|null} target 事件目标
 * @returns {HTMLElement|null}
 */
export function findHorizontalScroller(target) {
  if (!target || typeof target.closest !== 'function') return null
  const box = target.closest('.' + SCROLL_X_CLASS)
  if (!box) return null
  // 有横向溢出才算"需要靠滑动查看内容"
  return box.scrollWidth > box.clientWidth + 1 ? box : null
}

/**
 * 是否落在可横向滚动的容器里。
 *
 * @param {EventTarget|null} target 事件目标
 * @returns {boolean}
 */
export function isInsideHorizontalScroller(target) {
  return !!findHorizontalScroller(target)
}

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
  /**
   * 本次手势的起点是否落在「可横向滚动的容器」里。
   *
   * 落在里面 → 横向滑动交给容器自己滚内容，**不切题**；
   * 落在外面 → 正常切题。用户原话：「触控到这个区域内，就是滑动这里面的内容，
   * 触控在外面，就是左右滑动切题」。
   */
  let startInsideScroller = false
  /** 起点所在的横滚容器（null = 不在里面） */
  let scrollerEl = null
  /** 手势开始时该容器的 scrollLeft */
  let scrollerStartLeft = 0

  const onPointerDown = (e) => {
    // 只响应主指针（鼠标左键 / 单指触摸），忽略右键与多指
    if (e.isPrimary === false) return
    if (e.pointerType === 'mouse' && e.button !== 0) return

    tracking = true
    locked = null
    startX = e.clientX
    startY = e.clientY
    startTime = Date.now()
    // 只在按下那一刻判断一次：手指抬起前不重新计算
    scrollerEl = findHorizontalScroller(e.target)
    startInsideScroller = !!scrollerEl
    scrollerStartLeft = scrollerEl ? scrollerEl.scrollLeft : 0
  }

  const onPointerMove = (e) => {
    if (!tracking) return
    const dx = e.clientX - startX
    const dy = e.clientY - startY

    if (!locked) {
      if (Math.abs(dx) <= MIN_DISTANCE && Math.abs(dy) <= MIN_DISTANCE) return
      /**
       * 轴锁定。
       *
       * 起点在横滚容器里且横向占优 → `scroller`（由脚本拖动内容）。
       * 起点在容器里但纵向占优 → `vertical`，交给页面正常上下翻。
       */
      if (startInsideScroller) {
        locked = Math.abs(dx) > Math.abs(dy) * AXIS_RATIO ? 'scroller' : 'vertical'
      } else {
        locked = Math.abs(dx) > Math.abs(dy) * AXIS_RATIO ? 'horizontal' : 'vertical'
      }
    }

    /**
     * 横滚容器：**由脚本改 scrollLeft**。
     *
     * 为什么不能靠浏览器原生横滚：`touch-action` 在祖先链上是**取交集**的 ——
     * 外层 `.stage` 设了 `pan-y`，内层就算设 `pan-x pan-y`，
     * 交集里也没有横向平移，浏览器照样否决横向手势。
     * 表现就是「手指按在表格/代码上横滑毫无反应，只有拖滚动条才动」。
     *
     * 所以这里直接按位移同步 `scrollLeft`，相当于自己实现横向拖拽。
     * 同时 `preventDefault` 压掉可能存在的文本选中。
     */
    if (locked === 'scroller' && scrollerEl) {
      if (e.cancelable) e.preventDefault()
      // 手指左移（dx<0）→ 内容向右滚（scrollLeft 增大）
      scrollerEl.scrollLeft = scrollerStartLeft - dx
      return
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
