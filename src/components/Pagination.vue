<script setup>
import { computed } from 'vue'

/**
 * 统一分页控件（列表页共用）。
 *
 * 设计要点：
 * - 只显示「上一页 / 页码 / 下一页 + 共 n 条」，不做无限加载；
 * - 吸底固定，滚动到任何位置都能操作，不必先滚回顶部；
 * - 页码过多时折叠为省略号（1 … 4 5 6 … 12）。
 * - 不足一页时整体隐藏（由父组件用 meta.visible 控制，组件内部也兜一层）。
 */
const props = defineProps({
  /** pageMeta() 的返回值 */
  meta: { type: Object, required: true },
  /** 单位文案：题 / 条 */
  unit: { type: String, default: '题' },
  /** 是否吸底固定 */
  fixed: { type: Boolean, default: true },
})

const emit = defineEmits(['change'])

const visible = computed(() => props.meta?.visible === true)

/**
 * 生成页码序列：当前页附近最多 5 个，两侧需要时补省略号。
 * @returns {Array<number|'…'>}
 */
const pageItems = computed(() => {
  const { page, pageCount } = props.meta
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1)
  }

  const items = []
  const push = (v) => {
    if (items[items.length - 1] !== v) items.push(v)
  }

  push(1)
  const start = Math.max(2, page - 1)
  const end = Math.min(pageCount - 1, page + 1)

  if (start > 2) push('…')

  for (let i = start; i <= end; i++) push(i)

  if (end < pageCount - 1) push('…')

  push(pageCount)
  return items
})

function go(target) {
  if (target === '…') return
  const next = Number(target)
  if (!Number.isFinite(next)) return
  if (next < 1 || next > props.meta.pageCount) return
  if (next === props.meta.page) return
  emit('change', next)
}

function prev() {
  if (props.meta.hasPrev) emit('change', props.meta.page - 1)
}

function next() {
  if (props.meta.hasNext) emit('change', props.meta.page + 1)
}
</script>

<template>
  <nav v-if="visible" class="pager" :class="{ 'pager--fixed': fixed }" aria-label="分页">
    <div class="pager__bar">
      <button
        class="pager__nav"
        :disabled="!meta.hasPrev"
        aria-label="上一页"
        @click="prev"
      >
        上一页
      </button>

      <div class="pager__pages">
        <button
          v-for="(item, i) in pageItems"
          :key="`${item}-${i}`"
          class="pager__num"
          :class="{
            'pager__num--on': item === meta.page,
            'pager__num--gap': item === '…',
          }"
          :disabled="item === '…'"
          :aria-current="item === meta.page ? 'page' : undefined"
          @click="go(item)"
        >
          {{ item }}
        </button>
      </div>

      <button
        class="pager__nav"
        :disabled="!meta.hasNext"
        aria-label="下一页"
        @click="next"
      >
        下一页
      </button>
    </div>

    <p class="pager__info">
      第 {{ meta.page }} / {{ meta.pageCount }} 页 · 显示 {{ meta.from }}–{{ meta.to }}，共
      {{ meta.total }} {{ unit }}
    </p>
  </nav>
</template>

<style scoped>
.pager {
  margin-top: 10px;
}
/* 吸底：滚动到任何位置都能翻页 */
.pager--fixed {
  position: sticky;
  bottom: 0;
  z-index: 12;
  margin: 10px -12px 0;
  padding: 8px 12px calc(8px + env(safe-area-inset-bottom, 0px));
  background: var(--c-bg);
  border-top: 1px solid var(--c-border);
}

.pager__bar {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pager__nav {
  flex-shrink: 0;
  min-height: 36px;
  padding: 0 10px;
  border-radius: var(--radius-sm);
  font-size: 12.5px;
  color: var(--c-primary);
  background: var(--c-card);
  border: 1px solid var(--c-border);
}
.pager__nav:disabled {
  color: var(--c-text-3);
  opacity: 0.5;
  cursor: not-allowed;
}
.pager__nav:not(:disabled):active {
  background: var(--c-primary-weak);
}

.pager__pages {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  min-width: 0;
  overflow: hidden;
}

.pager__num {
  min-width: 28px;
  height: 32px;
  padding: 0 4px;
  border-radius: 6px;
  font-size: 12.5px;
  color: var(--c-text-2);
}
.pager__num:active:not(:disabled) {
  background: var(--c-primary-weak);
}
.pager__num--on {
  color: #fff;
  background: var(--c-primary);
  font-weight: 600;
}
.pager__num--gap {
  color: var(--c-text-3);
  cursor: default;
}

.pager__info {
  margin: 4px 0 0;
  text-align: center;
  font-size: 10.5px;
  color: var(--c-text-3);
}
</style>
