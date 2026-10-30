<script setup>
/**
 * 消息积压的排查与处理（题 2208）。
 *
 * 核心洞察：积压要分「消费能力不足」还是「消费被卡住」；
 * 两者处理方式完全不同 —— 一个是扩容/提速，一个是查下游阻塞。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 258" role="img" aria-label="消息积压排查：先看 LAG 趋势判断是能力不足还是被卡住，再按原因分路处理">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">先分清「消费跟不上」还是「消费被卡住」，处理完全不同</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">第一步：看 LAG 与消费速率</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">LAG 持续增长 = 产大于消；LAG 不动但也不降 = 消费停滞</text>

      <rect x="6" y="54" width="328" height="28" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="72" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700" fill="var(--fig-node-b)">情形 A</tspan>　消费能力不足：CPU/下游饱和、单条处理慢、并行度不够</text>

      <rect x="6" y="86" width="328" height="28" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="104" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700" fill="#e5484d">情形 B</tspan>　消费被卡住：下游超时、反复重试、rebalance 频繁、忘记 ack</text>

      <!-- 处理 -->
      <text x="6" y="130" font-size="9" font-weight="700" fill="var(--fig-text)">按原因分路</text>

      <rect x="6" y="138" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="151" font-size="7.5" font-weight="700" fill="var(--fig-node-c)">A：提消费能力</text>
      <text x="14" y="163" font-size="7.5" fill="var(--fig-text)">扩分区 → 再扩消费者实例（顺序别反）· 批量处理 · 减少单条耗时</text>

      <rect x="6" y="172" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="185" font-size="7.5" font-weight="700" fill="var(--fig-node-d)">B：解除阻塞</text>
      <text x="14" y="197" font-size="7.5" fill="var(--fig-text)">下游超时/重试 → 先降并发或熔断 · rebalance → 调 max.poll.interval.ms</text>

      <rect x="6" y="206" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="219" font-size="8" font-weight="700" fill="var(--fig-node-a)">应急止血</text>
      <text x="14" y="231" font-size="7.5" fill="var(--fig-text)">先别删消息；必要时「紧急扩容消费者」或「临时落到离线处理」</text>

      <text x="6" y="248" font-size="7.5" fill="var(--fig-muted)">注意：积压深了要确认「磁盘与保留期够不够」，别在追积压时被 retention 删掉</text>
    </svg>
    <figcaption>先看 LAG 判断是「能力不足」还是「被卡住」；前者扩分区再扩消费者，后者解除下游阻塞或调参</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
