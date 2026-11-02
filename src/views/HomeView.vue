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
  bank.loadIndex().catch(() => {})
})

/** 今日是否有刷题记录 */
const todayDone = computed(() => study.todayReviewedCount > 0)

/** 掌握率只统计简答题（PRD §五.4） */
const masteryText = computed(() => formatPercent(study.masteryRate))
const choiceText = computed(() => formatPercent(study.choiceRate))

/**
 * 每日一记。
 *
 * 替代原来的「按分类刷题」列表：那个列表只是把「我的」页已有的分类进度
 * 再画一遍，而且点任何一个都跳到同一个刷题页（只是带了 category 参数），
 * 信息量低、动作重复。
 *
 * 每日一记给的是「今天来做什么」这一个具体动作：
 * - 同一天固定一题（日期做种子），不是随机刷新
 * - 直接进题目详情页（能看解析、能收藏），与刷题页不重复
 * - 今天答过就显示结果，形成「每天来答一道」的节奏
 */
const daily = computed(() =>
  /**
   * 「每日一记」只抽**简答题**。
   *
   * 它的定位是「看一道题、记一个知识点」：简答题自带完整答案与解析，
   * 适合直接读；选择题的选项在未作答时是空的，当作「每日看点」没内容可看。
   * 早先叫「每日一题」且不限题型，抽到选择题时点开还得先做题才看得到东西。
   */
  pickDailyQuestion(bank.questions, new Date(), { types: ['short'] }),
)

const dailyTypeLabel = computed(() => (daily.value ? TYPE_LABEL[getType(daily.value)] : ''))

/** 今天这道题的作答状态（只看今天，不把上周的结果算进来） */
const dailyState = computed(() => {
  const q = daily.value
  if (!q) return { label: '今日一记', answered: false, status: null }
  const rec = study.recordOf(q.id)
  if (!rec || !isToday(rec.lastReviewed)) return { label: '今日一记', answered: false, status: null }

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

/** 错题本数量：错题复习入口据此决定是否可用 */
const wrongCount = computed(() => study.wrongList.length)

/** 收藏数量（「我的题集」区块显示） */
const favCount = computed(() => study.favorites.length)

/** 进入复习赛（一次性题组，与刷题页的连续队列不同） */
function startReview(kind) {
  router.push({ path: '/practice', query: { review: kind } })
}

/**
 * 今天的日期，显示在 hero 标题下方。
 *
 * 显示为「年月日」完整日期（如「2026年11月1日」），让「每日」这个语义
 * 在页面上直接看得见，而不是要用户自己点开某处才知道今天是几号。
 */
const dateText = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
})

function openDaily() {
  // 带 from=/：详情页据此把返回指向首页（而不是一律回题库）
  if (daily.value) router.push(`/question/${daily.value.id}?from=/`)
}

/** 进入薄弱环节详情页（完整榜单在那里） */
function openWeak() {
  router.push('/weak')
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
          <!--
            日期放在标题下方：早先它挂在「每日一记」卡片右上角，
            但那个位置属于「每日一记」这个区块，日期其实是「今天」的属性，
            应该跟着页面标题走。改到标题下方，也让「每日」这个语义一眼可见。
          -->
          <p class="hero__date">{{ dateText }}</p>
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

    <!--
      每日一记：给一个「今天具体记什么」的动作。
      只抽简答题 —— 它能直接读答案解析，符合「记」的定位。
    -->
    <h2 class="section-title">每日一记</h2>
    <button v-if="daily" class="daily card" @click="openDaily">
      <!--
        状态标签只在「已作答」时出现（今天答对/答错、标记会/不会）。
        未作答时不显示「今日一记」——标题已经写了「每日一记」，
        再挂一个同义徽标只是重复。
      -->
      <span
        v-if="dailyState.answered"
        class="daily__tag"
        :class="`daily__tag--${dailyState.status}`"
      >
        {{ dailyState.label }}
      </span>

      <p class="daily__q">{{ dailySummary }}</p>

      <div class="daily__meta">
        <span class="badge daily__cat">{{ daily.category }}</span>
        <span class="badge daily__type">{{ dailyTypeLabel }}</span>
        <DifficultyBadge :difficulty="daily.difficulty" />
        <FrequencyBadge :frequency="daily.frequency" />
      </div>

      <!--
        只留一个箭头，不再写「点开作答，答完看解析」那行提示。
        整张卡片本来就是按钮，箭头已经说明可进；那一行既重复又白占高度。
      -->
            <span class="daily__arrow" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="15" height="15">
          <path
            d="M9 6l6 6-6 6"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </button>

    <!--
      每日一刷：紧跟在每日一记下方，是「每天两个动作」里的第二个。
      与每日一记的差别：每日一记是「看一道」，每日一刷是「考一批」并给分数。
      它不属于「复习巩固」（那是按错题/薄弱去补），所以单独成块。
    -->
    <h2 class="section-title">每日一刷</h2>
    <button class="review review--drill" @click="startReview('dailyDrill')">
      <span class="review__icon review__icon--drill" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="19" height="19">
          <path
            d="M12 4a8 8 0 1 0 7.5 10.5M12 4a8 8 0 0 1 7 4.3M19 4v4.5h-4.5"
            fill="none"
            stroke="currentColor"
            stroke-width="1.9"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
      <span class="review__text">
        <!--
          主标题与副标题分开：标题只放「这是什么」，规则细节放副标题。
          早先标题写成「随机 30 题选择题」，把规则塞进了标题位，
          与下方「每日一刷」区块标题重复，视觉上也很吵。
        -->
        <span class="review__title">30 题限时自测</span>
        <span class="review__desc">随机选择题 · 刷完给分数与建议</span>
      </span>
            <span class="review__arrow" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="15" height="15">
          <path
            d="M9 6l6 6-6 6"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </button>

    <!--
      复习巩固：按「错题 → 复习 → 薄弱」的顺序排。
      错题本放最前面 —— 它是「有哪些题要补」的清单，错题复习是从清单里抽题练，
      先看清单再开练更合逻辑。
    -->
    <h2 class="section-title">复习巩固</h2>
    <div class="reviews">
      <!-- 错题本：清单（点了去看有哪些题），不是练习 -->
      <router-link to="/wrong" class="review">
        <span class="review__icon review__icon--wrong" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="19" height="19">
            <path
              d="M12 7v6M12 16.5v.5M4.5 12a7.5 7.5 0 1 0 15 0 7.5 7.5 0 0 0-15 0z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
            />
          </svg>
        </span>
        <span class="review__text">
          <span class="review__title">错题本</span>
          <span class="review__desc">
            {{ wrongCount ? `已收集 ${wrongCount} 题 · 连对 3 次自动移出` : '还没有错题，答错或自评「不会」会进这里' }}
          </span>
        </span>
              <span class="review__arrow" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="15" height="15">
          <path
            d="M9 6l6 6-6 6"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
      </router-link>

      <!-- 错题复习：从错题本里抽一批来练 -->
      <button class="review" :disabled="!wrongCount" @click="startReview('wrong')">
        <span class="review__icon review__icon--drill" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="19" height="19">
            <path
              d="M12 4a8 8 0 1 0 7.5 10.5M12 4a8 8 0 0 1 7 4.3M19 4v4.5h-4.5"
              fill="none"
              stroke="currentColor"
              stroke-width="1.9"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <span class="review__text">
          <span class="review__title">错题复习</span>
          <span class="review__desc">
            {{ wrongCount ? `从错题本抽 ${Math.min(wrongCount, 10)} 题 · 连对 3 次移出` : '错题本是空的' }}
          </span>
        </span>
              <span class="review__arrow" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="15" height="15">
          <path
            d="M9 6l6 6-6 6"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
      </button>

      <!--
        薄弱环节入口：与上面两张卡同款式，只显示「最弱的是哪块」这一条摘要。
        完整榜单（含样本量、分类题库入口）在 /weak 页。

        **卡片常驻**：早先没有足够样本时整卡隐藏，导致「功能看不见、以为没了」。
        现在无数据时显示引导文案并可点进 /weak。
      -->
      <button class="review" @click="openWeak">
        <span class="review__icon review__icon--weak" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="19" height="19">
            <path
              d="M4 18V9m4 9V5m4 13v-6m4 6V8m4 10v-4"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
        </span>
        <span class="review__text">
          <span class="review__title">薄弱分类</span>
          <span class="review__desc">
            <template v-if="study.weakCategories.length">
              {{ study.weakCategories[0].category }} ·
              {{ study.weakCategories[0].wrong }}/{{ study.weakCategories[0].reviewed }} 错
              <template v-if="study.weakCategories.length > 1">
                · 共 {{ study.weakCategories.length }} 个待补
              </template>
            </template>
            <template v-else>
              数据还不够 · 同分类刷满它题量的 33% 且含错题后开始排行
            </template>
          </span>
        </span>
              <span class="review__arrow" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="15" height="15">
          <path
            d="M9 6l6 6-6 6"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
      </button>
    </div>

    <!--
      我的题集：从「我的」页搬来 —— 它们本质是「题」而不是「我的设置」，
      放首页与其他题目入口同段更好找。「我的」页只留数据看板 + 右上角设置。
      （错题本因为要挨着「错题复习」，已并入上面的「复习巩固」。）
    -->
    <h2 class="section-title">我的题集</h2>
    <div class="reviews">
      <router-link to="/favorites" class="review">
        <span class="review__icon review__icon--fav" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="19" height="19">
            <path
              d="M12 3.5l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 10l6.1-.9z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <span class="review__text">
          <span class="review__title">我的收藏</span>
          <span class="review__desc">
            {{ favCount ? `${favCount} 题 · 手动标记的重点` : '还没有收藏，题卡上点星标即可收进来' }}
          </span>
        </span>
              <span class="review__arrow" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="15" height="15">
          <path
            d="M9 6l6 6-6 6"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
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
/* 日期：跟在标题下方，比副标题更淡，不抢主标题 */
.hero__date {
  margin: 4px 0 0;
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.6);
  font-variant-numeric: tabular-nums;
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


/* ---------- 每日一记 ---------- */
.daily {
  /* 日期绝对定位到右上角，所以卡片自己要做定位上下文 */
  position: relative;
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
/* 状态胶囊：答过之后转绿/转红，一眼看出今天做没做。现在它是卡片首行的行内元素 */
.daily__tag {
  align-self: flex-start;
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

/**
 * 箭头绝对定位到卡片右下角。
 *
 * 早先它跟「点开作答，答完看解析」凑成一行，用一条分隔线隔开 ——
 * 那行既重复（卡片本身就是按钮）又白占十几像素高度。
 * 现在只留箭头，浮在右下角，与右上角的日期形成对角平衡。
 */
/**
 * 卡片右下角的进入箭头。
 *
 * 原来是文本字符 `→`：不同字体下粗细/长度不一，和卡片内的线条图标风格不搭。
 * 现在用 chevron 图标 + 淡色圆底，与 AppHeader 的返回箭头同一套线条语言。
 */
.daily__arrow {
  position: absolute;
  right: 12px;
  bottom: 10px;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--c-primary-weak);
  color: var(--c-primary);
}

/* ---------- 复习入口 ---------- */
.reviews {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.review {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  padding: 13px 14px;
  border-radius: var(--radius);
  border: 1px solid var(--c-border);
  background: var(--c-card);
  box-shadow: var(--shadow-card);
  text-align: left;
  transition: transform 0.14s ease, box-shadow 0.14s ease;
}
.review:active:not(:disabled) {
  transform: scale(0.985);
  box-shadow: var(--shadow-lift);
}
/*
 * 每日一刷是独立卡片（不在 .reviews 容器里）。
 * 它的视觉比照「每日一记」那张：渐变底 + 更大内边距 + 更大图标，
 * 因为它是「每天两个动作」之一，不该看起来像复习列表里的普通一行。
 */
.review--drill {
  padding: 14px;
  gap: 12px;
  border-radius: var(--radius);
  background-image: var(--grad-card);
  margin-bottom: 4px;
}
.review--drill .review__icon {
  width: 38px;
  height: 38px;
  border-radius: 11px;
}
.review--drill .review__title {
  font-size: 15px;
}
/* 错题本为空时置灰：看起来像禁用，而不是点了才发现没题 */
.review:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.review__icon {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.review__icon--drill {
  background: var(--grad-indigo);
}
.review__icon--wrong {
  background: linear-gradient(135deg, #f0736f, #d64b52);
}
/* 薄弱环节：用琥珀色，与「错题」的红区分开 —— 它代表「趋势/分析」而非「错误」 */
.review__icon--weak {
  background: linear-gradient(135deg, #f7b955, #e09428);
}
/* 收藏：绿色，与「错题」的红、「薄弱」的琥珀都区分开 —— 它代表「主动留下」 */
.review__icon--fav {
  background: linear-gradient(135deg, #4ec38a, #2f9e6d);
}
.review__text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.review__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text);
}
.review__desc {
  font-size: 11px;
  color: var(--c-text-3);
}
/* 复习入口行尾的箭头：与「每日一记」那个同一套样式（chevron + 淡色圆底） */
.review__arrow {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--c-primary-weak);
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
