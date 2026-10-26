<script setup>
import { computed } from 'vue'

/**
 * 横向条形图（纯 CSS，不引图表库）。
 * 每行：分类名 + 已答数/总数 + 进度条 + 百分比。
 */
const props = defineProps({
  /** [{ label, value, total, percent }] percent 为 null 时显示「—」 */
  items: { type: Array, default: () => [] },
  /** 空数据提示 */
  emptyText: { type: String, default: '暂无数据' },
})

/** 归一化：percent 为 null 时不画进度 */
const rows = computed(() =>
  (props.items || []).map((it) => ({
    ...it,
    width: typeof it.percent === 'number' ? Math.min(100, Math.max(0, it.percent)) : 0,
    text: typeof it.percent === 'number' ? Math.round(it.percent) + '%' : '—',
  }))
)
</script>

<template>
  <div class="bars">
    <p v-if="!rows.length" class="bars__empty">{{ emptyText }}</p>
    <div v-for="row in rows" :key="row.label" class="bar-row">
      <div class="bar-row__head">
        <span class="bar-row__label">{{ row.label }}</span>
        <span class="bar-row__meta">
          <span v-if="row.total !== undefined" class="bar-row__count">{{ row.count }}/{{ row.total }}</span>
          <span class="bar-row__pct" :class="{ 'bar-row__pct--null': typeof row.percent !== 'number' }">
            {{ row.text }}
          </span>        </span>
      </div>
      <div class="bar-row__track">
        <div
          class="bar-row__fill"
          :class="{ 'bar-row__fill--empty': typeof row.percent !== 'number' }"
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
  gap: 10px;
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
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}
.bar-row__label {
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
}
.bar-row__pct {
  font-size: 12px;
  font-weight: 600;
  color: var(--c-primary);
}
.bar-row__pct--null {
  color: var(--c-text-3);
  font-weight: 400;
}

.bar-row__track {
  height: 6px;
  background: var(--c-bg);
  border-radius: 3px;
  overflow: hidden;
}
.bar-row__fill {
  height: 100%;
  background: var(--c-primary);
  border-radius: 3px;
  transition: width 0.3s ease;
}
.bar-row__fill--empty {
  background: transparent;
}
</style>
