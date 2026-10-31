<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import QuestionCard from '@/components/QuestionCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import Pagination from '@/components/Pagination.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'
import { PAGE_SIZE, WRONG_CLEAR_STREAK } from '@/utils/constants'
import { pageMeta, paginate } from '@/utils/paginate'
import { scrollToTop } from '@/utils/scroll'

const router = useRouter()
const bank = useBankStore()
const study = useStudyStore()

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

const meta = computed(() => pageMeta(list.value.length, page.value, PAGE_SIZE))
const pagedList = computed(() => paginate(list.value, meta.value.page, PAGE_SIZE))
const pageStartIndex = computed(() => (meta.value.page - 1) * PAGE_SIZE)

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
    <AppHeader title="错题本" back-to="/me" />

    <div v-if="bank.loading" class="skeleton card" aria-busy="true" />

    <EmptyState
      v-else-if="bank.error"
      variant="error"
      title="题库加载失败"
      :desc="bank.error"
      action="重试"
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

      <ul v-else class="list">
        <li v-for="(q, i) in pagedList" :key="q.id">
          <QuestionCard :question="q" :index="pageStartIndex + i + 1" />
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

      <Pagination v-if="list.length" :meta="meta" unit="题" @change="changePage" />
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
