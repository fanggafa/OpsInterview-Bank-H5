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

/** 收藏列表：按收藏时间倒序（store 已处理） */
const list = computed(() => study.favoriteList)

const meta = computed(() => pageMeta(list.value.length, page.value, PAGE_SIZE))
const pagedList = computed(() => paginate(list.value, meta.value.page, PAGE_SIZE))
const pageStartIndex = computed(() => (meta.value.page - 1) * PAGE_SIZE)

function changePage(next) {
  page.value = next
  scrollToTop()
}

/** 取消收藏后总量减少，页码可能越界 */
watch(meta, (m) => {
  if (m.page !== page.value) page.value = m.page
})

function clearAll() {
  if (!list.value.length) return
  if (window.confirm('确定取消全部收藏？')) {
    study.clearFavorites()
    page.value = 1
  }
}
</script>

<template>
  <div class="page">
    <AppHeader title="我的收藏" back-to="/stats" />

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
        <p class="head__count">共 <strong>{{ list.length }}</strong> 道收藏</p>
        <button class="head__clear" @click="clearAll">全部取消</button>
      </div>

      <EmptyState
        v-else
        variant="favorites"
        title="还没有收藏"
        desc="在题目卡片或详情页点击星标，就会出现在这里，方便反复看。"
        action="去题库"
        @action="router.push('/bank')"
      />

      <ul v-if="list.length" class="list">
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
