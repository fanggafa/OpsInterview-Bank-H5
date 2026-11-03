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

/**
 * 本页**没有任何跳转** —— 从「带操作的分析页」改成纯自我评估页后，
 * `practiceWrong`（去刷错题）和 `browseCategory`（去看分类题库）都用不上了。
 * `router` 仅保留给空态里的「去刷题」按钮。
 */
</script>

<template>
  <div class="page">
    <AppHeader title="薄弱分类" back-to="/" />

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
        title="数据量不足"
        desc="一个分类要刷满它题量的 33%（至少 3 题）且其中有错题，才能算出可信的错误率 —— 只刷几道就下结论并不准确。"
        action="去刷题"
        @action="router.push('/practice')"
      />

      <template v-else>
        <!-- 顶部小结：先回答「总体情况怎么样」 -->
        <section class="summary">
          <p class="summary__main">
            最薄弱的分类是
            <strong :style="{ color: categoryColor(top.category) }">{{ top.category }}</strong>
          </p>
          <p class="summary__desc">
            {{ top.wrong }}/{{ top.reviewed }} 错（{{ top.rate }}%）
            <span v-if="overall !== null"> · 以上分类合计错误率 {{ overall }}%</span>
          </p>
        </section>

        <p class="rule">
          按「错题数 ÷ 已刷题数」排序 · 一个分类要刷满它题量的 33% 才参与排行
          <br />
          <span class="rule__note">本页仅供自我评估，不提供跳转</span>
        </p>

        <!--
          整块列表而不是「一分类一张卡」。
          26 个分类时，26 张各自带阴影的卡片视觉上很碎很占位；
          收成一个列表 + 细分隔线后，行高可以压到 50px 出头。
        -->
        <ul class="list">
          <li v-for="w in study.weakCategories" :key="w.category" class="item">
            <!--
              整行是**纯信息展示，不可点、也没有任何按钮**。

              2026-11：本页从「带操作的分析页」变成**纯自我评估页**。
              早先每行右侧有「刷错题」按钮，点进该分类的错题练习；
              现在去掉 —— 想练错题有专门的入口（首页「每日复习 30 题」），
              本页只负责回答一个问题：「我哪块最弱、弱到什么程度」。
              带上跳转反而让页面变成又一个入口，弱化了它作为评估结果的价值。
            -->
            <div class="item__info">
              <span class="item__text">
                <span class="item__cat">
                  <span class="item__dot" :style="{ background: categoryColor(w.category) }" />
                  {{ w.category }}
                </span>
                <span class="item__meta">错 {{ w.wrong }} · 刷 {{ w.reviewed }}/{{ w.total }}</span>
              </span>

              <span class="item__bar" :aria-label="`错误率 ${w.rate}%`">
                <span class="item__fill" :style="{ width: `${w.rate}%` }" />
              </span>

              <span class="item__rate">{{ w.rate }}%</span>
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

/**
 * 规则说明：把「怎么排序、什么条件才进榜」写在列表前。
 *
 * 下边距从 10px 加到 16px —— 原来文字与下面的分类卡几乎贴在一起，
 * 卡片顶边看起来像被文字压着（截图里就是这个症状）。
 */
.rule {
  margin: 12px 0 16px;
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--c-text-3);
  text-align: center;
}
/**
 * 「本页仅供自我评估」那行小字。
 * 比 rule 主体再淡一点 —— 它是补充说明，不该和排序规则抢注意力。
 */
.rule__note {
  color: var(--c-text-3);
  opacity: 0.8;
}


/**
 * 整块列表容器：卡片改为「一块带分隔线的列表」。
 *
 * 为什么不再一张分类一张卡：26 个分类时，26 个独立阴影块非常碎、也占高度。
 * 收成一块后，行与行只隔一条极淡的分隔线，整页清爽很多。
 */
.list {
  list-style: none;
  margin: 0;
  padding: 0 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  border-radius: var(--radius);
  background: var(--c-card);
  border: 1px solid var(--c-border);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.item {
  position: relative;
  display: flex;
  align-items: center;
  /* 行间细线：最后一行不加 */
  border-top: 1px solid var(--c-border);
}
.item:first-child {
  border-top: 0;
}

/**
 * 一行装下「分类名 + 样本量 + 进度条 + 百分比」。
 * 行高目标 52px 左右，26 行合计约 1350px（约 1.5 屏）。
 *
 * 这是**纯展示区**（不是按钮），所以没有 :active 反馈 ——
 * 它不可点，就不该给出「可点」的视觉暗示。
 */
.item__info {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 4px 11px 14px;
}

.item__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  /**
   * 分类名要够宽，否则「自动化与配置管理」会被截成「自动化与配置管…」。
   * 34% 太窄，放宽到 42%，进度条相应变短但仍能看趋势。
   */
  flex: 0 0 42%;
}
.item__cat {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--c-text);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item__dot {
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.item__meta {
  font-size: 11px;
  color: var(--c-text-3);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 进度条放进行内，不再独占一行 */
.item__bar {
  flex: 1;
  min-width: 36px;
  height: 5px;
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

/**
 * 错误率数字。
 *
 * 早先 `text-align: right` 且紧贴「刷错题」按钮 —— 数字和胶囊挨在一起看着像一整块。
 * 现在固定宽度居中，并与按钮之间留 10px，让「数字」与「操作」在视觉上是两组。
 */
.item__rate {
  flex-shrink: 0;
  width: 38px;
  margin-right: 10px;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--c-text);
  font-variant-numeric: tabular-nums;
}

</style>

