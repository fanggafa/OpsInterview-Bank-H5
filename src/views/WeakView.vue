<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useBankStore } from '@/stores/bankStore'
import { useStudyStore } from '@/stores/studyStore'
import { buildRetryHint } from '@/utils/retryHint'
import { categoryColor } from '@/utils/constants'

/**
 * 薄弱环节页：按「错误率」列出需要补的分类。
 *
 * 为什么单独一页而不是塞进首页：首页要的是「一眼看到最弱那块」的入口，
 * 而这里要放得下每个分类的样本量（已刷 5/30）与两个去向按钮。
 * 塞首页会把首页撑得很长，信息还放不全。
 */

const router = useRouter()
const bank = useBankStore()
const study = useStudyStore()

onMounted(() => {
  bank.loadIndex().catch(() => {})
})

const retryHint = computed(() => buildRetryHint(bank))

/** 榜单里最弱的那一个，用来说明「先补这个」 */
const top = computed(() => study.weakCategories[0] || null)

/** 整体错误率（所有上榜分类合计），给用户一个总体印象 */
const overall = computed(() => {
  const list = study.weakCategories
  if (!list.length) return null
  const wrong = list.reduce((a, w) => a + w.wrong, 0)
  const reviewed = list.reduce((a, w) => a + w.reviewed, 0)
  if (!reviewed) return null
  return Math.round((wrong / reviewed) * 100)
})

/** 去刷该分类的错题（直接开始刷） */
function practiceWrong(category) {
  router.push({ path: '/practice', query: { mode: 'wrong', category } })
}

/** 去该分类的题库列表（先看题，再决定怎么刷） */
function browseCategory(category) {
  router.push({ path: '/bank', query: { category } })
}
</script>

<template>
  <div class="page">
    <AppHeader title="最需要补的分类" back-to="/" />

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
        v-if="!study.weakCategories.length"
        variant="wrong"
        title="还没有足够的数据"
        desc="一个分类至少需要刷过 3 题、且其中有错题，才会参与排行 —— 样本太少得出的「最弱」并不准确。先去刷题吧。"
        action="去刷题"
        @action="router.push('/practice')"
      />

      <template v-else>
        <!-- 顶部小结：先回答「总体情况怎么样」 -->
        <section class="summary">
          <p class="summary__main">
            最需要补的是
            <strong :style="{ color: categoryColor(top.category) }">{{ top.category }}</strong>
          </p>
          <p class="summary__desc">
            {{ top.wrong }}/{{ top.reviewed }} 错（{{ top.rate }}%）
            <span v-if="overall !== null"> · 以上分类合计错误率 {{ overall }}%</span>
          </p>
        </section>

        <p class="rule">
          按「错题数 ÷ 已刷题数」排序 · 一个分类刷满 3 题才参与排行
        </p>

        <ul class="list">
          <li v-for="w in study.weakCategories" :key="w.category" class="item">
            <div class="item__head">
              <span class="item__cat">
                <span class="item__dot" :style="{ background: categoryColor(w.category) }" />
                {{ w.category }}
              </span>
              <span class="item__rate">{{ w.rate }}%</span>
            </div>

            <!-- 错误率条 -->
            <div class="item__bar" :aria-label="`错误率 ${w.rate}%`">
              <span class="item__fill" :style="{ width: `${w.rate}%` }" />
            </div>

            <!-- 样本量：让用户知道这个百分比是在多大样本上得出的 -->
            <p class="item__meta">
              错 <strong>{{ w.wrong }}</strong> 题 · 已刷 {{ w.reviewed }}/{{ w.total }} 题
            </p>

            <!-- 两个去向：主按钮直接刷错题，次要按钮先进列表看 -->
            <div class="item__acts">
              <button class="btn btn--primary item__btn" @click="practiceWrong(w.category)">
                刷这个分类的错题
              </button>
              <button class="btn btn--ghost item__btn" @click="browseCategory(w.category)">
                看题库
              </button>
            </div>
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
  margin: 0;
  font-size: 15px;
  color: var(--c-text-2);
}
.summary__main strong {
  font-size: 17px;
  font-weight: 700;
}
.summary__desc {
  margin: 6px 0 0;
  font-size: 12.5px;
  color: var(--c-text-3);
  font-variant-numeric: tabular-nums;
}

.rule {
  margin: 12px 0 10px;
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--c-text-3);
  text-align: center;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item {
  padding: 13px 14px;
  border-radius: var(--radius);
  background: var(--c-card);
  border: 1px solid var(--c-border);
  box-shadow: var(--shadow-card);
}

.item__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}
.item__cat {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14.5px;
  font-weight: 600;
  color: var(--c-text);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item__dot {
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
.item__rate {
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--c-text);
  font-variant-numeric: tabular-nums;
}

/* 错误率条：渐变从警告色到危险色，错误率越高越红 */
.item__bar {
  margin-top: 9px;
  height: 6px;
  border-radius: 3px;
  background: var(--c-border);
  overflow: hidden;
}
.item__fill {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--c-warning), #e5484d);
}

.item__meta {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--c-text-3);
  font-variant-numeric: tabular-nums;
}
.item__meta strong {
  color: var(--c-text-2);
  font-weight: 600;
}

.item__acts {
  display: flex;
  gap: 8px;
  margin-top: 11px;
}
.item__btn {
  flex: 1;
  font-size: 12.5px;
  padding: 8px 0;
}
</style>
