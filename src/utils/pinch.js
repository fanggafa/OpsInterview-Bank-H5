/**
 * 双指缩放（pinch）手势：纯逻辑 + DOM 绑定。
 *
 * 为什么要自己做：图查看层是 `overflow: auto` 的可滚动区域，
 * 浏览器自带的「双指缩放」缩放的是整个页面视口（顶栏、按钮、底部 Tab 都会跟着变，
 * 退出后字号也不复原）。我们要的是「只放大这张图」，
 * 所以把画布宽度按比例改掉，让滚动区自然跟着变宽变高。
 *
 * 手感的两个关键参数（都很容易踩坑）：
 * 1. 起手间距不能直接当分母。两指只隔 25px 时，分开 25px 比例就是 2 倍 ——
 *    表现为「轻轻一挪就放得很大」。所以起手间距不足 MIN_START 时不建立基线，
 *    等两指分开到 MIN_START 才开始计，分母有下限。
 * 2. 加死区和阻尼。手指落下的头几帧距离抖动要被吃掉（死区），
 *    超过死区的部分再用 <1 的指数做阻尼，让「挪一点 = 变一点」而不是跳变。
 */

/**
 * 缩放下限。
 *
 * 1 不是合适的下限：打开时的基准宽度是 `min(920px, 260vw)`（约屏宽的 2.6 倍，
 * 因为标注字要够大才读得清）。用户反馈「原始大小下只能放大不能缩小」——
 * 想缩到「整张图一次看全」时需要的比例在 0.4 上下，比 1 还小。
 * 所以下限放到 0.35，缩到底时整张图稳稳装进屏内。
 */
export const MIN_PINCH_SCALE = 0.35
/** 缩放上限：5 倍，再大标注字也糊了，且横向要拖很久 */
export const MAX_PINCH_SCALE = 5

/**
 * 起手两指的最小间距。
 *
 * 两指贴得很近时，同样的「挪动 1px」对应的比例变化极大：
 * 25px 起手 → 移动 25px 就是 2 倍。设成 48 之后，分母不会小于它，
 * 手势从「极敏感」变成「按整张图的比例来缩」。
 */
export const PINCH_MIN_START_DISTANCE = 48

/** 死区：两指间距变化小于这个比例时完全不缩放（吃掉手指抖动与误触） */
export const PINCH_DEADZONE_RATIO = 0.06

/**
 * 阻尼指数。1 = 完全线性（灵敏度最高）；越小越「稳」。
 * 0.62 的效果：间距变化 2 倍 → 实际放大约 1.5 倍，不会一步跳到位。
 */
export const PINCH_SENSITIVITY = 0.62

/** 两点距离（px） */
export function distance(a, b) {
  if (!a || !b) return 0
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/**
 * 根据手指距离变化算出新的缩放比例。
 *
 * @param {number} startDistance 手势开始（基线建立）时两指距离
 * @param {number} currentDistance 当前两指距离
 * @param {Object} [options]
 * @param {number} [options.baseScale] 基线建立时的缩放（连续缩放要在此基础上乘）
 * @param {number} [options.min]
 * @param {number} [options.max]
 * @param {number} [options.minStart] 分母下限
 * @param {number} [options.deadzone] 死区比例
 * @param {number} [options.sensitivity] 阻尼指数
 * @returns {number} 夹取后的缩放比例
 */
export function pinchScale(startDistance, currentDistance, options = {}) {
  const {
    baseScale = 1,
    min = MIN_PINCH_SCALE,
    max = MAX_PINCH_SCALE,
    minStart = PINCH_MIN_START_DISTANCE,
    deadzone = PINCH_DEADZONE_RATIO,
    sensitivity = PINCH_SENSITIVITY,
  } = options

  const base = Number.isFinite(baseScale) && baseScale > 0 ? baseScale : 1

  // 起手距离为 0（两指重合）或非法时不做任何缩放，避免 Infinity / NaN
  if (!Number.isFinite(startDistance) || startDistance <= 0) return base
  if (!Number.isFinite(currentDistance) || currentDistance <= 0) return base

  /**
   * 两指还都贴得很近（当前距离都没过 minStart）时不做任何缩放。
   *
   * 这时分母虽然被 minStart 兜住了，但 20/48 = 0.42 落在死区之外，
   * 会被算成「一下子缩到 0.66」—— 而用户其实只是两根手指轻轻搭在屏幕上、
   * 还没来得及张开。等真正分开超过 minStart 才开始计比例。
   */
  const minStartValue = Number(minStart) > 0 ? minStart : 0
  if (minStartValue && currentDistance < minStartValue && startDistance < minStartValue) {
    return base
  }

  // 分母下限：两指贴太近时不直接用它的距离做基准
  const start = Math.max(startDistance, minStartValue)

  const raw = currentDistance / start
  // 死区内的抖动一律不响应，保持当前比例
  if (Math.abs(raw - 1) <= deadzone) return base

  // 扣掉死区后再算，这样「跨过死区那一刻」不会突然跳一格
  const effective = raw > 1 ? 1 + (raw - 1 - deadzone) : 1 - (1 - raw - deadzone)
  if (effective <= 0) return base

  const next = base * Math.pow(effective, Math.max(0.05, sensitivity))
  if (!Number.isFinite(next)) return base
  return Math.min(max, Math.max(min, next))
}

/**
 * 滚轮缩放的比例步长（每一格）。
 *
 * 用「乘性」步长而不是「加性」：从 1 倍到 2 倍，和从 3 倍到 4 倍，
 * 手感应该一样——那只有乘法能做到。0.0018 是按「滚一格约 1.9%」调的，
 * 一次滚三五格能看到明显变化，又不会一闪就过。
 */
export const WHEEL_ZOOM_STEP = 0.0018

/**
 * 由滚轮事件算出新的缩放比例。
 *
 * @param {Object} input
 * @param {number} input.scale 当前比例
 * @param {number} input.deltaY 滚轮增量（向上为负、向下为正）
 * @param {number} [input.step]
 * @param {number} [input.min]
 * @param {number} [input.max]
 * @returns {number} 夹取后的新比例
 */
export function wheelScale({ scale = 1, deltaY = 0, step = WHEEL_ZOOM_STEP, min = MIN_PINCH_SCALE, max = MAX_PINCH_SCALE } = {}) {
  const base = Number.isFinite(scale) && scale > 0 ? scale : 1
  if (!Number.isFinite(deltaY) || deltaY === 0) return base

  // deltaY < 0（向上滚）放大；> 0 缩小
  const next = base * Math.exp(-deltaY * step)
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
 * 绑定缩放到元素：桌面用滚轮，移动端用双指。
 *
 * @param {HTMLElement} el
 * @param {Object} handlers
 * @param {() => number} [handlers.getScale] 取当前已生效的缩放（连续缩放要用）
 * @param {(info: {scale:number, midX:number, midY:number}) => void} [handlers.onStart]
 * @param {(info: {scale:number, midX:number, midY:number, baseScale:number}) => void} [handlers.onChange]
 * @param {() => void} [handlers.onEnd]
 * @param {number} [handlers.min]
 * @param {number} [handlers.max]
 * @param {number} [handlers.minStart]
 * @param {number} [handlers.deadzone]
 * @param {number} [handlers.sensitivity]
 * @param {number} [handlers.wheelStep] 滚轮每格的缩放步长
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
    minStart = PINCH_MIN_START_DISTANCE,
    deadzone = PINCH_DEADZONE_RATIO,
    sensitivity = PINCH_SENSITIVITY,
    wheelStep = WHEEL_ZOOM_STEP,
  } = handlers

  /** @type {Map<number, {x:number, y:number}>} */
  const pointers = new Map()
  let pinching = false
  /** 基线：建立那一刻的两指距离与当时的缩放 */
  let startDistance = 0
  let baseScale = 1
  /** 手势前元素原本的 touch-action，结束后要还回去 */
  let savedTouchAction = ''
  /** 是否处于「已锁」状态。用独立标志位而不是拿 savedTouchAction === '' 当哨兵：
      元素原本的 touch-action 有可能本来就是空字符串，那样会永远解锁不了。 */
  let touchLocked = false

  /**
   * 关掉浏览器自己的触摸接管。
   *
   * 这一步是双指缩放能不能用的关键：缩放层本身是 overflow:auto 的可滚动区域，
   * 按设计它的 touch-action 是 `pan-x pan-y`（允许单指拖动看图）。
   * 而这个值**同时禁用了 pinch-zoom**，浏览器看到两指会当作「平移」自己接管，
   * 随即派发 pointercancel 把我们的手势掐断 —— 表现就是「两指一捏，图没动」。
   *
   * touch-action 只在触摸开始的那一刻参与计算，所以必须在第二根手指落下的
   * 瞬间改成 none（而不是靠 pointermove 里 preventDefault）。
   */
  function lockTouch() {
    if (!el.style || touchLocked) return
    savedTouchAction = el.style.touchAction || ''
    touchLocked = true
    el.style.touchAction = 'none'
  }

  function unlockTouch() {
    if (!el.style || !touchLocked) return
    el.style.touchAction = savedTouchAction
    savedTouchAction = ''
    touchLocked = false
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

  function currentDistance() {
    const pts = Array.from(pointers.values())
    if (pts.length < 2) return 0
    return distance(pts[0], pts[1])
  }

  /**
   * 建立缩放基线。
   *
   * 只在「两指间距已经够开」时才建立，这样分母不会太小
   * （见 PINCH_MIN_START_DISTANCE 的说明）。
   *
   * @param {number} dist 当前两指距离
   */
  function begin(dist = currentDistance()) {
    if (pinching || pointers.size < 2) return
    if (dist <= 0) return
    // 两指还挨得很近：先不建立基线，等它们分开到 minStart（继续在 move 里尝试）
    if (dist < minStart) return

    pinching = true
    startDistance = dist
    baseScale = Number(getScale()) || 1
    const { midX, midY } = midPoint()
    if (typeof onStart === 'function') onStart({ scale: baseScale, midX, midY })
  }

  /**
   * 结束一次缩放。
   *
   * 注意即使 pinching 为 false 也要把 touch-action 还回去：
   * 两指在够开之前就抬起（基线还没建立），此时 touch 已经被锁住，
   * 如果只按 pinching 判断就会漏掉解锁，结果单指再也拖不动图。
   * 所以解锁不依赖 pinching。
   */
  function endPinch() {
    const wasPinching = pinching
    pinching = false
    startDistance = 0
    unlockTouch()
    if (wasPinching && typeof onEnd === 'function') onEnd()
  }

  const onPointerDown = (e) => {
    // 只认触摸：鼠标不参与（桌面端用别的交互）
    if (e.pointerType && e.pointerType !== 'touch') return

    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

    /**
     * 关键修复：单指落下也要挂 window 监听。
     *
     * 之前只在双指落下时才 attachWindow，导致单指抬起时收不到 pointerup，
     * 这根手指的记录永远留在 pointers 里。下一次单指触摸时 map 就凑满两条
     * —— 被误判成双指，于是「单指一挪图就缩放」。
     * 现在无论几指，第一个 down 就挂监听，任何一个 up 都能把记录清掉。
     */
    attachWindow()

    if (pointers.size >= 2) {
      // 第二根手指落下：立刻锁住 touch-action，否则浏览器会接管并 cancel 手势
      lockTouch()
      begin()
    }
  }

  const onPointerMove = (e) => {
    if (!pointers.has(e.pointerId)) return
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.size < 2) return

    // 两指够开了才建立基线（两指贴太近时不把那个小距离当分母）
    if (!pinching) {
      begin()
      return
    }

    // 缩放期间不要同时滚动/选择，否则手感是「又拖又缩」
    if (e.cancelable) e.preventDefault()

    const current = currentDistance()
    const scale = pinchScale(startDistance, current, {
      baseScale,
      min,
      max,
      minStart,
      deadzone,
      sensitivity,
    })
    const { midX, midY } = midPoint()
    if (typeof onChange === 'function') onChange({ scale, midX, midY, baseScale })
  }

  const onPointerUp = (e) => {
    if (!pointers.has(e.pointerId)) return
    pointers.delete(e.pointerId)
    // 手指少于两根就结束这次缩放
    if (pointers.size < 2) {
      endPinch()
    }
    // 一根都不剩才解绑监听（从两指退回一指时，剩下那根还要能收尾）
    if (pointers.size === 0) detachWindow()
  }

  const onCancel = () => {
    pointers.clear()
    endPinch()
    detachWindow()
  }

  function attachWindow() {
    if (typeof window === 'undefined') return
    window.addEventListener('pointermove', onPointerMove, { passive: false })
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onCancel)
  }

  function detachWindow() {
    if (typeof window === 'undefined') return
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', onCancel)
  }

  /**
   * 桌面端：滚轮缩放。
   *
   * 这是看图/看表的通行做法（浏览器看 PDF、地图、图片查看器都是滚轮缩放），
   * 比「点个按钮切档位」自然得多。触控板双指捏合在浏览器里也会派发
   * wheel 事件（带 ctrlKey），这里同样接住，所以触控板也能捏。
   *
   * passive: false 是必须的：不 preventDefault 的话，页面会跟着滚，
   * 图放大了却滚走了。
   */
  const onWheel = (e) => {
    if (!e.deltaY) return
    const scale = wheelScale({
      scale: Number(getScale()) || 1,
      deltaY: e.deltaY,
      step: wheelStep,
      min,
      max,
    })
    // 已经到头了就放行，让浏览器正常滚页面（不然滚到底会被完全吃掉）
    if (scale === (Number(getScale()) || 1)) return

    if (e.cancelable) e.preventDefault()

    // 以光标位置为焦点缩放：指着哪块就放哪块
    const rect = el.getBoundingClientRect ? el.getBoundingClientRect() : { left: 0, top: 0 }
    const midX = e.clientX - (rect.left || 0)
    const midY = e.clientY - (rect.top || 0)
    if (typeof onChange === 'function') {
      onChange({ scale, midX, midY, baseScale: Number(getScale()) || 1 })
    }
  }

  el.addEventListener('pointerdown', onPointerDown)
  el.addEventListener('wheel', onWheel, { passive: false })

  return () => {
    el.removeEventListener('pointerdown', onPointerDown)
    el.removeEventListener('wheel', onWheel)
    detachWindow()
    pointers.clear()
    pinching = false
    unlockTouch()
  }
}
