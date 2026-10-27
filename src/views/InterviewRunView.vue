<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import DifficultyBadge from '@/components/DifficultyBadge.vue'
import FrequencyBadge from '@/components/FrequencyBadge.vue'
import ChoiceOptions from '@/components/ChoiceOptions.vue'
import AnswerText from '@/components/AnswerText.vue'
import { TYPE_LABEL } from '@/utils/constants'
import { isShort, isMultiple, optionState, answerSingle, toggleOption, judgeChoice } from '@/utils/question'
import { useInterviewStore } from '@/stores/interviewStore'

const router = useRouter()
const interview = useInterviewStore()

/** 简答题答案折叠态 */
const expanded = ref(false)
/** 选择题作答态 */
const selected = ref([])
const submitted = ref(false)
const passed = ref(false)

/** 定时器：卸载时清理，避免跳到已销毁的页面 */
let advanceTimer = null
function clearTimer() {
  if (advanceTimer) {
    clearTimeout(advanceTimer)
    advanceTimer = null
  }
}

const q = computed(() => interview.current)
const short = computed(() => (q.value ? isShort(q.value) : true))
const multiple = computed(() => (q.value ? isMultiple(q.value) : false))
const isLast = computed(() => interview.cursor >= interview.total - 1)
const typeLabel = computed(() => (q.value ? TYPE_LABEL[q.value.type || 'short'] : ''))
const progressText = computed(() => `第 ${interview.cursor + 1} / ${interview.total} 题`)

const optionStates = computed(() =>
  submitted.value && q.value ? optionState(q.value, selected.value, passed.value) : {}
)

function resetAnswerState() {
  expanded.value = false
  selected.value = []
  submitted.value = false
  passed.value = false
  clearTimer()
}

watch(() => interview.currentId, resetAnswerState)

onMounted(() => {
  // 无会话时路由守卫会拦，这里再兜一层
  if (!interview.active) router.replace('/interview')
})

onBeforeUnmount(clearTimer)

/** 判定后统一前进：最后一题去结果页 */
function goNext() {
  if (isLast.value) router.replace('/interview/result')
  else router.replace('/interview/run')
}

/** 简答题：自评后立即前进 */
function rate(status) {
  interview.submit(status)
  goNext()
}

/** 单选：点即判定，展示 600ms 后前进 */
function onSelect(key) {
  if (submitted.value || !q.value) return

  if (multiple.value) {
    selected.value = toggleOption(selected.value, key)
    return
  }

  const res = answerSingle(q.value, key)
  selected.value = res.selected
  passed.value = res.passed
  submitted.value = true

  advanceTimer = setTimeout(() => {
    interview.submitChoice(res.selected)
    goNext()
  }, 600)
}

/** 多选：点提交才判定 */
function submitMultiple() {
  if (!selected.value.length || !q.value) return
  passed.value = judgeChoice(q.value, selected.value)
  submitted.value = true

  advanceTimer = setTimeout(() => {
    interview.submitChoice(selected.value)
    goNext()
  }, 600)
}

/**
 * 退出面试：用页内确认，不用 window.confirm。
 *
 * window.confirm 在微信内置浏览器 / 部分 WebView 下会静默失效，
 * 表现为「点了退出没反应」。与其他页面的二次确认保持一致。
 */
const confirmingQuit = ref(false)

function quit() {
  confirmingQuit.value = true
}

function cancelQuit() {
  confirmingQuit.value = false
}

function confirmQuit() {
  interview.reset()
  router.replace('/interview')
}
</script>

<template>
  <div class="page practice page--fill">
    <AppHeader :title="progressText" back-to="/interview">
      <template #right>
        <button class="quit" aria-label="退出面试" @click="quit">退出</button>
      </template>
    </AppHeader>

    <!-- 页内退出确认 -->
    <div v-if="confirmingQuit" class="confirm card" role="alertdialog">
      <p class="confirm__text">
        确定退出面试？<br />
        <span class="muted">本次作答不会计入学习记录。</span>
      </p>
      <div class="confirm__actions">
        <button class="btn btn--plain btn--sm" @click="cancelQuit">继续答题</button>
        <button class="btn btn--danger btn--sm" @click="confirmQuit">确定退出</button>
      </div>
    </div>

    <div
      class="bar"
      role="progressbar"
      :aria-valuenow="interview.answeredCount"
      :aria-valuemin="0"
      :aria-valuemax="interview.total"
    >
      <div class="bar__fill" :style="{ width: interview.progressPercent + '%' }" />
    </div>

    <div v-if="q" class="stage">
      <article class="card qcard-p">
        <div class="qcard-p__meta">
          <span class="badge qcard-p__cat">{{ q.category }}</span>
          <span class="badge qcard-p__type" :class="{ 'qcard-p__type--choice': !short }">{{ typeLabel }}</span>
          <DifficultyBadge :difficulty="q.difficulty" />
          <FrequencyBadge :frequency="q.frequency" />
        </div>

        <div class="qcard-p__scroll">
          <h2 class="qcard-p__q">{{ q.question }}</h2>

          <template v-if="!short">
            <ChoiceOptions
              :question="q"
              :selected="selected"
              :states="optionStates"
              :submitted="submitted"
              class="qcard-p__options"
              @select="onSelect"
            />
            <div v-if="submitted" class="result" :class="passed ? 'result--ok' : 'result--bad'">
              {{ passed ? '回答正确' : '回答错误' }}
            </div>
            <div v-if="submitted && q.explanation" class="explain">
              <p class="explain__label">解析</p>
              <AnswerText :answer="q.explanation" />
            </div>
          </template>

          <template v-else>
            <button class="qcard-p__toggle" :aria-expanded="expanded" @click="expanded = !expanded">
              <span>{{ expanded ? '收起参考答案' : '看参考答案' }}</span>
              <svg
                class="qcard-p__chev"
                :class="{ 'qcard-p__chev--up': expanded }"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <div class="answer" :class="{ 'answer--open': expanded }">
              <div class="answer__inner">
                <div class="answer__body">
                  <AnswerText :answer="q.answer" />
                </div>
              </div>
            </div>
          </template>
        </div>
      </article>
    </div>

    <!-- 操作区 -->
    <div class="actions">
      <template v-if="short">
        <button class="btn actions__btn actions__btn--unknown" @click="rate('unknown')">不会</button>
        <button class="btn actions__btn actions__btn--know" @click="rate('know')">
          {{ isLast ? '会 · 看结果' : '会' }}
        </button>
      </template>
      <template v-else>
        <button
          v-if="multiple && !submitted"
          class="btn btn--primary actions__submit"
          :disabled="!selected.length"
          @click="submitMultiple"
        >
          提交答案{{ selected.length ? `（已选 ${selected.length}）` : '' }}
        </button>
        <p v-else class="actions__hint">
          <template v-if="submitted">已判定，正在进入下一题…</template>
          <template v-else-if="multiple">请选择答案后点「提交」</template>
          <template v-else>点击选项即作答，判对错后自动进入下一题</template>
        </p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.practice {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  padding-bottom: 0;
}

.quit {
  min-height: 40px;
  padding: 0 8px;
  font-size: 13px;
  color: var(--c-text-3);
}

/* 页内退出确认 */
.confirm {
  margin-top: 8px;
  padding: 12px 13px;
  flex-shrink: 0;
}
.confirm__text {
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--c-text);
}
.confirm__actions {
  display: flex;
  gap: 8px;
}
.btn--sm {
  height: 34px;
  padding: 0 14px;
  border-radius: var(--radius-sm);
  font-size: 13px;
}
.btn--danger {
  background: var(--c-danger);
  color: #fff;
  font-weight: 500;
}

.bar {
  height: 3px;
  margin: 6px 0 0;
  background: var(--c-border);
  border-radius: 2px;
  overflow: hidden;
  flex-shrink: 0;
}
.bar__fill {
  height: 100%;
  background: var(--c-primary);
  transition: width 0.3s ease;
}

.stage {
  flex: 1;
  display: flex;
  margin-top: 10px;
  min-height: 0;
}

.qcard-p {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 12px 14px;
  overflow: hidden;
}
.qcard-p__meta {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  flex-shrink: 0;
}
.qcard-p__cat,
.qcard-p__type {
  color: var(--c-text-2);
  background: var(--c-bg);
}
.qcard-p__type--choice {
  color: var(--c-primary);
  background: var(--c-primary-weak);
}

.qcard-p__scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.qcard-p__q {
  margin: 10px 0 0;
  font-size: 16px;
  line-height: 1.6;
  font-weight: 600;
  color: var(--c-text);
}

.qcard-p__options {
  margin-top: 12px;
}

.qcard-p__toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 44px;
  margin-top: 12px;
  padding: 10px 12px;
  background: var(--c-bg);
  border-radius: var(--radius-sm);
  font-size: 13.5px;
  font-weight: 500;
  color: var(--c-primary);
}
.qcard-p__chev {
  transition: transform 0.2s ease;
}
.qcard-p__chev--up {
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
  margin-top: 10px;
  padding: 11px 12px;
  background: var(--c-answer-bg);
  border: 1px solid var(--c-answer-border);
  border-radius: var(--radius-sm);
}

.result {
  margin-top: 10px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  font-size: 13px;
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

.explain {
  margin-top: 8px;
  padding: 10px;
  background: var(--c-bg);
  border-radius: var(--radius-sm);
}
.explain__label {
  margin: 0 0 5px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--c-text-2);
}

.actions {
  flex-shrink: 0;
  display: flex;
  gap: 10px;
  align-items: center;
  margin: 8px -12px 0;
  padding: 8px 12px calc(8px + env(safe-area-inset-bottom, 0px));
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
.actions__btn--know {
  color: var(--c-success);
}
.actions__submit {
  flex: 1;
}
.actions__submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.actions__hint {
  flex: 1;
  margin: 0;
  text-align: center;
  font-size: 12.5px;
  color: var(--c-text-3);
}
</style>
