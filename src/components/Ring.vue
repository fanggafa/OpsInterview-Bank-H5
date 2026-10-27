<script setup>
import { computed } from 'vue'

/** 环形进度：CSS conic-gradient 实现，不引入图表库 */
const props = defineProps({
  /** 0-100，null 显示为空环 */
  percent: { type: Number, default: null },
  size: { type: Number, default: 96 },
  stroke: { type: Number, default: 8 },
  label: { type: String, default: '' },
})

const valid = computed(() => typeof props.percent === 'number' && Number.isFinite(props.percent))
const clamped = computed(() => (valid.value ? Math.min(100, Math.max(0, props.percent)) : 0))
const text = computed(() => (valid.value ? Math.round(clamped.value) + '%' : '—'))
const holeSize = computed(() => props.size - props.stroke * 2)
</script>

<template>
  <div
    class="ring"
    :style="{
      width: size + 'px',
      height: size + 'px',
      background: valid
        ? `conic-gradient(var(--ring-color, var(--c-primary)) 0 ${clamped}%, var(--ring-track, var(--c-border)) ${clamped}% 100%)`
        : 'var(--ring-track, var(--c-border))',
    }"
    role="img"
    :aria-label="label ? label + ' ' + text : text"
  >
    <div
      class="ring__hole"
      :style="{ width: holeSize + 'px', height: holeSize + 'px' }"
    >
      <span class="ring__text">{{ text }}</span>
      <span v-if="label" class="ring__label">{{ label }}</span>
    </div>
  </div>
</template>

<style scoped>
.ring {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ring__hole {
  border-radius: 50%;
  /* 用变量便于嵌套在渐变卡片上时覆盖（如首页 hero） */
  background: var(--ring-hole-bg, var(--c-card));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
}
.ring__text {
  font-size: 18px;
  font-weight: 600;
  color: var(--c-text);
}
.ring__label {
  font-size: 10px;
  color: var(--c-text-3);
}
</style>
