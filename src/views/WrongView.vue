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
import { PAGE_SIZE, WRONG_CLEAR_STREAK } from '@/utils/constants'
import { pageMeta, paginate } from '@/utils/paginate'
import { groupByCategory } from '@/utils/groupByCategory'
import { scrollToTop } from '@/utils/scroll'

const route = useRoute()
const router = useRouter()
const bank = useBankStore()
const study = useStudyStore()

/** 错误态文案（含重试退避冷却提示） */
const retryHint = computed(() => buildRetryHint(bank))

onMounted(() => bank.loadIndex().catch(() => {}))

/**
 * 错题本由 records 的 inWrong 标记派生。
 *
 * 规则（用户要求）：答错 / 自评「不会」进入；之后任意方式（刷题、每日一题、
 * 复习赛）刷到时，连续答对满 WRONG_CLEAR_STREAK 次自动移出。
 * 所以列表不再随「最近一次答对」立刻消失，而是等连对攒够。
 */
const list = computed(() => study.wrongList)

/**
 * 按分类分组后再分页 —— 与「我的收藏」页同一套规则。
 *
 * 错题本原来是平铺的一长串，用户反馈「都没分类」：想专门补某一类
 * （比如 MySQL）只能一页页翻。分组后每页是若干个完整的分类块，
 * 组顺序复用 `CATEGORIES` 的业务优先级。
 *
 * 按「组」切页而不是按条切：按条切会把同一分类拆散到相邻两页，分组就白做了。
 */
const GROUP_PAGE_SIZE = 4

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
 * 当前查看的分类（`?category=` 给定）。
 *
 * 页面分两个视图：
 * - 不带 category → **分类汇总**（每个分类一张卡：分类名 / 错题数 / 连对门槛 / 「查看」按钮）
 * - 带 category   → 该分类的**题目明细**
 *
 * 为什么用 query 而不是新增路由：两个视图是同一个列表的两种粒度，
 * 共用一个页面的加载、错误态与数据源；拆两个路由会让「返回」多一层跳转，
 * 而这里退回汇总只是把 query 去掉。
 */
const activeCategory = computed(() => route.query.category || '')
const inCategory = computed(() => !!activeCategory.value)

/** 当前分类下的题（保持错题本原顺序） */
const categoryList = computed(() => {
  if (!activeCategory.value) return list.value
  return list.value.filter((q) => q.category === activeCategory.value)
})

/** 汇总视图的分组（每分类一组，组内 count 就是该分类错题数） */
const summaryGroups = computed(() => groups.value)

const page = computed({
  get: () => Number(route.query.page) || 1,
  set: (v) => router.push({ path: '/wrong', query: { ...route.query, page: v } }),
})

function changePage(next) {
  page.value = next
  scrollToTop()
}

/** 明细视图的分页：按条分页（分类内题目不再分组） */
const detailMeta = computed(() => pageMeta(categoryList.value.length, page.value, PAGE_SIZE))
const detailList = computed(() => paginate(categoryList.value, detailMeta.value.page, PAGE_SIZE))
const detailStartIndex = computed(() => (detailMeta.value.page - 1) * PAGE_SIZE)

function openCategory(category) {
  page.value = 1
  router.push({ path: '/wrong', query: { category } })
}

/** 题量变化（连对满 3 次移出）后，页码可能越界，由 meta 自动收敛 */
watch(detailMeta, (m) => {
  if (inCategory.value && m.page !== page.value) page.value = m.page
})

/** 题目在错题本里的连对进度（0/3、1/3、2/3） */
function streakOf(id) {
  return study.streakOf(id)
}

const clearStreak = WRONG_CLEAR_STREAK

/**
 * 页头标题。
 *
 * 明细视图把分类名放进标题（「错题本 · Linux基础》）——
 * 早先是在正文里再来一行「‹ Linux基础 共 6 题」，于是页面上出现**两个返回箭头**
 * （页头的 + 正文的），用户第一反应是「为什么有两个返回」。
 * 现在靠标题表达「你在哪一类」，返回箭头只留页头那一个：
 * 在明细里它回汇总列表，在汇总里它回首页。
 */
const headerTitle = computed(() => (inCategory.value ? `错题本 · ${activeCategory.value}` : '错题本'))

/** 页头返回按钮的目标：明细 → 汇总（当前路由），汇总 → 首页 */
const headerBackTo = computed(() => (inCategory.value ? '/wrong' : '/'))

/** 明细头部还剩多少题（去掉返回箭头后只留文字） */
const detailCountText = computed(() => `共 ${categoryList.value.length} 题`)

/**
 * 汇总视图里进度条的基准：以「错题最多的那个分类」为满格。
 *
 * 为什么不用总错题数做分母：那样每个分类的条都短得看不出来差别；
 * 用最大值为满格，各分类之间的相对多少才一眼可比。
 */
const maxGroupCount = computed(() =>
  summaryGroups.value.reduce((max, g) => Math.max(max, g.count), 1),
)
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
        variant="wrong"
        title="错题本是空的"
        desc="答错或自评「不会」的题目会进入这里；之后任意方式连续答对 3 次即自动移出。"
        action="去刷题"
        @action="router.push('/practice')"
      />

      <!-- ========== 明细视图：某个分类下的错题 ========== -->
      <template v-else-if="inCategory">
        <!--
          只留一行统计文字。
          早先这里有「‹ Linux基础 共 6 题」+ 右侧「错题复习」两个元素 ——
          返回箭头与页头那个重复，按钮又挤在同一行，所以都去掉了：
          分类名已经写在页头标题里，返回靠页头那一个箭头。
        -->
        <p class="head__count head__count--detail">{{ detailCountText }}</p>

        <ul class="list">
          <li v-for="(q, i) in detailList" :key="q.id">
            <QuestionCard :question="q" :index="detailStartIndex + i + 1" from="/wrong" />
            <!-- 连对进度：让「还差几次移出」这件事看得见，不然用户会疑惑为什么答对了还留着 -->
            <p class="progress-hint">
              <span class="progress-dots" aria-hidden="true">
                <span
                  v-for="n in clearStreak"
                  :key="n"
                  class="progress-dot"
                  :class="{ 'progress-dot--on': n <= streakOf(q.id) }"
                />
              </span>
              连对 {{ streakOf(q.id) }} / {{ clearStreak }}
            </p>
          </li>
        </ul>

        <Pagination :meta="detailMeta" unit="题" @change="changePage" />
      </template>

      <!-- ========== 汇总视图：每个分类一行，右侧「查看」进明细 ========== -->
      <template v-else>
        <!--
          去掉了右侧的「错题复习」按钮。
          它做的事和「从错题本重新抽一批」是同一个入口，但放在这一页里
          反而与「点进某个分类补那一类」的动作抢注意力 —— 用户反映「没啥用」。
          真正需要「抽一批来练」的场景从首页「复习巩固」进。
        -->
        <p class="head__count">
          共 <strong>{{ list.length }}</strong> 道错题 · {{ summaryGroups.length }} 个分类
        </p>

        <p class="rule">
          连对 {{ clearStreak }} 次自动移出 · 任意方式刷到都算
        </p>

        <!--
          与「薄弱分类」页同款：一行一个分类，分类名 + 题数 + 连对进度条 + 「查看」按钮。
          整行是纯信息展示（不可点），唯一操作是右侧按钮 —— 点一下才进该分类的明细。
        -->
        <ul class="list list--cats">
          <li v-for="g in summaryGroups" :key="g.category" class="cat">
            <div class="cat__info">
              <span class="cat__text">
                <span class="cat__name">{{ g.category }}</span>
                <span class="cat__meta">{{ g.count }} 道错题</span>
              </span>
              <span class="cat__bar" :aria-label="`${g.category} ${g.count} 道错题`">
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
 * 下边距 6px 而不是 0：汇总视图下面紧跟 `.rule`（它自己带 16px 下边距），
 * 而明细视图下面直接就是题目列表 —— 没有这条下边距时文字会贴住第一张卡。
 */
.head__count {
  margin: 0 0 6px;
  font-size: 13px;
  color: var(--c-text-2);
}
.head__count strong {
  color: var(--c-danger);
  font-size: 15px;
}
/* 明细视图顶部的统计文字：单独占一行，与列表拉开 */
/* 明细视图顶部的统计文字：与下方题目列表拉开 16px */
.head__count--detail {
  margin: 10px 0 16px;
}

/* 规则说明：把「怎么才会移出」写在列表前，省得用户猜 */
.rule {
  margin: 6px 0 16px;
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--c-text-3);
}

/* 连对进度：小圆点 + 数字，一眼看出还差几次 */
.progress-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: -4px 0 10px;
  padding: 0 4px;
  font-size: 11px;
  color: var(--c-text-3);
}
.progress-dots {
  display: inline-flex;
  gap: 3px;
}
.progress-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--c-border);
}
.progress-dot--on {
  background: var(--c-success);
}

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
  /* 错题用一种稳定的红色渐变：它表达「需要补的量」，不是错误率 */
  background: linear-gradient(90deg, #f0736f, #d64b52);
}
/**
 * 右侧的题数。
 *
 * 早先是 `text-align: right` + 紧贴「查看」按钮 —— 数字和胶囊贴在一起，
 * 看着像一整块。现在：固定宽度居中、并在它与按钮之间留出 10px 的间距，
 * 让「数字」和「操作」在视觉上是两组东西。
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
