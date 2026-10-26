<script setup>
import { computed } from 'vue'
import { isMultiple } from '@/utils/question'

/**
 * 选择题选项渲染组件（详情页 / 刷题页 / 面试页共用）。
 * 交互与判定由父组件负责，这里只负责展示与状态样式。
 */
const props = defineProps({
  question: { type: Object, required: true },
  /** 已选中的 key 数组 */
  selected: { type: Array, default: () => [] },
  /** 选项状态映射：{ A: 'correct' | 'wrong' | 'missed' | 'idle' } */
  states: { type: Object, default: () => ({}) },
  /** 是否已判定（判定后禁用点击） */
  submitted: { type: Boolean, default: false },
})

const emit = defineEmits(['select'])

const multiple = computed(() => isMultiple(props.question))

function isSelected(key) {
  return props.selected.includes(key)
}

function onSelect(key) {
  if (props.submitted) return
  emit('select', key)
}

/** 选项左侧标记：单选圆点、多选方框 */
const stateLabel = computed(() => ({
  correct: '正确',
  wrong: '错误',
  missed: '漏选',
  idle: '',
}))
</script>

<template>
  <ul class="options" role="listbox" :aria-multiselectable="multiple">
    <li v-for="opt in question.options" :key="opt.key">
      <button
        class="option"
        :class="[
          `option--${states[opt.key] || 'idle'}`,
          { 'option--selected': isSelected(opt.key) },
        ]"
        :disabled="submitted"
        role="option"
        :aria-selected="isSelected(opt.key)"
        @click="onSelect(opt.key)"
      >
        <span class="option__mark" :class="{ 'option__mark--square': multiple }" aria-hidden="true">
          <svg v-if="isSelected(opt.key)" viewBox="0 0 24 24" width="14" height="14">
            <path
              d="M5 12.5l4.5 4.5L19 7"
              fill="none"
              stroke="currentColor"
              stroke-width="2.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <span class="option__key">{{ opt.key }}</span>
        <span class="option__text">{{ opt.text }}</span>
        <span v-if="stateLabel[states[opt.key]]" class="option__flag">
          {{ stateLabel[states[opt.key]] }}
        </span>
      </button>
    </li>
  </ul>
</template>

<style scoped>
.options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
}

.option {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  text-align: left;
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  line-height: 1.5;
  color: var(--c-text);
  transition: border-color 0.15s ease, background-color 0.15s ease;
}
.option:active:not(:disabled) {
  background: var(--c-primary-weak);
}
.option:disabled {
  cursor: default;
}

/* 选中态（未判定） */
.option--selected {
  border-color: var(--c-primary);
  background: var(--c-primary-weak);
}

/* 判定后 */
.option--correct {
  border-color: var(--c-success);
  background: var(--c-success-weak);
}
.option--wrong {
  border-color: var(--c-danger);
  background: var(--c-danger-weak);
}
.option--missed {
  border-color: var(--c-warning);
  background: rgba(250, 173, 20, 0.1);
}
:root[data-theme='dark'] .option--missed {
  background: rgba(255, 197, 61, 0.14);
}

/* 左侧标记 */
.option__mark {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  margin-top: 1px;
  border: 1.5px solid var(--c-text-3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: all 0.15s ease;
}
.option__mark--square {
  border-radius: 4px;
}
.option--selected .option__mark,
.option--correct .option__mark {
  border-color: var(--c-primary);
  background: var(--c-primary);
}
.option--correct .option__mark {
  border-color: var(--c-success);
  background: var(--c-success);
}
.option--wrong .option__mark {
  border-color: var(--c-danger);
  background: var(--c-danger);
}

.option__key {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text-2);
  line-height: 1.6;
}

.option__text {
  flex: 1;
  word-break: break-word;
}

.option__flag {
  flex-shrink: 0;
  font-size: 11px;
  padding: 1px 5px;
  border-radius: 3px;
  background: var(--c-card);
  color: var(--c-text-2);
  align-self: center;
}
.option--correct .option__flag {
  color: var(--c-success);
}
.option--wrong .option__flag {
  color: var(--c-danger);
}
.option--missed .option__flag {
  color: var(--c-warning);
}
</style>
