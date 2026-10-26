<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import Ring from '@/components/Ring.vue'
import BarChart from '@/components/BarChart.vue'
import EmptyState from '@/components/EmptyState.vue'
import DifficultyBadge from '@/components/DifficultyBadge.vue'
import BackToTop from '@/components/BackToTop.vue'
import { CATEGORY_ADVICE } from '@/utils/constants'
import { useInterviewStore } from '@/stores/interviewStore'
import { useBankStore } from '@/stores/bankStore'

const router = useRouter()
const interview = useInterviewStore()
const bank = useBankStore()

/** 进入结果页时把本次结果写入学习记录（只做一次） */
onMounted(() => {
  if (interview.result) interview.commitToStudy()
})

const r = computed(() => interview.result)

/** 分类正确率条形图数据 */
const catBars = computed(() =>
  (r.value?.categories || []).map((s) => ({
    label: s.category,
    count: s.know,
    total: s.answered,
    percent: s.rate,
  }))
)

/** 评估结论：按得分给出一句定性 */
const verdict = computed(() => {
  const score = r.value?.score ?? 0
  if (score >= 85) return { text: '表现优秀', tone: 'ok' }
  if (score >= 70) return { text: '基本达标', tone: 'ok' }
  if (score >= 50) return { text: '仍有明显短板', tone: 'warn' }
  return { text: '需要重点复习', tone: 'bad' }
})

/** 薄弱分类建议文案（来自 constants 的分类建议） */
const advice = computed(() =>
  (r.value?.weakCategories || []).map((s) => ({
    ...s,
    advice: CATEGORY_ADVICE[s.category] || '建议系统复习该分类的基础知识并多做练习。',
  }))
)

/** 逐题回顾 */
const details = computed(() =>
  (r.value?.details || []).map((d) => ({
    ...d,
    question: bank.getById(d.id),
  }))
)

function again() {
  interview.reset()
  router.replace('/interview')
}

function goPractice() {
  // 带着薄弱分类直接去刷题
  const weakest = r.value?.weakCategories?.[0]
  interview.reset()
  if (weakest) router.replace({ path: '/practice', query: { category: weakest.category } })
  else router.replace('/practice')
}
</script>

<template>
  <div class="page">
    <AppHeader title="面试评估" back-to="/interview" />

    <EmptyState
      v-if="!r"
      variant="search"
      title="没有可评估的会话"
      desc="请先开始一次模拟面试。"
      action="去设置"
      @action="router.replace('/interview')"
    />

    <template v-else>
      <!-- 总览 -->
      <section class="hero card">
        <Ring :percent="r.score" :size="104" label="得分" />
        <div class="hero__side">
          <p class="hero__verdict" :class="`hero__verdict--${verdict.tone}`">{{ verdict.text }}</p>
          <p class="hero__line">
            共 {{ r.total }} 题 · <span class="ok">对 {{ r.know }}</span> ·
            <span class="bad">错 {{ r.unknown }}</span>
            <template v-if="r.unanswered"> · 未答 {{ r.unanswered }}</template>
          </p>
          <p class="hero__line hero__line--sub">
            已答 {{ r.answered }} 题，其中正确率 {{ r.accuracy === null ? '—' : r.accuracy + '%' }}
          </p>
        </div>
      </section>

      <p class="disclaimer">
        本页为<b>自评评估</b>：得分 = 答对（自评「会」/选择答对）占总题数的比例。无后端、不调用 AI，不做自动判分。
      </p>

      <!-- 题型表现 -->
      <div class="split">
        <div class="split__item card">
          <span class="split__label">简答题</span>
          <span class="split__num">{{ r.shortCount }}</span>
          <span class="split__tip">道</span>
        </div>
        <div class="split__item card">
          <span class="split__label">选择题</span>
          <span class="split__num">{{ r.choiceKnow }}/{{ r.choiceTotal }}</span>
          <span class="split__tip">答对</span>
        </div>
      </div>

      <!-- 分类正确率 -->
      <h2 class="section-title">各分类表现</h2>
      <section class="card chart-card">
        <BarChart :items="catBars" empty-text="本次没有作答记录" />
      </section>

      <!-- 薄弱分类与建议 -->
      <template v-if="advice.length">
        <h2 class="section-title">薄弱环节与建议</h2>
        <section class="advice">
          <div v-for="item in advice" :key="item.category" class="advice__item card">
            <div class="advice__head">
              <span class="advice__cat">{{ item.category }}</span>
              <span class="advice__rate">{{ item.rate }}%</span>
            </div>
            <p class="advice__text">{{ item.advice }}</p>
          </div>
        </section>
      </template>
      <section v-else class="card done-tip">
        <p class="done-tip__text">本次没有明显薄弱分类，保持节奏继续巩固即可。</p>
      </section>

      <!-- 逐题回顾 -->
      <h2 class="section-title">逐题回顾</h2>
      <ul class="review">
        <li v-for="(d, i) in details" :key="d.id" class="review__item card">
          <span class="review__idx">{{ i + 1 }}</span>
          <div class="review__body">
            <p class="review__q">{{ d.question?.question || '题目已移除' }}</p>
            <div class="review__meta">
              <span class="badge review__cat">{{ d.category }}</span>
              <DifficultyBadge v-if="d.question" :difficulty="d.question.difficulty" />
            </div>
          </div>
          <span
            class="review__tag"
            :class="d.status === 'know' ? 'review__tag--ok' : d.status === 'unknown' ? 'review__tag--bad' : 'review__tag--none'"
          >
            {{ d.status === 'know' ? '对' : d.status === 'unknown' ? '错' : '未答' }}
          </span>
        </li>
      </ul>

      <!-- 操作 -->
      <div class="cta">
        <button class="btn btn--plain cta__btn" @click="again">再来一次</button>
        <button class="btn btn--primary cta__btn" @click="goPractice">
          {{ r.weakCategories?.length ? '专项刷薄弱分类' : '去刷题' }}
        </button>
      </div>

      <BackToTop :threshold="600" />
    </template>
  </div>
</template>

<style scoped>
.hero {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  margin-top: 10px;
}
.hero__side {
  flex: 1;
  min-width: 0;
}
.hero__verdict {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 700;
}
.hero__verdict--ok {
  color: var(--c-success);
}
.hero__verdict--warn {
  color: var(--c-warning);
}
.hero__verdict--bad {
  color: var(--c-danger);
}
.hero__line {
  margin: 0 0 3px;
  font-size: 12.5px;
  color: var(--c-text-2);
}
.hero__line .ok {
  color: var(--c-success);
}
.hero__line .bad {
  color: var(--c-danger);
}
.hero__line--sub {
  font-size: 11.5px;
  color: var(--c-text-3);
}

.disclaimer {
  margin: 10px 0 0;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  background: var(--c-primary-weak);
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--c-text-2);
}
.disclaimer b {
  color: var(--c-primary);
}

.split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 10px;
}
.split__item {
  display: flex;
  align-items: baseline;
  gap: 5px;
  padding: 11px 12px;
}
.split__label {
  font-size: 12px;
  color: var(--c-text-2);
}
.split__num {
  margin-left: auto;
  font-size: 18px;
  font-weight: 700;
  color: var(--c-text);
}
.split__tip {
  font-size: 10.5px;
  color: var(--c-text-3);
}

.chart-card {
  padding: 12px 14px;
}

.advice {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.advice__item {
  padding: 11px 12px;
  border-left: 3px solid var(--c-warning);
}
.advice__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 5px;
}
.advice__cat {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text);
}
.advice__rate {
  font-size: 12px;
  font-weight: 600;
  color: var(--c-warning);
}
.advice__text {
  margin: 0;
  font-size: 12px;
  line-height: 1.65;
  color: var(--c-text-2);
}

.done-tip {
  padding: 14px;
}
.done-tip__text {
  margin: 0;
  font-size: 12.5px;
  color: var(--c-text-2);
}

.review {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.review__item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
}
.review__idx {
  flex-shrink: 0;
  width: 16px;
  font-size: 11px;
  color: var(--c-text-3);
  line-height: 1.6;
}
.review__body {
  flex: 1;
  min-width: 0;
}
.review__q {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--c-text);
}
.review__meta {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 5px;
}
.review__cat {
  color: var(--c-text-2);
  background: var(--c-bg);
}
.review__tag {
  flex-shrink: 0;
  min-width: 30px;
  text-align: center;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}
.review__tag--ok {
  color: var(--c-success);
  background: var(--c-success-weak);
}
.review__tag--bad {
  color: var(--c-danger);
  background: var(--c-danger-weak);
}
.review__tag--none {
  color: var(--c-text-3);
  background: var(--c-bg);
}

.cta {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  padding-bottom: 8px;
}
.cta__btn {
  flex: 1;
}
</style>
