<script setup>
/**
 * 用监控数据做容量规划（题 5019）。
 *
 * 核心洞察：容量规划是「用历史趋势外推 + 留余量 + 设定扩容触发线」，
 * 关键是选对指标（饱和度而非平均值）并考虑增长与突发。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 248" role="img" aria-label="容量规划三步：选饱和度指标、趋势外推、设定扩容阈值与预留余量">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">用「饱和度指标 + 趋势外推」预测，再设定扩容触发线</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① 选对指标：看饱和度，不看平均值</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">CPU 使用率、内存水位、磁盘 IO util、连接池占用、队列深度</text>

      <rect x="6" y="54" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="67" font-size="8" font-weight="700" fill="var(--fig-node-b)">② 看趋势而非瞬时</text>
      <text x="14" y="79" font-size="7.5" fill="var(--fig-text)">用周/月均值消除毛刺；算增长率（周环比），外推到「何时会到阈值」</text>

      <rect x="6" y="88" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="101" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ 留余量 + 设扩容触发线</text>
      <text x="14" y="113" font-size="7.5" fill="var(--fig-text)">常见规则：到 60~70% 触发扩容（而不是等 90% 才动）</text>

      <!-- 关键提醒 -->
      <rect x="6" y="122" width="328" height="50" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="135" font-size="8.5" font-weight="700" fill="#e5484d">三个容易算错的地方</text>
      <text x="14" y="148" font-size="7.5" fill="var(--fig-text)">① 用日均值规划 → 忽略峰值，大促当天就崩</text>
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)">② 线性外推 → 业务增长常是非线性的（活动/推广会跳变）</text>
      <text x="14" y="172" font-size="7" fill="var(--fig-node-c)">③ 只看单机 → 忽略「故障时剩余节点能否扛住全量」</text>

      <rect x="6" y="178" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="191" font-size="8" font-weight="700" fill="var(--fig-node-d)">N+1 原则</text>
      <text x="14" y="203" font-size="7.5" fill="var(--fig-text)">容量要保证「挂掉一台」后剩余节点仍能承载峰值（不是刚好够用）</text>

      <rect x="6" y="218" width="328" height="18" rx="3" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="231" font-size="7.5" fill="var(--fig-text)">验证：用压测确认「单机能扛多少」，别用监控推测极限</text>

      <text x="6" y="240" font-size="7.5" fill="var(--fig-muted)">注意：扩缩容有延迟（拉起/预热/缓存填充），触发线要留出这个时间</text>
    </svg>
    <figcaption>选饱和度指标、看周月趋势外推、留余量并设 60~70% 触发线；别用日均值规划，要守 N+1 原则</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
