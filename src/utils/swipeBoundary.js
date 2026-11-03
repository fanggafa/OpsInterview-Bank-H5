import { onBeforeUnmount, ref } from 'vue'

/**
 * 「已经是第一题 / 最后一题」提示的**状态逻辑**。
 *
 * 与展示组件 `SwipeBoundaryToast.vue` 拆开：
 * SFC 的 `<script setup>` 只能导出组件本身，不能额外导出一个函数，
 * 所以状态逻辑放这里，页面 `import { useSwipeBoundaryToast }` 使用。
 *
 * 详情页与刷题页共用这一份 —— 早先只有详情页有提示，
 * 刷题页（每日一刷 / 每日复习）滑到边界时静默不动，用户以为手势失灵。
 */
const TEXT_FIRST = '已经是第一题'
const TEXT_LAST = '已经是最后一题'
/** 提示停留时长（毫秒）。1.6 秒足够看清，又不至于挡着后续阅读 */
const DURATION = 1600

/**
 * @returns {{ text: import('vue').Ref<string>, flashFirst: Function, flashLast: Function }}
 */
export function useSwipeBoundaryToast() {
  /** 当前要显示的文案，空串 = 不显示 */
  const text = ref('')
  let timer = 0

  /** 闪一条提示 */
  function flash(msg) {
    // 先清掉上一次的计时，避免连续越界时提示提前消失
    if (timer) clearTimeout(timer)
    text.value = msg
    timer = setTimeout(() => {
      text.value = ''
      timer = 0
    }, DURATION)
  }

  /** 已经在第一题还往前滑 */
  function flashFirst() {
    flash(TEXT_FIRST)
  }

  /** 已经在最后一题还往后滑 */
  function flashLast() {
    flash(TEXT_LAST)
  }

  onBeforeUnmount(() => {
    if (timer) clearTimeout(timer)
  })

  return { text, flashFirst, flashLast }
}
