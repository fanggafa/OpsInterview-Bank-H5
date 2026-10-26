<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import QuestionCard from '@/components/QuestionCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import Pagination from '@/components/Pagination.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'
import { PAGE_SIZE } from '@/utils/constants'
import { pageMeta, paginate } from '@/utils/paginate'
import { scrollToTop } from '@/utils/scroll'

const router = useRouter()
const bank = useBankStore()
const study = useStudyStore()

const page = ref(1)

onMounted(() => bank.load().catch(() => {}))

/** 错题本由 records 实时派生：最近一次自评/判定为 unknown 的题 */
const list = computed(() => study.wrongList)

const meta = computed(() => pageMeta(list.value.length, page.value, PAGE_SIZE))
const pagedList = computed(() => paginate(list.value, meta.value.page, PAGE_SIZE))
const pageStartIndex = computed(() => (meta.value.page - 1) * PAGE_SIZE)

function changePage(next) {
  page.value = next
  scrollToTop()
}

/** 题量变化（答对移出错题本）后，页码可能越界，由 meta 自动收敛 */
watch(meta, (m) => {
  if (m.page !== page.value) page.value = m.page
})

function startWrongPractice() {
  router.push({ path: '/practice', query: { mode: 'wrong' } })
}
</script>

<template>
  <div class="page">
    <AppHeader title="错题本" back-to="/stats" />

    <div v-if="bank.loading" class="skeleton card" aria-busy="true" />

    <EmptyState
      v-else-if="bank.error"
      variant="error"
      title="题库加载失败"
      :desc="bank.error"
      action="重试"
      @action="bank.retry().catch(() => {})"
    />

    <template v-else>
      <div v-if="list.length" class="head">
        <p class="head__count">共 <strong>{{ list.length }}</strong> 道错题</p>
        <button class="btn btn--primary head__btn" @click="startWrongPractice">
          错题专项刷题
        </button>
      </div>

      <EmptyState
        v-if="!list.length"
        variant="wrong"
        title="错题本是空的"
        desc="答错或自评「不会」的题目会自动进入这里；之后答对了会自动移出。"
        action="去刷题"
        @action="router.push('/practice')"
      />

      <ul v-else class="list">
        <li v-for="(q, i) in pagedList" :key="q.id">
          <QuestionCard :question="q" :index="pageStartIndex + i + 1" />
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
