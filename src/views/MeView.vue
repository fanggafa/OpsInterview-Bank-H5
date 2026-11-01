<script setup>
import { computed, ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import BarChart from '@/components/BarChart.vue'
import { useStudyStore } from '@/stores/studyStore'
import { useBankStore } from '@/stores/bankStore'
import { CATEGORIES } from '@/utils/constants'
import { formatPercent } from '@/utils/format'

/**
 * 「我的」页：只做「看我自己的数据 + 快速进入错题/收藏」。
 *
 * 外观主题、默认练习方式、清空数据这些配置项都移到了 /settings，
 * 页头右上角一个齿轮按钮进入——避免主页面被设置项撑得太长。
 */

const study = useStudyStore()
const bank = useBankStore()

const masteryText = computed(() => formatPercent(study.masteryRate))
const choiceText = computed(() => formatPercent(study.choiceRate))
const favCount = computed(() => study.favorites.length)
const wrongCount = computed(() => study.wrongList.length)
const percentText = computed(() => formatPercent(study.progressRate))

/** 头部三格数据 */
const summary = computed(() => [
  { label: '已刷', value: study.reviewedCount, to: '/practice' },
  { label: '错题', value: wrongCount.value, to: '/wrong' },
  { label: '收藏', value: favCount.value, to: '/favorites' },
])

/** 分类图表默认折叠（页面太长，点开再看细节） */
const expandedMastery = ref(false)

/**
 * 各分类掌握度（仅简答题）。
 *
 * **顺序跟随题库页的分类筛选顺序**（`CATEGORIES` 的业务优先级），
 * 而不是 `categoryStats` 的原始顺序（那是按题库遍历出来的，实际是 id 顺序）。
 * 两个页面用同一套顺序，用户在两处看到的分类排列才不会跳来跳去。
 */
const categoryMastery = computed(() => {
  const map = new Map(study.categoryStats.map((s) => [s.category, s]))
  return CATEGORIES.filter((c) => {
    const s = map.get(c)
    return s && s.shortTotal > 0
  }).map((c) => {
    const s = map.get(c)
    return {
      label: c,
      count: s.know,
      total: s.know + s.unknown,
      percent: s.mastery,
    }
  })
})

/*
 * 2026-11：移除了「各分类选择正确率」图表（连同 categoryChoice 与 expandedChoice）。
 * 全局的「选择正确率」指标（tile）仍然保留 —— 那是学员最关心的一句话结论；
 * 去掉的只是按分类细分的第二张柱状图。
 */
</script>

<template>
  <div class="page">
    <AppHeader title="我的" :back="false">
      <template #right>
        <router-link to="/settings" class="me__settings" aria-label="设置">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
            />
            <path
              d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linejoin="round"
            />
          </svg>
        </router-link>
      </template>
    </AppHeader>

    <!-- 个人卡：头像 + 总体进度 + 三格数字 -->
    <section class="profile">
      <div class="profile__top">
        <div class="profile__avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="26" height="26">
            <path
              d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <div class="profile__info">
          <p class="profile__name">运维刷题备考</p>
          <p class="profile__sub">
            总进度 {{ percentText }} · {{ study.reviewedCount }} / {{ bank.total }} 题
          </p>
        </div>
      </div>

      <div class="profile__stats">
        <router-link v-for="s in summary" :key="s.label" :to="s.to" class="profile__stat">
          <span class="profile__num">{{ s.value }}</span>
          <span class="profile__label">{{ s.label }}</span>
        </router-link>
      </div>
    </section>

    <!-- 数据概览（纯展示，统计页已并入本页） -->
    <h2 class="section-title">掌握情况</h2>
    <div class="grid">
      <div class="tile card">
        <span class="tile__label">简答掌握率</span>
        <span class="tile__value">{{ masteryText }}</span>
      </div>
      <div class="tile card">
        <span class="tile__label">选择正确率</span>
        <span class="tile__value">{{ choiceText }}</span>
      </div>
      <div class="tile card">
        <span class="tile__label">今日已刷</span>
        <span class="tile__value">{{ study.todayReviewedCount }}<em>题</em></span>
      </div>
      <div class="tile card">
        <span class="tile__label">题库总量</span>
        <span class="tile__value">{{ bank.total }}<em>题</em></span>
      </div>
    </div>

    <!-- 各分类掌握度：默认折叠，点标题展开（卡片式折叠条，与其它卡片同一套视觉） -->
    <button
      class="collapse"
      :class="{ 'collapse--open': expandedMastery }"
      :aria-expanded="expandedMastery"
      @click="expandedMastery = !expandedMastery"
    >
      <span class="collapse__title">
        <span class="collapse__icon collapse__icon--indigo" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="15" height="15">
            <rect x="4" y="12" width="4" height="8" rx="1" fill="currentColor" opacity=".5" />
            <rect x="10" y="8" width="4" height="12" rx="1" fill="currentColor" opacity=".75" />
            <rect x="16" y="4" width="4" height="16" rx="1" fill="currentColor" />
          </svg>
        </span>
        各分类掌握度
        <span class="collapse__tip">（仅简答题）</span>
      </span>
      <span class="collapse__chev" :class="{ 'collapse__chev--up': expandedMastery }" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    </button>
    <section v-if="expandedMastery" class="card chart-card chart-card--attached">
      <BarChart :items="categoryMastery" empty-text="还没有简答题的作答记录" />
    </section>

    <!-- 错题本 / 收藏入口 -->
    <h2 class="section-title">我的题目</h2>
    <div class="group card">
      <router-link to="/wrong" class="row">
        <span class="row__icon row__icon--rose" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="17" height="17">
            <path
              d="M12 7v6M12 16.5v.5M4.5 12a7.5 7.5 0 1 0 15 0 7.5 7.5 0 0 0-15 0z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
            />
          </svg>
        </span>
        <div class="row__text">
          <span class="row__title">错题本</span>
          <span class="row__desc">答错 / 自评「不会」的题</span>
        </div>
        <span class="row__value">{{ wrongCount }} 题</span>
        <span class="row__chev" aria-hidden="true">›</span>
      </router-link>

      <router-link to="/favorites" class="row">
        <span class="row__icon row__icon--amber" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="17" height="17">
            <path
              d="M12 3.5l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 10l6.1-.9z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <div class="row__text">
          <span class="row__title">我的收藏</span>
          <span class="row__desc">手动标记的重点题</span>
        </div>
        <span class="row__value">{{ favCount }} 题</span>
        <span class="row__chev" aria-hidden="true">›</span>
      </router-link>
    </div>

    <!-- 设置入口：外观 / 默认练习方式 / 数据管理都收进设置页。
         外层用 .group 包裹（与「我的题目」完全相同的容器），
         避免「独立 card + 自己加 padding」把卡片撑宽、与上面的卡对不齐。 -->
    <div class="group card">
      <router-link to="/settings" class="row">
        <span class="row__icon row__icon--indigo" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="17" height="17">
            <path
              d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
            />
            <path
              d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <div class="row__text">
          <span class="row__title">设置</span>
          <span class="row__desc">外观主题 · 默认练习方式 · 清空数据</span>
        </div>
        <span class="row__chev" aria-hidden="true">›</span>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
/* ---------- 个人卡 ---------- */
.profile {
  margin-top: 10px;
  padding: 16px;
  border-radius: var(--radius);
  background: var(--grad-hero);
  box-shadow: var(--shadow-lift);
  color: #fff;
}
.profile__top {
  display: flex;
  align-items: center;
  gap: 12px;
}
.profile__avatar {
  flex-shrink: 0;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.32);
}
.profile__info {
  min-width: 0;
}
.profile__name {
  margin: 0 0 3px;
  font-size: 15.5px;
  font-weight: 700;
}
.profile__sub {
  margin: 0;
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.78);
}

.profile__stats {
  display: flex;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.18);
}
.profile__stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: #fff;
}
.profile__stat + .profile__stat {
  border-left: 1px solid rgba(255, 255, 255, 0.16);
}
.profile__num {
  font-size: 17px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.profile__label {
  font-size: 10.5px;
  color: rgba(255, 255, 255, 0.72);
}

/* ---------- 四宫格 ---------- */
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.tile {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 13px;
  color: var(--c-text);
}

/* 图表卡（分类掌握度） */
.chart-card {
  padding: 14px 14px 8px;
}

/* 页头右上角的设置入口 */
.me__settings {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-text-2);
  border-radius: 50%;
}
.me__settings:active {
  background: var(--c-primary-weak);
}

/**
 * 可折叠标题（分类掌握度 / 选择正确率）。
 *
 * 这两块原来只是一行文字 + 箭头，视觉上像「普通小标题」，
 * 和上面的卡片、下面的「我的题目」不成体系。
 * 现在做成卡片样式的折叠条：带边框/底色/图标，与其它卡片同一套视觉语言。
 */
.collapse {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  min-height: 52px;
  margin-top: 8px;
  padding: 0 14px;
  border-radius: var(--radius);
  border: 1px solid var(--c-border);
  background: var(--c-card);
  box-shadow: var(--shadow-card);
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text);
  text-align: left;
}
.collapse:active {
  background: var(--c-bg);
}
/* 展开后与下方图表连成一体：底部去掉圆角与分隔线 */
.collapse--open {
  margin-bottom: 0;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom-color: transparent;
}
.collapse__title {
  display: flex;
  align-items: baseline;
  gap: 5px;
  min-width: 0;
}
.collapse__tip {
  font-size: 11px;
  font-weight: 400;
  color: var(--c-text-3);
}
.collapse__icon {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.collapse__icon--indigo {
  color: var(--c-primary);
  background: var(--c-primary-weak);
}
.collapse__icon--teal {
  color: var(--c-tag-teal, #0d9488);
  background: rgba(13, 148, 136, 0.12);
}
.collapse__chev {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  color: var(--c-text-3);
  transition: transform 0.2s ease;
}
.collapse__chev--up {
  transform: rotate(180deg);
}
/* 展开后的图表卡：与折叠条贴合 */
.chart-card--attached {
  margin-top: 0;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-top-color: transparent;
}

/**
 * 设置入口行（单独一张卡）。
 *
 * 注意：`.row` 的左右 padding 是 0——它原本设计为放在 `.group` 里，
 * 由 `.group` 提供 14px 内边距。这里的行是「独立一张卡」，没有 group 包着，
 * 所以必须自己补上左右 14px，否则图标会贴着卡片左边缘（截图里就是这样）。
 */
/* 设置入口现在用 .group 包裹（与「我的题目」同一容器），
   不需要单独的 .row--entry —— 曾用「独立 card + 自己加 padding」的方式，
   结果卡片比上面那张宽出 28px（2×14px），与截图里对不齐的现象一致。 */
.tile__label {
  font-size: 11.5px;
  color: var(--c-text-3);
}
.tile__value {
  font-size: 19px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}
.tile__value em {
  margin-left: 2px;
  font-size: 11px;
  font-style: normal;
  font-weight: 400;
  color: var(--c-text-3);
}

/* ---------- 分组列表 ---------- */
.group {
  padding: 0 14px;
  overflow: hidden;
}
.row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 56px;
  padding: 10px 0;
  border-bottom: 1px solid var(--c-border);
  text-align: left;
  color: var(--c-text);
}
.row:last-child {
  border-bottom: none;
}
.row:active {
  background: var(--c-bg);
}
.row--static {
  cursor: default;
}
.row--static:active {
  background: none;
}
.row--disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.row__main {
  display: flex;
  align-items: center;
  gap: 10px;
}

.row__icon {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.row__icon--teal {
  color: var(--c-tag-teal, #0d9488);
  background: rgba(13, 148, 136, 0.12);
}
.row__icon--indigo {
  color: var(--c-primary);
  background: var(--c-primary-weak);
}
.row__icon--amber {
  color: var(--c-warning);
  background: rgba(250, 173, 20, 0.14);
}
.row__icon--rose {
  color: var(--c-danger);
  background: var(--c-danger-weak);
}

.row__text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.row__title {
  font-size: 13.5px;
  font-weight: 500;
}
.row__desc {
  font-size: 10.5px;
  color: var(--c-text-3);
}
.row__value {
  flex-shrink: 0;
  font-size: 12.5px;
  color: var(--c-text-3);
}
.row__chev {
  flex-shrink: 0;
  font-size: 16px;
  color: var(--c-text-3);
  line-height: 1;
}

/* ---------- 分段选择 ---------- */

/* ---------- 页内确认条 ---------- */

/* ---------- 页脚 ---------- */

/* ---------- 轻提示 ---------- */
</style>
