<script setup>
/**
 * Kafka Topic 命名与分区数规划（题 2231）。
 *
 * 核心洞察：分区数一旦定下就难改（减少不允许、增加会破坏同 key 顺序），
 * 所以规划要按「目标吞吐 ÷ 单分区能力」倒推，并给消费者留出扩容空间。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 252" role="img" aria-label="Kafka 分区数规划：按目标吞吐除以单分区能力倒推，分区数是并行度上限且改动代价高">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">分区数是「并行度上限」，减少不允许、增加会破坏同 key 顺序</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">倒推公式</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">目标吞吐 ÷ 单分区可承载速率 = 最小分区数，再按「1.5~2 倍」留余量</text>

      <rect x="6" y="58" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="71" font-size="8" font-weight="700" fill="var(--fig-node-b)">也要看消费端</text>
      <text x="14" y="84" font-size="7.5" fill="var(--fig-text)">分区数 = 单组最大并行消费者数；消费者想扩到 N 个，分区至少 N</text>

      <rect x="6" y="96" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="109" font-size="8" font-weight="700" fill="var(--fig-node-c)">命名规范</text>
      <text x="14" y="122" font-size="7.5" fill="var(--fig-text)">环境.业务域.事件类型.版本（如 prod.order.created.v1），便于治理与灰度</text>

      <!-- 不要过度分区 -->
      <rect x="6" y="134" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="147" font-size="8.5" font-weight="700" fill="#e5484d">为什么不要「先设很多分区」</text>
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)">分区多 → 每分区都有开销（文件句柄、内存、元数据），集群压力上升</text>
      <text x="14" y="172" font-size="7.5" fill="var(--fig-text)">且低流量 Topic 上多分区会让消费端大量空转</text>

      <rect x="6" y="188" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="201" font-size="8" font-weight="700" fill="var(--fig-node-d)">顺带要定的</text>
      <text x="14" y="214" font-size="7.5" fill="var(--fig-text)">副本数（≥3）· 保留期（覆盖最长消费延迟）· cleanup.policy（delete/compact）</text>

      <text x="6" y="244" font-size="7.5" fill="var(--fig-muted)">顺序敏感业务：扩分区会改变同 key 的分区映射 → 切换期可能乱序</text>
    </svg>
    <figcaption>分区数按「目标吞吐 ÷ 单分区能力」倒推并留 1.5~2 倍余量；不要先设很多分区，且顺序敏感业务慎扩</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
