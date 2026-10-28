<script setup>
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { parseAnswerFlow } from '@/utils/answerParts'
import { getFigure } from '@/components/figures/index'
import {
  attachPinch,
  keepFocusScrollLeft,
  MIN_PINCH_SCALE,
  MAX_PINCH_SCALE,
} from '@/utils/pinch'

/**
 * 答案渲染组件：结构化块渲染（标题/段落/列表/表格/代码）+ 内联 SVG 插图。
 *
 * 安全要点：**全程不使用 v-html**。
 * - 答案解析成数据（块数组、行内片段），模板里用插值渲染
 * - 表格渲染成真 <table>、列表渲染成真 <ul>/<ol>、代码渲染成 <pre><code>
 * - 插图按白名单 id 取组件渲染
 * 因此题库内容无法注入任何脚本，也不会出现「文字竖排错乱」。
 */
const props = defineProps({
  answer: { type: String, default: '' },
})

const flow = computed(() => {
  const out = []
  parseAnswerFlow(props.answer).forEach((item, idx) => {
    if (item.type === 'figure') {
      const comp = getFigure(item.id)
      out.push(
        comp
          ? { key: `f-${idx}`, type: 'figure', comp }
          : { key: `t-${idx}`, type: 'fallback', text: `[[图:${item.id}]]` }
      )
      return
    }
    out.push({ key: `b-${idx}`, type: 'blocks', blocks: item.blocks })
  })
  return out
})

/** 行内片段归一化（兼容旧的 splitEmphasis 返回值） */
function segs(list) {
  return (list || []).map((s) => ({
    text: s.text,
    strong: !!s.strong,
    code: !!s.code,
  }))
}

/**
 * 图解放大。
 *
 * 为什么需要：图解的 SVG 画布固定 340 宽，在手机上被缩到 ~0.85 倍，
 * 里面 7.5~9px 的标注字实际只有 6~8px —— 正常视力都吃力，近视更看不清。
 * 直接把画布重新排版不现实（34 张图），所以给一个「点开看大的」出口：
 * 打开时先按 2.6 倍渲染，再用**双指缩放**在 1~5 倍之间自己调。
 */
const zoomComp = shallowRef(null) // 用 shallowRef：组件对象不能被做成响应式代理
const isZoomOpen = computed(() => zoomComp.value !== null)

/** 当前缩放比例（1 = 打开时的基准宽度 260vw） */
const zoomScale = ref(1)
/** 手势过程中的临时比例，用于保持手指中点下的内容不跑掉 */
let pinchFrom = 1

const canvasRef = ref(null)
let detachPinch = () => {}

function openZoom(comp) {
  zoomComp.value = comp
  zoomScale.value = 1
}

function closeZoom() {
  zoomComp.value = null
  zoomScale.value = 1
}

/**
 * 双指缩放：改的是画布的 CSS 宽度，滚动区自然跟着变宽。
 *
 * 不用 CSS transform: scale()——那样滚动范围不会跟着变，
 * 放大后超出部分会被裁掉，用户拖不过去。
 */
function onPinchStart() {
  pinchFrom = zoomScale.value
}

function onPinchChange({ scale, midX }) {
  const canvas = canvasRef.value
  if (!canvas) {
    zoomScale.value = scale
    return
  }

  const from = pinchFrom
  const scrollLeftBefore = canvas.scrollLeft
  zoomScale.value = scale

  // 等宽度生效后再按「两指中点」修正横向滚动位置，
  // 否则每次缩放都从左边开始变，视线要重新找地方。
  requestAnimationFrame(() => {
    const el = canvasRef.value
    if (!el) return
    el.scrollLeft = keepFocusScrollLeft({
      scrollLeft: scrollLeftBefore,
      midX,
      fromScale: from,
      toScale: scale,
    })
  })
}

function bindPinch(el) {
  detachPinch()
  detachPinch = () => {}
  if (!el) return
  detachPinch = attachPinch(el, {
    getScale: () => zoomScale.value,
    onStart: onPinchStart,
    onChange: onPinchChange,
    min: MIN_PINCH_SCALE,
    max: MAX_PINCH_SCALE,
  })
}

watch(canvasRef, (el) => {
  if (el && isZoomOpen.value) bindPinch(el)
  else {
    detachPinch()
    detachPinch = () => {}
  }
})

/**
 * 双击 / 「复位」回来的一档。
 *
 * 不是回到 1（那是打开时的放大基准，约屏宽 2.6 倍，整张图看不全）。
 * 缩到 FIT_SCALE 时整张图刚好装进屏幕 —— 这才是用户按「复位」时的预期：
 * 「让我先看全，再决定放大哪里」。
 */
const FIT_SCALE = 0.4

/** 双击切换：装不下整张图（> FIT_SCALE）就先缩小看全，否则回放大基准 */
function onCanvasDoubleClick() {
  zoomScale.value = zoomScale.value > FIT_SCALE ? FIT_SCALE : 1
  const el = canvasRef.value
  if (el) el.scrollLeft = 0
}

/** 「复位」按钮：回到「整张图装进屏幕」 */
function resetZoom() {
  zoomScale.value = FIT_SCALE
  const el = canvasRef.value
  if (el) el.scrollLeft = 0
}

function onKeydown(e) {
  // 放大层是模态的：打开期间不许刷题页的快捷键（← / → / 空格 / 1 / 2）生效，
  // 否则「看图时按方向键顺手换了下一题」。用捕获阶段拦，才能先于
  // PracticeView 挂在 window 上的冒泡监听。
  e.stopPropagation()
  e.stopImmediatePropagation()
  if (e.key === 'Escape') closeZoom()
}

// 打开时锁住背景滚动并接管 Esc；关闭/卸载时全部还原
watch(isZoomOpen, (open) => {
  if (typeof document === 'undefined') return
  if (open) {
    document.addEventListener('keydown', onKeydown, true)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', onKeydown, true)
    document.body.style.overflow = ''
  }
})

onBeforeUnmount(() => {
  detachPinch()
  if (typeof document === 'undefined') return
  document.removeEventListener('keydown', onKeydown, true)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="answer-body">
    <template v-for="item in flow" :key="item.key">
      <div
        v-if="item.type === 'figure'"
        class="ans-fig"
        role="button"
        tabindex="0"
        aria-label="放大查看图解"
        @click="openZoom(item.comp)"
        @keydown.enter.prevent="openZoom(item.comp)"
        @keydown.space.prevent="openZoom(item.comp)"
      >
        <component :is="item.comp" />
        <span class="ans-fig__hint" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="6" />
            <path d="M20 20l-4.5-4.5M11 8.5v5M8.5 11h5" />
          </svg>
          点开放大
        </span>
      </div>

      <div v-else-if="item.type === 'fallback'" class="ans-block">
        <div class="ans-line">{{ item.text }}</div>
      </div>

      <div v-else class="ans-block">
        <template v-for="(b, bi) in item.blocks" :key="bi">
          <!-- 标题 -->
          <div v-if="b.type === 'heading'" class="ans-h" :class="`ans-h--${b.level}`">
            <template v-for="(seg, si) in b.segs" :key="si">
              <code v-if="seg.code" class="ans-code-inline">{{ seg.text }}</code>
              <strong v-else-if="seg.strong" class="ans-strong">{{ seg.text }}</strong>
              <span v-else>{{ seg.text }}</span>
            </template>
          </div>

          <!-- 表格 -->
          <div v-else-if="b.type === 'table'" class="ans-table-wrap">
            <table class="ans-table">
              <thead>
                <tr>
                  <th
                    v-for="(cell, ci) in b.header"
                    :key="ci"
                    :class="`ta-${b.align[ci] || 'left'}`"
                  >
                    <template v-for="(seg, si) in segs(cell)" :key="si">
                      <code v-if="seg.code" class="ans-code-inline">{{ seg.text }}</code>
                      <strong v-else-if="seg.strong" class="ans-strong">{{ seg.text }}</strong>
                      <span v-else>{{ seg.text }}</span>
                    </template>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, ri) in b.rows" :key="ri">
                  <td
                    v-for="(cell, ci) in row"
                    :key="ci"
                    :class="`ta-${b.align[ci] || 'left'}`"
                  >
                    <template v-for="(seg, si) in segs(cell)" :key="si">
                      <code v-if="seg.code" class="ans-code-inline">{{ seg.text }}</code>
                      <strong v-else-if="seg.strong" class="ans-strong">{{ seg.text }}</strong>
                      <span v-else>{{ seg.text }}</span>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 列表 -->
          <ul v-else-if="b.type === 'list' && !b.ordered" class="ans-list">
            <li
              v-for="(it, ii) in b.items"
              :key="ii"
              :class="it.depth ? `ans-list__item--d${it.depth}` : ''"
            >
              <span class="ans-list__dot" aria-hidden="true"></span>
              <span class="ans-list__txt">
                <template v-for="(seg, si) in segs(it.segs)" :key="si">
                  <code v-if="seg.code" class="ans-code-inline">{{ seg.text }}</code>
                  <strong v-else-if="seg.strong" class="ans-strong">{{ seg.text }}</strong>
                  <span v-else>{{ seg.text }}</span>
                </template>
                <span v-for="(ex, ei) in it.extra || []" :key="`x${ei}`" class="ans-list__extra">{{ ex }}</span>
              </span>
            </li>
          </ul>
          <ol v-else-if="b.type === 'list' && b.ordered" class="ans-list ans-list--ol">
            <li
              v-for="(it, ii) in b.items"
              :key="ii"
              :class="it.depth ? `ans-list__item--d${it.depth}` : ''"
            >
              <span class="ans-list__num" aria-hidden="true">{{ ii + 1 }}</span>
              <span class="ans-list__txt">
                <template v-for="(seg, si) in segs(it.segs)" :key="si">
                  <code v-if="seg.code" class="ans-code-inline">{{ seg.text }}</code>
                  <strong v-else-if="seg.strong" class="ans-strong">{{ seg.text }}</strong>
                  <span v-else>{{ seg.text }}</span>
                </template>
                <span v-for="(ex, ei) in it.extra || []" :key="`x${ei}`" class="ans-list__extra">{{ ex }}</span>
              </span>
            </li>
          </ol>

          <!-- 代码块 -->
          <div v-else-if="b.type === 'code'" class="ans-pre">
            <span v-if="b.lang" class="ans-pre__lang">{{ b.lang }}</span>
            <pre class="ans-pre__body"><code>{{ b.lines.join('\n') }}</code></pre>
          </div>

          <!-- 分隔线 -->
          <hr v-else-if="b.type === 'hr'" class="ans-hr" />

          <!-- 引用 -->
          <blockquote v-else-if="b.type === 'quote'" class="ans-quote">{{ b.text }}</blockquote>

          <!-- 段落 -->
          <p v-else class="ans-p">
            <template v-for="(seg, si) in segs(b.segs)" :key="si">
              <code v-if="seg.code" class="ans-code-inline">{{ seg.text }}</code>
              <strong v-else-if="seg.strong" class="ans-strong">{{ seg.text }}</strong>
              <span v-else>{{ seg.text }}</span>
            </template>
          </p>
        </template>
      </div>
    </template>

    <!-- 图解全屏放大：与手机相册的「看图」同一套交互，点开就能读清标注 -->
    <Teleport to="body">
      <div
        v-if="isZoomOpen"
        class="ans-zoom"
        role="dialog"
        aria-modal="true"
        aria-label="图解放大"
      >
        <div class="ans-zoom__bar">
          <span class="ans-zoom__tip">
            双指缩放 · 拖动查看
            <span v-if="zoomScale !== 1" class="ans-zoom__pct">{{ Math.round(zoomScale * 100) }}%</span>
          </span>
          <!-- 一键看全：缩到整张图装进屏幕。放大后来回切「看全 / 看大」很方便 -->
          <button
            type="button"
            class="ans-zoom__fit"
            :class="{ 'ans-zoom__fit--on': zoomScale <= FIT_SCALE + 0.01 }"
            :aria-pressed="zoomScale <= FIT_SCALE + 0.01"
            aria-label="缩放到整张图可见"
            @click="resetZoom"
          >
            看全
          </button>
          <button
            type="button"
            class="ans-zoom__close"
            aria-label="关闭图解"
            @click="closeZoom"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div
          ref="canvasRef"
          class="ans-zoom__canvas"
          @click.self="closeZoom"
          @dblclick="onCanvasDoubleClick"
        >
          <div class="ans-zoom__inner" :style="{ '--zoom': zoomScale }">
            <component :is="zoomComp" />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.answer-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
/**
 * 正文 16px。
 *
 * 用户反馈「参考答案太小了，近视看不清」：
 * 原来是 13.5px，手机上又常被系统字号压一档，长段落很难读。
 * 16px + 1.75 行高是中文长文比较舒服的组合（微信正文 17px 量级），
 * 代价是答案要多滚两屏 —— 可滚动区本来就是独立滚动的，可以接受。
 */
.ans-block {
  font-size: 16px;
  line-height: 1.75;
  color: var(--c-text);
  display: flex;
  flex-direction: column;
  gap: 9px;
}

/* 段落：中文优先正文字体，不再全局等宽 */
.ans-p {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 标题 */
.ans-h {
  font-weight: 700;
  color: var(--c-text);
  letter-spacing: 0.2px;
}
.ans-h--1,
.ans-h--2 {
  font-size: 18px;
  padding-left: 9px;
  border-left: 3px solid var(--c-primary);
  line-height: 1.5;
}
.ans-h--3,
.ans-h--4,
.ans-h--5,
.ans-h--6 {
  font-size: 16px;
  color: var(--c-primary);
}

/* 强调与行内代码 */
.ans-strong {
  font-weight: 700;
  color: var(--c-text);
}
.ans-code-inline {
  font-family: var(--mono);
  font-size: 0.88em;
  padding: 1px 5px;
  border-radius: 5px;
  background: var(--c-code-bg);
  color: var(--c-code-text);
  border: 1px solid var(--c-code-border);
  word-break: break-word;
}

/* 表格 */
.ans-table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: var(--radius-sm);
  border: 1px solid var(--c-border);
  background: var(--c-card);
}
.ans-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  line-height: 1.65;
}
.ans-table th {
  background: var(--c-table-head);
  color: var(--c-text);
  font-weight: 700;
  padding: 9px 10px;
  text-align: left;
  white-space: nowrap;
  border-bottom: 1px solid var(--c-border);
}
.ans-table td {
  padding: 9px 10px;
  border-bottom: 1px solid var(--c-table-line);
  vertical-align: top;
}
.ans-table tbody tr:last-child td {
  border-bottom: none;
}
.ans-table tbody tr:nth-child(even) {
  background: var(--c-table-zebra);
}
.ans-table .ta-center {
  text-align: center;
}
.ans-table .ta-right {
  text-align: right;
}

/* 列表 */
.ans-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.ans-list > li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.ans-list__dot {
  flex: none;
  width: 5px;
  height: 5px;
  margin-top: 0.66em;
  border-radius: 50%;
  background: var(--c-primary);
  opacity: 0.85;
}
.ans-list__num {
  flex: none;
  min-width: 20px;
  height: 20px;
  margin-top: 0.18em;
  border-radius: 5px;
  background: var(--c-primary-weak);
  color: var(--c-primary);
  font-size: 13px;
  font-weight: 700;
  line-height: 20px;
  text-align: center;
  font-family: var(--mono);
}
.ans-list__txt {
  flex: 1;
  min-width: 0;
  word-break: break-word;
}
/* 列表项下的缩进续行（多为命令或补充说明） */
.ans-list__extra {
  display: block;
  margin-top: 3px;
  padding-left: 2px;
  font-family: var(--mono);
  font-size: 14px;
  line-height: 1.65;
  color: var(--c-text-2);
  white-space: pre-wrap;
}
.ans-list__item--d1 {
  margin-left: 15px;
}
.ans-list__item--d2 {
  margin-left: 30px;
}

/* 代码块 */
.ans-pre {
  position: relative;
  border-radius: var(--radius-sm);
  background: var(--c-code-bg);
  border: 1px solid var(--c-code-border);
  overflow: hidden;
}
.ans-pre__lang {
  display: block;
  padding: 4px 10px;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: var(--c-text-3);
  background: var(--c-code-head);
  border-bottom: 1px solid var(--c-code-border);
}
.ans-pre__body {
  margin: 0;
  padding: 10px 11px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  font-family: var(--mono);
  font-size: 13.5px;
  line-height: 1.7;
  color: var(--c-code-text);
  white-space: pre;
  tab-size: 2;
}
.ans-pre__body code {
  font: inherit;
}

/* 引用与分隔线 */
.ans-quote {
  margin: 0;
  padding: 8px 11px;
  border-left: 3px solid var(--c-border);
  background: var(--c-bg);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  color: var(--c-text-2);
}
.ans-hr {
  margin: 2px 0;
  border: none;
  height: 1px;
  background: var(--c-border);
}

/* ---------- 图解：可点开放大 ---------- */
.ans-fig {
  position: relative;
  /* 纵向间距交给图自身的 .fig（它有 12px 上边距），这里不再叠加 */
  margin: 0;
  cursor: zoom-in;
  /* 点按反馈：轻压一下，表明「这张图能点」 */
  transition: transform 0.14s ease;
}
.ans-fig:active {
  transform: scale(0.995);
}
/**
 * 「点开放大」提示。
 *
 * 早期版本做成压在图片右上角的胶囊，但 34 张图几乎每一张的右上 / 右下都排了
 * 说明文字，胶囊会盖住标注 —— 图本来就是拿来读标注的，盖住等于白做。
 * 所以改为图下方右对齐的一行小字：不遮挡任何内容，也不占太多高度。
 */
.ans-fig__hint {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 3px;
  margin-top: 5px;
  font-size: 11.5px;
  font-weight: 500;
  line-height: 1;
  color: var(--c-primary);
  opacity: 0.9;
}
.ans-fig__hint svg {
  flex: none;
}

/* 全屏看图 */
.ans-zoom {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  background: var(--c-bg);
  padding-top: env(safe-area-inset-top, 0px);
}
.ans-zoom__bar {
  flex: none;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 50px;
  padding: 0 8px 0 14px;
  border-bottom: 1px solid var(--c-border);
  background: var(--c-card);
}
.ans-zoom__tip {
  font-size: 13px;
  color: var(--c-text-2);
}
/* 缩放百分比：只在放大后才出现，避免「100%」这种没信息量的数字常驻 */
.ans-zoom__pct {
  margin-left: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--c-primary);
  font-variant-numeric: tabular-nums;
}

/* 「看全」：缩到整张图装进屏幕。已经在看全状态时高亮，像个开关 */
.ans-zoom__fit {
  margin-left: auto;
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid var(--c-border);
  background: var(--c-bg);
  font-size: 12.5px;
  font-weight: 500;
  color: var(--c-text-2);
}
.ans-zoom__fit:active {
  background: var(--c-primary-weak);
  color: var(--c-primary);
}
.ans-zoom__fit--on {
  border-color: var(--c-primary);
  background: var(--c-primary-weak);
  color: var(--c-primary);
}

.ans-zoom__close {
  margin-left: 4px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: var(--c-text-2);
}
.ans-zoom__close:active {
  background: var(--c-bg);
}
.ans-zoom__canvas {
  flex: 1;
  min-height: 0;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  /**
   * 单指拖动看图用 pan-x pan-y；双指缩放不靠它 ——
   * 这个值会禁用 pinch-zoom，浏览器见到两指会当平移接管并 cancel 手势，
   * 所以 pinch 绑定器在第二根手指落下时会把元素的 touch-action 临时改成 none。
   */
  touch-action: pan-x pan-y;
}
.ans-zoom__inner {
  width: max-content;
  margin: 0 auto;
  padding: 12px 12px calc(24px + env(safe-area-inset-bottom, 0px));
}
/**
 * 放大态：画布 340 宽 → 基准显示宽 min(920, 屏宽*2.6)，实际约 2.7 倍，
 * 原本 8px 的标注字变成 ~21px。
 *
 * 这里的宽度还乘上 `--zoom`（双指缩放的比例）：
 * 用 CSS 宽度而不是 transform: scale()，因为 transform 不改变元素的布局尺寸，
 * 滚动区不会跟着变宽 —— 放大后超出屏幕的部分没法拖过去，等于被裁掉。
 */
.ans-zoom__inner :deep(.fig) {
  width: calc(min(920px, 260vw) * var(--zoom, 1));
  margin: 0;
  padding: 14px 14px 10px;
  box-shadow: none;
}
.ans-zoom__inner :deep(.fig svg) {
  max-height: none;
}
.ans-zoom__inner :deep(.fig figcaption) {
  font-size: 13px;
}
</style>
