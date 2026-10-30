<script setup>
/**
 * ES 的 query 与 filter 的区别（题 3006）。
 *
 * 核心洞察：query 计算相关性分数且不缓存，filter 不算分但结果可缓存 ——
 * 所以生产查询应「该筛的用 filter，只有需要排序打分时才用 query」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 254" role="img" aria-label="ES 的 query 计算相关性分数不缓存，filter 不算分且结果缓存，生产应优先用 filter">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">filter 不算相关性分数、结果可缓存 —— 这就是生产要优先用它的原因</text>

      <!-- 对比表 -->
      <text x="140" y="32" font-size="8" font-weight="700" fill="var(--fig-node-b)">query</text>
      <text x="244" y="32" font-size="8" font-weight="700" fill="var(--fig-node-a)">filter</text>
      <line x1="132" y1="36" x2="334" y2="36" stroke="var(--fig-muted)" stroke-width=".5" opacity=".5" />

      <text x="6" y="50" font-size="7.5" font-weight="700" fill="var(--fig-text)">计算 _score</text>
      <text x="140" y="50" font-size="7.5" fill="var(--fig-text)">是</text>
      <text x="244" y="50" font-size="7.5" fill="var(--fig-node-a)">否</text>

      <text x="6" y="66" font-size="7.5" font-weight="700" fill="var(--fig-text)">结果缓存</text>
      <text x="140" y="66" font-size="7.5" fill="var(--fig-text)">不缓存</text>
      <text x="244" y="66" font-size="7.5" fill="var(--fig-node-a)">缓存</text>

      <text x="6" y="82" font-size="7.5" font-weight="700" fill="var(--fig-text)">性能</text>
      <text x="140" y="82" font-size="7.5" fill="var(--fig-text)">较慢</text>
      <text x="244" y="82" font-size="7.5" fill="var(--fig-node-a)">较快</text>

      <text x="6" y="98" font-size="7.5" font-weight="700" fill="var(--fig-text)">常用写法</text>
      <text x="140" y="98" font-size="7.5" fill="var(--fig-text)">must / should</text>
      <text x="244" y="98" font-size="7.5" fill="var(--fig-node-a)">filter / must_not</text>

      <!-- 怎么选 -->
      <rect x="6" y="110" width="328" height="52" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="123" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">判断规则（很简单）</text>
      <text x="14" y="136" font-size="7.5" fill="var(--fig-text)">需要「按相关度排序」→ 用 query（如全文检索、搜索框）</text>
      <text x="14" y="148" font-size="7.5" fill="var(--fig-text)">只是「精确筛选」→ 用 filter（如状态、时间范围、ID、标签）</text>
      <text x="14" y="160" font-size="7.5" fill="var(--fig-node-c)">混合场景：filter 筛范围 + query 打分排序，是标准写法</text>

      <!-- 示例 -->
      <rect x="6" y="170" width="328" height="40" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="183" font-size="8" font-weight="700" fill="var(--fig-node-c)">推荐结构</text>
      <text x="14" y="196" font-size="7.5" fill="var(--fig-text)">bool: filter 放「精确条件」，must 放「需要算分的条件」</text>
      <text x="14" y="207" font-size="7.5" fill="var(--fig-node-c)">这样既能利用 filter cache，又能保留相关性排序</text>

      <rect x="6" y="218" width="328" height="20" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="232" font-size="7.5" fill="var(--fig-text)">反模式：把「状态=1」也放进 must → 白白算分、还失去缓存</text>

      <text x="6" y="250" font-size="7.5" fill="var(--fig-muted)">排查提示：慢查询先看是否把大量精确条件写进了 must</text>
    </svg>
    <figcaption>query 算相关性分数不缓存，filter 不算分且可缓存；只筛选就用 filter，需排序打分才用 query</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
