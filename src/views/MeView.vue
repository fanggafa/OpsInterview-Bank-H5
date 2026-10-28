<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import BarChart from '@/components/BarChart.vue'
import { useSettingsStore } from '@/stores/settingsStore'
import {
  THEMES,
  STORAGE_KEYS,
  STUDY_MODE_LABEL,
  STUDY_MODES,
  DEFAULT_STUDY_MODE,
} from '@/utils/constants'
import { useStudyStore } from '@/stores/studyStore'
import { useBankStore } from '@/stores/bankStore'
import { formatPercent } from '@/utils/format'
import { readJSON, writeJSON, isStorageAvailable } from '@/utils/storage'
import { isShort } from '@/utils/question'

const router = useRouter()
const settings = useSettingsStore()
const study = useStudyStore()
const bank = useBankStore()

const THEME_LABEL = { light: '浅色', dark: '深色', system: '跟随系统' }

// ---------- 页内二次确认（替代 window.confirm） ----------
/**
 * 为什么不用 window.confirm：
 * 微信内置浏览器、部分安卓 WebView、以及某些「禁止弹窗」的设置下，
 * window.confirm 会**静默返回 false 或直接不弹**，
 * 表现为「点了清空按钮毫无反应」——这是本页此前的真实 bug。
 * 改用页内确认条：渲染在页面上，任何环境都能显示与点击。
 */
const confirming = reactive({ records: false, favorites: false })

function askConfirm(kind) {
  // 一次只弹一个，避免两个确认条同时铺开
  confirming.records = false
  confirming.favorites = false
  confirming[kind] = true
}

function cancelConfirm(kind) {
  confirming[kind] = false
}

function confirmClearRecords() {
  study.clearRecords()
  confirming.records = false
  toast('已清空学习记录')
}

function confirmClearFavorites() {
  study.clearFavorites()
  confirming.favorites = false
  toast('已清空收藏')
}

// ---------- 轻提示 ----------
const toastText = ref('')
let toastTimer = null

function toast(text) {
  toastText.value = text
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastText.value = ''
  }, 1800)
}

// ---------- 概览数据 ----------

const masteryText = computed(() => formatPercent(study.masteryRate))
const choiceText = computed(() => formatPercent(study.choiceRate))
const favCount = computed(() => study.favorites.length)
const wrongCount = computed(() => study.wrongList.length)
const percentText = computed(() => formatPercent(study.progressRate))

/** 头部三格数据（主流 App 的「数字摘要」位置） */
const summary = computed(() => [
  { label: '已刷', value: study.reviewedCount, to: '/practice' },
  { label: '错题', value: wrongCount.value, to: '/wrong' },
  { label: '收藏', value: favCount.value, to: '/favorites' },
])

// ---------- 各分类掌握度（原统计页搬来） ----------

/** 各分类掌握度（仅简答题，与统计口径一致） */
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

// ---------- 默认练习方式 ----------

const prefMode = computed({
  get() {
    const saved = readJSON(STORAGE_KEYS.SETTINGS, {})
    return STUDY_MODES.includes(saved?.studyMode) ? saved.studyMode : DEFAULT_STUDY_MODE
  },
  set(next) {
    if (!STUDY_MODES.includes(next)) return
    const saved = readJSON(STORAGE_KEYS.SETTINGS, {})
    writeJSON(STORAGE_KEYS.SETTINGS, { ...saved, studyMode: next })
    toast(`默认模式：${STUDY_MODE_LABEL[next]}`)
  },
})

const prefOptions = computed(() =>
  STUDY_MODES.map((m) => ({ value: m, label: STUDY_MODE_LABEL[m] }))
)

// ---------- 其它 ----------

const storageOk = computed(() => isStorageAvailable())
const appVersion = '0.2.0'

/** 主题循环切换（点击一次切下一个） */
const themeText = computed(() => THEME_LABEL[settings.theme] || '跟随系统')

function cycleTheme() {
  settings.cycleTheme()
}
</script>

<template>
  <div class="page">
    <AppHeader title="我的" :back="false" />

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

    <!-- 各分类掌握度（原统计页） -->
    <h2 class="section-title">各分类掌握度<span class="section-title__tip">（仅简答题）</span></h2>
    <section class="card chart-card">
      <BarChart :items="categoryMastery" empty-text="还没有简答题的作答记录" />
    </section>

    <!-- 各分类选择题正确率 -->
    <h2 class="section-title">各分类选择正确率</h2>
    <section class="card chart-card">
      <BarChart :items="categoryChoice" empty-text="还没有选择题的作答记录" />
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

    <!-- 学习设置分组 -->
    <h2 class="section-title">学习设置</h2>
    <div class="group card">
      <!-- 默认练习方式 -->
      <div class="row row--stack">
        <div class="row__main">
          <span class="row__icon row__icon--teal" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="17" height="17">
              <path
                d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10v16H5.5A1.5 1.5 0 0 1 4 18.5v-13zM14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14V4z"
                fill="currentColor"
                opacity=".9"
              />
            </svg>
          </span>
          <div class="row__text">
            <span class="row__title">默认练习方式</span>
            <span class="row__desc">进入刷题页时默认选中</span>
          </div>
        </div>
        <div class="seg">
          <button
            v-for="opt in prefOptions"
            :key="opt.value"
            class="seg__item"
            :class="{ 'seg__item--on': prefMode === opt.value }"
            @click="prefMode = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- 主题 -->
      <button class="row" @click="cycleTheme">
        <span class="row__icon row__icon--indigo" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="17" height="17">
            <path
              d="M15 3.5a7.5 7.5 0 1 0 5.5 12.4A8.5 8.5 0 0 1 15 3.5z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <div class="row__text">
          <span class="row__title">外观主题</span>
          <span class="row__desc">点击切换浅色 / 深色 / 跟随系统</span>
        </div>
        <span class="row__value">{{ themeText }}</span>
        <span class="row__chev" aria-hidden="true">›</span>
      </button>
    </div>

    <!-- 数据管理分组 -->
    <h2 class="section-title">数据管理</h2>
    <div class="group card">
      <button class="row" @click="askConfirm('records')">
        <span class="row__icon row__icon--amber" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="17" height="17">
            <path
              d="M4 7h16M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M6.5 7l.8 11.6A1.5 1.5 0 0 0 8.8 20h6.4a1.5 1.5 0 0 0 1.5-1.4L17.5 7"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
            />
          </svg>
        </span>
        <div class="row__text">
          <span class="row__title">清空学习记录</span>
          <span class="row__desc">已刷状态、掌握率、进度一并清除</span>
        </div>
        <span class="row__value">{{ study.reviewedCount }} 题</span>
        <span class="row__chev" aria-hidden="true">›</span>
      </button>

      <div v-if="confirming.records" class="confirm" role="alertdialog">
        <p class="confirm__text">
          确定清空全部学习记录？<br />
          <span class="muted">此操作不可恢复。</span>
        </p>
        <div class="confirm__actions">
          <button class="btn btn--plain btn--sm" @click="cancelConfirm('records')">取消</button>
          <button class="btn btn--danger btn--sm" @click="confirmClearRecords">确定清空</button>
        </div>
      </div>

      <button
        class="row"
        :disabled="!favCount"
        :class="{ 'row--disabled': !favCount }"
        @click="askConfirm('favorites')"
      >
        <span class="row__icon row__icon--rose" aria-hidden="true">
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
          <span class="row__title">清空收藏</span>
          <span class="row__desc">手动标记的重点题</span>
        </div>
        <span class="row__value">{{ favCount }} 题</span>
        <span class="row__chev" aria-hidden="true">›</span>
      </button>

      <div v-if="confirming.favorites" class="confirm" role="alertdialog">
        <p class="confirm__text">确定清空全部收藏？（{{ favCount }} 题）</p>
        <div class="confirm__actions">
          <button class="btn btn--plain btn--sm" @click="cancelConfirm('favorites')">取消</button>
          <button class="btn btn--danger btn--sm" @click="confirmClearFavorites">确定清空</button>
        </div>
      </div>
    </div>

    <!-- 关于 -->
    <h2 class="section-title">关于</h2>
    <div class="group card">
      <div class="row row--static">
        <div class="row__text">
          <span class="row__title">版本</span>
        </div>
        <span class="row__value">v{{ appVersion }}</span>
      </div>
      <div class="row row--static">
        <div class="row__text">
          <span class="row__title">存储方式</span>
        </div>
        <span class="row__value">{{ storageOk ? '本机 localStorage' : '不可用' }}</span>
      </div>
      <div class="row row--static">
        <div class="row__text">
          <span class="row__title">题库</span>
        </div>
        <span class="row__value">{{ bank.total }} 题 · 23 分类</span>
      </div>
    </div>

    <p class="foot muted">
      数据只存在本机浏览器，清除浏览器数据或换设备会丢失。
    </p>

    <!-- 轻提示 -->
    <Transition name="toast">
      <div v-if="toastText" class="toast" role="status">{{ toastText }}</div>
    </Transition>
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
.row--stack {
  flex-direction: column;
  align-items: stretch;
  gap: 9px;
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
.seg {
  display: flex;
  padding: 3px;
  gap: 3px;
  border-radius: 9px;
  background: var(--c-bg);
}
.seg__item {
  flex: 1;
  height: 32px;
  padding: 0 12px;
  border-radius: 7px;
  font-size: 12.5px;
  color: var(--c-text-2);
}
.seg__item--on {
  background: var(--c-primary);
  color: #fff;
  font-weight: 500;
}

/* ---------- 页内确认条 ---------- */
.confirm {
  padding: 11px 0 13px;
  border-bottom: 1px solid var(--c-border);
}
.confirm__text {
  margin: 0 0 9px;
  font-size: 12.5px;
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

/* ---------- 页脚 ---------- */
.foot {
  margin: 16px 2px 8px;
  font-size: 10.5px;
  line-height: 1.7;
  text-align: center;
}

/* ---------- 轻提示 ---------- */
.toast {
  position: fixed;
  left: 50%;
  bottom: calc(var(--tabbar-h) + var(--safe-bottom) + 16px);
  transform: translateX(-50%);
  padding: 8px 16px;
  border-radius: 18px;
  font-size: 12.5px;
  color: #fff;
  background: rgba(0, 0, 0, 0.78);
  z-index: 60;
  pointer-events: none;
}
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(6px);
}
</style>
