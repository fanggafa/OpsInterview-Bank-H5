<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Ring from '@/components/Ring.vue'
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
/**
 * 题干摘要。现在它**独占副标题那一行**（不再和「每天一道…」挤在一起），
 * 所以可以放宽截断长度 —— 46 字在手机上只够显示半句，看不出是哪道题。
 */
const dailySummary = computed(() => (daily.value ? truncate(daily.value.question, 70) : ''))

/** 错题本数量：错题复习入口据此决定是否可用 */
const wrongCount = computed(() => study.wrongList.length)

/**
 * 「分类熟练度」卡片的摘要：有多少个分类已经有记录（选择刷过 / 简答自评过）。
 *
 * 2026-11：这张卡由「薄弱分类」改名而来，副标题不再只讲「哪个最弱」——
 * 那个页面现在同时展示两类题型的熟练度，摘要也该对应地说「有多少分类有数据」。
 */
const proficiencyCount = computed(
  () =>
    study.categoryProficiency.filter((r) => r.choice.pct !== null || r.short.pct !== null).length,
)

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
      ========== 背题区 ==========
      首页按**使用方式**分成两个区块：背题（读题看答案记住）、刷题（成组做判对错）。

      不用「简答题 / 选择题」当标题 —— 那是题型名，读起来像目录、很生硬；
      「背题 / 刷题」是 App 里本来就在用的说法（背题模式 / 刷题），用户熟悉。

      背题 = 每日一记（每天读一道、记一个知识点）+ 我的收藏（收藏只收简答题）。
    -->
    <h2 class="section-title">背一背题</h2>

    <!--
      每日一记：给一个「今天具体记什么」的动作。
      只抽简答题 —— 它能直接读答案解析，符合「记」的定位。

      **与其它卡片同构**：图标 + 标题 + 副标题 + 行尾箭头。
      早先是「左上状态胶囊 + 纯文字标题 + 题干」的独立版式，
      和下面几张卡放在一起明显是两个东西：没图标、标题跟题干挤在一行、
      卡片间距也不同。现在统一成同一套 `.review` 骨架，只在内部多一行题干。
    -->
    <div class="reviews">
      <button v-if="daily" class="review review--daily" @click="openDaily">
        <span class="review__icon review__icon--daily" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="19" height="19">
            <path
              d="M5 4.5h11a2.5 2.5 0 0 1 2.5 2.5v13a2.5 2.5 0 0 1-2.5 2.5H5A2.5 2.5 0 0 1 2.5 20V7A2.5 2.5 0 0 1 5 4.5zM6.5 9.5h8M6.5 13h8M6.5 16.5h4.5"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>

        <span class="review__text">
          <span class="review__title">
            每日一记
            <!-- 已作答时把状态贴在标题后面，不占额外一行 -->
            <span v-if="dailyState.answered" class="review__state">{{ dailyState.label }}</span>
          </span>
          <!--
            只显示题干，不要副标题。
            题干才是用户真正关心的（今天记哪道题），
            副标题那种「每天一道 · 看完答案再自评」是说明文案，纯占地方。

            往下拉开一点距离 + 字号大一些，让它读起来像「题目」而不是「备注」。
          -->
          <span class="review__desc review__desc--question">{{ dailySummary }}</span>
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
          <span class="review__desc">已收藏 {{ favCount }} 题 · 简答题点星标即可收藏</span>
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

    <!--
      ========== 刷题区 ==========
      每日一刷（30 题自测）+ 复习巩固（错题本 / 错题复习 / 薄弱分类）。
      这几项**都只涉及选择题**：错题本只收选择题，薄弱分类也只统计选择题。
    -->
    <h2 class="section-title">刷一刷题</h2>

    <!-- 用 .reviews 包住，与下面几张卡共用同一个 gap —— 卡片间距才一致 -->
    <div class="reviews">
      <button class="review" @click="startReview('dailyDrill')">
        <span class="review__icon review__icon--drill" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="19" height="19">
            <path
              d="M8 3.5h8l1 3.5H7l1-3.5zM12 7v6m-3-3h6M5 10h14l-1.2 9.2A2 2 0 0 1 15.8 21H8.2a2 2 0 0 1-2-1.8L5 10z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <span class="review__text">
          <span class="review__title">每日一刷 30 题</span>
          <span class="review__desc">随机抽取 30 选择题 · 限时 20 分钟 · 给评测建议</span>
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
        复习区：按「复习 → 错题 → 薄弱」的顺序排。
        每日复习（原「错题复习」）放最前面 —— 它是「现在就练一批」的动作，
        错题本则是「看看有哪些题要补」的清单，先练再翻清单更顺手。

        **与每日一刷同处一个 .reviews 容器**：早先它们各用一个 .reviews，
        两个容器相邻却没有外边距，结果「每日一刷」和「每日复习」之间是 0px，
        而组内其它卡片是 8px —— 看着就是「间距不对」。
        同一个区块内的卡片，本该共用一个 gap。
      -->
      <!-- 每日复习：从错题本里抽一批来练（原「错题复习」） -->
      <button class="review" :disabled="!wrongCount" @click="startReview('wrong')">
        <span class="review__icon review__icon--review" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="19" height="19">
            <path
              d="M4 9a8 8 0 1 1 1.6 5.2M4 4v5h5M9 12l2.5 2.5L16 10"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <span class="review__text">
          <span class="review__title">每日复习 30 题</span>
          <span class="review__desc">
            {{ wrongCount ? `错题本抽 ${Math.min(wrongCount, 30)} 选择题 · 限时 20 分钟 · 连对 3 次移出` : '错题本为空' }}
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
            {{ wrongCount ? `已收集 ${wrongCount} 题 · 记录答对次数 · 连对 3 次移出` : '0 题 · 选择题答错会进这里' }}
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
          <!--
            2026-11：本卡由「薄弱分类」改名而来。
            合并了「我的」页那张「各分类掌握度（仅简答题）」——
            现在一页里左列选择题熟练度、右列简答题掌握度，所以不再只叫「薄弱」。
          -->
          <span class="review__title">分类熟练度</span>
          <span class="review__desc">
            <template v-if="proficiencyCount">
              {{ proficiencyCount }} 个分类有记录 · 按选择题熟练度分等级
            </template>
            <template v-else>
              数据量不足 · 刷过选择题后开始统计
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
  box-shadow: var(--shadow-card);  text-align: left;
  transition: transform 0.14s ease, box-shadow 0.14s ease;
}
.review:active:not(:disabled) {
  transform: scale(0.985);
  box-shadow: var(--shadow-lift);
}
/**
 * 「每日一记」这张卡比其它卡高（多一行题干），不能沿用父级的 `align-items: center` ——
 * 那会把图标垂直居中、沉到 29px，而其它卡的图标在 14px，一眼就能看出没对齐。
 *
 * 处理：整卡改为顶部对齐（图标与标题同为 14px），
 * 但**箭头单独 `align-self: center`** —— 箭头是「可进入」的指示，
 * 贴在卡片垂直中部比顶在角落自然。
 */
.review--daily {
  align-items: flex-start;
}
.review--daily .review__arrow {
  align-self: center;
}
/*
 * 首页所有入口卡都是**同一套骨架**：`.review` 的尺寸、内边距、图标大小、标题字号。
 *
 * 早先「每日一记」和「每日一刷」各自有一套版式（渐变底、更大内边距、
 * 38px 图标、15px 标题），理由是「它们属于每日两个动作，不该长得像普通一行」。
 * 但实际效果是：同一屏里出现了三种卡片尺寸，用户反馈「图标、字号、间距都不一样，太乱」。
 * 现在统一了 —— 靠图标配色和标题区分，而不是靠尺寸差异。
 */
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
/*
 * 两个「每天必做」的入口：配色要与复习那几张区分开。
 * - 每日一记 → 蓝紫（对应 hero 主色，是「今天第一件事」）
 * - 每日一刷 → 靛蓝（与每日复习的品红区分）
 * - 每日复习 → 品红（与每日一刷的靛蓝区分）
 *
 * 早先「每日一刷」和「每日复习」都用了同一个循环箭头图标 + 同一种靛蓝，
 * 视觉上完全一样，用户反馈「这两个图标重复了」。
 */
.review__icon--daily {
  background: linear-gradient(135deg, #6b8afd, #4f7cff);
}
.review__icon--review {
  background: linear-gradient(135deg, #c084fc, #9333ea);
}
.review__text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.review__title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text);
}
/**
 * 标题后面的状态小胶囊（只有「每日一记」会用到）。
 * 贴在标题右侧而不是另起一行 —— 卡片高度不变，还一眼能看出今天做了没。
 */
.review__state {
  flex-shrink: 0;
  padding: 2px 6px;
  border-radius: 5px;
  font-size: 10.5px;
  font-weight: 500;
  color: var(--c-primary);
  background: var(--c-primary-weak);
}
.review__desc {
  font-size: 11px;
  color: var(--c-text-3);
}
/**
 * 题干（每日一记专用）。
 *
 * 这张卡没有副标题，题干是用户唯一要看的内容 ——
 * 字号比普通副标题大（11 → 13px）、颜色用正文色。
 *
 * `margin-top` 取 14px 是**实测量出来的**，不是估的：
 * 标题在 14~32px、图标在 14~48px，题干若按常规 5px 上边距只到 39px，
 * 与图标底（48px）差 9px，看起来像「题干贴着标题、悬在图标中间」。
 * 补上这 9px 后题干顶部正好与图标底部齐平，卡片左侧形成一条整齐的边缘。
 * 最多两行后省略，避免长题干把卡片撑高。
 */
.review__desc--question {
  margin-top: 14px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--c-text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
