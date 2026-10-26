<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useBankStore } from '@/stores/bankStore'
import { useInterviewStore } from '@/stores/interviewStore'
import { CATEGORIES, DEFAULT_INTERVIEW_SIZE, INTERVIEW_SIZES } from '@/utils/constants'

const router = useRouter()
const bank = useBankStore()
const interview = useInterviewStore()

const size = ref(DEFAULT_INTERVIEW_SIZE)
/** 选中的分类；空数组 = 全部 */
const selected = ref([])

onMounted(() => {
  bank.load().catch(() => {})
})

/** 只列出题库里真有题的分类 */
const availableCategories = computed(() => {
  const present = new Set(bank.questions.map((q) => q.category))
  const ordered = CATEGORIES.filter((c) => present.has(c))
  const extras = Array.from(present).filter((c) => !CATEGORIES.includes(c))
  return [...ordered, ...extras]
})

const counts = computed(() => {
  const map = {}
  bank.questions.forEach((q) => {
    map[q.category] = (map[q.category] || 0) + 1
  })
  return map
})

/** 当前范围下的可用题量，用于限制题数并给出提示 */
const poolSize = computed(() => {
  if (!selected.value.length) return bank.total
  return bank.questions.filter((q) => selected.value.includes(q.category)).length
})

/** 实际出题数：不能超过题库量 */
const effectiveSize = computed(() => Math.min(size.value, poolSize.value))

const canStart = computed(() => poolSize.value > 0 && !bank.loading)

const allSelected = computed(
  () => availableCategories.value.length > 0 && selected.value.length === availableCategories.value.length
)

function toggleCategory(cat) {
  const i = selected.value.indexOf(cat)
  if (i >= 0) selected.value = selected.value.filter((c) => c !== cat)
  else selected.value = [...selected.value, cat]
}

function selectAll() {
  selected.value = allSelected.value ? [] : [...availableCategories.value]
}

function clearSelection() {
  selected.value = []
}

function start() {
  if (!canStart.value) return
  const ok = interview.start({ size: effectiveSize.value, categories: selected.value })
  if (ok) router.push('/interview/run')
}
</script>

<template>
  <div class="page">
    <AppHeader title="模拟面试" back-to="/stats" />

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
      <p class="intro">
        随机抽题，逐题作答后自评。结束给出<b>自评评估</b>——本工具无后端、不调用 AI，不做自动判分。
      </p>

      <!-- 题数 -->
      <h2 class="section-title">题目数量</h2>
      <div class="sizes card">
        <button
          v-for="n in INTERVIEW_SIZES"
          :key="n"
          class="sizes__item"
          :class="{ 'sizes__item--on': size === n }"
          @click="size = n"
        >
          {{ n }}
        </button>
      </div>

      <!-- 分类范围 -->
      <div class="range-head">
        <h2 class="section-title">分类范围</h2>
        <div class="range-actions">
          <button class="range-btn" @click="selectAll">
            {{ allSelected ? '取消全选' : '全选' }}
          </button>
          <button v-if="selected.length" class="range-btn" @click="clearSelection">清空</button>
        </div>
      </div>

      <nav class="chip-grid" aria-label="分类范围">
        <button
          class="chip"
          :class="{ 'chip--active': !selected.length }"
          @click="clearSelection"
        >
          全部<span class="chip__count">{{ bank.total }}</span>
        </button>
        <button
          v-for="cat in availableCategories"
          :key="cat"
          class="chip"
          :class="{ 'chip--active': selected.includes(cat) }"
          @click="toggleCategory(cat)"
        >
          {{ cat }}<span class="chip__count">{{ counts[cat] }}</span>
        </button>
      </nav>

      <!-- 汇总 -->
      <div class="summary card">
        <div class="summary__row">
          <span>本次范围</span>
          <strong>{{ selected.length ? `${selected.length} 个分类` : '全部分类' }}</strong>
        </div>
        <div class="summary__row">
          <span>可选题量</span>
          <strong>{{ poolSize }} 道</strong>
        </div>
        <div class="summary__row">
          <span>实际出题</span>
          <strong class="summary__size">{{ effectiveSize }} 道</strong>
        </div>
        <p v-if="size > poolSize" class="summary__warn">
          所选范围只有 {{ poolSize }} 道题，将按 {{ effectiveSize }} 道出题。
        </p>
      </div>

      <button class="btn btn--primary start-btn" :disabled="!canStart" @click="start">
        开始面试
      </button>
    </template>
  </div>
</template>

<style scoped>
.intro {
  margin: 10px 0 0;
  font-size: 12.5px;
  line-height: 1.65;
  color: var(--c-text-2);
}
.intro b {
  color: var(--c-text);
}

.sizes {
  display: flex;
  gap: 4px;
  padding: 4px;
}
.sizes__item {
  flex: 1;
  min-height: 38px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  color: var(--c-text-2);
}
.sizes__item--on {
  background: var(--c-primary);
  color: #fff;
}

.range-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.range-actions {
  display: flex;
  gap: 8px;
}
.range-btn {
  font-size: 12px;
  color: var(--c-primary);
  padding: 4px 2px;
  min-height: 32px;
}

.summary {
  margin-top: 14px;
  padding: 12px 14px;
}
.summary__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 5px 0;
  font-size: 13px;
  color: var(--c-text-2);
}
.summary__row strong {
  color: var(--c-text);
  font-weight: 600;
}
.summary__size {
  color: var(--c-primary) !important;
  font-size: 16px;
}
.summary__warn {
  margin: 8px 0 0;
  padding-top: 8px;
  border-top: 1px solid var(--c-border);
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--c-warning);
}

.start-btn {
  width: 100%;
  margin-top: 14px;
}
.start-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.skeleton {
  height: 300px;
  margin-top: 10px;
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
