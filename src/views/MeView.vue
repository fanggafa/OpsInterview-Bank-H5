<script setup>
import { computed } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import { useStudyStore } from '@/stores/studyStore'
import { useBankStore } from '@/stores/bankStore'
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

/**
 * 头部三格数据：**纯展示，不再做跳转**。
 *
 * 2026-11 错题本/收藏入口搬到首页后，这三格若仍链到 /wrong 与 /favorites，
 * 等于「我的」页又偷偷留了入口，与「本页只做数据看板」的定位矛盾。
 * 数字留在这一页，去哪儿看题由首页负责。
 */
const summary = computed(() => [
  { label: '已刷', value: study.reviewedCount },
  { label: '错题', value: wrongCount.value },
  { label: '收藏', value: favCount.value },
])

/*
 * 2026-11：移除了两张按分类细分的图表。
 *
 * ① 按分类的选择正确率图表
 * ② 按分类的简答题掌握度图表
 *
 * 第二张是在本轮移除的：它被合并进了首页「分类熟练度」页 ——
 * 那边用「左边选择题、右边简答题」的双列对照展示，
 * 比这里的单列柱状图信息更全，也没必要在两个页面重复同一份数据。
 *
 * 全局的「简答掌握率」「选择正确率」指标（tile）仍然保留 ——
 * 那是用户最关心的一句话结论，不属于「按分类细分」。
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
        <div v-for="s in summary" :key="s.label" class="profile__stat">
          <span class="profile__num">{{ s.value }}</span>
          <span class="profile__label">{{ s.label }}</span>
        </div>
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
