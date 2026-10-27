<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import Ring from '@/components/Ring.vue'
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

const router = useRouter()
const settings = useSettingsStore()
const study = useStudyStore()
const bank = useBankStore()

const THEME_LABEL = { light: '浅色', dark: '深色', system: '跟随系统' }

const themeOptions = computed(() => THEMES.map((t) => ({ value: t, label: THEME_LABEL[t] })))

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

// ---------- 数据概览 ----------

const masteryText = computed(() => formatPercent(study.masteryRate))
const choiceText = computed(() => formatPercent(study.choiceRate))

const statsCards = computed(() => [
  { label: '已刷题', value: study.reviewedCount, unit: `/ ${bank.total || '—'}`, to: '/stats' },
  { label: '掌握率', value: masteryText.value, unit: '简答', to: '/stats' },
  { label: '正确率', value: choiceText.value, unit: '选择', to: '/stats' },
  { label: '今日', value: study.todayReviewedCount, unit: '题', to: '/practice' },
])

const favCount = computed(() => study.favorites.length)
const wrongCount = computed(() => study.wrongList.length)

// ---------- 默认练习模式偏好 ----------

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

// ---------- 其他 ----------

const storageOk = computed(() => isStorageAvailable())

const appVersion = '0.1.0'

function goPractice(mode) {
  router.push({ path: '/practice', query: mode ? { studyMode: mode } : {} })
}
</script>

<template>
  <div class="page">
    <AppHeader title="我的" :back="false" />

    <!-- 数据概览：四个数字 + 总进度环 -->
    <section class="overview card">
      <div class="overview__ring">
        <Ring :percent="study.progressRate" :size="72" label="总进度" />
      </div>
      <div class="overview__grid">
        <router-link
          v-for="s in statsCards"
          :key="s.label"
          :to="s.to"
          class="overview__cell"
        >
          <span class="overview__value">{{ s.value }}<em>{{ s.unit }}</em></span>
          <span class="overview__label">{{ s.label }}</span>
        </router-link>
      </div>
    </section>

    <!-- 快捷入口 -->
    <h2 class="section-title">快捷入口</h2>
    <div class="quick card">
      <button class="quick__item quick__item--practice" @click="goPractice('practice')">
        <span class="quick__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="19" height="19">
            <path d="M13 3 5 14h5l-1 7 8-11h-5l1-7z" fill="currentColor" />
          </svg>
        </span>
        <span class="quick__text">
          <span class="quick__title">开始刷题</span>
          <span class="quick__desc">全部题 · 简答自评 / 选择作答</span>
        </span>
      </button>
      <button class="quick__item quick__item--memorize" @click="goPractice('memorize')">
        <span class="quick__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="19" height="19">
            <path
              d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10v16H5.5A1.5 1.5 0 0 1 4 18.5v-13zM14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14V4z"
              fill="currentColor"
              opacity=".85"
            />
          </svg>
        </span>
        <span class="quick__text">
          <span class="quick__title">背题模式</span>
          <span class="quick__desc">只有简答题 · 看题背答案</span>
        </span>
      </button>
      <router-link to="/wrong" class="quick__item">
        <span class="quick__badge quick__badge--danger">{{ wrongCount }}</span>
        <span class="quick__text">
          <span class="quick__title">错题本</span>
          <span class="quick__desc">答错 / 自评不会的题</span>
        </span>
        <span class="quick__arrow" aria-hidden="true">→</span>
      </router-link>
      <router-link to="/favorites" class="quick__item">
        <span class="quick__badge">{{ favCount }}</span>
        <span class="quick__text">
          <span class="quick__title">收藏</span>
          <span class="quick__desc">手动标记的重点题</span>
        </span>
        <span class="quick__arrow" aria-hidden="true">→</span>
      </router-link>
    </div>

    <!-- 外观 -->
    <h2 class="section-title">外观</h2>
    <div class="seg card">
      <button
        v-for="opt in themeOptions"
        :key="opt.value"
        class="seg__item"
        :class="{ 'seg__item--on': settings.theme === opt.value }"
        @click="settings.setTheme(opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>

    <!-- 默认练习方式 -->
    <h2 class="section-title">默认练习方式</h2>
    <div class="seg card">
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
    <p class="note muted">进入刷题页时默认选中该模式，也可在刷题页随时切换。</p>

    <!-- 数据管理 -->
    <h2 class="section-title">数据管理</h2>
    <div class="card list">
      <div class="list__row">
        <span>学习记录</span>
        <span class="muted">{{ study.reviewedCount }} 题</span>
      </div>
      <button class="list__row list__row--action" @click="askConfirm('records')">
        <span class="danger">清空学习记录</span>
        <span class="list__arrow" aria-hidden="true">›</span>
      </button>

      <!-- 页内确认：不依赖 window.confirm，微信/WebView 里也能用 -->
      <div v-if="confirming.records" class="confirm" role="alertdialog">
        <p class="confirm__text">
          确定清空全部学习记录？<br />
          <span class="muted">已刷状态、掌握率、进度会一并清除，不可恢复。</span>
        </p>
        <div class="confirm__actions">
          <button class="btn btn--plain btn--sm" @click="cancelConfirm('records')">取消</button>
          <button class="btn btn--danger btn--sm" @click="confirmClearRecords">确定清空</button>
        </div>
      </div>

      <div class="list__row">
        <span>收藏</span>
        <span class="muted">{{ favCount }} 题</span>
      </div>
      <button
        class="list__row list__row--action"
        :disabled="!favCount"
        :class="{ 'list__row--disabled': !favCount }"
        @click="askConfirm('favorites')"
      >
        <span class="danger">清空收藏</span>
        <span class="list__arrow" aria-hidden="true">›</span>
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
    <div class="card list">
      <div class="list__row">
        <span>应用</span>
        <span class="muted">运维面试题库 v{{ appVersion }}</span>
      </div>
      <div class="list__row">
        <span>数据存储</span>
        <span class="muted">{{ storageOk ? '浏览器本地（localStorage）' : '不可用（隐私模式）' }}</span>
      </div>
      <div class="list__row">
        <span>题库规模</span>
        <span class="muted">{{ bank.total || '—' }} 题</span>
      </div>
    </div>

    <p class="foot muted">
      数据只存在本机浏览器，清除浏览器数据或换设备会丢失。<br />
      建议定期到「统计」页核对进度。
    </p>

    <!-- 轻提示 -->
    <Transition name="toast">
      <div v-if="toastText" class="toast" role="status">{{ toastText }}</div>
    </Transition>
  </div>
</template>

<style scoped>
/* ---------- 概览 ---------- */
.overview {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
}
.overview__ring {
  flex-shrink: 0;
}
.overview__grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 10px;
  min-width: 0;
}
.overview__cell {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  color: var(--c-text);
}
.overview__value {
  font-size: 15px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.3;
}
.overview__value em {
  margin-left: 2px;
  font-size: 10.5px;
  font-style: normal;
  font-weight: 400;
  color: var(--c-text-3);
}
.overview__label {
  font-size: 10.5px;
  color: var(--c-text-3);
}

/* ---------- 快捷入口 ---------- */
.quick {
  padding: 0;
  overflow: hidden;
}
.quick__item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 54px;
  padding: 10px 13px;
  border-bottom: 1px solid var(--c-border);
  text-align: left;
  color: var(--c-text);
}
.quick__item:last-child {
  border-bottom: none;
}
.quick__icon {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.quick__item--practice .quick__icon {
  background: var(--grad-indigo);
}
.quick__item--memorize .quick__icon {
  background: var(--grad-teal);
}
.quick__badge {
  flex-shrink: 0;
  min-width: 30px;
  height: 30px;
  padding: 0 7px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--c-primary);
  background: var(--c-primary-weak);
}
.quick__badge--danger {
  color: var(--c-danger);
  background: var(--c-danger-weak);
}
.quick__text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.quick__title {
  font-size: 13.5px;
  font-weight: 600;
}
.quick__desc {
  font-size: 10.5px;
  color: var(--c-text-3);
}
.quick__arrow {
  flex-shrink: 0;
  font-size: 15px;
  color: var(--c-text-3);
}

/* ---------- 分段选择 ---------- */
.seg {
  display: flex;
  padding: 4px;
  gap: 4px;
}
.seg__item {
  flex: 1;
  min-height: 38px;
  border-radius: var(--radius-sm);
  font-size: 13.5px;
  color: var(--c-text-2);
}
.seg__item--on {
  background: var(--c-primary);
  color: #fff;
  font-weight: 500;
}

.note {
  margin: 6px 2px 0;
  font-size: 11px;
  line-height: 1.5;
}

/* ---------- 列表 ---------- */
.list {
  padding: 0 14px;
  overflow: hidden;
}
.list__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 48px;
  padding: 0;
  font-size: 14px;
  color: var(--c-text);
  border-bottom: 1px solid var(--c-border);
  text-align: left;
}
.list__row:last-child {
  border-bottom: none;
}
.list__row--action {
  justify-content: flex-start;
  gap: 8px;
  cursor: pointer;
}
.list__row--action:active {
  background: var(--c-bg);
}
.list__row--disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.list__arrow {
  margin-left: auto;
  font-size: 17px;
  color: var(--c-text-3);
}
.danger {
  color: var(--c-danger);
}
.list__row .muted {
  font-size: 13px;
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
