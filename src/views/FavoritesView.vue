<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import QuestionCard from '@/components/QuestionCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import Pagination from '@/components/Pagination.vue'
import { useBankStore } from '@/stores/bankStore'
import { buildRetryHint } from '@/utils/retryHint'
import { useStudyStore } from '@/stores/studyStore'
import { PAGE_SIZE } from '@/utils/constants'
import { pageMeta, paginate } from '@/utils/paginate'
import { groupByCategory } from '@/utils/groupByCategory'
import { scrollToTop } from '@/utils/scroll'

const route = useRoute()
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

/**
 * 当前查看的分类（`?category=` 给定）—— 与错题本同一套两视图结构：
 * - 不带 category → **分类汇总**（每分类一行：分类名 / 收藏数 / 「查看」按钮）
 * - 带 category   → 该分类的**题目明细**
 */
const activeCategory = computed(() => route.query.category || '')
const inCategory = computed(() => !!activeCategory.value)

/** 当前分类下的收藏（保持收藏时间倒序） */
const categoryList = computed(() => {
  if (!activeCategory.value) return list.value
  return list.value.filter((q) => q.category === activeCategory.value)
})

const summaryGroups = computed(() => groups.value)

const detailMeta = computed(() => pageMeta(categoryList.value.length, page.value, PAGE_SIZE))
const detailList = computed(() => paginate(categoryList.value, detailMeta.value.page, PAGE_SIZE))
const detailStartIndex = computed(() => (detailMeta.value.page - 1) * PAGE_SIZE)

function openCategory(category) {
  page.value = 1
  router.push({ path: '/favorites', query: { category } })
}

/**
 * 页头标题：明细视图把分类名写进标题（「我的收藏 · 网络基础」）。
 *
 * 早先正文里还有一行「‹ 网络基础 共 1 题」，页头再加一个返回箭头 ——
 * 一屏出现两个返回箭头，用户第一反应是「为什么有两个返回」。
 * 现在靠标题表达「在哪一类」，箭头只留页头那一个。
 */
const headerTitle = computed(() =>
  inCategory.value ? `我的收藏 · ${activeCategory.value}` : '我的收藏',
)

/** 页头返回目标：明细 → 汇总（当前路由），汇总 → 首页 */
const headerBackTo = computed(() => (inCategory.value ? '/favorites' : '/'))

function changePage(next) {
  page.value = next
  scrollToTop()
}

const maxGroupCount = computed(() =>
  summaryGroups.value.reduce((max, g) => Math.max(max, g.count), 1),
)

/** 取消收藏后总量减少，页码可能越界 */
watch(detailMeta, (m) => {
  if (m.page !== page.value) page.value = m.page
})

/**
 * 「清空收藏」只放在设置页，**本页不再提供**。
 *
 * 早先右上角有个「全部取消」，但它紧贴列表、又是破坏性操作，很容易误触；
 * 而设置页本来就有「清空数据」的统一入口（含二次确认）。两处都放 = 多一个误触点。
 */
</script>

<template>
  <div class="page">
    <AppHeader :title="headerTitle" :back-to="headerBackTo" />

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
      <EmptyState
        v-if="!list.length"
        variant="favorites"
        title="还没有收藏"
        desc="在题目卡片或详情页点击星标，就会出现在这里，方便反复看。"
        action="去题库"
        @action="router.push('/bank')"
      />

      <!-- ========== 明细视图：某个分类下的收藏 ========== -->
      <template v-else-if="inCategory">
        <!--
          只留一行统计文字。
          早先这里有「‹ 网络基础」的返回箭头 + 「全部取消」按钮：
          前者与页头那个重复（分类名已写进页头标题），后者容易误触（清空改去设置页）。
        -->
        <p class="head__count head__count--detail">共 {{ categoryList.length }} 题</p>

        <ul class="list">
          <li v-for="(q, i) in detailList" :key="q.id">
            <QuestionCard :question="q" :index="detailStartIndex + i + 1" from="/favorites" />
          </li>
        </ul>

        <Pagination :meta="detailMeta" unit="题" @change="changePage" />
      </template>

      <!-- ========== 汇总视图：每个分类一行，右侧「查看」进明细 ========== -->
      <template v-else>
        <p class="head__count">
          共 <strong>{{ list.length }}</strong> 道收藏 · {{ summaryGroups.length }} 个分类
        </p>

        <!--
          与「薄弱分类」页同款：一行一个分类，分类名 + 收藏数 + 占比条 + 「查看」按钮。
          整行纯展示不可点，唯一操作是右侧按钮。
        -->
        <ul class="list list--cats">
          <li v-for="g in summaryGroups" :key="g.category" class="cat">
            <div class="cat__info">
              <span class="cat__text">
                <span class="cat__name">{{ g.category }}</span>
                <span class="cat__meta">{{ g.count }} 道收藏</span>
              </span>
              <span class="cat__bar" :aria-label="`${g.category} ${g.count} 道收藏`">
                <span class="cat__fill" :style="{ width: `${(g.count / maxGroupCount) * 100}%` }" />
              </span>
              <span class="cat__count">{{ g.count }}</span>
            </div>
            <button class="cat__act" @click="openCategory(g.category)">查看</button>
          </li>
        </ul>
      </template>
    </template>
  </div>
</template>

<style scoped>
/* ---------- 分类汇总（与「薄弱分类」页同款） ---------- */
.list--cats {
  gap: 0;
  border-radius: var(--radius);
  background: var(--c-card);
  border: 1px solid var(--c-border);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.cat {
  display: flex;
  align-items: center;
  border-top: 1px solid var(--c-border);
}
.cat:first-child {
  border-top: 0;
}

/* 信息区是纯展示，不可点 */
.cat__info {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 4px 11px 14px;
}
.cat__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 0 0 42%;
}
.cat__name {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--c-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cat__meta {
  font-size: 11px;
  color: var(--c-text-3);
  font-variant-numeric: tabular-nums;
}
.cat__bar {
  flex: 1;
  min-width: 36px;
  height: 5px;
  border-radius: 3px;
  background: var(--c-border);
  overflow: hidden;
}
.cat__fill {
  display: block;
  height: 100%;
  border-radius: 3px;
  /* 收藏用金色渐变，与错题本的红色区分 */
  background: linear-gradient(90deg, #f7b955, #e09428);
}
/**
 * 右侧的题数：固定宽度居中 + 与「查看」之间留 10px，
 * 让「数字」和「操作」在视觉上是两组东西（原来右对齐紧贴按钮，看着像一整块）。
 */
.cat__count {
  flex-shrink: 0;
  width: 26px;
  margin-right: 10px;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--c-text);
  font-variant-numeric: tabular-nums;
}

/* 「查看」：明确文字胶囊，不用难懂的小图标 */
.cat__act {
  flex-shrink: 0;
  margin-right: 12px;
  padding: 5px 10px;
  border-radius: 999px;
  background: var(--c-primary-weak);
  color: var(--c-primary);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}
.cat__act:active {
  opacity: 0.7;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 0;
}
/**
 * 统计文字。
 *
 * 下边距 16px：原来没有下边距，文字紧贴下面的分类卡片，
 * 卡片顶边看起来像被文字压着（截图里就是这个症状）。
 */
.head__count {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--c-text-2);
}
.head__count strong {
  color: var(--c-warning);
  font-size: 15px;
}
/* 明细视图顶部的统计文字：单独占一行，与列表拉开 */
/* 明细视图顶部的统计文字：与下方题目列表拉开 16px */
.head__count--detail {
  margin: 10px 0 16px;
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
