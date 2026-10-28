<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import Ring from '@/components/Ring.vue'
import BarChart from '@/components/BarChart.vue'
import EmptyState from '@/components/EmptyState.vue'
import BackToTop from '@/components/BackToTop.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'
import { formatPercent } from '@/utils/format'
import { isShort } from '@/utils/question'

const router = useRouter()
const bank = useBankStore()
const study = useStudyStore()

onMounted(() => {
  bank.load().catch(() => {})
})

/** 各分类掌握度（仅简答题，PRD §五.4） */
const categoryMastery = computed(() =>
  study.categoryStats
    .filter((s) => s.shortTotal > 0)
    .map((s) => ({
      label: s.category,
      count: s.know,
      total: s.know + s.unknown,
      percent: s.mastery,
    }))
)

/** 各分类选择题正确率 */
const categoryChoice = computed(() => {
  const map = new Map()
  Array.from(study.choiceIds).forEach((id) => {
    const q = bank.questionMap.get(id)
    if (!q) return
    if (!map.has(q.category)) map.set(q.category, { know: 0, unknown: 0 })
    const s = map.get(q.category)
    if (study.recordOf(id).status === 'know') s.know += 1
    else s.unknown += 1
  })
  return Array.from(map.entries()).map(([label, s]) => ({
    label,
    count: s.know,
    total: s.know + s.unknown,
    percent: s.know + s.unknown ? Math.round((s.know / (s.know + s.unknown)) * 100) : null,
  }))
})

const hasAnyRecord = computed(() => study.reviewedCount > 0)
const wrongCount = computed(() => study.wrongList.length)
const favoriteCount = computed(() => study.favoriteList.length)

const choiceAnswered = computed(() => study.choiceKnowCount + study.choiceUnknownCount)
const shortAnswered = computed(() => study.shortKnowCount + study.shortUnknownCount)
</script>

<template>
  <div class="page">
    <AppHeader title="统计" :back="false" />

    <!-- 总进度 -->
    <section class="overview card">
      <Ring :percent="study.progressRate" :size="88" label="总进度" />
      <div class="overview__side">
        <p class="overview__row">
          <span>已刷</span>
          <strong>{{ study.reviewedCount }} <em>/ {{ bank.total }}</em></strong>
        </p>
        <p class="overview__row">
          <span>今日</span>
          <strong>{{ study.todayReviewedCount }}</strong>
        </p>
      </div>
    </section>

    <!-- 双指标 -->
    <h2 class="section-title">答题表现</h2>
    <div class="metrics">
      <div class="metric card">
        <div class="metric__top">
          <span class="metric__label">简答掌握率</span>
          <span class="metric__tip">会 / 已答简答</span>
        </div>
        <p class="metric__value" :class="{ 'metric__value--empty': study.masteryRate === null }">
          {{ formatPercent(study.masteryRate) }}
        </p>
        <p class="metric__sub">
          已答 {{ shortAnswered }} / 共 {{ study.shortTotal }} 道简答
          <span class="metric__split">
            · 会 {{ study.shortKnowCount }} · 不会 {{ study.shortUnknownCount }}
          </span>
        </p>
      </div>

      <div class="metric card">
        <div class="metric__top">
          <span class="metric__label">选择题正确率</span>
          <span class="metric__tip">答对 / 已答选择</span>
        </div>
        <p class="metric__value" :class="{ 'metric__value--empty': study.choiceRate === null }">
          {{ formatPercent(study.choiceRate) }}
        </p>
        <p class="metric__sub">
          已答 {{ choiceAnswered }} / 共 {{ study.choiceTotal }} 道选择
          <span class="metric__split">
            · 对 {{ study.choiceKnowCount }} · 错 {{ study.choiceUnknownCount }}
          </span>
        </p>
      </div>
    </div>

    <!-- 入口 -->
    <div class="entries">
      <button class="entry card" @click="router.push('/wrong')">
        <span class="entry__icon entry__icon--wrong" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8" />
            <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </span>
        <span class="entry__text">
          <span class="entry__title">错题本</span>
          <span class="entry__desc">最近一次答错的题</span>
        </span>
        <span class="entry__num">{{ wrongCount }}</span>
      </button>

      <button class="entry card" @click="router.push('/favorites')">
        <span class="entry__icon entry__icon--fav" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path
              d="M12 3.5l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 10l6.1-.9z"
              fill="currentColor"
            />
          </svg>
        </span>
        <span class="entry__text">
          <span class="entry__title">我的收藏</span>
          <span class="entry__desc">星标过的题目</span>
        </span>
        <span class="entry__num">{{ favoriteCount }}</span>
      </button>
    </div>

    <!-- 分类掌握度 -->
    <h2 class="section-title">各分类掌握度<span class="section-title__tip">（仅简答题）</span></h2>
    <section class="card chart-card">
      <BarChart :items="categoryMastery" empty-text="还没有简答题的作答记录" />
    </section>

    <!-- 分类选择题正确率 -->
    <h2 class="section-title">各分类选择题正确率</h2>
    <section class="card chart-card">
      <BarChart :items="categoryChoice" empty-text="还没有选择题的作答记录" />
    </section>

    <EmptyState
      v-if="!hasAnyRecord && !bank.loading"
      variant="search"
      title="还没有开始刷题"
      desc="去题库挑一道题，或直接进入刷题页开始。"
      action="去刷题"
      @action="router.push('/practice')"
    />

    <BackToTop :threshold="500" />
  </div>
</template>

<style scoped>
.overview {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 14px;
  margin-top: 10px;
}
.overview__side {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.overview__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin: 0;
  font-size: 12.5px;
  color: var(--c-text-2);
}
.overview__row strong {
  font-size: 16px;
  color: var(--c-text);
}
.overview__row em {
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  color: var(--c-text-3);
}

/* 双指标 */
.metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.metric {
  position: relative;
  padding: 12px;
  overflow: hidden;
}
/* 左上角渐变色块，两个指标各不同色 */
.metric::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 64px;
  height: 3px;
  border-radius: 0 0 3px 0;
  background: var(--metric-grad, var(--grad-indigo));
}
.metric:nth-child(1) {
  --metric-grad: var(--grad-indigo);
}
.metric:nth-child(2) {
  --metric-grad: var(--grad-teal);
}
.metric__top {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.metric__label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--c-text);
}
.metric__tip {
  font-size: 10.5px;
  color: var(--c-text-3);
}
.metric__value {
  margin: 6px 0 2px;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.1;
  background: var(--metric-grad, var(--grad-indigo));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
/* 无数据：缩小并转中性色，避免「—」在大字号下被看成装饰线 */
.metric__value--empty {
  font-size: 16px;
  font-weight: 400;
  background: none;
  -webkit-text-fill-color: var(--c-text-3);
  color: var(--c-text-3);
}
.metric__sub {
  margin: 0;
  font-size: 10.5px;
  color: var(--c-text-3);
  line-height: 1.5;
}
.metric__split {
  display: block;
}

/* 入口 */
.entries {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}
.entry {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  cursor: pointer;
  text-align: left;
}
.entry:active {
  transform: scale(0.995);
}
.entry__icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.entry__icon--wrong {
  color: var(--c-danger);
  background: var(--c-danger-weak);
}
.entry__icon--fav {
  color: var(--c-warning);
  background: rgba(250, 173, 20, 0.12);
}
.entry__go {
  font-size: 16px;
  color: var(--c-primary);
}
.entry__text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.entry__title {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--c-text);
}
.entry__desc {
  font-size: 11px;
  color: var(--c-text-3);
}
.entry__num {
  font-size: 17px;
  font-weight: 700;
  color: var(--c-text);
}

.section-title__tip {
  font-weight: 400;
  font-size: 11px;
  color: var(--c-text-3);
}

.chart-card {
  padding: 12px 14px;
}
</style>
