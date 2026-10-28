<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'
import {
  STATUS,
  CATEGORIES,
  PRACTICE_MODES,
  STUDY_MODES,
  STUDY_MODE_LABEL,
  STUDY_MODE_DESC,
  DEFAULT_STUDY_MODE,
  TYPE_LABEL,
} from '@/utils/constants'
import {
  buildQueue,
  resolveStartIndex,
  normalizeMode,
  normalizeStudyMode,
  describeProgress,
  summarizeRound,
} from '@/utils/practice'
import {
  isShort,
  isMultiple,
  answerSingle,
  toggleOption,
  judgeChoice,
  optionState,
  resultToStatus,
} from '@/utils/question'
import { attachSwipe } from '@/utils/gestures'
import AppHeader from '@/components/AppHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import DifficultyBadge from '@/components/DifficultyBadge.vue'
import FrequencyBadge from '@/components/FrequencyBadge.vue'
import ChoiceOptions from '@/components/ChoiceOptions.vue'
import AnswerText from '@/components/AnswerText.vue'
import Ring from '@/components/Ring.vue'

const route = useRoute()
const router = useRouter()
const bank = useBankStore()
const study = useStudyStore()

const mode = computed(() => normalizeMode(route.query.mode))
const studyMode = computed(() => normalizeStudyMode(route.query.studyMode || DEFAULT_STUDY_MODE))
const category = computed(() =>
  CATEGORIES.includes(route.query.category) ? route.query.category : ''
)

const queue = ref([])
const cursor = ref(0)
/** 本次是否从断点继续（仅用于触发浮层提示，不参与渲染判断） */
const resumed = ref(false)
const ready = ref(false)

/** 「已从上次位置继续」的浮层提示（2 秒后自动消失，不常驻占位） */
const resumeToast = ref('')
let resumeTimer = null

/**
 * 是否已进入「刷题中」。
 *
 * 进入页面先显示选择页（两个居中按钮），选定后才渲染题卡。
 * 从首页分类入口进来时带 category 参数，仍先选择方式——
 * 因为「刷题 / 背题」是不同的队列，必须先定。
 */
const started = ref(false)
const expanded = ref(false)
const roundAnswers = ref({})
const finished = ref(false)
const slideDir = ref('')
let animating = false

/** 选择题作答态（每切一题重置） */
const selected = ref([])
const submitted = ref(false)
const passed = ref(false)

const current = computed(() => queue.value[cursor.value] || null)
const total = computed(() => queue.value.length)
const short = computed(() => (current.value ? isShort(current.value) : true))
const multiple = computed(() => (current.value ? isMultiple(current.value) : false))
const status = computed(() => (current.value ? study.statusOf(current.value.id) : null))
const favorite = computed(() => (current.value ? study.isFavorite(current.value.id) : false))
const progressText = computed(() => `第 ${cursor.value + 1} / ${total.value} 题`)
const answeredCount = computed(() => Object.keys(roundAnswers.value).length)
const typeLabel = computed(() => (current.value ? TYPE_LABEL[current.value.type || 'short'] : ''))

const optionStates = computed(() =>
  submitted.value && current.value ? optionState(current.value, selected.value, passed.value) : {}
)

const roundSummary = computed(() => {
  const answers = Object.values(roundAnswers.value)
  return summarizeRound(
    answers.filter((s) => s === STATUS.KNOW).length,
    answers.filter((s) => s === STATUS.UNKNOWN).length
  )
})

// ---------- 队列 ----------

function build() {
  clearTimers()
  animating = false
  slideDir.value = ''

  const wrongIds = new Set(study.wrongList.map((q) => q.id))
  const q = buildQueue(bank.questions, {
    mode: mode.value,
    studyMode: studyMode.value,
    category: category.value,
    wrongIds,
  })
  queue.value = q

  const start = resolveStartIndex(
    study.progress,
    { mode: mode.value, studyMode: studyMode.value, category: category.value },
    q.length
  )
  cursor.value = start.index
  resumed.value = start.resumed

  /**
   * 「已从上次位置继续」改成 2 秒的浮层提示，而不是常驻一行。
   *
   * 常驻一行（约 22px）每天都在占位置，但它只在「刚进来」这一瞬有意义，
   * 看完就该消失，把高度还给题目与答案。
   */
  if (start.resumed) {
    resumeToast.value = `已从第 ${start.index + 1} 题继续`
    clearTimeout(resumeTimer)
    resumeTimer = setTimeout(() => {
      resumeToast.value = ''
    }, 2000)
  }

  // 背题模式默认展开答案（它的用途就是「看题背答案」）；
  // 刷题模式仍默认收起，先自己想再看
  expanded.value = studyMode.value === 'memorize'
  finished.value = false
  roundAnswers.value = {}
  resetChoice()
  ready.value = true
}

function resetChoice() {
  selected.value = []
  submitted.value = false
  passed.value = false
}

onMounted(() => {
  bank
    .load()
    .then(() => build())
    .catch(() => {
      ready.value = true
    })
})

watch([mode, studyMode, category], () => {
  if (bank.questions.length) build()
})

// ---------- 定时器管理 ----------

const timers = new Set()

function schedule(fn, ms) {
  const t = setTimeout(() => {
    timers.delete(t)
    fn()
  }, ms)
  timers.add(t)
  return t
}

function clearTimers() {
  timers.forEach((t) => clearTimeout(t))
  timers.clear()
}

// ---------- 导航 ----------

function persistProgress() {
  study.saveProgress({
    mode: mode.value,
    studyMode: studyMode.value,
    category: category.value || null,
    index: cursor.value,
  })
}

function goTo(index) {
  if (animating || !total.value) return
  if (index < 0 || index >= total.value) return

  animating = true
  slideDir.value = index > cursor.value ? 'left' : 'right'

  schedule(() => {
    cursor.value = index
    // 切题后同样按模式决定：背题模式每道都直接展开答案
    expanded.value = studyMode.value === 'memorize'
    resetChoice()
    slideDir.value = ''
    persistProgress()
    animating = false
  }, 180)
}

function next() {
  if (cursor.value < total.value - 1) goTo(cursor.value + 1)
}

function prev() {
  if (cursor.value > 0) goTo(cursor.value - 1)
}

function finish() {
  finished.value = true
  cursor.value = Math.max(0, total.value - 1)
  persistProgress()
}

// ---------- 简答题自评 ----------

function mark(s) {
  const q = current.value
  if (!q) return
  if (s === STATUS.KNOW) study.markKnow(q.id)
  else study.markUnknown(q.id)
  roundAnswers.value = { ...roundAnswers.value, [q.id]: s }

  if (cursor.value >= total.value - 1) {
    finish()
    return
  }
  schedule(() => {
    if (!finished.value) goTo(cursor.value + 1)
  }, 160)
}

// ---------- 选择题作答 ----------

function onSelect(key) {
  if (submitted.value || !current.value) return
  if (multiple.value) {
    selected.value = toggleOption(selected.value, key)
  } else {
    const res = answerSingle(current.value, key)
    selected.value = res.selected
    commitResult(res.passed)
  }
}

function submitMultiple() {
  if (!selected.value.length || !current.value) return
  commitResult(judgeChoice(current.value, selected.value))
}

function commitResult(isPassed) {
  const q = current.value
  if (!q) return

  passed.value = isPassed
  submitted.value = true

  const s = resultToStatus(isPassed)
  if (s === STATUS.KNOW) study.markKnow(q.id)
  else study.markUnknown(q.id)
  roundAnswers.value = { ...roundAnswers.value, [q.id]: s }

  /**
   * 判定后**停在本题**，不自动翻页。
   *
   * 早期版本在判定 1.4 秒后自动进入下一题，本意是「刷得快」，
   * 但用户反馈：「判断对错后不要自动进入下一题，不然我看不了解析，怎么学习呢」——
   * 选择题的价值就在解析里（为什么错、正确答案为什么对），
   * 1.4 秒连滚动到解析都不够。学习场景优先，速度让位。
   *
   * 现在由用户自己看完解析点「下一题 →」（或左滑 / →键）前进。
   */
}

/** 选择题「下一题」手动跳过等待 */
function continueNext() {
  clearTimers()
  if (cursor.value >= total.value - 1) finish()
  else goTo(cursor.value + 1)
}

// ---------- 其它 ----------

function toggleFavorite() {
  if (current.value) study.toggleFavorite(current.value.id)
}

function toggleAnswer() {
  expanded.value = !expanded.value
}

function restart() {
  study.clearProgress()
  roundAnswers.value = {}
  finished.value = false
  cursor.value = 0
  expanded.value = false
  resetChoice()
  persistProgress()
  if (mode.value === 'random') build()
}

function switchMode(nextMode) {
  if (mode.value === nextMode) return
  study.clearProgress()
  router.replace({ path: '/practice', query: { ...route.query, mode: nextMode } })
}

/** 切换练习模式（刷题 / 背题）：清掉旧进度并按新模式重建队列 */
function switchStudyMode(nextStudyMode) {
  if (studyMode.value === nextStudyMode) return
  study.clearProgress()
  // 先按新模式决定答案展开态，避免路由切换那一瞬还是旧状态
  expanded.value = nextStudyMode === 'memorize'
  router.replace({ path: '/practice', query: { ...route.query, studyMode: nextStudyMode } })
}

// ---------- 键盘 ----------

function onKeydown(e) {
  if (!ready.value || finished.value || !current.value) return
  const tag = (e.target?.tagName || '').toLowerCase()
  if (tag === 'input' || tag === 'textarea') return

  if (short.value) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      prev()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      next()
    } else if (e.key === ' ') {
      e.preventDefault()
      toggleAnswer()
    } else if (e.key === '1') {
      e.preventDefault()
      mark(STATUS.UNKNOWN)
    } else if (e.key === '2') {
      e.preventDefault()
      mark(STATUS.KNOW)
    }
    return
  }

  // 选择题：A-D 选择、Enter 提交多选
  const key = e.key.toUpperCase()
  const optionKeys = (current.value.options || []).map((o) => o.key)
  if (optionKeys.includes(key)) {
    e.preventDefault()
    onSelect(key)
  } else if (e.key === 'Enter' && multiple.value && !submitted.value) {
    e.preventDefault()
    submitMultiple()
  } else if (e.key === 'ArrowRight' && submitted.value) {
    e.preventDefault()
    continueNext()
  }
}

// ---------- 滑动手势 ----------

const stageRef = ref(null)
let detachSwipe = () => {}

function bindSwipe() {
  detachSwipe()
  detachSwipe = () => {}
  if (!stageRef.value || finished.value || !current.value) return
  detachSwipe = attachSwipe(stageRef.value, {
    onLeft: () => {
      if (finished.value) return
      next()
    },
    onRight: () => {
      if (finished.value) return
      prev()
    },
  })
}

watch(
  stageRef,
  (el) => {
    if (el) bindSwipe()
    else {
      detachSwipe()
      detachSwipe = () => {}
    }
  },
  { flush: 'post' }
)

watch([queue, finished], () => {
  if (stageRef.value) bindSwipe()
})

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  detachSwipe()
  clearTimers()
  if (total.value) persistProgress()
})

const modeOptions = computed(() =>
  PRACTICE_MODES.filter((m) => m !== 'wrong').map((m) => ({
    value: m,
    label: m === 'random' ? '随机' : '顺序',
  }))
)

/** 练习模式选项（刷题 / 背题），带说明文案 */
const studyModeOptions = computed(() =>
  STUDY_MODES.map((m) => ({
    value: m,
    label: STUDY_MODE_LABEL[m],
    desc: STUDY_MODE_DESC[m],
  }))
)

/** 当前练习模式下的题量提示（显示在「题目顺序」那一行右侧） */
const queueHint = computed(() => {
  if (!total.value) return '没有符合条件的题目'
  return `本次 ${total.value} 题`
})

/** 上次进度（只在选择页展示，让用户知道继续会接上） */
const progressInfo = computed(() => describeProgress(study.progress))

/** 选定练习方式并开始 */
function startStudy(next) {
  started.value = true
  if (studyMode.value !== next) {
    switchStudyMode(next)
  } else {
    // 同一模式：直接在当前队列上恢复/继续
    build()
    persistProgress()
  }
}

/**
 * 返回「选择练习方式」页。
 *
 * 不是退出 App、也不是跳题库：刷题页本身有两个阶段（选模式 / 刷题），
 * 返回箭头就应该是「退回上一个阶段」，和用户在浏览器里点后退的预期一致。
 */
function backToPicker() {
  started.value = false
  resumeToast.value = ''
  clearTimeout(resumeTimer)
}

const headerTitle = computed(() => (category.value ? category.value : '刷题'))
</script>

<template>
  <div class="page practice page--fill">
    <!--
      刷题中的紧凑顶栏（44px）。

      布局：左「返回」· 中进度 + 进度条 · 右模式切换；题目顺序做成中段的分段胶囊。
      返回 = 回到「选择练习方式」页（不是回题库，也不是退出 App）。
    -->
    <header v-if="started && !finished" class="ptop">
      <button class="ptop__back" aria-label="返回选择练习方式" @click="backToPicker">
        <!-- 标准返回箭头：横线 + 箭头头。比单个 chevron 更像「返回」，
             视觉重量也能压住右侧的块状元素，不再显得孤立突兀 -->
        <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
          <path
            d="M20 12H5M11 6l-6 6 6 6"
            fill="none"
            stroke="currentColor"
            stroke-width="1.9"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <div class="ptop__center">
        <span class="ptop__count">{{ progressText }}</span>
        <div
          class="ptop__bar"
          role="progressbar"
          :aria-valuenow="answeredCount"
          :aria-valuemin="0"
          :aria-valuemax="total"
        >
          <div class="ptop__fill" :style="{ width: total ? (answeredCount / total) * 100 + '%' : '0%' }" />
        </div>
      </div>

      <!-- 题目顺序：分段胶囊（当前项高亮） -->
      <div class="ptop__seg" role="radiogroup" aria-label="题目顺序">
        <button
          v-for="opt in modeOptions"
          :key="opt.value"
          class="ptop__seg-item"
          :class="{ 'ptop__seg-item--on': mode === opt.value }"
          role="radio"
          :aria-checked="mode === opt.value"
          @click="switchMode(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>

      <!-- 模式切换：点一下切到另一种练习方式 -->
      <button
        class="practice__mode-btn practice__mode-btn--compact"
        :class="`practice__mode-btn--${studyMode}`"
        :aria-label="`当前${STUDY_MODE_LABEL[studyMode]}，点击切换`"
        :title="`点击切换到${STUDY_MODE_LABEL[studyMode === 'practice' ? 'memorize' : 'practice']}`"
        @click="switchStudyMode(studyMode === 'practice' ? 'memorize' : 'practice')"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <path
            v-if="studyMode === 'practice'"
            d="M13 3 5 14h5l-1 7 8-11h-5l1-7z"
            fill="currentColor"
          />
          <path
            v-else
            d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10v16H5.5A1.5 1.5 0 0 1 4 18.5v-13zM14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14V4z"
            fill="currentColor"
          />
        </svg>
        <span class="practice__mode-text">{{ STUDY_MODE_LABEL[studyMode] }}</span>
      </button>
    </header>

    <AppHeader v-else :title="headerTitle" :back="false" />

    <!-- 选择页：两个居中按钮，选定后才进入刷题 -->
    <section v-if="!started && !finished" class="picker">
      <h1 class="picker__title">选择练习方式</h1>
      <p class="picker__tip muted">
        两种方式共用同一套题库，随时可在右上角切换
      </p>

      <button class="picker__btn picker__btn--practice" @click="startStudy('practice')">
        <span class="picker__icon picker__icon--practice" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M13 3 5 14h5l-1 7 8-11h-5l1-7z" fill="currentColor" />
          </svg>
        </span>
        <span class="picker__body">
          <span class="picker__name">刷题模式</span>
          <span class="picker__desc">全部题 · 简答自评 / 选择作答</span>
        </span>
      </button>

      <button class="picker__btn picker__btn--memorize" @click="startStudy('memorize')">
        <span class="picker__icon picker__icon--memorize" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path
              d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10v16H5.5A1.5 1.5 0 0 1 4 18.5v-13zM14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14V4z"
              fill="currentColor"
            />
          </svg>
        </span>
        <span class="picker__body">
          <span class="picker__name">背题模式</span>
          <span class="picker__desc">只有简答题 · 答案默认展开</span>
        </span>
      </button>

      <p v-if="progressInfo" class="picker__resume muted">
        上次停在 {{ progressInfo.studyModeLabel }} · {{ progressInfo.category }} ·
        {{ progressInfo.positionText }}
      </p>
    </section>

    <!-- 刷题中：只在 started 之后渲染 -->
    <template v-if="started">
    <!-- 注意：题目顺序、进度条都收进了顶部 ptop 栏，这里不再单独占行 -->
    <!-- 「续刷」提示改为浮层，2 秒后自动消失，不占常驻高度 -->
    <Transition name="toast">
      <div v-if="resumeToast && !finished" class="resume-toast" role="status">{{ resumeToast }}</div>
    </Transition>

    <!-- loading -->
    <div v-if="!ready || bank.loading" class="skeleton card" aria-busy="true" />

    <EmptyState
      v-else-if="bank.error"
      variant="error"
      title="题库加载失败"
      :desc="bank.error"
      action="重试"
      @action="bank.retry().then(build).catch(() => {})"
    />

    <EmptyState
      v-else-if="!total"
      variant="wrong"
      :title="mode === 'wrong' ? '暂无错题' : '该分类下暂无题目'"
      :desc="mode === 'wrong' ? '答错 / 自评「不会」的题会自动进入错题本。' : '换一个分类，或到题库页浏览全部题目。'"
      action="去题库"
      @action="router.push('/bank')"
    />

    <!-- 完成小结 -->
    <section v-else-if="finished" class="done card">
      <Ring :percent="roundSummary.knowRate" :size="96" label="掌握" />
      <h2 class="done__title">本轮完成</h2>
      <p class="done__desc">
        共 {{ roundSummary.total }} 题 · 对 <strong class="ok">{{ roundSummary.know }}</strong> ·
        错 <strong class="bad">{{ roundSummary.unknown }}</strong>
      </p>
      <div class="done__actions">
        <button class="btn btn--plain" @click="restart">再来一轮</button>
        <button class="btn btn--primary" @click="router.push('/me')">看掌握情况</button>
      </div>
    </section>

    <!-- 沉浸式题卡 -->
    <template v-else-if="current">
      <div ref="stageRef" class="stage" :class="slideDir ? `stage--${slideDir}` : ''">
        <article class="card qcard-p">
          <!-- 题头：滚动区外的固定信息 -->
          <div class="qcard-p__meta">
            <span class="badge qcard-p__cat">{{ current.category }}</span>
            <span class="badge qcard-p__type" :class="{ 'qcard-p__type--choice': !short }">{{ typeLabel }}</span>
            <DifficultyBadge :difficulty="current.difficulty" />
            <FrequencyBadge :frequency="current.frequency" />
            <span v-if="status" class="badge qcard-p__status" :class="`qcard-p__status--${status}`">
              {{ status === 'know' ? (short ? '会' : '答对') : (short ? '不会' : '答错') }}
            </span>
            <!-- 收藏：放在题目自己这一行，与「顶部导航」无关 -->
            <button
              class="qcard-p__fav"
              :class="{ 'qcard-p__fav--on': favorite }"
              :aria-label="favorite ? '取消收藏' : '收藏这道题'"
              :aria-pressed="favorite"
              @click="toggleFavorite"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  d="M12 3.5l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 10l6.1-.9z"
                  :fill="favorite ? 'currentColor' : 'none'"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>

          <!--
            题卡分三段（自上而下）：
            ① 题头 meta：分类/难度/频率 + 收藏（固定不滚）
            ② 题干区：题目 + 标签，以及简答题右侧的「看答案」按钮（固定不滚）
            ③ 滚动区：只有答案 / 选项 / 解析会随手指滚动

            为什么这样切：之前题干也在滚动区里，向下看答案时题目会被顶出去，
            用户失去上下文。现在题目始终钉在顶部，「下滑看答案」只让答案区滚动。
          -->
          <div class="qcard-p__head">
            <h2 class="qcard-p__q">{{ current.question }}</h2>

            <div v-if="current.tags?.length || short" class="qcard-p__qfoot">
              <ul v-if="current.tags?.length" class="qcard-p__tags">
                <li v-for="tag in current.tags" :key="tag" class="qcard-p__tag">#{{ tag }}</li>
              </ul>
              <!-- 简答题：看答案按钮与标签同一行，靠最右 -->
              <button
                v-if="short"
                class="qcard-p__toggle"
                :aria-expanded="expanded"
                @click="toggleAnswer"
              >
                <span>{{ expanded ? '收起答案' : '看答案' }}</span>
                <svg
                  class="qcard-p__chev"
                  :class="{ 'qcard-p__chev--up': expanded }"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <!-- 可滚动的答案/选项区 -->
          <div class="qcard-p__scroll">
            <!-- 选择题 -->
            <template v-if="!short">
              <ChoiceOptions
                :question="current"
                :selected="selected"
                :states="optionStates"
                :submitted="submitted"
                class="qcard-p__options"
                @select="onSelect"
              />

              <div v-if="submitted" class="result" :class="passed ? 'result--ok' : 'result--bad'">
                <span class="result__icon">{{ passed ? '✓' : '✕' }}</span>
                <span>{{ passed ? '回答正确' : '回答错误' }}</span>
              </div>

              <div v-if="submitted && current.explanation" class="explain">
                <p class="explain__label">解析</p>
                <AnswerText :answer="current.explanation" />
              </div>
            </template>

            <!-- 简答题：答案 -->
            <template v-else>
              <div class="answer" :class="{ 'answer--open': expanded }">
                <div class="answer__inner">
                  <div class="answer__body">
                    <AnswerText :answer="current.answer" />
                  </div>
                </div>
              </div>
            </template>
          </div>
        </article>
      </div>

      <!-- 吸底操作区 -->
      <div class="actions">
        <template v-if="short">
          <button
            class="btn actions__btn actions__btn--unknown"
            :class="{ 'actions__btn--on': status === 'unknown' }"
            @click="mark('unknown')"
          >
            不会
          </button>
          <button
            class="btn actions__btn actions__btn--know"
            :class="{ 'actions__btn--on': status === 'know' }"
            @click="mark('know')"
          >
            会
          </button>
        </template>
        <template v-else>
          <button
            v-if="multiple && !submitted"
            class="btn btn--primary actions__submit"
            :disabled="!selected.length"
            @click="submitMultiple"
          >
            提交答案{{ selected.length ? `（已选 ${selected.length}）` : '' }}
          </button>
          <button v-else-if="submitted" class="btn btn--primary actions__submit" @click="continueNext">
            {{ cursor >= total - 1 ? '完成本轮' : '下一题 →' }}
          </button>
          <p v-else class="actions__hint">
            点击选项即作答，判定后可慢慢看解析
          </p>
        </template>
      </div>

      <p class="tips muted">
        <template v-if="short">左滑下一题 · 右滑上一题 · 空格看答案 · 1 不会 / 2 会</template>
        <template v-else>左滑下一题 · 右滑上一题 · A–D 选择<template v-if="multiple"> · Enter 提交</template></template>
      </p>
    </template>
    </template>
  </div>
</template>

<style scoped>
.practice {
  /* 沉浸式：作为 .page--fill 的 flex 子项撑满高度，滚动交给内部卡片 */
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  padding-bottom: 0;
  /* 续刷提示用 absolute 定位在顶栏下方 */
  position: relative;
}

.practice__fav {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-text-3);
  border-radius: 50%;
}

/**
 * 右上角的模式切换按钮。
 *
 * 早期版本做得太小（30px 高、细边框），用户反馈「确实有点小」——
 * 看不出它是可点的，更像一个状态标签。现在：
 * - 高度 38px（接近 44px 的触控建议下限，且不与页头 52px 冲突）
 * - 有实色底 + 主色文字，视觉上明确是「按钮」
 * - 左侧带模式图标（闪电 / 书本），一眼看出当前在哪种模式
 */
.practice__mode-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 38px;
  padding: 0 12px 0 13px;
  border-radius: 19px;
  border: 1px solid transparent;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  transition: transform 0.12s ease;
}
.practice__mode-btn:active {
  transform: scale(0.96);
}
/* 刷题模式：主色（靛蓝） */
.practice__mode-btn--practice {
  color: var(--c-primary);
  background: var(--c-primary-weak);
  border-color: color-mix(in srgb, var(--c-primary) 32%, transparent);
}
/* 背题模式：青色，与刷题明确区分 */
.practice__mode-btn--memorize {
  color: var(--c-tag-teal, #0d9488);
  background: rgba(13, 148, 136, 0.12);
  border-color: rgba(13, 148, 136, 0.3);
}
.practice__mode-text {
  font-weight: 600;
}
.practice__mode-chev {
  opacity: 0.75;
}

/* ---------- 选择页（进入刷题前的两个居中按钮） ---------- */
.picker {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px 6px 40px;
}
.picker__title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--c-text);
}
.picker__tip {
  margin: 0 0 10px;
  font-size: 12px;
  text-align: center;
}
.picker__btn {
  width: 100%;
  max-width: 340px;
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 17px 18px;
  border-radius: 14px;
  border: 1.5px solid var(--c-border);
  background: var(--c-card);
  box-shadow: var(--shadow-card);
  text-align: left;
  transition: transform 0.14s ease, border-color 0.14s ease;
}
.picker__btn:active {
  transform: scale(0.985);
}
.picker__btn--practice {
  border-color: var(--c-primary);
  background: var(--c-primary-weak);
}
.picker__icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.picker__icon--practice {
  background: var(--grad-indigo);
}
.picker__icon--memorize {
  background: var(--grad-teal);
}
.picker__body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.picker__name {
  font-size: 16px;
  font-weight: 700;
  color: var(--c-text);
}
.picker__desc {
  font-size: 11.5px;
  color: var(--c-text-3);
}
.picker__resume {
  margin: 12px 0 0;
  padding: 8px 14px;
  border-radius: 20px;
  background: var(--c-card);
  border: 1px solid var(--c-border);
  font-size: 11px;
  line-height: 1.6;
  text-align: center;
}

/**
 * 刷题中的紧凑顶栏（48px）。
 *
 * 布局：左返回 · 中进度 · 右「顺序胶囊 + 模式切换」。
 *
 * 设计取舍（第一版被反馈「太丑」后重做）：
 * - 返回用箭头（←）而不是 ✕：✕ 暗示「关闭/丢弃」，而这里是「退回上一阶段」
 * - 顺序不再是裸文字，做成有底色的分段胶囊，与模式按钮同一套视觉语言
 * - 进度「第 17 / 1430 题」+ 细进度条合并成一块，不再挤成两行
 * - 顶栏底色与页面一致、底部一条 1px 分隔线，边界清晰不显脏
 */
.ptop {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 48px;
  margin: 0 -16px;
  padding: 0 12px;
  background: var(--c-bg);
  border-bottom: 1px solid var(--c-border);
}
/**
 * 返回按钮。
 *
 * 反馈「箭头很突兀」的原因：原来是无底色的细 chevron（`<`），
 * 竖在三个「有底色的块状元素」旁边，显得单薄又孤立。
 *
 * 现在：
 * - 换成带横线的标准返回箭头（←），视觉重量与其它元素匹配
 * - 加一个与「顺序胶囊」同款淡底色圆角方块，让它成为「一排控件」中的一员
 * - 颜色用 text-2（不是更浅的 text-3），避免被当成禁用态
 */
.ptop__back {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-text-2);
  background: var(--c-card);
  border: 1px solid var(--c-border);
  border-radius: 9px;
}
.ptop__back:active {
  background: var(--c-primary-weak);
  border-color: var(--c-primary);
  color: var(--c-primary);
}

/* 中间：进度文字 + 细进度条，纵向两行但很紧凑 */
.ptop__center {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.ptop__count {
  font-size: 12px;
  color: var(--c-text-2);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.ptop__bar {
  height: 3px;
  background: var(--c-border);
  border-radius: 2px;
  overflow: hidden;
}
.ptop__fill {
  height: 100%;
  background: var(--c-primary);
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* 题目顺序：分段胶囊（有底色，当前项高亮） */
.ptop__seg {
  flex-shrink: 0;
  display: flex;
  padding: 2px;
  gap: 2px;
  border-radius: 10px;
  background: var(--c-card);
  border: 1px solid var(--c-border);
}
.ptop__seg-item {
  height: 26px;
  padding: 0 10px;
  border-radius: 8px;
  font-size: 12px;
  color: var(--c-text-3);
  white-space: nowrap;
}
.ptop__seg-item--on {
  color: #fff;
  background: var(--c-primary);
  font-weight: 500;
}

/* 紧凑模式按钮：与顶栏同高 */
.practice__mode-btn--compact {
  height: 30px;
  padding: 0 11px;
  font-size: 12px;
  gap: 4px;
}

/* 续刷浮层提示：2 秒后消失，不占常驻高度 */
.resume-toast {
  position: absolute;
  top: 58px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 11.5px;
  color: #fff;
  background: rgba(0, 0, 0, 0.72);
  z-index: 20;
  pointer-events: none;
  white-space: nowrap;
}
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
}

.skeleton {
  flex: 1;
  margin-top: 10px;
  background: linear-gradient(90deg, var(--c-card) 25%, var(--c-bg) 37%, var(--c-card) 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}
@keyframes shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

/* 舞台：占满剩余高度 */
.stage {
  flex: 1;
  display: flex;
  margin-top: 10px;
  min-height: 0;
  transition: transform 0.18s ease, opacity 0.18s ease;
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  cursor: grab;
}
/**
 * 关键：touch-action 不继承。
 * 手指通常落在卡片内容区（.qcard-p__scroll 等子元素）上，
 * 若子元素是默认的 auto，浏览器会自行接管横向手势并派发 pointercancel，
 * 导致 JS 手势收不到完整 move → 手机上滑不动。
 * 这里让舞台内所有元素都只允许纵向平移。
 */
.stage,
.stage * {
  touch-action: pan-y;
}

/**
 * 例外：答案里的表格与代码块自身要能横向滚动。
 * 继续用 pan-y 会让它们横滑不动（内容被截断看起来像是排版崩了），
 * 这里放开为 pan-x pan-y——纵向仍可翻卡，横向可看完整表格。
 */
.stage :deep(.ans-table-wrap),
.stage :deep(.ans-pre__body) {
  touch-action: pan-x pan-y;
}
.stage:active {
  cursor: grabbing;
}
.stage--left {
  transform: translateX(-24px);
  opacity: 0;
}
.stage--right {
  transform: translateX(24px);
  opacity: 0;
}

/* 卡片：内部纵向滚动，不在整页留白 */
.qcard-p {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 12px 14px;
  overflow: hidden;
}
.qcard-p__meta {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  flex-shrink: 0;
}
/* 收藏按钮固定在题头行末尾（题目自己的收藏，与顶部导航无关） */
.qcard-p__fav {
  flex-shrink: 0;
  margin-left: auto;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--c-text-3);
}
.qcard-p__fav:active {
  background: var(--c-bg);
}
.qcard-p__fav--on {
  color: var(--c-warning);
}
.qcard-p__cat {
  color: var(--c-text-2);
  background: var(--c-bg);
}
.qcard-p__type {
  color: var(--c-text-2);
  background: var(--c-bg);
}
.qcard-p__type--choice {
  color: var(--c-primary);
  background: var(--c-primary-weak);
}
.qcard-p__status {
  margin-left: auto;
}
.qcard-p__status--know {
  color: var(--c-success);
  background: var(--c-success-weak);
}
.qcard-p__status--unknown {
  color: var(--c-danger);
  background: var(--c-danger-weak);
}

/**
 * 滚动区：只有这一块会随手指滚动。
 *
 * 题干固定在 .qcard-p__head 里不参与滚动，
 * 所以「向下滑看答案」时题目始终留在顶部。
 */
.qcard-p__scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding-top: 10px;
}

/* 答案展开时去掉上边距，紧贴题干下方，省出一行空间 */
.qcard-p__scroll .answer__body {
  margin-top: 0;
}

/**
 * 题干区（固定不滚，但有高度上限）。
 *
 * flex-shrink: 0 保证它不被下方滚动区挤压；
 * 同时给一个 max-height，避免「超长题干」把答案区挤得只剩几行——
 * 超过上限时题干自己内部滚动，仍然「标题始终可见」，只是不会无限占屏。
 *
 * 上限取 38vh：iPhone SE 级小屏（约 570px 可视高）下约 216px，
 * 够放 4-5 行 16px 的题干；再长就内部滚。
 */
.qcard-p__head {
  flex-shrink: 0;
  max-height: 38vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding-top: 2px;
}
/* 题干 + 标签 与「看答案」按钮同一行：标签左、按钮右 */
.qcard-p__qfoot {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}
.qcard-p__q {
  margin: 10px 0 0;
  font-size: 16px;
  line-height: 1.6;
  font-weight: 600;
  color: var(--c-text);
}

.qcard-p__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin: 0;
  min-width: 0;
  flex: 1;
}
.qcard-p__tag {
  font-size: 11.5px;
  color: var(--c-primary);
  background: var(--c-primary-weak);
  padding: 3px 7px;
  border-radius: 4px;
}

.qcard-p__options {
  margin-top: 12px;
}

/**
 * 「看答案」按钮（简答题）。
 *
 * 从原来的「整行大按钮」改成行内小胶囊，与标签同行、靠最右：
 * - 省掉一整行（44px + 12px margin），答案区多显示一行
 * - 语义更清楚：「看本题答案」属于这道题，不是独立功能
 */
.qcard-p__toggle {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 3px;
  height: 28px;
  padding: 0 9px 0 11px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--c-primary) 30%, transparent);
  background: var(--c-primary-weak);
  font-size: 12px;
  font-weight: 500;
  color: var(--c-primary);
  white-space: nowrap;
}
.qcard-p__toggle:active {
  transform: scale(0.96);
}
.qcard-p__chev {
  display: flex;
  align-items: center;
  opacity: 0.8;
  transition: transform 0.2s ease;
}
.qcard-p__chev--up {
  transform: rotate(180deg);
}

.answer {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.25s ease;
}
.answer--open {
  grid-template-rows: 1fr;
}
.answer__inner {
  overflow: hidden;
  min-height: 0;
}
.answer__body {
  margin-top: 10px;
  padding: 11px 12px;
  background: var(--c-answer-bg);
  border: 1px solid var(--c-answer-border);
  border-radius: var(--radius-sm);
}

/* 判定结果 */
.result {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
}
.result--ok {
  color: var(--c-success);
  background: var(--c-success-weak);
}
.result--bad {
  color: var(--c-danger);
  background: var(--c-danger-weak);
}
.result__icon {
  font-weight: 700;
}

.explain {
  margin-top: 8px;
  padding: 10px;
  background: var(--c-bg);
  border-radius: var(--radius-sm);
}
.explain__label {
  margin: 0 0 5px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--c-text-2);
}

/* 吸底操作区 */
.actions {
  flex-shrink: 0;
  display: flex;
  gap: 10px;
  margin: 8px -12px 0;
  padding: 8px 12px calc(8px + env(safe-area-inset-bottom, 0px));
  background: var(--c-bg);
  border-top: 1px solid var(--c-border);
}
.actions__btn {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  border: 1px solid var(--c-border);
  background: var(--c-card);
}
.actions__btn--unknown {
  color: var(--c-danger);
}
.actions__btn--unknown.actions__btn--on {
  background: var(--c-danger-weak);
  border-color: var(--c-danger);
}
.actions__btn--know {
  color: var(--c-success);
}
.actions__btn--know.actions__btn--on {
  background: var(--c-success-weak);
  border-color: var(--c-success);
}
.actions__submit {
  flex: 1;
}
.actions__submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
/* 提示文案样式（单选等待点击时占位，不可点） */
.actions__hint {
  flex: 1;
  margin: 0;
  text-align: center;
  font-size: 12.5px;
  color: var(--c-text-3);
  align-self: center;
}

.tips {
  flex-shrink: 0;
  margin: 6px 0 0;
  text-align: center;
  font-size: 11px;
}

/* 完成小结 */
.done {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 18px;
  margin-top: 16px;
}
.done__title {
  margin: 14px 0 5px;
  font-size: 17px;
  color: var(--c-text);
}
.done__desc {
  margin: 0;
  font-size: 13px;
  color: var(--c-text-2);
}
.done__desc .ok {
  color: var(--c-success);
}
.done__desc .bad {
  color: var(--c-danger);
}
.done__actions {
  display: flex;
  gap: 10px;
  width: 100%;
  margin-top: 18px;
}
.done__actions .btn {
  flex: 1;
}
</style>
