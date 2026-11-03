<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { useSettingsStore } from '@/stores/settingsStore'
import {
  THEMES,
  STORAGE_KEYS,
  CATEGORIES,
} from '@/utils/constants'
import { useStudyStore } from '@/stores/studyStore'
import { useBankStore } from '@/stores/bankStore'
import { readJSON, writeJSON, isStorageAvailable } from '@/utils/storage'
import { installGuideAll } from '@/utils/installGuide'

/**
 * 设置页：把「我的」页里偏配置的项收进来。
 *
 * 从「我的」页拆出来的原因：主页面被主题、数据管理、关于
 * 塞得太长，而这些都不是每天要看的东西。
 *
 * 设置页只做这几件事：外观主题、数据管理、安装到桌面、关于。
 *
 * 2026-11：移除了「默认练习方式」—— 那个开关**从来没有被读取过**
 * （PracticeView 用的是硬编码的 DEFAULT_STUDY_MODE 常量，不读 oi_settings），
 * 属于死开关，还向用户承诺了没实现的行为。
 */

const router = useRouter()
const settings = useSettingsStore()
const study = useStudyStore()
const bank = useBankStore()

const THEME_LABEL = { light: '浅色', dark: '深色', system: '跟随系统' }
const themeOptions = computed(() => THEMES.map((t) => ({ value: t, label: THEME_LABEL[t] })))

// ---------- 页内二次确认（替代 window.confirm） ----------
/**
 * 为什么不用 window.confirm：
 * 微信内置浏览器、部分安卓 WebView 下 confirm 会静默返回 false，
 * 表现为「点了完全没反应」。页内确认条任何环境都能用。
 */
const confirming = reactive({ records: false, favorites: false })

function askConfirm(kind) {
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

const favCount = computed(() => study.favorites.length)
const storageOk = computed(() => isStorageAvailable())
const appVersion = '0.3.0'

/**
 * 安装引导：**列出全部平台**（iOS / 安卓 / 电脑），并标出当前设备。
 *
 * 2026-11 改版：早先按 UA 只显示当前平台那一套，导致「在电脑上打开时看不出
 * 手机上也能装成 App」—— 而题库正是碎片时间在手机上用的。
 * 现在一次全列（有下拉可收起，不占位置），任何设备打开都能看到移动端的安装方式。
 *
 * 平台与「是否已装好」都在浏览器里读，所以包在 computed 里延迟取，
 * 避免 SSR / 测试环境下直接访问 navigator 报错。
 */
const guide = computed(() => {
  if (typeof navigator === 'undefined') return installGuideAll({})
  const mm = typeof window !== 'undefined' && window.matchMedia
  return installGuideAll({
    ua: navigator.userAgent,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    standalone: !!(mm && window.matchMedia('(display-mode: standalone)').matches),
    navStandalone: !!navigator.standalone,
  })
})

/** 当前平台的组（用来生成收起状态下的副标题） */
const currentGroup = computed(
  () => guide.value.groups.find((g) => g.platform === guide.value.current) || null,
)

/** 安装引导是否展开（默认收起，避免设置页被一大段步骤撑长） */
const guideOpen = ref(false)
</script>

<template>
  <div class="page">
    <AppHeader title="设置" />

    <!-- 外观 -->
    <h2 class="section-title">外观</h2>
    <div class="group card">
      <div class="row row--stack">
        <div class="row__main">
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
            <span class="row__title">主题</span>
            <span class="row__desc">浅色 / 深色 / 跟随系统</span>
          </div>
        </div>
        <div class="seg">
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
      </div>
    </div>

    <!-- 数据管理 -->
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

    <!--
      安装到桌面：给用户一个「怎么变成 App」的入口。

      2026-11：展开后**列出全部平台**（手机两个 + 电脑），而不只是当前平台。
      这样在电脑网页上打开也能看到「手机上可以装成 App」，
      知道可以换到手机上用 —— 题库本来就是碎片时间在手机上用的。
      默认收起（`guideOpen = false`），不占设置页高度。
    -->
    <h2 class="section-title">安装到桌面</h2>
    <div class="group card">
      <button class="row row--btn" @click="guideOpen = !guideOpen">
        <div class="row__text">
          <span class="row__title">装成 App，离线也能刷题</span>
          <span class="row__desc">
            {{
              guide.installed
                ? '已在独立形态运行，可离线刷题'
                : 'iPhone / 安卓 / 电脑，各端的安装步骤'
            }}
          </span>
        </div>
        <span class="row__chev" :class="{ 'row__chev--open': guideOpen }" aria-hidden="true">›</span>
      </button>

      <div v-if="guideOpen" class="guide">
        <p v-if="guide.installed" class="guide__done">
          ✓ 已装好。当前就在独立形态里运行，断网也能刷题。
        </p>

        <!--
          三个平台全部列出，每个一块：
          标题行 = 平台名 + （当前设备时）一枚「当前设备」标记。
          当前设备那块不折叠，其它两块也全展开 —— 用户既然点开了，
          就是想看到「别的设备怎么装」，不用再一层层点。
        -->
        <section
          v-for="g in guide.groups"
          :key="g.platform"
          class="guide__group"
        >
          <h3 class="guide__group-title">
            {{ g.label }}
            <span v-if="g.platform === guide.current" class="guide__tag">当前设备</span>
          </h3>

          <p v-if="g.warning" class="guide__warn">⚠️ {{ g.warning }}</p>

          <ol class="guide__steps">
            <li v-for="(s, i) in g.steps" :key="i">{{ s }}</li>
          </ol>

          <!-- 安卓特有：失败时的备选路径（这块来自真实踩坑） -->
          <p v-if="g.fallback" class="guide__fallback">{{ g.fallback }}</p>

          <p class="guide__note">{{ g.note }}</p>
        </section>
      </div>
    </div>

    <!-- 关于 -->
    <h2 class="section-title">关于</h2>
    <div class="group card">
      <div class="row row--static">
        <div class="row__text"><span class="row__title">版本</span></div>
        <span class="row__value">v{{ appVersion }}</span>
      </div>
      <div class="row row--static">
        <div class="row__text"><span class="row__title">存储方式</span></div>
        <span class="row__value">{{ storageOk ? '本机 localStorage' : '不可用' }}</span>
      </div>
      <div class="row row--static">
        <div class="row__text"><span class="row__title">题库</span></div>
        <span class="row__value">{{ bank.total }} 题 · {{ CATEGORIES.length }} 分类</span>
      </div>
    </div>

    <p class="foot muted">数据只存在本机浏览器，清除浏览器数据或换设备会丢失。</p>

    <Transition name="toast">
      <div v-if="toastText" class="toast" role="status">{{ toastText }}</div>
    </Transition>
  </div>
</template>

<style scoped>
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
.row__icon--indigo {
  color: var(--c-primary);
  background: var(--c-primary-weak);
}
.row__icon--teal {
  color: var(--c-tag-teal, #0d9488);
  background: rgba(13, 148, 136, 0.12);
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
  transition: transform 0.18s ease;
}
.row__chev--open {
  transform: rotate(90deg);
}

/* ---------- 安装引导 ---------- */
.guide {
  padding: 4px 0 12px;
  border-top: 1px solid var(--c-border);
}
.guide__done {
  margin: 12px 0 0;
  font-size: 13px;
  color: var(--c-success);
  line-height: 1.6;
}
.guide__warn {
  margin: 12px 0 0;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--c-warning);
}
.guide__steps {
  margin: 10px 0 0;
  padding-left: 20px;
  font-size: 13px;
  line-height: 1.75;
  color: var(--c-text);
}
.guide__steps li {
  margin-bottom: 4px;
}
.guide__fallback {
  margin: 10px 0 0;
  padding: 9px 11px;
  border-radius: 8px;
  background: var(--c-danger-weak);
  font-size: 12px;
  line-height: 1.65;
  color: var(--c-danger);
}
.guide__note {
  margin: 10px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--c-text-2);
}

/**
 * 平台分组：三个平台各自成块，块之间用细分隔线分开。
 *
 * 用分隔线而不是给每块加卡片边框 —— 它们在同一个 `.group.card` 里，
 * 再加边框会出现「卡中卡」的嵌套感。
 */
.guide__group {
  padding: 14px 0 4px;
}
.guide__group + .guide__group {
  border-top: 1px solid var(--c-border);
}

/**
 * 平台名 + 「当前设备」标记。
 *
 * 标记用小圆角胶囊，颜色走主色 —— 它只是「提示你在哪一端」，
 * 不是警告，不该用警示色。
 */
.guide__group-title {
  margin: 0;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--c-text);
  display: flex;
  align-items: center;
  gap: 8px;
}
.guide__tag {
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 500;
  color: var(--c-primary);
  background: var(--c-primary-weak);
}

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

.foot {
  margin: 16px 2px 8px;
  font-size: 10.5px;
  line-height: 1.7;
  text-align: center;
}

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
