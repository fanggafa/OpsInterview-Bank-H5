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
import { PAGE_SIZE } from '@/utils/constants'
import { pageMeta, paginate } from '@/utils/paginate'
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
    <AppHeader title="我的收藏" back-to="/me" />

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
