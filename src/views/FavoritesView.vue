<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import QuestionCard from '@/components/QuestionCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import Pagination from '@/components/Pagination.vue'
import { useBankStore } from '@/stores/bankStore'
import { buildRetryHint } from '@/utils/retryHint'
import { useStudyStore } from '@/stores/studyStore'
import { pageMeta, paginate } from '@/utils/paginate'
import { groupByCategory } from '@/utils/groupByCategory'
import { scrollToTop } from '@/utils/scroll'

const router = useRouter()
const bank = useBankStore()
const study = useStudyStore()

/** 错误态文案（含重试退避冷却提示） */
const retryHint = computed(() => buildRetryHint(bank))

const page = ref(1)

onMounted(() => bank.loadIndex().catch(() => {}))

/** 收藏列表：按收藏时间倒序（store 已处理） */
const list = computed(() => study.favoriteList)

/**
 * 按分类分组后再分页。
 *
 * 用户反馈「收藏都没分类」—— 平铺一长串，想复习某一类只能一页页翻。
 * 这里先把同一分类的题聚成一组（组顺序复用 `CATEGORIES` 的业务优先级），
 * 再把「分组」按页切开：**一页里仍能看到清晰的分组**，而不是把一组拆到两页。
 *
 * 为什么按组切页而不是按条切页：按条切会把同一分类拆散到相邻两页，
 * 分组的意义就没了；按组切页保证「翻到哪一页，那页的组都是完整的」。
 */
const GROUP_PAGE_SIZE = 4

/**
 * 分组，并给每组算出「全局起始序号」—— 这样跨组的编号是连续的（1、2、3…），
 * 不会每组都从 1 开始。用 reduce 一次算完，避免再写一层嵌套循环。
 */
const groups = computed(() => {
  let acc = 0
  return groupByCategory(list.value).map((g, i) => {
    const startIndex = acc
    acc += g.count
    return { ...g, key: i, startIndex }
  })
})

const meta = computed(() => pageMeta(groups.value.length, page.value, GROUP_PAGE_SIZE))
const pagedGroups = computed(() => paginate(groups.value, meta.value.page, GROUP_PAGE_SIZE))

function changePage(next) {
  page.value = next
  scrollToTop()
}

/** 取消收藏后总量减少，页码可能越界 */
watch(meta, (m) => {
  if (m.page !== page.value) page.value = m.page
})

/**
 * 「全部取消」用页内确认，不用 window.confirm。
 *
 * window.confirm 在微信内置浏览器 / 部分 WebView / 禁止弹窗的设置下
 * 会静默返回 false 或干脆不弹，表现为「点了没反应」。
 * 「我的」页曾因同样的写法出现过这个 bug，这里保持一致。
 */
const confirming = ref(false)

function askClear() {
  if (!list.value.length) return
  confirming.value = true
}

function cancelClear() {
  confirming.value = false
}

function clearAll() {
  study.clearFavorites()
  page.value = 1
  confirming.value = false
}
</script>

<template>
  <div class="page">
    <AppHeader title="我的收藏" back-to="/" />

    <div v-if="bank.loading" class="skeleton card" aria-busy="true" />

    <EmptyState
      v-else-if="bank.error"
      variant="error"
      title="题库加载失败"
      :desc="retryHint"
      action="重试"
      :action-disabled="bank.inCooldown"
      @action="bank.retryIndex().catch(() => {})"
    />

    <template v-else>
      <div v-if="list.length" class="head">
        <p class="head__count">共 <strong>{{ list.length }}</strong> 道收藏</p>
        <button class="head__clear" @click="askClear">全部取消</button>
      </div>

      <!-- 页内确认条：不依赖 window.confirm -->
      <div v-if="confirming" class="confirm" role="alertdialog">
        <p class="confirm__text">确定取消全部收藏？（{{ list.length }} 题）</p>
        <div class="confirm__actions">
          <button class="btn btn--plain btn--sm" @click="cancelClear">取消</button>
          <button class="btn btn--danger btn--sm" @click="clearAll">确定取消</button>
        </div>
      </div>

      <EmptyState
        v-if="!list.length"
        variant="favorites"
        title="还没有收藏"
        desc="在题目卡片或详情页点击星标，就会出现在这里，方便反复看。"
        action="去题库"
        @action="router.push('/bank')"
      />

      <!-- 按分类分组渲染：每组一个标题（分类名 + 题数），组内题目连续编号 -->
      <div v-if="list.length" class="groups">
        <section v-for="g in pagedGroups" :key="g.key" class="group">
          <h2 class="group__title">
            <span class="group__cat">{{ g.category }}</span>
            <span class="group__count">{{ g.count }} 题</span>
          </h2>
          <ul class="list">
            <li v-for="(q, i) in g.items" :key="q.id">
              <QuestionCard :question="q" :index="g.startIndex + i + 1" from="/favorites" />
            </li>
          </ul>
        </section>
      </div>

      <!-- 分页控件自带 visible 判断，外层不用再包 v-if -->
      <Pagination :meta="meta" unit="组" @change="changePage" />
    </template>
  </div>
</template>

<style scoped>
/* ---------- 分类分组 ---------- */
.groups {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.group__title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--c-text);
}
/* 分类名左侧加一条主色短线，与题目卡列表形成层级区分 */
.group__cat {
  position: relative;
  padding-left: 9px;
}
.group__cat::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 12px;
  border-radius: 2px;
  background: var(--c-primary);
}
.group__count {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--c-text-3);
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 0;
}
.head__count {
  margin: 0;
  font-size: 13px;
  color: var(--c-text-2);
}
.head__count strong {
  color: var(--c-warning);
  font-size: 15px;
}
.head__clear {
  min-height: 36px;
  padding: 0 10px;
  font-size: 12.5px;
  color: var(--c-text-3);
  border-radius: var(--radius-sm);
}
.head__clear:active {
  background: var(--c-bg);
}

/* 页内确认条 */
.confirm {
  padding: 10px 12px;
  margin-bottom: 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--c-border);
  background: var(--c-card);
}
.confirm__text {
  margin: 0 0 9px;
  font-size: 12.5px;
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

.list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
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
