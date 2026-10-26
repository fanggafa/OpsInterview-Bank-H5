<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Ring from '@/components/Ring.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'
import { formatPercent } from '@/utils/format'
import { STORAGE_KEYS } from '@/utils/constants'
import { describeProgress } from '@/utils/practice'

const bank = useBankStore()
const study = useStudyStore()
const router = useRouter()

onMounted(() => {
  bank.load().catch(() => {})
})

/** 「继续上次刷题」的展示文案（PRD §二.2） */
const progressInfo = computed(() => describeProgress(study.progress))

function continueStudy() {
  const p = study.progress
  const query = { mode: p?.mode || 'sequential' }
  if (p?.category) query.category = p.category
  router.push({ path: '/practice', query })
}

/** 分类入口：按题库实际分类动态生成，带各自进度 */
const categories = computed(() => {
  const statsMap = new Map(study.categoryStats.map((s) => [s.category, s]))
  const counts = {}
  bank.questions.forEach((q) => {
    counts[q.category] = (counts[q.category] || 0) + 1
  })

  const present = Object.keys(counts)
  return present.map((name) => {
    const stat = statsMap.get(name)
    const reviewed = stat ? stat.reviewed : 0
    return {
      name,
      total: counts[name],
      reviewed,
      percent: counts[name] ? Math.round((reviewed / counts[name]) * 100) : null,
    }
  })
})

/** 今日是否有刷题记录，决定「今日」区块的口径文案 */
const todayDone = computed(() => study.todayReviewedCount > 0)

/** 掌握率只统计简答题（PRD §五.4），首页展示时说明清楚 */
const masteryText = computed(() => formatPercent(study.masteryRate))
const choiceText = computed(() => formatPercent(study.choiceRate))

/** 无数据（null）时不染强调色，否则「—」会被误读成装饰线 */
const masteryClass = computed(() => (study.masteryRate === null ? '' : 'ok'))
const choiceClass = computed(() => (study.choiceRate === null ? '' : 'warn'))
</script>

<template>
  <div class="page">
    <header class="home-header">
      <div>
        <h1 class="home-title">运维面试题库</h1>
        <p class="home-sub">
          {{ todayDone ? `今天已经刷了 ${study.todayReviewedCount} 题，继续保持` : '碎片时间，背完这些题' }}
        </p>
      </div>
      <button class="home-theme" aria-label="打开设置" @click="router.push('/me')">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8" />
          <path
            d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </header>

    <!-- 总进度 + 双指标 -->
    <section class="overview card">
      <Ring :percent="study.progressRate" :size="86" label="总进度" />
      <div class="overview__side">
        <p class="overview__row">
          <span>已刷</span>
          <strong>{{ study.reviewedCount }} <em>/ {{ bank.total }} 题</em></strong>
        </p>
        <p class="overview__row">
          <span>简答掌握率</span>
          <strong :class="masteryClass">{{ masteryText }}</strong>
        </p>
        <p class="overview__row">
          <span>选择正确率</span>
          <strong :class="choiceClass">{{ choiceText }}</strong>
        </p>
      </div>
    </section>

    <!-- 快捷入口 -->
    <div class="entries">
      <button class="entry card" @click="router.push('/practice')">
        <span class="entry__icon entry__icon--practice" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M13 3 5 14h5l-1 7 8-11h-5l1-7z" fill="currentColor" />
          </svg>
        </span>
        <span class="entry__text">
          <span class="entry__title">开始刷题</span>
          <span class="entry__desc">顺序 / 随机 / 按分类</span>
        </span>
      </button>

      <button class="entry card" @click="router.push('/interview')">
        <span class="entry__icon entry__icon--interview" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              d="M12 3l7 4v5c0 4.4-2.9 7.6-7 9-4.1-1.4-7-4.6-7-9V7l7-4z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linejoin="round"
            />
            <path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
        <span class="entry__text">
          <span class="entry__title">模拟面试</span>
          <span class="entry__desc">随机抽题 + 自评评估</span>
        </span>
      </button>
    </div>

    <!-- 继续上次 -->
    <section v-if="progressInfo" class="continue card" @click="continueStudy">
      <div class="continue__body">
        <p class="continue__title">继续上次刷题</p>
        <p class="continue__desc">
          {{ progressInfo.category }} · {{ progressInfo.modeLabel }} · {{ progressInfo.positionText }}
        </p>
      </div>
      <span class="continue__arrow" aria-hidden="true">→</span>
    </section>

    <!-- 分类入口（带各自进度） -->
    <h2 class="section-title">按分类刷题</h2>
    <div class="cats">
      <router-link
        v-for="cat in categories"
        :key="cat.name"
        :to="{ path: '/practice', query: { category: cat.name } }"
        class="cats__item card"
      >
        <div class="cats__head">
          <span class="cats__name">{{ cat.name }}</span>
          <span class="cats__count">{{ cat.reviewed }}/{{ cat.total }}</span>
        </div>
        <div class="cats__track">
          <div class="cats__fill" :style="{ width: (cat.percent || 0) + '%' }" />
        </div>
      </router-link>
    </div>

    <p class="home-foot muted">
      共 {{ bank.total }} 题（简答 {{ study.shortTotal }} · 选择 {{ study.choiceTotal }}）
      · 记录保存在本机（{{ STORAGE_KEYS.RECORDS }}）
    </p>
  </div>
</template>

<style scoped>
.home-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 14px 0 4px;
}
.home-title {
  margin: 0;
  font-size: 21px;
  font-weight: 700;
  color: var(--c-text);
}
.home-sub {
  margin: 4px 0 0;
  font-size: 12.5px;
  color: var(--c-text-2);
}
.home-theme {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-text-2);
  border-radius: 50%;
}
.home-theme:active {
  background: var(--c-primary-weak);
}

/* 总进度 */
.overview {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px;
  margin-top: 12px;
}
.overview__side {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.overview__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin: 0;
  font-size: 12px;
  color: var(--c-text-2);
}
.overview__row strong {
  font-size: 14px;
  color: var(--c-text);
  font-weight: 600;
}
.overview__row em {
  font-size: 11px;
  font-style: normal;
  font-weight: 400;
  color: var(--c-text-3);
}
.overview__row .ok {
  color: var(--c-success);
}
.overview__row .warn {
  color: var(--c-warning);
}

/* 快捷入口 */
.entries {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 10px;
}
.entry {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 10px;
  cursor: pointer;
  text-align: left;
}
.entry:active {
  transform: scale(0.99);
}
.entry__icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.entry__icon--practice {
  color: var(--c-primary);
  background: var(--c-primary-weak);
}
.entry__icon--interview {
  color: var(--c-success);
  background: var(--c-success-weak);
}
.entry__text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.entry__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text);
  white-space: nowrap;
}
.entry__desc {
  font-size: 10px;
  color: var(--c-text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 继续上次 */
.continue {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 14px;
  margin-top: 10px;
  cursor: pointer;
  border-left: 3px solid var(--c-primary);
}
.continue__body {
  min-width: 0;
}
.continue__title {
  margin: 0 0 2px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--c-text);
}
.continue__desc {
  margin: 0;
  font-size: 12px;
  color: var(--c-text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.continue__arrow {
  flex-shrink: 0;
  font-size: 16px;
  color: var(--c-primary);
}

/* 分类入口 */
.cats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.cats__item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 11px 12px;
  color: var(--c-text);
}
.cats__item:active {
  transform: scale(0.99);
}
.cats__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 6px;
}
.cats__name {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cats__count {
  flex-shrink: 0;
  font-size: 10.5px;
  color: var(--c-text-3);
}
.cats__track {
  height: 3px;
  background: var(--c-bg);
  border-radius: 2px;
  overflow: hidden;
}
.cats__fill {
  height: 100%;
  background: var(--c-primary);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.home-foot {
  margin: 16px 0 8px;
  text-align: center;
  font-size: 10.5px;
  line-height: 1.6;
}
</style>
