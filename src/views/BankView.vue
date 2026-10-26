<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QuestionCard from '@/components/QuestionCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import Pagination from '@/components/Pagination.vue'
import { useBankStore } from '@/stores/bankStore'
import { CATEGORIES, FREQUENCIES, PAGE_SIZE, SEARCH_DEBOUNCE_MS } from '@/utils/constants'
import { applyFilters, parseQueryState, toQueryState } from '@/utils/filter'
import { pageMeta, paginate } from '@/utils/paginate'
import { scrollToTop } from '@/utils/scroll'

const route = useRoute()
const router = useRouter()
const bank = useBankStore()

/** URL 是筛选态的唯一来源：刷新 / 返回都能恢复 */
const state = computed(() => parseQueryState(route.query, CATEGORIES, FREQUENCIES))

/** 搜索框本地值（输入时即时响应，防抖后才写 URL） */
const keywordInput = ref(state.value.keyword)
let debounceTimer = null

onMounted(() => {
  bank.load().catch(() => {})
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
  () => [state.value.category, state.value.frequency, state.value.keyword, currentPage.value],
  () => {
    try {
      sessionStorage.removeItem(SCROLL_KEY)
    } catch (e) {
      /* 忽略 */
    }
  }
)

const hasFilter = computed(
  () => Boolean(state.value.category || state.value.frequency || state.value.keyword)
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

    <!-- 分类 Tab：按题库实际分类动态渲染，新增分类无需改代码 -->
    <nav class="chip-grid bank-tabs" aria-label="分类筛选">
      <button
        class="chip"
        :class="{ 'chip--active': !state.category }"
        @click="selectCategory('')"
      >
        全部<span class="chip__count">{{ bank.total }}</span>
      </button>
      <button
        v-for="cat in availableCategories"
        :key="cat"
        class="chip"
        :class="{ 'chip--active': state.category === cat }"
        @click="selectCategory(cat)"
      >
        {{ cat }}<span class="chip__count">{{ categoryCounts[cat] }}</span>
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
      @action="bank.retry().catch(() => {})"
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
      desc="换个关键词，或清空分类 / 频率筛选试试。"
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
.chip__count {
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
