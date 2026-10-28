<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Ring from '@/components/Ring.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { formatPercent } from '@/utils/format'
import { STORAGE_KEYS, categoryColor } from '@/utils/constants'

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

/** 分类入口：按题库实际分类动态生成，带各自进度与专属颜色 */
const categories = computed(() => {
  const statsMap = new Map(study.categoryStats.map((s) => [s.category, s]))
  const counts = {}
  bank.questions.forEach((q) => {
    counts[q.category] = (counts[q.category] || 0) + 1
  })

  return Object.keys(counts).map((name) => {
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

/** 今日是否有刷题记录 */
const todayDone = computed(() => study.todayReviewedCount > 0)

/** 掌握率只统计简答题（PRD §五.4） */
const masteryText = computed(() => formatPercent(study.masteryRate))
const choiceText = computed(() => formatPercent(study.choiceRate))
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

    <!-- 按分类刷题 -->
    <h2 class="section-title">按分类刷题</h2>
    <div class="cats">
      <router-link
        v-for="cat in categories"
        :key="cat.name"
        :to="{ path: '/practice', query: { category: cat.name } }"
        class="cats__item"
        :style="{ '--cat-color': categoryColor(cat.name) }"
      >
        <div class="cats__head">
          <span class="cats__dot" aria-hidden="true" />
          <span class="cats__name">{{ cat.name }}</span>
          <span class="cats__count">{{ cat.reviewed }}/{{ cat.total }}</span>
        </div>
        <div class="cats__track">
          <div class="cats__fill" :style="{ width: (cat.percent || 0) + '%' }" />
        </div>
      </router-link>
    </div>

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

/* ---------- 分类卡片 ---------- */
.cats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.cats__item {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 11px 12px;
  border-radius: var(--radius);
  border: 1px solid var(--c-border);
  background: var(--c-card);
  box-shadow: var(--shadow-card);
  color: var(--c-text);
  transition: transform 0.14s ease, border-color 0.14s ease;
}
.cats__item:active {
  transform: scale(0.985);
  border-color: var(--cat-color);
}
.cats__head {
  display: flex;
  align-items: center;
  gap: 6px;
}
.cats__dot {
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--cat-color);
}
.cats__name {
  flex: 1;
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
  font-variant-numeric: tabular-nums;
}
.cats__track {
  height: 4px;
  border-radius: 2px;
  background: var(--c-bg);
  overflow: hidden;
}
.cats__fill {
  height: 100%;
  border-radius: 2px;
  background: var(--cat-color);
  transition: width 0.35s ease;
}

.home-foot {
  margin: 16px 0 8px;
  text-align: center;
  font-size: 10.5px;
  line-height: 1.6;
  color: var(--c-text-3);
}
</style>
