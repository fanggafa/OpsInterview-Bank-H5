<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import DifficultyBadge from '@/components/DifficultyBadge.vue'
import FrequencyBadge from '@/components/FrequencyBadge.vue'
import ChoiceOptions from '@/components/ChoiceOptions.vue'
import AnswerText from '@/components/AnswerText.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'
import { STATUS, TYPE_LABEL } from '@/utils/constants'
import { attachSwipe } from '@/utils/gestures'
import {
  isShort,
  isMultiple,
  answerSingle,
  toggleOption,
  judgeChoice,
  optionState,
  resultToStatus,
  resultText,
} from '@/utils/question'

const route = useRoute()
const router = useRouter()
const bank = useBankStore()
const study = useStudyStore()

const expanded = ref(false)
/** 选择题作答态 */
const selected = ref([])
const submitted = ref(false)
const passed = ref(false)

const id = computed(() => Number(route.params.id))
const question = computed(() => bank.getById(id.value))
const short = computed(() => (question.value ? isShort(question.value) : true))
const multiple = computed(() => (question.value ? isMultiple(question.value) : false))
const status = computed(() => study.statusOf(id.value))
const favorite = computed(() => study.isFavorite(id.value))
const record = computed(() => study.recordOf(id.value))
const typeLabel = computed(() => (question.value ? TYPE_LABEL[question.value.type || 'short'] : ''))

/** 选项状态：仅在已判定后计算，否则全部 idle */
const optionStates = computed(() =>
  submitted.value && question.value ? optionState(question.value, selected.value, passed.value) : {}
)

const index = computed(() => bank.questions.findIndex((q) => q.id === id.value))
const prevQuestion = computed(() => (index.value > 0 ? bank.questions[index.value - 1] : null))
const nextQuestion = computed(() =>
  index.value >= 0 && index.value < bank.questions.length - 1 ? bank.questions[index.value + 1] : null
)

/**
 * 左右滑动切题（替代底部的「上一题 / 下一题」按钮）。
 *
 * 用与刷题页相同的 attachSwipe：
 * - 左滑 → 下一题，右滑 → 上一题
 * - 只在「答案已收起」时才响应，避免横向拖动时误切题（如滑动查看宽表格）
 * - 首尾不循环（没有上一题/下一题时就停在原地）
 *
 * CSS 侧必须同时给 .stage 及其所有子孙设 touch-action: pan-y，
 * 否则移动端横向手势会被浏览器的纵向滚动吞掉（这个坑踩过一次）。
 */
const stageRef = ref(null)
let detachSwipe = () => {}

function bindSwipe() {
  detachSwipe()
  detachSwipe = () => {}
  if (!stageRef.value || !question.value) return
  detachSwipe = attachSwipe(stageRef.value, {
    onLeft: () => go(nextQuestion.value),
    onRight: () => go(prevQuestion.value),
  })
}

watch(stageRef, (el) => {
  if (el) bindSwipe()
  else {
    detachSwipe()
    detachSwipe = () => {}
  }
}, { flush: 'post' })

onBeforeUnmount(() => detachSwipe())

onMounted(async () => {
  // 详情页需要答案，但不必拉全量：先取索引（含分类），再只补这道题所属的分类分片。
  try {
    await bank.loadIndex()
    const cat = bank.getById(id.value)?.category
    await bank.hydrateCategory(cat || '')
  } catch {
    // 错误态由 bankStore 的 error 渲染
  }
})

/**
 * 错误态里的「重试」：走索引 + 分片路径。
 * 不能调 bank.retry() —— 那是全量加载，会请求已从部署产物剔除的 questions.json。
 */
async function retryLoad() {
  try {
    await bank.retryIndex()
    const cat = bank.getById(id.value)?.category
    await bank.hydrateCategory(cat || '')
  } catch {
    // 失败仍由 bankStore 的 error 呈现
  }
}

/** 切题时重置作答态与折叠态 */
watch(id, () => {
  expanded.value = false
  resetChoice()
  // 切到的题可能属于别的分类 —— 补一次，避免答案字段缺失
  const cat = bank.getById(id.value)?.category
  if (cat) bank.hydrateCategory(cat).catch(() => {})
})

function resetChoice() {
  selected.value = []
  submitted.value = false
  passed.value = false
}

function toggleAnswer() {
  expanded.value = !expanded.value
}

function toggleFavorite() {
  study.toggleFavorite(id.value)
}

// ---------- 简答题自评 ----------

function mark(s) {
  if (s === STATUS.KNOW) study.markKnow(id.value)
  else study.markUnknown(id.value)
}

// ---------- 选择题作答 ----------

function onSelect(key) {
  if (submitted.value) return
  if (multiple.value) {
    selected.value = toggleOption(selected.value, key)
  } else {
    // 单选：点即判定
    const res = answerSingle(question.value, key)
    selected.value = res.selected
    commitResult(res.passed)
  }
}

/** 多选：点「提交答案」才判定 */
function submitMultiple() {
  if (!selected.value.length) return
  commitResult(judgeChoice(question.value, selected.value))
}

function commitResult(isPassed) {
  passed.value = isPassed
  submitted.value = true
  // 答对记 know、答错记 unknown，复用既有 records
  const s = resultToStatus(isPassed)
  if (s === STATUS.KNOW) study.markKnow(id.value)
  else study.markUnknown(id.value)
}

/** 重做本题 */
function retry() {
  resetChoice()
}

function go(q) {
  if (q) router.push(`/question/${q.id}`)
}

const statusText = computed(() => {
  if (short.value) {
    if (status.value === STATUS.KNOW) return '已标记为「会」'
    if (status.value === STATUS.UNKNOWN) return '已标记为「不会」'
    return '尚未自评'
  }
  if (status.value === STATUS.KNOW) return '最近一次「答对」'
  if (status.value === STATUS.UNKNOWN) return '最近一次「答错」'
  return '尚未作答'
})
</script>

<template>
  <div class="page">
    <AppHeader title="题目详情" back-to="/bank" />

    <div v-if="bank.loading" class="skeleton card" aria-busy="true" />

    <EmptyState
      v-else-if="bank.error"
      variant="error"
      title="题库加载失败"
      :desc="bank.error"
      action="重试"
      @action="retryLoad"
    />

    <EmptyState
      v-else-if="!question"
      variant="search"
      title="题目不存在"
      desc="该题可能已从题库移除，请返回题库重新选择。"
      action="回题库"
      @action="router.replace('/bank')"
    />

    <template v-else>
      <div ref="stageRef" class="stage">
      <article class="card detail">
        <div class="detail__meta">
          <span class="badge detail__cat">{{ question.category }}</span>
          <span class="badge detail__type" :class="{ 'detail__type--choice': !short }">{{ typeLabel }}</span>
          <DifficultyBadge :difficulty="question.difficulty" />
          <FrequencyBadge :frequency="question.frequency" />
          <button
            class="detail__star"
            :class="{ 'detail__star--on': favorite }"
            :aria-label="favorite ? '取消收藏' : '收藏这道题'"
            :aria-pressed="favorite"
            @click="toggleFavorite"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
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

        <h2 class="detail__question">{{ question.question }}</h2>

        <ul v-if="question.tags?.length" class="detail__tags">
          <li v-for="tag in question.tags" :key="tag" class="detail__tag">#{{ tag }}</li>
        </ul>

        <!-- 选择题：选项作答 -->
        <template v-if="!short">
          <ChoiceOptions
            :question="question"
            :selected="selected"
            :states="optionStates"
            :submitted="submitted"
            class="detail__options"
            @select="onSelect"
          />

          <button
            v-if="multiple && !submitted"
            class="btn btn--primary detail__submit"
            :disabled="!selected.length"
            @click="submitMultiple"
          >
            提交答案{{ selected.length ? `（已选 ${selected.length}）` : '' }}
          </button>

          <div v-if="submitted" class="result" :class="passed ? 'result--ok' : 'result--bad'">
            <span class="result__icon">{{ passed ? '✓' : '✕' }}</span>
            <span class="result__text">
              {{ passed ? '回答正确' : '回答错误' }}
            </span>
            <button class="result__retry" @click="retry">重做</button>
          </div>

          <div v-if="submitted && question.explanation" class="explain">
            <p class="explain__label">解析</p>
            <AnswerText :answer="question.explanation" />
          </div>
        </template>

        <!-- 简答题：折叠答案 -->
        <template v-else>
          <button
            class="answer-toggle"
            :aria-expanded="expanded"
            aria-controls="answer-panel"
            @click="toggleAnswer"
          >
            <span>{{ expanded ? '收起参考答案' : '展开参考答案' }}</span>
            <svg
              class="answer-toggle__chevron"
              :class="{ 'answer-toggle__chevron--up': expanded }"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>

          <div id="answer-panel" class="answer" :class="{ 'answer--open': expanded }">
            <div class="answer__inner">
              <div class="answer__body">
                <AnswerText :answer="question.answer" />
              </div>
            </div>
          </div>
        </template>
      </article>
      </div>

      <p class="status-hint muted">
        {{ statusText }}
        <template v-if="record && record.times"> · 已作答 {{ record.times }} 次</template>
      </p>

      <!-- 简答题才有自评按钮；选择题由选项判定 -->
      <div v-if="short" class="actions">
        <button
          class="btn actions__btn actions__btn--unknown"
          :class="{ 'actions__btn--on': status === STATUS.UNKNOWN }"
          @click="mark(STATUS.UNKNOWN)"
        >
          不会
        </button>
        <button
          class="btn actions__btn actions__btn--know"
          :class="{ 'actions__btn--on': status === STATUS.KNOW }"
          @click="mark(STATUS.KNOW)"
        >
          会
        </button>
      </div>

      <!-- 滑动切题提示（替代原来的两个按钮） -->
      <p class="swipe-hint muted">左右滑动切换上一题 / 下一题</p>
    </template>
  </div>
</template>

<style scoped>
.skeleton {
  height: 200px;
  margin-top: 10px;
  background: linear-gradient(90deg, var(--c-card) 25%, var(--c-bg) 37%, var(--c-card) 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}
@keyframes shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

.detail {
  padding: 12px 14px;
  margin-top: 10px;
}

.detail__meta {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}
.detail__cat {
  color: var(--c-text-2);
  background: var(--c-bg);
}
.detail__type {
  color: var(--c-text-2);
  background: var(--c-bg);
}
.detail__type--choice {
  color: var(--c-primary);
  background: var(--c-primary-weak);
}
.detail__star {
  margin-left: auto;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-text-3);
  border-radius: 50%;
}
.detail__star--on {
  color: var(--c-warning);
}
.detail__star:active {
  background: var(--c-primary-weak);
}

.detail__question {
  margin: 12px 0 0;
  font-size: 16px;
  line-height: 1.6;
  font-weight: 600;
  color: var(--c-text);
}

.detail__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin: 10px 0 0;
}
.detail__tag {
  font-size: 11.5px;
  color: var(--c-primary);
  background: var(--c-primary-weak);
  padding: 3px 7px;
  border-radius: 4px;
}

.detail__options {
  margin-top: 14px;
}
.detail__submit {
  width: 100%;
  margin-top: 12px;
}
.detail__submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* 判定结果 */
.result {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  font-size: 13.5px;
  font-weight: 500;
}
.result--ok {
  color: var(--c-success);
  background: var(--c-success-weak);
}
.result--bad {
  color: var(--c-danger);
  background: var(--c-danger-weak);
}
.result__icon {
  font-size: 15px;
  font-weight: 700;
}
.result__text {
  flex: 1;
}
.result__retry {
  font-size: 12.5px;
  font-weight: 500;
  color: inherit;
  opacity: 0.85;
  text-decoration: underline;
  min-height: 32px;
  padding: 0 4px;
}

/* 解析 */
.explain {
  margin-top: 10px;
  padding: 10px 12px;
  background: var(--c-bg);
  border-radius: var(--radius-sm);
}
.explain__label {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--c-text-2);
}

/* 折叠答案 */
.answer-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 44px;
  margin-top: 14px;
  padding: 10px 12px;
  background: var(--c-bg);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  color: var(--c-primary);
}
.answer-toggle__chevron {
  transition: transform 0.2s ease;
}
.answer-toggle__chevron--up {
  transform: rotate(180deg);
}

.answer {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.25s ease;
}
.answer--open {
  grid-template-rows: 1fr;
}
.answer__inner {
  overflow: hidden;
  min-height: 0;
}
.answer__body {
  margin-top: 12px;
  padding: 12px 13px;
  background: var(--c-answer-bg);
  border: 1px solid var(--c-answer-border);
  border-radius: var(--radius-sm);
}

.status-hint {
  margin: 10px 0 0;
  text-align: center;
  font-size: 12px;
}

/* 自评按钮（仅简答题） */
.actions {
  position: sticky;
  bottom: 0;
  display: flex;
  gap: 10px;
  margin: 14px -12px 0;
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom, 0px));
  background: var(--c-bg);
  border-top: 1px solid var(--c-border);
}
.actions__btn {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  border: 1px solid var(--c-border);
  background: var(--c-card);
}
.actions__btn--unknown {
  color: var(--c-danger);
}
.actions__btn--unknown.actions__btn--on {
  background: var(--c-danger-weak);
  border-color: var(--c-danger);
}
.actions__btn--know {
  color: var(--c-success);
}
.actions__btn--know.actions__btn--on {
  background: var(--c-success-weak);
  border-color: var(--c-success);
}

/* 滑动切题的舞台：自身与所有子孙都要 pan-y，
   否则移动端横向手势会被浏览器纵向滚动吞掉 */
.stage,
.stage * {
  touch-action: pan-y;
}

.swipe-hint {
  margin: 10px 0 8px;
  padding-bottom: 8px;
  font-size: 11.5px;
  text-align: center;
}
</style>
