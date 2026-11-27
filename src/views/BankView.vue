<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import QuestionCard from '@/components/QuestionCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import Pagination from '@/components/Pagination.vue'
import { useBankStore } from '@/stores/bankStore'
import { CATEGORIES, DIFFICULTIES, FREQUENCIES, TYPES, PAGE_SIZE, SEARCH_DEBOUNCE_MS } from '@/utils/constants'
import { applyFilters, parseQueryState, toQueryState } from '@/utils/filter'
import { pageMeta, paginate } from '@/utils/paginate'
import { buildRetryHint } from '@/utils/retryHint'
import { scrollToTop } from '@/utils/scroll'

const route = useRoute()
const router = useRouter()
const bank = useBankStore()

/** 题型筛选的合法枚举（URL 里存的是 `short` / `single` / `multiple`） */
const TYPE_VALUES = TYPES.map((t) => t.value)

/** URL 是筛选态的唯一来源：刷新 / 返回都能恢复 */
const state = computed(() =>
  parseQueryState(route.query, CATEGORIES, FREQUENCIES, DIFFICULTIES, TYPE_VALUES)
)

/** 搜索框本地值（输入时即时响应，防抖后才写 URL） */
const keywordInput = ref(state.value.keyword)
let debounceTimer = null

onMounted(() => {
  bank.loadIndex().catch(() => {})
  // 滚动位置恢复（配合路由 scrollBehavior 的 savedPosition 不够，列表是动态渲染的）
  restoreScroll()
  // 展开分类后，点空白处收起（手机端尤其重要：不用去够那个小箭头）
  document.addEventListener('click', onDocClick, true)
})

/** 外部 URL 变化（如浏览器后退）时，同步回输入框 */
watch(
  () => state.value.keyword,
  (val) => {
    if (val !== keywordInput.value) keywordInput.value = val
  }
)

function pushState(next) {
  const query = toQueryState({ ...state.value, ...next }, 1)
  router.replace({ path: '/bank', query })
}

function onKeywordInput(e) {
  const value = e.target.value
  keywordInput.value = value
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (value !== state.value.keyword) pushState({ keyword: value })
  }, SEARCH_DEBOUNCE_MS)
}

function clearKeyword() {
  keywordInput.value = ''
  if (debounceTimer) clearTimeout(debounceTimer)
  pushState({ keyword: '' })
}

function selectCategory(cat) {
  pushState({ category: state.value.category === cat ? '' : cat })
  /**
   * 选中后收起分类区。
   *
   * 展开的目的就是「挑一个分类」，挑完自然该回到紧凑状态 ——
   * 否则选完还占着 15 行，得再点一次箭头，多一步无意义操作。
   * 手机上尤其明显：选完想立刻看题目，却还被分类挡住。
   */
  catsExpanded.value = false
}

/**
 * 题型筛选。点已选中的项会取消（回到「全部题型」），与其它筛选一致。
 *
 * 注意这里传的是 `TYPE_VALUES`（`short` / `single` / `multiple` 原值），
 * 不是展示名「简答」—— URL 与数据字段都按原值走，展示名只在模板里用。
 */
function selectType(type) {
  pushState({ type: state.value.type === type ? '' : type })
}

function selectFrequency(freq) {
  pushState({ frequency: state.value.frequency === freq ? '' : freq })
}

function selectDifficulty(diff) {
  pushState({ difficulty: state.value.difficulty === diff ? '' : diff })
}

/**
 * 分类筛选默认折叠，只显示前几个 + 「展开全部」。
 *
 * 23 个分类平铺要占 5-6 行，把搜索框和列表挤到很下面；
 * 折叠后首屏直接看到题目，需要选分类时再展开。
 *
 * 用「限制数量」而不是「CSS 限高」：胶囊宽度随屏幕变化（375px 与 480px
 * 一行能放的个数不同），限高在不同机型下折叠效果不一致；限制数量则确定。
 */
const catsExpanded = ref(false)

/** 折叠时显示的分类数（不含「全部」） */
const COLLAPSED_CAT_COUNT = 3
/**
 * 为什么是 3：2 列网格下，「全部」+ 3 个分类 = 4 格 = **恰好 2 行满格**。
 *
 * 用户要求折叠态只占 2 行。2 列 × 2 行 = 4 格，减去「全部」正好剩 3 格。
 * 展开箭头浮在右下角（绝对定位），不占格子。
 */
const visibleCategories = computed(() => {
  if (catsExpanded.value) return availableCategories.value
  const shown = availableCategories.value.slice(0, COLLAPSED_CAT_COUNT)
  // 选中的分类若被折叠掉，补到最前面，避免「选中了却看不见」
  const selected = state.value.category
  if (selected && !shown.includes(selected)) {
    return [selected, ...shown.slice(0, COLLAPSED_CAT_COUNT - 1)]
  }
  return shown
})

/**
 * 展开 / 收起分类。
 *
 * **展开时把选中的分类滚进可见区** ——
 * 展开态现在有 `max-height` 限高（约 6 行），其余分类靠内部滚动。
 * 如果用户当前选的是第 20 个分类（比如「Kubernetes」），
 * 展开后它可能不在可见范围内，用户会以为「没选中」。
 */
async function toggleCats() {
  catsExpanded.value = !catsExpanded.value
  if (!catsExpanded.value) return
  await nextTick()
  const nav = document.getElementById('bank-cats')
  const active = nav?.querySelector('.chip--active')
  if (active && typeof active.scrollIntoView === 'function') {
    /**
     * `block: 'nearest'` 保证只滚动网格内部，不带动整个页面。
     * 用 'nearest' 而不是 'center'：已经在可见区时不做无谓滚动。
     */
    active.scrollIntoView({ block: 'nearest', behavior: 'auto' })
  }
}

/** 是否真的需要「展开」按钮（分类很少时不必出现） */



/**
 * 点空白处收起分类（展开状态下）。
 *
 * ## 为什么需要
 *
 * 展开后分类区占好几行，手指正停在屏幕中间 —— 此时要收起，
 * 得先把手指移到右侧那个 26px 的小箭头上，很别扭。
 * 点任意空白处收起符合「点外面就关掉」的通用直觉（弹窗、下拉都这样）。
 *
 * ## 三个边界
 *
 * ① **点分类区内部不收起** —— 那里有 chip 和箭头，各自有自己的 click 逻辑。
 *    箭头靠它自己的 `@click` toggle；若这里也处理会变成「点一次切换两次」。
 * ② **只在展开状态监听** —— 折叠态没有可收起的东西，不必拦事件。
 * ③ **用 capture 阶段** —— 保证在其它 click 处理前判断，
 *    避免某个 handler 先 `stopPropagation` 导致这里收不到。
 */
function onDocClick(e) {
  if (!catsExpanded.value) return
  const root = document.querySelector('.bank-cats')
  // 点在分类区内（chip / 箭头）→ 交给它们自己的处理
  if (root && e.target instanceof Node && root.contains(e.target)) return
  catsExpanded.value = false
}

function resetAll() {
  keywordInput.value = ''
  if (debounceTimer) clearTimeout(debounceTimer)
  router.replace({ path: '/bank', query: {} })
}

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
  saveScroll()
  document.removeEventListener('click', onDocClick, true)
})

// ---------- 列表滚动位置恢复 ----------

const SCROLL_KEY = 'oi_bank_scroll'

function saveScroll() {
  try {
    sessionStorage.setItem(SCROLL_KEY, String(window.scrollY || 0))
  } catch (e) {
    /* 忽略 */
  }
}

function restoreScroll() {
  try {
    const raw = sessionStorage.getItem(SCROLL_KEY)
    if (!raw) return
    const top = Number(raw)
    if (!Number.isFinite(top) || top <= 0) return
    // 列表是异步渲染的：等数据就绪后再恢复，避免内容还没插入就滚动
    const tryScroll = (attempt = 0) => {
      requestAnimationFrame(() => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight
        if (maxScroll > top || attempt >= 10) {
          window.scrollTo(0, Math.min(top, Math.max(0, maxScroll)))
        } else {
          tryScroll(attempt + 1)
        }
      })
    }
    tryScroll()
  } catch (e) {
    /* 忽略 */
  }
}

// ---------- 派生数据 ----------

const list = computed(() => applyFilters(bank.questions, state.value))

/**
 * 错误态文案：原始错误 + 退避冷却 / 不可重试的说明。
 * 逻辑在 `@/utils/retryHint` 里统一实现（多个视图共用）。
 */
const retryHint = computed(() => buildRetryHint(bank))

/** 当前页码（来自 URL，非法值会由 pageMeta 收敛） */
const currentPage = computed(() => {
  const n = Number(route.query.page)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1
})

/** 分页元信息：总页数、区间、上下页可用性 */
const meta = computed(() => pageMeta(list.value.length, currentPage.value, PAGE_SIZE))

/** 当前页的题目切片（配序号继续用全局序号） */
const pagedList = computed(() => paginate(list.value, meta.value.page, PAGE_SIZE))

/** 渲染卡片时的全局序号起点 */
const pageStartIndex = computed(() => (meta.value.page - 1) * PAGE_SIZE)

/** 翻页：写 URL，并回到列表顶部 */
function changePage(next) {
  const query = toQueryState(state.value, next)
  router.replace({ path: '/bank', query })
  scrollToTop()
}

/** 列表是异步渲染的：等数据就绪后再恢复，避免内容还没插入就滚动 */
watch(
  () => bank.questions.length,
  (len) => {
    if (len > 0) restoreScroll()
  }
)

/**
 * 翻页或改筛选时回到顶部（并清掉缓存的滚动位置），
 * 否则会带着上一页的位置跳到新页的中间，看起来像「滚不到头」。
 */
watch(
  () => [
    state.value.category,
    state.value.frequency,
    state.value.difficulty,
    state.value.keyword,
    currentPage.value,
  ],
  () => {
    try {
      sessionStorage.removeItem(SCROLL_KEY)
    } catch (e) {
      /* 忽略 */
    }
  }
)

/**
 * 是否处于「有筛选」状态。
 *
 * 决定两件事：计数文案显示「共 N 题」还是「筛选出 N 题」、
 * 「重置」按钮是否出现。**新增任何筛选维度都必须加进这里**，
 * 否则会出现「筛了但计数不变、也没有重置按钮」的错觉（题型筛选就漏过一次）。
 */
const hasFilter = computed(
  () =>
    Boolean(state.value.category) ||
    Boolean(state.value.type) ||
    Boolean(state.value.frequency) ||
    Boolean(state.value.difficulty) ||
    Boolean(state.value.keyword)
)

/** 各分类题量，用于 Tab 上的角标 */
const categoryCounts = computed(() => {
  const counts = {}
  bank.questions.forEach((q) => {
    counts[q.category] = (counts[q.category] || 0) + 1
  })
  return counts
})

/**
 * 可筛选的分类：以 CATEGORIES 枚举顺序为准（保证顺序稳定），
 * 但只显示题库里真的有题的分类，且补充题库中出现的新分类。
 * 这样以后加分类只改 constants + 题库，无需改页面。
 */
const availableCategories = computed(() => {
  const present = new Set(bank.questions.map((q) => q.category))
  const ordered = CATEGORIES.filter((c) => present.has(c))
  // 枚举之外的新分类追加在末尾，避免被静默隐藏
  const extras = Array.from(present).filter((c) => !CATEGORIES.includes(c))
  return [...ordered, ...extras]
})

/** 是否真的需要「展开」按钮（分类很少时不必出现） */
const catsCollapsible = computed(() => availableCategories.value.length > COLLAPSED_CAT_COUNT)

/**
 * 展开态的自定义滚动指示条。
 *
 * ## 为什么不用原生滚动条
 *
 * 实测 Chrome 下 `::-webkit-scrollbar` 因全局 `scrollbar-width: thin`
 * 走了 overlay 路径：`offsetWidth - clientWidth = 0`，**不占位、几乎不可见**。
 * 而这条滚动条的作用恰恰是「提示下面还有内容」，看不见就完全失去意义。
 *
 * ## 实现要点
 *
 * - 只在 `catsExpanded && catScrollable` 时渲染
 * - `thumbHeightPct` / `thumbOffsetPct` 由「可视高度 / 内容高度」与滚动位置算出
 * - 滚动事件用 passive 监听，不阻塞滚动
 */
const catScrollable = ref(false)
const thumbHeightPct = ref(100)
const thumbOffsetPct = ref(0)

/** 重新计算「是否可滚动」与滑块尺寸/位置 */
function updateCatScrollState() {
  const nav = document.getElementById('bank-cats')
  if (!nav) return
  const { scrollHeight, clientHeight, scrollTop } = nav
  const canScroll = scrollHeight > clientHeight + 2
  catScrollable.value = canScroll
  if (!canScroll) {
    thumbHeightPct.value = 100
    thumbOffsetPct.value = 0
    return
  }
  /**
   * 滑块高度 = 可视/内容 比例，最小 12% 保证还能看见、能拖。
   *
   * `thumbOffsetPct` 是**相对滑块自身高度的位移百分比**（CSS translateY 语义）：
   * 滑块可移动的总距离 = 轨道高 - 滑块高，
   * 换算成「滑块高度的倍数」= (100 - h) / h * 滚动进度。
   */
  const h = Math.max(12, (clientHeight / scrollHeight) * 100)
  const maxScroll = scrollHeight - clientHeight
  const progress = maxScroll > 0 ? scrollTop / maxScroll : 0
  thumbHeightPct.value = h
  thumbOffsetPct.value = ((100 - h) / h) * progress * 100
}

/** 展开/收起、分类数量变化时重算 */
watch([catsExpanded, () => availableCategories.value.length], async () => {
  await nextTick()
  updateCatScrollState()
})

/** 网格滚动时更新指示条（passive：不阻塞滚动） */
function onCatsScroll() {
  updateCatScrollState()
}

onMounted(() => {
  const nav = document.getElementById('bank-cats')
  nav?.addEventListener('scroll', onCatsScroll, { passive: true })
})

onBeforeUnmount(() => {
  document.getElementById('bank-cats')?.removeEventListener('scroll', onCatsScroll)
})


const resultText = computed(() => {
  if (!hasFilter.value) return `共 ${bank.total} 题`
  return `筛选出 ${list.value.length} 题`
})
</script>

<template>
  <div class="page">
    <!--
      页头统一走 AppHeader —— 全站的标题/返回/右侧槽位都在那一处，
      本页不该再自造一套 `.bank-head`（那正是「标题没跟着一起变」的根因）。

      题库是底部 TabBar 的**一级页面**，没有「上一页」可回 ——
      所以 `:back="false"`，不显示返回箭头（它在这里只会让人误以为能退到别处）。
      题数不占页头，而是放进搜索框末尾（见下方），页头只留标题。
    -->
    <AppHeader title="题库" :back="false" />

    <!-- 搜索框 -->
    <div class="search">
      <svg class="search__icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2" />
        <path d="M16 16l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
      <input
        class="search__input"
        type="search"
        inputmode="search"
        enterkeyhint="search"
        placeholder="搜索题干"
        aria-label="搜索题目"
        :value="keywordInput"
        @input="onKeywordInput"
      />
      <!-- 题数：贴在搜索框最右侧，省一行高度 -->
      <span class="search__count">{{ resultText }}</span>
      <button v-if="keywordInput" class="search__clear" aria-label="清空搜索" @click="clearKeyword">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M7 7l10 10M17 7L7 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <!--
      分类 Tab：**2 列等宽网格**，折叠显示 7 个（恰好 4 行满格）。

      为什么是 2 列而不是 3 列：3 列能省一行，但会把
      `iptables/firewalld` 和 `Tomcat/JVM` 截断成 `iptables/fi...`，
      用户根本认不出是哪个分类。2 列让所有名字完整可读。
      详见 styles.css 里 `.chip-grid` 的注释。
    -->
    <div class="bank-cats">
      <nav
        id="bank-cats"
        class="chip-grid bank-tabs"
        :class="{ 'chip-grid--scroll': catsExpanded }"
        aria-label="分类筛选"
        @scroll.passive="onCatsScroll"
      >
        <button
          class="chip"
          :class="{ 'chip--active': !state.category }"
          @click="selectCategory('')"
        >
          <span class="chip__label">全部</span><span class="chip__count">{{ bank.total }}</span>
        </button>
        <button
          v-for="cat in visibleCategories"
          :key="cat"
          class="chip"
          :class="{ 'chip--active': state.category === cat }"
          :title="cat"
          @click="selectCategory(cat)"
        >
          <span class="chip__label">{{ cat }}</span><span class="chip__count">{{ categoryCounts[cat] }}</span>
        </button>
      </nav>

      <!--
        展开/收起箭头：**浮动在右上角**（第 1 行位置），不占网格格子。

        用户要求：展开时箭头在上一行，**滚动条显示在箭头下方** ——
        右侧形成一条纵向操作栏（上箭头、下滑动条），
        既方便连续点击，也能直观看出「下面还有内容」。
      -->
      <button
        v-if="catsCollapsible"
        class="bank-cats__more"
        :class="{ 'bank-cats__more--open': catsExpanded }"
        :aria-expanded="catsExpanded"
        aria-controls="bank-cats"
        :aria-label="catsExpanded ? '收起分类' : `展开全部 ${availableCategories.length} 个分类`"
        :title="catsExpanded ? '收起分类' : `展开全部 ${availableCategories.length} 个分类`"
        @click="toggleCats"
      >
        <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <!--
        滚动指示条：**只在展开且内容超出时显示**，位置在箭头正下方。

        ## 为什么自己画而不用原生滚动条
        Chrome 下 `::-webkit-scrollbar` 因全局 `scrollbar-width: thin`
        会走 overlay 路径（实测 `offsetWidth - clientWidth = 0`）——
        **不占位、静态下几乎看不见**，起不到「下面还有内容」的提示作用。

        自己画一条：位置/粗细/颜色完全可控，且能真实反映滚动进度。
      -->
      <div
        v-if="catsExpanded && catScrollable"
        class="bank-cats__bar"
        aria-hidden="true"
      >
        <div
          class="bank-cats__thumb"
          :style="{ height: `${thumbHeightPct}%`, transform: `translateY(${thumbOffsetPct}%)` }"
        />
      </div>
    </div>

    <!--
      题型筛选：单选 / 多选 / 简答。
      放在频率与难度**之前** —— 题型是「这道题要不要我自己判对错」这种最前置的区分，
      比频率、难度更影响用户在不在这一页停留。
    -->
    <nav class="chip-wrap bank-tabs" aria-label="题型筛选">
      <button
        class="chip chip--sm"
        :class="{ 'chip--active': !state.type }"
        @click="selectType('')"
      >
        全部题型
      </button>
      <button
        v-for="t in TYPES"
        :key="t.value"
        class="chip chip--sm"
        :class="{ 'chip--active': state.type === t.value }"
        @click="selectType(t.value)"
      >
        {{ t.label }}
      </button>
    </nav>

    <!-- 频率筛选 -->
    <nav class="chip-wrap bank-tabs" aria-label="频率筛选">
      <button
        class="chip chip--sm"
        :class="{ 'chip--active': !state.frequency }"
        @click="selectFrequency('')"
      >
        全部频率
      </button>
      <button
        v-for="freq in FREQUENCIES"
        :key="freq"
        class="chip chip--sm"
        :class="{ 'chip--active': state.frequency === freq }"
        @click="selectFrequency(freq)"
      >
        {{ freq }}
      </button>
    </nav>

    <!-- 难度筛选（与频率同构） -->
    <nav class="chip-wrap bank-tabs" aria-label="难度筛选">
      <button
        class="chip chip--sm"
        :class="{ 'chip--active': !state.difficulty }"
        @click="selectDifficulty('')"
      >
        全部难度
      </button>
      <button
        v-for="diff in DIFFICULTIES"
        :key="diff"
        class="chip chip--sm"
        :class="{ 'chip--active': state.difficulty === diff }"
        @click="selectDifficulty(diff)"
      >
        {{ diff }}
      </button>
      <button v-if="hasFilter" class="chip chip--sm chip--reset" @click="resetAll">重置</button>
    </nav>

    <!-- 三态 -->
    <div v-if="bank.loading" class="list" aria-busy="true">
      <div v-for="i in 5" :key="i" class="skeleton card" />
    </div>

    <EmptyState
      v-else-if="bank.error"
      variant="error"
      title="题库加载失败"
      :desc="retryHint"
      :action="retryHint ? '重试' : ''"
      :action-disabled="bank.inCooldown"
      @action="bank.retryIndex().catch(() => {})"
    />

    <EmptyState
      v-else-if="bank.isEmpty"
      variant="search"
      title="题库为空"
      desc="题库数据为空，请运行 npm run split:data 后重试。"
    />

    <EmptyState
      v-else-if="!list.length"
      variant="search"
      title="没有匹配的题目"
      desc="换个关键词，或清空分类 / 频率 / 难度筛选试试。"
      action="重置筛选"
      @action="resetAll"
    />

    <ul v-else class="list">
      <li v-for="(q, i) in pagedList" :key="q.id">
        <QuestionCard
          :question="q"
          :index="pageStartIndex + i + 1"
          :keyword="state.keyword"
          from="/bank"
        />
      </li>
    </ul>

    <!-- 分页：每页 PAGE_SIZE 条，超过一页才显示 -->
    <Pagination v-if="list.length" :meta="meta" unit="题" @change="changePage" />
  </div>
</template>

<style scoped>
/**
 * 页头：标题居中 + 计数在下方。
 *
 * 原来是 `display: flex; justify-content: space-between; align-items: baseline`
 * —— 标题贴左、计数贴右，与全站其它页面（标题居中）不同。
 */
/* 搜索框 */
.search {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 10px;
  background: var(--c-card);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  margin-bottom: 8px;
}
.search__icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: var(--c-text-3);
}
.search__input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: none;
  font-size: 14px;
  color: var(--c-text);
  font-family: inherit;
}
.search__input::placeholder {
  color: var(--c-text-3);
}
/* 去掉 iOS search 输入框的取消按钮 */
.search__input::-webkit-search-cancel-button {
  display: none;
}
/**
 * 题数：贴在搜索框最右侧。
 *
 * 早先是页头右侧单独一行（`justify-content: space-between` 把标题挤到左边），
 * 既多占一行、又让页头与全站居中的标题不一致。
 * 现在放进搜索框尾部 —— 搜索时它顺带告诉你「筛出了多少题」，语义也更顺。
 * 左侧加一条细分割线，与输入区隔开。
 */
.search__count {
  flex-shrink: 0;
  padding-left: 8px;
  margin-left: 2px;
  border-left: 1px solid var(--c-border);
  font-size: 11.5px;
  color: var(--c-text-3);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.search__clear {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-text-3);
  border-radius: 50%;
  background: var(--c-bg);
}

/* Tab */
.bank-tabs {
  margin-bottom: 6px;
}

/**
 * 分类区容器：为右下角的「展开」浮动按钮提供定位上下文。
 *
 * 布局诉求（用户描述）：
 *
 * ```
 * 第 1 行:  全部        Linux基础
 * 第 2 行:  网络基础    综合场景题      ⌄
 * ```
 *
 * 所以箭头**贴在容器右下角**，不参与网格排版。
 * 为了让箭头不压住第 2 行的第 2 格，容器右侧留出 32px
 * （网格宽度 = 容器宽 - 32px），两列各约 165px，长名字仍能完整显示。
 */
.bank-cats {
  position: relative;
  /* 右侧留出箭头的宽度，避免遮挡第 2 行第 2 格 */
  padding-right: 32px;
}
.bank-cats__more {
  position: absolute;
  /**
   * **固定在第 1 行的垂直位置**。
   *
   * 为什么不是 `bottom: 6px`：那样折叠态（2 行）时落在第 2 行右侧看着没问题，
   * 但**展开后容器变高、`bottom` 锚点会让箭头跑到网格最底部**，
   * 手指要移到屏幕下方才点得到收起。
   *
   * 为什么最终放第 1 行而不是第 2 行：
   * 第 1 行右侧那格是「Linux基础」，箭头挪到上方后腾出了第 2 行右侧的位置，
   * 正好留给**展开态的滚动指示条**（在箭头正下方，形成一条完整的右侧栏）。
   *
   * 数值：箭头高 26px，chip 高 32px → 垂直居中于第 1 行 → top = (32-26)/2 = 3px。
   */
  top: 3px;
  right: 0;
  width: 26px;
  height: 26px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid var(--c-border);
  background: var(--c-card);
  color: var(--c-text-3);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.15s ease;
  -webkit-tap-highlight-color: transparent;
  z-index: 1;
}
.bank-cats__more:active {
  background: var(--c-primary-weak);
  border-color: var(--c-primary);
  color: var(--c-primary);
}
/* 展开后箭头翻转，提示「点它收起」 */
.bank-cats__more--open {
  transform: rotate(180deg);
}

/**
 * 展开态的滚动指示条：位于箭头**正下方**，构成右侧纵向操作栏。
 *
 * `top` = 箭头底部（3 + 26 = 29px）+ 4px 间距 = 33px。
 * 底部留 2px，避免贴住网格边缘。
 */
.bank-cats__bar {
  position: absolute;
  top: 33px;
  bottom: 2px;
  right: 1px;
  width: 4px;
  border-radius: 2px;
  background: color-mix(in srgb, var(--c-text-3) 14%, transparent);
  /* 只是提示，不拦截网格的滚动手势 */
  pointer-events: none;
  overflow: hidden;
}
.bank-cats__thumb {
  width: 100%;
  border-radius: 2px;
  background: var(--c-text-3);
  opacity: 0.55;
  /* 高度与位移由 JS 按滚动进度算 */
  transition:
    transform 0.08s linear,
    height 0.12s ease;
}
/* 尊重「减少动效」偏好：滑块跟随滚动时不要有拖影 */
@media (prefers-reduced-motion: reduce) {
  .bank-cats__thumb {
    transition: none;
  }
}

/* 分类名较长，网格内字号略小，保证 8 字分类名能完整显示 */
.bank-tabs .chip {
  font-size: 12.5px;
}
/**
 * chip 内的文字容器：长度超出时省略，不撑破胶囊。
 * 不设 min-width:0 的话，flex 子项会被内容撑开（这就是分类名溢出边框的原因）。
 */
.chip__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.chip__count {
  flex-shrink: 0;
  margin-left: 3px;
  font-size: 10px;
  opacity: 0.65;
}
.chip--sm {
  height: 27px;
  padding: 0 9px;
  font-size: 11.5px;
  border-radius: 13px;
  width: auto;
}
.chip--reset {
  color: var(--c-primary);
  border-style: dashed;
}

/* 列表 */
.list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.skeleton {
  height: 76px;
  margin-bottom: 8px;
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
</style>
