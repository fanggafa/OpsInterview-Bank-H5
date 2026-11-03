<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'
import { buildRetryHint } from '@/utils/retryHint'
import { categoryColor, proficiencyLevel } from '@/utils/constants'

/**
 * 分类熟练度页。
 *
 * ## 演变
 *
 * 1. 原「薄弱分类」：按选择题错误率排榜
 * 2. 合并「我的」页的「各分类掌握度（仅简答题）」→ 左右两列百分比并排
 * 3. **当前：等级制单指标** —— 用户反馈「两列百分比很矛盾」
 *
 * ## 为什么放弃双列百分比
 *
 * 两列看起来能横向比较，实际口径完全不同：
 * - 选择题：客观点选判定的**错误率反算**
 * - 简答题：主观自评的**掌握率**
 *
 * 并排摆两个百分比会诱导用户比大小，而它们不可比。
 * 改成等级后，页面只回答「这块练到什么程度」这一个问题；
 * 简答自评数据降级为小字注脚，不再充当第二根主指标。
 *
 * 这也是 NN/G 仪表盘原则的落地：长度是前注意属性（适合编码量），
 * 但两列不可比的量不该用同一套视觉语言并排。
 */

const router = useRouter()
const bank = useBankStore()
const study = useStudyStore()

onMounted(() => {
  bank.loadIndex().catch(() => {})
})

const retryHint = computed(() => buildRetryHint(bank))

/**
 * 列表数据：主指标是**选择题熟练度**（客观、样本多），
 * 简答题只作为一行小字补充。
 *
 * 排序：按主指标升序（越不熟练越靠前），没刷过的排最后。
 */
const rows = computed(() =>
  study.categoryProficiency
    .filter((r) => r.choice.pct !== null || r.short.pct !== null)
    .slice()
    .sort((a, b) => {
      if (a.choice.pct === null && b.choice.pct === null) return 0
      if (a.choice.pct === null) return 1
      if (b.choice.pct === null) return -1
      return a.choice.pct - b.choice.pct
    })
    .map((r) => ({
      ...r,
      level: proficiencyLevel(r.choice.pct),
      /**
       * 进度条宽度。
       *
       * 0% 时会是 0，进度条看起来像「没加载」；给一个最小可见宽度（4%），
       * 让「未掌握」也有红色小段。这是**视觉下限，不是真实数值** ——
       * 右侧仍如实显示 0%。
       */
      barWidth: r.choice.pct === null ? 0 : Math.max(r.choice.pct, 4),
    }))
)

const isEmpty = computed(() => rows.value.length === 0)

/** 最需要补的分类（主指标最低且有数据） */
const weakest = computed(() => rows.value.find((r) => r.choice.pct !== null) || null)

/**
 * 整体熟练度：按已刷题量加权，避免小样本被同等对待。
 */
const overall = computed(() => {
  let right = 0
  let reviewed = 0
  for (const r of rows.value) {
    if (r.choice.pct !== null) {
      reviewed += r.choice.reviewed
      right += r.choice.reviewed - r.choice.wrong
    }
  }
  if (!reviewed) return null
  const pct = Math.round((right / reviewed) * 100)
  return { pct, level: proficiencyLevel(pct) }
})

/** 简答题的整体自评率（注脚用） */
const shortOverall = computed(() => {
  let know = 0
  let answered = 0
  for (const r of rows.value) {
    if (r.short.pct !== null) {
      answered += r.short.answered
      know += r.short.know
    }
  }
  return answered ? Math.round((know / answered) * 100) : null
})
</script>

<template>
  <div class="page">
    <AppHeader title="分类熟练度" back-to="/" />

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
        v-if="isEmpty"
        variant="wrong"
        title="数据量不足"
        desc="刷过选择题或自评过简答题之后，这里会按分类给出熟练度等级。"
        action="去刷题"
        @action="router.push('/practice')"
      />

      <template v-else>
        <!--
          顶部小结：给出一个**整体等级**，而不是几个百分比。
          用户打开这页最想知道「我整体到哪一步了」，
          具体哪个分类偏弱往下看列表。
        -->
        <section class="summary">
          <div class="summary__main">
            <span class="summary__label">整体熟练度</span>
            <strong class="summary__level" :class="`lv--${overall?.level.key || 'none'}`">
              {{ overall?.level.label || '未开始' }}
            </strong>
          </div>
          <p v-if="shortOverall !== null" class="summary__sub">
            简答题自评：{{ shortOverall }}% 标记为「会」
          </p>
          <p v-if="weakest" class="summary__desc">
            最需要补的是
            <strong :style="{ color: categoryColor(weakest.category) }">{{ weakest.category }}</strong>
            （{{ weakest.level.label }}）
          </p>
        </section>

        <p class="rule">
          等级按选择题正确率换算：未掌握 = 0% · 入门 &lt; 50% · 熟练 ≥ 50% · 精通 ≥ 80%
          <br />
          <span class="rule__note">本页只统计选择题 · 不提供跳转</span>
        </p>

        <!--
          一行一个分类：左边分类名 + 等级徽标，右边一条进度条 + 简答注脚。
          没有第二个主指标 —— 简答那行字是灰的、小一号的，明确属于次要信息。
        -->
        <ul class="list">
          <li v-for="r in rows" :key="r.category" class="item">
            <span class="item__cat">
              <span class="item__dot" :style="{ background: categoryColor(r.category) }" />
              <span class="item__name">{{ r.category }}</span>
            </span>

            <span class="item__main">
              <span class="item__bar" :aria-label="`熟练度 ${r.choice.pct ?? 0}%`">
                <span
                  v-if="r.choice.pct !== null"
                  class="item__fill"
                  :class="`lv-fill--${r.level.key}`"
                  :style="{ width: `${r.barWidth}%` }"
                />
              </span>

              <span class="item__row">
                <span class="item__level" :class="`lv--${r.level.key}`">{{ r.level.label }}</span>
                <span class="item__pct">{{ r.choice.pct === null ? '' : `${r.choice.pct}%` }}</span>
              </span>
            </span>
          </li>
        </ul>
      </template>
    </template>
  </div>
</template>

<style scoped>
.summary {
  padding: 14px 16px;
  border-radius: var(--radius);
  background: var(--c-card);
  border: 1px solid var(--c-border);
  box-shadow: var(--shadow-card);
}
.summary__main {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}
.summary__label {
  font-size: 13px;
  color: var(--c-text-2);
}
.summary__level {
  font-size: 20px;
  font-weight: 700;
}
.summary__sub {
  margin: 8px 0 0;
  font-size: 11.5px;
  color: var(--c-text-3);
}
.summary__desc {
  margin: 8px 0 0;
  font-size: 12.5px;
  color: var(--c-text-2);
}

/**
 * 用法说明。左对齐（与表头、数据同一视觉起点），
 * 居中的多行小字在窄屏上会左右留白、读起来断断续续。
 */
.rule {
  margin: 14px 0 12px;
  padding: 0 15px;
  font-size: 11px;
  line-height: 1.6;
  color: var(--c-text-3);
  text-align: left;
}
.rule__note {
  color: var(--c-text-3);
  opacity: 0.8;
}

/**
 * 列表：一块带分隔线的容器。
 * 行内只有两个区域（分类名 + 主区），不再有第三列 ——
 * 这是「单指标」的关键：视觉上不留「还有一列可供比较」的余地。
 */
.list {
  margin: 0;
  padding: 0;
  list-style: none;
  border-radius: var(--radius);
  background: var(--c-card);
  border: 1px solid var(--c-border);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}
.item {
  display: grid;
  grid-template-columns: 100px 1fr;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
}
.item + .item {
  border-top: 1px solid var(--c-border);
}
.item__cat {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--c-text);
}
.item__dot {
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
.item__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item__main {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.item__bar {
  position: relative;
  display: block;
  width: 100%;
  height: 7px;
  border-radius: 999px;
  background: var(--c-bg);
  overflow: hidden;
}
.item__fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease;
}

/* 等级配色：颜色只表示「到哪一档」，不编码具体数值 */
.item__fill.lv-fill--fail {
  background: linear-gradient(90deg, #f0736f, #d64b52);
}
.item__fill.lv-fill--entry {
  background: linear-gradient(90deg, #f7b955, #e09428);
}
.item__fill.lv-fill--skilled {
  background: linear-gradient(90deg, #6b8afd, #4f7cff);
}
.item__fill.lv-fill--mastered {
  background: linear-gradient(90deg, #4ec38a, #2f9e6d);
}

.item__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}
.item__level {
  font-size: 12px;
  font-weight: 600;
}
.item__pct {
  font-size: 11.5px;
  color: var(--c-text-3);
  font-variant-numeric: tabular-nums;
}

/* 等级文字配色，与进度条同一套语义 */
.lv--none {
  color: var(--c-text-3);
  font-weight: 500;
}
.lv--fail {
  color: #d64b52;
}
.lv--entry {
  color: #d98324;
}
.lv--skilled {
  color: var(--c-primary);
}
.lv--mastered {
  color: #2f9e6d;
}

/**
 * 简答注脚：已随「单指标」方案移除。
 * A 方案的核心是「一页只讲一件事」——把主观自评数据留在列表里，
 * 哪怕字号再小，也等于承认还有第二根可比指标。所以整个拿掉了。
 */

.skeleton {
  height: 200px;
  margin-top: 10px;
  background: linear-gradient(90deg, var(--c-card) 25%, var(--c-bg) 37%, var(--c-card) 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}
@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: 0 0;
  }
}
</style>
