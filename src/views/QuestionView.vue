<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import DifficultyBadge from '@/components/DifficultyBadge.vue'
import FrequencyBadge from '@/components/FrequencyBadge.vue'
import ChoiceOptions from '@/components/ChoiceOptions.vue'
import AnswerText from '@/components/AnswerText.vue'
import { useBankStore } from '@/stores/bankStore'
import { buildRetryHint } from '@/utils/retryHint'
import { useStudyStore } from '@/stores/studyStore'
import { STATUS, TYPE_LABEL } from '@/utils/constants'
import { attachSwipe } from '@/utils/gestures'
import {
  isShort,
  isMultiple,
  answerSingle,
  toggleOption,
  judgeChoice,
  optionState,
  resultToStatus,
  resultText,
} from '@/utils/question'

const route = useRoute()
const router = useRouter()
const bank = useBankStore()
const study = useStudyStore()

/**
 * 返回目标：按「从哪儿进来的」决定，而不是一律回题库。
 *
 * 题目详情可以从很多地方进入：题库列表、首页每日一题、收藏、错题本。
 * 早先这里写死 `back-to="/bank"`，导致从**首页每日一题**点进来后，
 * 点返回会跳到题库页 —— 用户明确反馈过这个路径不对。
 *
 * 约定：入口页在跳转时带 `?from=<路径>`，这里只接受白名单内的值，
 * 防止被构造成任意跳转。没带或不在白名单 → 用浏览器历史回退。
 */
const FROM_ROUTES = ['/', '/bank', '/favorites', '/wrong', '/me']
const backTo = computed(() => {
  const from = route.query.from
  return typeof from === 'string' && FROM_ROUTES.includes(from) ? from : ''
})

/** 错误态文案（含重试退避冷却提示） */
const retryHint = computed(() => buildRetryHint(bank))

/**
 * 答案是否展开。
 *
 * **从收藏进详情时默认展开**：收藏的定位就是「留一道值得反复看的题」，
 * 用户进来是要回顾内容，不该再点一次「展开参考答案」。
 *
 * 从题库 / 首页进来保持折叠 —— 那里是「做题 / 浏览」场景，
 * 尤其是首页「每日一记」，先想一想再看答案才有意义。
 */
const fromFavorites = computed(() => route.query.from === '/favorites')
const expanded = ref(false)
/** 选择题作答态 */
const selected = ref([])
const submitted = ref(false)
const passed = ref(false)

const id = computed(() => Number(route.params.id))
const question = computed(() => bank.getById(id.value))
const short = computed(() => (question.value ? isShort(question.value) : true))
const multiple = computed(() => (question.value ? isMultiple(question.value) : false))
const status = computed(() => study.statusOf(id.value))
const favorite = computed(() => study.isFavorite(id.value))
const record = computed(() => study.recordOf(id.value))
const typeLabel = computed(() => (question.value ? TYPE_LABEL[question.value.type || 'short'] : ''))

/** 选项状态：仅在已判定后计算，否则全部 idle */
const optionStates = computed(() =>
  submitted.value && question.value ? optionState(question.value, selected.value, passed.value) : {}
)

/**
 * 左右滑动切题的**范围**。
 *
 * 默认是全库顺序（题库页那种「浏览所有题」的场景）。
 * 但**从错题本 / 收藏进来时必须限定在那一批**：
 * 用户在「错题本 · MySQL」里看到「共 6 题」，左右滑动就该在这 6 题里走，
 * 而不是滑两下跳到别的分类、别的来源。
 *
 * URL 由入口带 `?scope=wrong|favorites&category=X` 表达；
 * 未带 scope 时才回落到全库。
 */
const scopedList = computed(() => {
  const scope = route.query.scope
  if (scope !== 'wrong' && scope !== 'favorites') return bank.questions

  const source = scope === 'wrong' ? study.wrongList : study.favoriteList
  const category = route.query.category
  // 带分类时再按分类收窄（列表页就是按分类进的明细）
  const list =
    typeof category === 'string' && category ? source.filter((q) => q.category === category) : source

  /**
   * 兜底：这题可能刚被「连对移出」或「取消收藏」，已不在这批里。
   * 此时把当前题补进去（单元素列表），滑动自然停在原地，
   * 不会退回全库乱跳。
   */
  if (!list.some((q) => q.id === id.value) && question.value) return [question.value]
  return list
})

const index = computed(() => scopedList.value.findIndex((q) => q.id === id.value))
const prevQuestion = computed(() => (index.value > 0 ? scopedList.value[index.value - 1] : null))
const nextQuestion = computed(() =>
  index.value >= 0 && index.value < scopedList.value.length - 1 ? scopedList.value[index.value + 1] : null
)

/**
 * 左右滑动切题（替代底部的「上一题 / 下一题」按钮）。
 *
 * 用与刷题页相同的 attachSwipe：
 * - 左滑 → 下一题，右滑 → 上一题
 * - 只在「答案已收起」时才响应，避免横向拖动时误切题（如滑动查看宽表格）
 * - 首尾不循环（没有上一题/下一题时就停在原地）
 *
 * CSS 侧必须同时给 .stage 及其所有子孙设 touch-action: pan-y，
 * 否则移动端横向手势会被浏览器的纵向滚动吞掉（这个坑踩过一次）。
 */
const stageRef = ref(null)
let detachSwipe = () => {}

/**
 * 边界提示：划到第一题 / 最后一题还继续滑时，**屏幕中间弹一个轻量提示**。
 *
 * 早先做在底部那行小字上，用户反馈「提示在底部，很容易忽略」——
 * 底部那行本来就有常驻说明，再往里换字，视线根本不会落到那儿。
 *
 * 所以改成居中浮层：
 * - 位置在屏幕中央偏下（不挡题干，也不用用户往下看）
 * - 深底浅字 + 圆角，与页面其他内容的层级拉开
 * - 1.6 秒后自动消失（不是常驻，越界只是少数情况）
 * - `pointer-events: none`：不拦手指，提示显示期间照样能滑动
 */
const boundaryHint = ref('')
let boundaryTimer = 0

function flashBoundaryHint() {
  // 先清掉上一次的计时，避免连续滑动时提示提前消失
  if (boundaryTimer) clearTimeout(boundaryTimer)
  boundaryHint.value = nextQuestion.value ? '已经是第一题' : '已经是最后一题'
  boundaryTimer = setTimeout(() => {
    boundaryHint.value = ''
    boundaryTimer = 0
  }, 1600)
}

onBeforeUnmount(() => {
  if (boundaryTimer) clearTimeout(boundaryTimer)
})

function bindSwipe() {
  detachSwipe()
  detachSwipe = () => {}
  if (!stageRef.value || !question.value) return
  detachSwipe = attachSwipe(stageRef.value, {
    onLeft: () => go(nextQuestion.value),
    onRight: () => go(prevQuestion.value),
  })
}

watch(stageRef, (el) => {
  if (el) bindSwipe()
  else {
    detachSwipe()
    detachSwipe = () => {}
  }
}, { flush: 'post' })

onBeforeUnmount(() => detachSwipe())

onMounted(async () => {
  // 从收藏进来 → 答案默认展开（收藏是「反复看」的场景，不该再点一次）
  expanded.value = fromFavorites.value

  // 详情页需要答案，但不必拉全量：先取索引（含分类），再只补这道题所属的分类分片。
  try {
    await bank.loadIndex()
    const cat = bank.getById(id.value)?.category
    await bank.hydrateCategory(cat || '')
  } catch {
    // 错误态由 bankStore 的 error 渲染
  }
})

/**
 * 错误态里的「重试」：走索引 + 分片路径。
 * 不能调 bank.retry() —— 那是全量加载，会请求已从部署产物剔除的 questions.json。
 */
async function retryLoad() {
  try {
    await bank.retryIndex()
    const cat = bank.getById(id.value)?.category
    await bank.hydrateCategory(cat || '')
  } catch {
    // 失败仍由 bankStore 的 error 呈现
  }
}

/** 切题时重置作答态与折叠态 */
watch(id, () => {
  /**
   * 收藏场景下切题也保持展开 —— 用户是在「翻看收藏的题」，
   * 每切一道就收起、再让他点一次「展开」，没有道理。
   * 其他来源切题一律收起（避免边翻边看答案）。
   */
  expanded.value = fromFavorites.value
  resetChoice()
  // 切到的题可能属于别的分类 —— 补一次，避免答案字段缺失
  const cat = bank.getById(id.value)?.category
  if (cat) bank.hydrateCategory(cat).catch(() => {})
})

function resetChoice() {
  selected.value = []
  submitted.value = false
  passed.value = false
}

function toggleAnswer() {
  expanded.value = !expanded.value
}

function toggleFavorite() {
  study.toggleFavorite(id.value)
}

// ---------- 简答题自评 ----------

function mark(s) {
  if (s === STATUS.KNOW) study.markKnow(id.value)
  else study.markUnknown(id.value)
}

// ---------- 选择题作答 ----------

function onSelect(key) {
  if (submitted.value) return
  if (multiple.value) {
    selected.value = toggleOption(selected.value, key)
  } else {
    // 单选：点即判定
    const res = answerSingle(question.value, key)
    selected.value = res.selected
    commitResult(res.passed)
  }
}

/** 多选：点「提交答案」才判定 */
function submitMultiple() {
  if (!selected.value.length) return
  commitResult(judgeChoice(question.value, selected.value))
}

function commitResult(isPassed) {
  passed.value = isPassed
  submitted.value = true
  // 答对记 know、答错记 unknown，复用既有 records
  const s = resultToStatus(isPassed)
  if (s === STATUS.KNOW) study.markKnow(id.value)
  else study.markUnknown(id.value)
}

/** 重做本题 */
function retry() {
  resetChoice()
}

function go(q) {
  /**
   * 划到边界时**给出提示**，而不是静默 return。
   *
   * 早先 `if (!q) return` 直接返回：用户滑到最后一题继续往后滑，
   * 界面毫无反应，会以为手势失灵或页面卡住了。
   * 这里闪一下底部提示条，明确告诉用户「已经到头了」。
   */
  if (!q) {
    flashBoundaryHint()
    return
  }
  /**
   * 切题时要**同时保留 from 与 scope/category**。
   *
   * - 丢 `from` → 「返回」的目标没了
   * - 丢 `scope`/`category` → 切到下一题后滑动范围变回全库，
   *   于是一路滑下去会串到别的分类、别的来源（正是用户报的 bug）
   */
  const params = new URLSearchParams()
  if (backTo.value) params.set('from', backTo.value)
  const scope = route.query.scope
  if (scope === 'wrong' || scope === 'favorites') {
    params.set('scope', scope)
    const category = route.query.category
    if (typeof category === 'string' && category) params.set('category', category)
  }
  const suffix = params.toString() ? `?${params.toString()}` : ''
  router.push(`/question/${q.id}${suffix}`)
}

const statusText = computed(() => {
  if (short.value) {
    if (status.value === STATUS.KNOW) return '已标记为「会」'
    if (status.value === STATUS.UNKNOWN) return '已标记为「不会」'
    return '尚未自评'
  }
  if (status.value === STATUS.KNOW) return '最近一次「答对」'
  if (status.value === STATUS.UNKNOWN) return '最近一次「答错」'
  return '尚未作答'
})
</script>

<template>
  <div class="page page--fill">
    <AppHeader title="题目详情" :back-to="backTo" />

    <div v-if="bank.loading" class="skeleton card" aria-busy="true" />

    <EmptyState
      v-else-if="bank.error"
      variant="error"
      title="题库加载失败"
      :desc="retryHint"
      action="重试"
      :action-disabled="bank.inCooldown"
      @action="retryLoad"
    />

    <EmptyState
      v-else-if="!question"
      variant="search"
      title="题目不存在"
      desc="该题可能已从题库移除，请返回题库重新选择。"
      action="回题库"
      @action="router.replace('/bank')"
    />

    <template v-else>
      <div ref="stageRef" class="stage">
      <article class="card detail">
        <div class="detail__meta">
          <span class="badge detail__cat">{{ question.category }}</span>
          <span class="badge detail__type" :class="{ 'detail__type--choice': !short }">{{ typeLabel }}</span>
          <DifficultyBadge :difficulty="question.difficulty" />
          <FrequencyBadge :frequency="question.frequency" />
          <!-- 只有简答题可收藏（选择题的价值在选项里，收进收藏页无意义） -->
          <button
            v-if="short"
            class="detail__star"
            :class="{ 'detail__star--on': favorite }"
            :aria-label="favorite ? '取消收藏' : '收藏这道题'"
            :aria-pressed="favorite"
            @click="toggleFavorite"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
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

        <h2 class="detail__question">{{ question.question }}</h2>

        <ul v-if="question.tags?.length" class="detail__tags">
          <li v-for="tag in question.tags" :key="tag" class="detail__tag">#{{ tag }}</li>
        </ul>

        <!-- 选择题：选项作答 -->
        <template v-if="!short">
          <ChoiceOptions
            :question="question"
            :selected="selected"
            :states="optionStates"
            :submitted="submitted"
            class="detail__options"
            @select="onSelect"
          />

          <button
            v-if="multiple && !submitted"
            class="btn btn--primary detail__submit"
            :disabled="!selected.length"
            @click="submitMultiple"
          >
            提交答案{{ selected.length ? `（已选 ${selected.length}）` : '' }}
          </button>

          <div v-if="submitted" class="result" :class="passed ? 'result--ok' : 'result--bad'">
            <span class="result__icon">{{ passed ? '✓' : '✕' }}</span>
            <span class="result__text">
              {{ passed ? '回答正确' : '回答错误' }}
            </span>
            <button class="result__retry" @click="retry">重做</button>
          </div>

          <div v-if="submitted && question.explanation" class="explain">
            <p class="explain__label">解析</p>
            <AnswerText :answer="question.explanation" />
          </div>
        </template>

        <!-- 简答题：折叠答案 -->
        <template v-else>
          <button
            class="answer-toggle"
            :aria-expanded="expanded"
            aria-controls="answer-panel"
            @click="toggleAnswer"
          >
            <span>{{ expanded ? '收起参考答案' : '展开参考答案' }}</span>
            <svg
              class="answer-toggle__chevron"
              :class="{ 'answer-toggle__chevron--up': expanded }"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>

          <div id="answer-panel" class="answer" :class="{ 'answer--open': expanded }">
            <div class="answer__inner">
              <div class="answer__body">
                <AnswerText :answer="question.answer" />
              </div>
            </div>
          </div>
        </template>
      </article>
      </div>

      <p class="status-hint muted">
        {{ statusText }}
        <template v-if="record && record.times"> · 已作答 {{ record.times }} 次</template>
      </p>

      <!-- 简答题才有自评按钮；选择题由选项判定 -->
      <div v-if="short" class="actions">
        <button
          class="btn actions__btn actions__btn--unknown"
          :class="{ 'actions__btn--on': status === STATUS.UNKNOWN }"
          @click="mark(STATUS.UNKNOWN)"
        >
          不会
        </button>
        <button
          class="btn actions__btn actions__btn--know"
          :class="{ 'actions__btn--on': status === STATUS.KNOW }"
          @click="mark(STATUS.KNOW)"
        >
          会
        </button>
      </div>

      <!-- 滑动切题提示（常驻说明；越界时另有居中弹层） -->
      <p class="swipe-hint muted">左右滑动切换上一题 / 下一题</p>
    </template>

    <!--
      越界提示：居中浮层，1.6 秒自动消失。
      放在 .page 里而不是 .stage 里，避免跟着滑动区一起被 transform 影响。
    -->
    <Transition name="boundary-fade">
      <div v-if="boundaryHint" class="boundary-toast" role="status" aria-live="polite">
        {{ boundaryHint }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.skeleton {
  height: 200px;
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

.detail {
  padding: 12px 14px;
  margin-top: 10px;
}

.detail__meta {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}
.detail__cat {
  color: var(--c-text-2);
  background: var(--c-bg);
}
.detail__type {
  color: var(--c-text-2);
  background: var(--c-bg);
}
.detail__type--choice {
  color: var(--c-primary);
  background: var(--c-primary-weak);
}
.detail__star {
  margin-left: auto;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-text-3);
  border-radius: 50%;
}
.detail__star--on {
  color: var(--c-warning);
}
.detail__star:active {
  background: var(--c-primary-weak);
}

.detail__question {
  margin: 12px 0 0;
  font-size: 16px;
  line-height: 1.6;
  font-weight: 600;
  color: var(--c-text);
}

.detail__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin: 10px 0 0;
}
.detail__tag {
  font-size: 11.5px;
  color: var(--c-primary);
  background: var(--c-primary-weak);
  padding: 3px 7px;
  border-radius: 4px;
}

.detail__options {
  margin-top: 14px;
}
.detail__submit {
  width: 100%;
  margin-top: 12px;
}
.detail__submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* 判定结果 */
.result {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  font-size: 13.5px;
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
  font-size: 15px;
  font-weight: 700;
}
.result__text {
  flex: 1;
}
.result__retry {
  font-size: 12.5px;
  font-weight: 500;
  color: inherit;
  opacity: 0.85;
  text-decoration: underline;
  min-height: 32px;
  padding: 0 4px;
}

/* 解析 */
.explain {
  margin-top: 10px;
  padding: 10px 12px;
  background: var(--c-bg);
  border-radius: var(--radius-sm);
}
.explain__label {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--c-text-2);
}

/* 折叠答案 */
.answer-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 44px;
  margin-top: 14px;
  padding: 10px 12px;
  background: var(--c-bg);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  color: var(--c-primary);
}
.answer-toggle__chevron {
  transition: transform 0.2s ease;
}
.answer-toggle__chevron--up {
  transform: rotate(180deg);
}

.status-hint {
  margin: 10px 0 0;
  text-align: center;
  font-size: 12px;
}

/* 自评按钮（仅简答题） */
.actions {
  position: sticky;
  bottom: 0;
  display: flex;
  gap: 10px;
  margin: 14px -12px 0;
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom, 0px));
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

/**
 * 滑动切题的舞台。
 *
 * **`flex: 1` 是关键**：滑动事件绑在这个容器上，它必须撑满「页头以下、
 * 提示文字以上」的全部剩余空间，用户才能在屏幕任意位置左右滑动切题。
 *
 * 早先这里只写了 `touch-action`、没有布局 —— 容器高度由内容撑开，
 * 于是**可滑动区域只有卡片那一小块**（用户反馈「只有卡片那点地方能滑」）。
 * 刷题页的 `.stage` 一直有 `flex: 1`，所以那边一直是正常的。
 *
 * 前提是外层 `.page` 带 `page--fill`（纵列 flex），否则 flex 链在父级就断了。
 *
 * `touch-action: pan-y` 必须同时给自身与**所有子孙**：
 * 手指通常落在卡片文字上，不设的话横向手势会被浏览器的纵向滚动吞掉（踩过一次）。
 */
.stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}
.stage * {
  touch-action: pan-y;
}

.swipe-hint {
  margin: 10px 0 8px;
  padding-bottom: 8px;
  font-size: 11.5px;
  text-align: center;
}

/**
 * 越界提示浮层。
 *
 * **居中、深底浅字**：早先做在底部那行小字上，用户反馈「很容易忽略」——
 * 底部本来就有常驻说明，往里换字视线根本不会落到那儿。
 * 做成居中浮层后，视线正在题目上，提示会自然进入视野中央。
 *
 * - 位置 `top: 50%` 再往上一小段：不挡题干可视区
 * - `pointer-events: none`：不拦手指，提示期间照样能继续滑动
 * - 层级高于卡片，但不加遮罩 —— 没必要为一条 1.6 秒的提示压暗整屏
 */
.boundary-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 40;
  transform: translate(-50%, -50%);
  padding: 10px 20px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--c-text) 86%, transparent);
  color: var(--c-bg);
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
}

/* 淡入淡出：越界提示不能「啪」地出现，那样更像报错 */
.boundary-fade-enter-active,
.boundary-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.boundary-fade-enter-from,
.boundary-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.94);
}
</style>
