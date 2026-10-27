<script setup>
import { computed } from 'vue'
import { categoryColor } from '@/utils/constants'

/**
 * 横向条形图（纯 CSS，不引图表库）。
 * 每行：分类色点 + 分类名 + 已答数/总数 + 进度条 + 百分比。
 * 进度条按分类专属色渲染，避免整页单一蓝色。
 */
const props = defineProps({
  /** [{ label, count, total, percent }] percent 为 null 时显示「—」 */
  items: { type: Array, default: () => [] },
  /** 空数据提示 */
  emptyText: { type: String, default: '暂无数据' },
})

/** 归一化：percent 为 null 时不画进度 */
const rows = computed(() =>
  (props.items || []).map((it) => {
    const hasPercent = typeof it.percent === 'number'
    const pct = hasPercent ? Math.min(100, Math.max(0, it.percent)) : 0
    return {
      ...it,
      width: pct,
      text: hasPercent ? Math.round(pct) + '%' : '—',
      hasPercent,
      color: categoryColor(it.label),
      // 百分比较高时给一点颜色层次
      tone: pct >= 80 ? 'high' : pct >= 50 ? 'mid' : 'low',
    }
  })
)
</script>

<template>
  <div class="bars">
    <p v-if="!rows.length" class="bars__empty">{{ emptyText }}</p>
    <div
      v-for="row in rows"
      :key="row.label"
      class="bar-row"
      :style="{ '--bar-color': row.color }"
    >
      <div class="bar-row__head">
        <span class="bar-row__dot" aria-hidden="true" />
        <span class="bar-row__label">{{ row.label }}</span>
        <span class="bar-row__meta">
          <span v-if="row.total !== undefined" class="bar-row__count">{{ row.count }}/{{ row.total }}</span>
          <span class="bar-row__pct" :class="{ 'bar-row__pct--null': !row.hasPercent }">
            {{ row.text }}
          </span>
        </span>
      </div>
      <div class="bar-row__track">
        <div
          class="bar-row__fill"
          :class="[`bar-row__fill--${row.tone}`, { 'bar-row__fill--empty': !row.hasPercent }]"
          :style="{ width: row.width + '%' }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.bars__empty {
  margin: 0;
  padding: 12px 0;
  text-align: center;
  font-size: 12.5px;
  color: var(--c-text-3);
}

.bar-row__head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 5px;
}
.bar-row__dot {
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--bar-color);
}
.bar-row__label {
  flex: 1;
  font-size: 12.5px;
  color: var(--c-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bar-row__meta {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-shrink: 0;
}
.bar-row__count {
  font-size: 11px;
  color: var(--c-text-3);
  font-variant-numeric: tabular-nums;
}
.bar-row__pct {
  font-size: 12px;
  font-weight: 700;
  color: var(--bar-color);
  font-variant-numeric: tabular-nums;
}
.bar-row__pct--null {
  color: var(--c-text-3);
  font-weight: 400;
}

.bar-row__track {
  height: 6px;
  border-radius: 3px;
  background: var(--c-bg);
  overflow: hidden;
}
.bar-row__fill {
  height: 100%;
  border-radius: 3px;
  background: var(--bar-color);
  transition: width 0.35s ease;
  opacity: 0.85;
}
.bar-row__fill--high {
  opacity: 1;
}
.bar-row__fill--mid {
  opacity: 0.85;
}
.bar-row__fill--low {
  opacity: 0.7;
}
.bar-row__fill--empty {
  background: transparent;
}
</style>
