<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QuestionCard from '@/components/QuestionCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import Pagination from '@/components/Pagination.vue'
import { useBankStore } from '@/stores/bankStore'
import { CATEGORIES, DIFFICULTIES, FREQUENCIES, PAGE_SIZE, SEARCH_DEBOUNCE_MS } from '@/utils/constants'
import { applyFilters, parseQueryState, toQueryState } from '@/utils/filter'
import { pageMeta, paginate } from '@/utils/paginate'
import { scrollToTop } from '@/utils/scroll'

const route = useRoute()
const router = useRouter()
const bank = useBankStore()

/** URL 是筛选态的唯一来源：刷新 / 返回都能恢复 */
const state = computed(() =>
  parseQueryState(route.query, CATEGORIES, FREQUENCIES, DIFFICULTIES)
)

/** 搜索框本地值（输入时即时响应，防抖后才写 URL） */
const keywordInput = ref(state.value.keyword)
let debounceTimer = null

onMounted(() => {
  bank.loadIndex().catch(() => {})
  // 滚动位置恢复（配合路由 scrollBehavior 的 savedPosition 不够，列表是动态渲染的）
  restoreScroll()
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

/** 折叠时显示的分类数（不含「全部」）。7 个约 1-2 行，覆盖最常用的前几类 */
const COLLAPSED_CAT_COUNT = 7
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

/** 是否真的需要「展开」按钮（分类很少时不必出现） */
const catsCollapsible = computed(() => availableCategories.value.length > COLLAPSED_CAT_COUNT)

function resetAll() {
  keywordInput.value = ''
  if (debounceTimer) clearTimeout(debounceTimer)
  router.replace({ path: '/bank', query: {} })
}

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
  saveScroll()
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

const hasFilter = computed(
  () =>
    Boolean(state.value.category) ||
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

const resultText = computed(() => {
  if (!hasFilter.value) return `共 ${bank.total} 题`
  return `筛选出 ${list.value.length} 题`
})
</script>

<template>
  <div class="page">
    <header class="bank-head">
      <h1 class="bank-title">题库</h1>
      <span class="bank-count muted">{{ resultText }}</span>
    </header>

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
        placeholder="搜索题干、答案、标签"
        aria-label="搜索题目"
        :value="keywordInput"
        @input="onKeywordInput"
      />
      <button v-if="keywordInput" class="search__clear" aria-label="清空搜索" @click="clearKeyword">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M7 7l10 10M17 7L7 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <!-- 分类 Tab：默认折叠，只显示前几个；末尾一个小箭头展开全部 -->
    <nav id="bank-cats" class="chip-grid bank-tabs" aria-label="分类筛选">
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

      <!--
        展开箭头：不再是独占一整行的文字按钮，而是分类列表末尾的一个小图标胶囊。
        省掉整行高度（30px + 6px 间距），分类区看起来更紧凑。

        aria-label 里带上完整语义（而不是「展开全部 23 个分类」的文字），
        因为视觉上只剩一个箭头，读屏需要能说清它干什么。
      -->
      <button
        v-if="catsCollapsible"
        class="chip chip--expand"
        :class="{ 'chip--expand--open': catsExpanded }"
        :aria-expanded="catsExpanded"
        aria-controls="bank-cats"
        :aria-label="catsExpanded ? '收起分类' : `展开全部 ${availableCategories.length} 个分类`"
        :title="catsExpanded ? '收起分类' : `展开全部 ${availableCategories.length} 个分类`"
        @click="catsExpanded = !catsExpanded"
      >
        <svg
          class="chip__chev"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
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
      :desc="bank.error"
      action="重试"
      @action="bank.retryIndex().catch(() => {})"
    />

    <EmptyState
      v-else-if="bank.isEmpty"
      variant="search"
      title="题库为空"
      desc="请检查 data/questions.json 是否有题目。"
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
        <QuestionCard :question="q" :index="pageStartIndex + i + 1" />
      </li>
    </ul>

    <!-- 分页：每页 PAGE_SIZE 条，超过一页才显示 -->
    <Pagination v-if="list.length" :meta="meta" unit="题" @change="changePage" />
  </div>
</template>

<style scoped>
.bank-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 12px 0 8px;
}
.bank-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--c-text);
}
.bank-count {
  font-size: 12px;
}

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
 * 展开/收起箭头：分类列表末尾的一个小胶囊图标。
 *
 * 早期版本是「独占一行的文字按钮（展开全部 23 个分类 ⌄）」，
 * 白占 30px 高度 + 6px 间距。改成行内小图标后：
 * - 省掉整行，分类区更紧凑
 * - 位置在列表末尾，语义上就是「后面还有，展开看」
 */
.chip--expand {
  width: 30px;
  height: 30px;
  padding: 0;
  justify-content: center;
  color: var(--c-text-3);
  background: var(--c-bg);
  border-color: var(--c-border);
}
.chip--expand:active {
  background: var(--c-primary-weak);
  border-color: var(--c-primary);
  color: var(--c-primary);
}
.chip__chev {
  flex-shrink: 0;
  transition: transform 0.2s ease;
}
/* 展开后箭头翻转，提示「点它收起」 */
.chip--expand--open .chip__chev {
  transform: rotate(180deg);
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
