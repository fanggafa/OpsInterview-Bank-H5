<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import DifficultyBadge from '@/components/DifficultyBadge.vue'
import FrequencyBadge from '@/components/FrequencyBadge.vue'
import { useStudyStore } from '@/stores/studyStore'
import { STATUS, TYPE_LABEL, categoryColor } from '@/utils/constants'
import { truncate } from '@/utils/format'
import { highlightSegments } from '@/utils/highlight'
import { isChoice, getType } from '@/utils/question'

const props = defineProps({
  question: { type: Object, required: true },
  /** 是否显示掌握状态 */
  showStatus: { type: Boolean, default: true },
  /** 列表项序号（可选） */
  index: { type: Number, default: null },
  /** 搜索关键词（用于题干高亮；为空则不高亮） */
  keyword: { type: String, default: '' },
})

const router = useRouter()
const study = useStudyStore()

const status = computed(() => (props.showStatus ? study.statusOf(props.question.id) : null))
const favorite = computed(() => study.isFavorite(props.question.id))
const summary = computed(() => truncate(props.question.question, 50))
/**
 * 题干高亮片段。
 *
 * 顺序很重要：**先截断、再高亮**。
 * 若反过来（先高亮再截断），截断点可能切在一个 <mark> 片段中间，
 * 拼接出来的文本会缺字或多字。截断后的文本才是实际显示的内容，
 * 高亮应基于它来切分。
 */
const summarySegments = computed(() => highlightSegments(summary.value, props.keyword))
const choice = computed(() => isChoice(props.question))
const typeLabel = computed(() => TYPE_LABEL[getType(props.question)])
/** 分类专属色，用于左侧色条与分类徽标 */
const catColor = computed(() => categoryColor(props.question.category))

const statusText = computed(() => {
  if (status.value === STATUS.KNOW) return choice.value ? '答对' : '会'
  if (status.value === STATUS.UNKNOWN) return choice.value ? '答错' : '不会'
  return '未刷'
})

function open() {
  router.push(`/question/${props.question.id}`)
}

function toggleFavorite(e) {
  e.stopPropagation()
  study.toggleFavorite(props.question.id)
}
</script>

<template>
  <article class="qcard card" :style="{ '--qcard-hue': catColor }" @click="open">
    <div class="qcard__top">
      <span v-if="index !== null" class="qcard__index">{{ index }}</span>
      <p class="qcard__summary">
        <template v-for="(seg, si) in summarySegments" :key="si">
          <mark v-if="seg.hit" class="qcard__hl">{{ seg.text }}</mark>
          <template v-else>{{ seg.text }}</template>
        </template>
      </p>
      <button
        class="qcard__star"
        :class="{ 'qcard__star--on': favorite }"
        :aria-label="favorite ? '取消收藏' : '收藏'"
        :aria-pressed="favorite"
        @click="toggleFavorite"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            d="M12 3.5l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 10l6.1-.9z"
            :fill="favorite ? 'currentColor' : 'none'"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <div class="qcard__meta">
      <span class="badge qcard__cat">{{ question.category }}</span>
      <span class="badge qcard__type" :class="{ 'qcard__type--choice': choice }">{{ typeLabel }}</span>
      <DifficultyBadge :difficulty="question.difficulty" />
      <FrequencyBadge :frequency="question.frequency" />
      <span v-if="showStatus" class="badge qcard__status" :class="`qcard__status--${status || 'none'}`">
        {{ statusText }}
      </span>
    </div>
  </article>
</template>
<style scoped>
.qcard {
  position: relative;
  padding: 10px 12px 10px 14px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: transform 0.12s ease, border-color 0.14s ease;
  overflow: hidden;
}
/* 左侧分类色条：一眼区分不同分类 */
.qcard::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  bottom: 10px;
  width: 3px;
  border-radius: 0 2px 2px 0;
  background: var(--qcard-hue, var(--c-primary));
  opacity: 0.85;
}
.qcard:active {
  transform: scale(0.995);
}

.qcard__top {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.qcard__index {
  flex-shrink: 0;
  width: 20px;
  font-size: 12px;
  color: var(--c-text-3);
  line-height: 1.5;
  padding-top: 1px;
}

.qcard__summary {
  flex: 1;
  margin: 0;
  font-size: 14px;
  line-height: 1.45;
  color: var(--c-text);
  font-weight: 500;
}

/**
 * 搜索命中高亮。
 *
 * 用半透明底色而非纯色块：题目文字本身有颜色，实色底 + 白字在浅色/深色主题下
 * 都可能对比不足。半透明黄底与文字保持原有对比关系，两套主题都清晰。
 */
.qcard__hl {
  background: color-mix(in srgb, var(--c-warning) 32%, transparent);
  color: inherit;
  border-radius: 2px;
  padding: 0 1px;
  font-weight: 600;
}

.qcard__star {
  flex-shrink: 0;
  width: 28px;  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-text-3);
  border-radius: 50%;
  margin: -4px -4px 0 0;
}
.qcard__star--on {
  color: var(--c-warning);
}

.qcard__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
}

.qcard__cat {
  color: var(--qcard-hue, var(--c-primary));
  background: color-mix(in srgb, var(--qcard-hue, var(--c-primary)) 12%, transparent);
}

.qcard__type {
  color: var(--c-text-2);
  background: var(--c-bg);
}
.qcard__type--choice {
  color: var(--c-primary);
  background: var(--c-primary-weak);
}

.qcard__status {
  margin-left: auto;
  color: var(--c-text-3);
  background: var(--c-bg);
}
.qcard__status--know {
  color: var(--c-success);
  background: var(--c-success-weak);
}
.qcard__status--unknown {
  color: var(--c-danger);
  background: var(--c-danger-weak);
}
</style>
