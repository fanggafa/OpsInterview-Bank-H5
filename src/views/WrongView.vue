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
import { WRONG_CLEAR_STREAK } from '@/utils/constants'
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

function changePage(next) {
  page.value = next
  scrollToTop()
}

/** 题量变化（连对满 3 次移出）后，页码可能越界，由 meta 自动收敛 */
watch(meta, (m) => {
  if (m.page !== page.value) page.value = m.page
})

/** 从错题本随机抽 10 题复习 */
function startWrongReview() {
  router.push({ path: '/practice', query: { review: 'wrong' } })
}

/** 题目在错题本里的连对进度（0/3、1/3、2/3） */
function streakOf(id) {
  return study.streakOf(id)
}

const clearStreak = WRONG_CLEAR_STREAK
</script>

<template>
  <div class="page">
    <AppHeader title="错题本" back-to="/" />

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
        <p class="head__count">共 <strong>{{ list.length }}</strong> 道错题</p>
        <button class="btn btn--primary head__btn" @click="startWrongReview">
          错题复习
        </button>
      </div>

      <p v-if="list.length" class="rule">
        连对 {{ clearStreak }} 次自动移出 · 任意方式刷到都算
      </p>

      <EmptyState
        v-if="!list.length"
        variant="wrong"
        title="错题本是空的"
        desc="答错或自评「不会」的题目会进入这里；之后任意方式连续答对 3 次即自动移出。"
        action="去刷题"
        @action="router.push('/practice')"
      />

      <!-- 按分类分组渲染：每组一个标题（分类名 + 题数），组内题目连续编号 -->
      <div v-else class="groups">
        <section v-for="g in pagedGroups" :key="g.key" class="group">
          <h2 class="group__title">
            <span class="group__cat">{{ g.category }}</span>
            <span class="group__count">{{ g.count }} 题</span>
          </h2>
          <ul class="list">
            <li v-for="(q, i) in g.items" :key="q.id">
              <QuestionCard :question="q" :index="g.startIndex + i + 1" from="/wrong" />
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
        </section>
      </div>

      <!-- 分页控件自带 visible 判断，外层不用再包 v-if -->
      <Pagination :meta="meta" unit="组" @change="changePage" />
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
.head__count {
  margin: 0;
  font-size: 13px;
  color: var(--c-text-2);
}
.head__count strong {
  color: var(--c-danger);
  font-size: 15px;
}
.head__btn {
  min-height: 36px;
  padding: 0 14px;
  font-size: 13px;
}

/* 规则说明：把「怎么才会移出」写在列表前，省得用户猜 */
.rule {
  margin: -4px 0 10px;
  font-size: 11.5px;
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
