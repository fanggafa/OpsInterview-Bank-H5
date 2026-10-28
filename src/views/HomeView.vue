<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Ring from '@/components/Ring.vue'
import DifficultyBadge from '@/components/DifficultyBadge.vue'
import FrequencyBadge from '@/components/FrequencyBadge.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { formatPercent, isToday, truncate } from '@/utils/format'
import { pickDailyQuestion } from '@/utils/daily'
import { STATUS, TYPE_LABEL } from '@/utils/constants'
import { getType } from '@/utils/question'

const bank = useBankStore()
const study = useStudyStore()
const settings = useSettingsStore()
const router = useRouter()

/** 右上角：点击直接切换主题（浅 ⇄ 深），不再跳「我的」页 */
const themeLabel = computed(() => (settings.isDark ? '切换到浅色主题' : '切换到深色主题'))

function toggleTheme() {
  settings.setTheme(settings.isDark ? 'light' : 'dark')
}

onMounted(() => {
  bank.load().catch(() => {})
})

/** 今日是否有刷题记录 */
const todayDone = computed(() => study.todayReviewedCount > 0)

/** 掌握率只统计简答题（PRD §五.4） */
const masteryText = computed(() => formatPercent(study.masteryRate))
const choiceText = computed(() => formatPercent(study.choiceRate))

/**
 * 每日一题。
 *
 * 替代原来的「按分类刷题」列表：那个列表只是把「我的」页已有的分类进度
 * 再画一遍，而且点任何一个都跳到同一个刷题页（只是带了 category 参数），
 * 信息量低、动作重复。
 *
 * 每日一题给的是「今天来做什么」这一个具体动作：
 * - 同一天固定一题（日期做种子），不是随机刷新
 * - 直接进题目详情页（能看解析、能收藏），与刷题页不重复
 * - 今天答过就显示结果，形成「每天来答一道」的节奏
 */
const daily = computed(() => pickDailyQuestion(bank.questions))

const dailyTypeLabel = computed(() => (daily.value ? TYPE_LABEL[getType(daily.value)] : ''))

/** 今天这道题的作答状态（只看今天，不把上周的结果算进来） */
const dailyState = computed(() => {
  const q = daily.value
  if (!q) return { label: '今日一题', answered: false, status: null }
  const rec = study.recordOf(q.id)
  if (!rec || !isToday(rec.lastReviewed)) return { label: '今日一题', answered: false, status: null }

  const passed = rec.status === STATUS.KNOW
  const isChoice = getType(q) !== 'short'
  return {
    label: isChoice ? (passed ? '今天答对了' : '今天答错了') : passed ? '今天标记为「会」' : '今天标记为「不会」',
    answered: true,
    status: rec.status,
  }
})

/** 题干摘要：卡片只放一行半，太长会把下面的内容顶出首屏 */
const dailySummary = computed(() => (daily.value ? truncate(daily.value.question, 46) : ''))

/** 卡片右上角的日期，让「每日」这个语义看得出来 */
const dateText = computed(() => {
  const d = new Date()
  return `${d.getMonth() + 1}月${d.getDate()}日`
})

function openDaily() {
  if (daily.value) router.push(`/question/${daily.value.id}`)
}
</script>

<template>
  <div class="page">
    <!-- 头部：渐变主卡 -->
    <header class="hero">
      <div class="hero__glow" aria-hidden="true" />
      <div class="hero__top">
        <div>
          <h1 class="hero__title">运维面试题库</h1>
          <p class="hero__sub">
            {{ todayDone ? `今天已经刷了 ${study.todayReviewedCount} 题，继续保持` : '碎片时间，背完这些题' }}
          </p>
        </div>
        <button
          class="hero__btn"
          :aria-label="themeLabel"
          :title="themeLabel"
          @click="toggleTheme"
        >
          <!-- 深色模式显示太阳（点了变浅色），浅色模式显示月亮 -->
          <svg v-if="settings.isDark" viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
            <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8" />
            <path
              d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
            <path
              d="M20.5 14.2A8.6 8.6 0 0 1 9.8 3.5a8.6 8.6 0 1 0 10.7 10.7z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>

      <div class="hero__stats">
        <div class="hero__ring">
          <Ring :percent="study.progressRate" :size="82" label="总进度" />
        </div>
        <div class="hero__side">
          <div class="hero__stat">
            <span>已刷</span>
            <strong>{{ study.reviewedCount }}<em> / {{ bank.total }}</em></strong>
          </div>
          <div class="hero__stat">
            <span>简答掌握</span>
            <strong>{{ masteryText }}</strong>
          </div>
          <div class="hero__stat">
            <span>选择正确</span>
            <strong>{{ choiceText }}</strong>
          </div>
        </div>
      </div>
    </header>

    <!-- 继续刷题：一个明确的行动入口，首页不再只是看数据 -->
    <button class="cta" @click="router.push('/practice')">
      <span class="cta__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M13 3 5 14h5l-1 7 8-11h-5l1-7z" fill="currentColor" />
        </svg>
      </span>
      <span class="cta__text">
        <span class="cta__title">{{ todayDone ? '继续刷题' : '开始刷题' }}</span>
        <span class="cta__desc">
          {{ todayDone ? `今天已刷 ${study.todayReviewedCount} 题` : '选刷题或背题模式开始' }}
        </span>
      </span>
      <span class="cta__arrow" aria-hidden="true">→</span>
    </button>

    <!-- 每日一题：给一个「今天具体做什么」的动作，替代原来的分类列表 -->
    <h2 class="section-title">每日一题</h2>
    <button v-if="daily" class="daily card" @click="openDaily">
      <div class="daily__head">
        <span class="daily__tag" :class="`daily__tag--${dailyState.status || 'fresh'}`">
          {{ dailyState.label }}
        </span>
        <span class="daily__date">{{ dateText }}</span>
      </div>

      <p class="daily__q">{{ dailySummary }}</p>

      <div class="daily__meta">
        <span class="badge daily__cat">{{ daily.category }}</span>
        <span class="badge daily__type">{{ dailyTypeLabel }}</span>
        <DifficultyBadge :difficulty="daily.difficulty" />
        <FrequencyBadge :frequency="daily.frequency" />
      </div>

      <div class="daily__foot">
        <span class="daily__hint">
          {{ dailyState.answered ? '今天已作答，可再看一遍解析' : '点开作答，答完看解析' }}
        </span>
        <span class="daily__arrow" aria-hidden="true">→</span>
      </div>
    </button>

    <p class="home-foot">
      共 {{ bank.total }} 题（简答 {{ study.shortTotal }} · 选择 {{ study.choiceTotal }}）
      · 记录保存在本机
    </p>
  </div>
</template>

<style scoped>
/* ---------- 渐变主卡 ---------- */
.hero {
  position: relative;
  overflow: hidden;
  margin-top: 10px;
  padding: 16px 16px 14px;
  border-radius: 16px;
  background: var(--grad-hero);
  box-shadow: var(--shadow-lift);
  color: #fff;
}
/* 右上角光晕 */
.hero__glow {
  position: absolute;
  top: -46px;
  right: -30px;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.34) 0%, rgba(255, 255, 255, 0) 68%);
  pointer-events: none;
}
.hero__top {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}
.hero__title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.2px;
}
.hero__sub {
  margin: 5px 0 0;
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.82);
}
.hero__btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(4px);
}
.hero__btn:active {
  background: rgba(255, 255, 255, 0.28);
}

.hero__stats {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 14px;
  padding: 11px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(6px);
}
.hero__ring {
  --ring-hole-bg: rgba(255, 255, 255, 0.95);
  --ring-color: var(--c-primary);
  --ring-track: rgba(255, 255, 255, 0.35);
}
.hero__ring :deep(.ring__text) {
  color: var(--c-text);
}
.hero__ring :deep(.ring__label) {
  color: var(--c-text-3);
}
.hero__side {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.hero__stat {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
}
.hero__stat strong {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  font-variant-numeric: tabular-nums;
}
.hero__stat em {
  font-size: 11px;
  font-style: normal;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.66);
}

/* ---------- 继续刷题入口 ---------- */
.cta {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  margin-top: 10px;
  padding: 13px 14px;
  border-radius: var(--radius);
  border: 1px solid var(--c-border);
  background: var(--c-card);
  background-image: var(--grad-card);
  box-shadow: var(--shadow-card);
  text-align: left;
  transition: transform 0.14s ease, box-shadow 0.14s ease;
}
.cta:active {
  transform: scale(0.985);
  box-shadow: var(--shadow-lift);
}
.cta__icon {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: var(--grad-indigo);
}
.cta__text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.cta__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text);
}
.cta__desc {
  font-size: 11px;
  color: var(--c-text-3);
}
.cta__arrow {
  flex-shrink: 0;
  font-size: 16px;
  color: var(--c-primary);
}

/* ---------- 每日一题 ---------- */
.daily {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  padding: 14px;
  text-align: left;
  color: var(--c-text);
  border: 1px solid var(--c-border);
  background-image: var(--grad-card);
  transition: transform 0.14s ease, box-shadow 0.14s ease;
}
.daily:active {
  transform: scale(0.985);
  box-shadow: var(--shadow-lift);
}
.daily__head {
  display: flex;
  align-items: center;
  gap: 8px;
}
/* 状态胶囊：今日未答是主色，答过之后转绿/转红，一眼看出今天做没做 */
.daily__tag {
  flex-shrink: 0;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--c-primary);
  background: var(--c-primary-weak);
}
.daily__tag--know {
  color: var(--c-success);
  background: var(--c-success-weak);
}
.daily__tag--unknown {
  color: var(--c-danger);
  background: var(--c-danger-weak);
}
.daily__date {
  margin-left: auto;
  font-size: 11px;
  color: var(--c-text-3);
  font-variant-numeric: tabular-nums;
}

.daily__q {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.55;
  color: var(--c-text);
}

.daily__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
}
.daily__cat {
  color: var(--c-text-2);
  background: var(--c-bg);
}
.daily__type {
  color: var(--c-primary);
  background: var(--c-primary-weak);
}

.daily__foot {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 9px;
  border-top: 1px solid var(--c-border);
}
.daily__hint {
  flex: 1;
  font-size: 11.5px;
  color: var(--c-text-3);
}
.daily__arrow {
  flex-shrink: 0;
  font-size: 15px;
  color: var(--c-primary);
}

.home-foot {
  margin: 16px 0 8px;
  text-align: center;
  font-size: 10.5px;
  line-height: 1.6;
  color: var(--c-text-3);
}
</style>
