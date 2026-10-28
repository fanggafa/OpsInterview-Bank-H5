<script setup>
/**
 * Kafka 消息「丢失/重复」的三个环节图。
 * 把消息从生产到消费的全链路上「可能丢在哪」标出来——
 * 这是「消息队列怎么保证不丢」这道题最需要的定位图。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 226" role="img" aria-label="Kafka 消息在生产者、broker、消费者三个环节的丢失与重复风险">
      <defs>
        <marker id="arrMq" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-node-a)" />
        </marker>
      </defs>

      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">一条消息要穿过三段链路，每一段都有「丢」和「重」的风险</text>

      <!-- 生产者 -->
      <rect x="6" y="20" width="94" height="66" rx="7" fill="var(--fig-node-a)" opacity=".09" />
      <rect x="6" y="20" width="94" height="66" rx="7" fill="none" stroke="var(--fig-node-a)" stroke-width="1.3" />
      <text x="14" y="35" font-size="9.5" font-weight="700" fill="var(--fig-node-a)">① 生产者</text>
      <text x="14" y="50" font-size="8" fill="var(--fig-node-d)">丢：acks=0 时发出即忘</text>
      <text x="14" y="63" font-size="8" fill="var(--fig-node-d)">丢：缓冲区满且未重试</text>
      <text x="14" y="78" font-size="8" fill="var(--fig-node-c)">防：acks=all + 重试</text>

      <path d="M102 53 L134 53" stroke="var(--fig-node-a)" stroke-width="1.7" marker-end="url(#arrMq)" />

      <!-- Broker -->
      <rect x="138" y="20" width="94" height="66" rx="7" fill="var(--fig-node-b)" opacity=".09" />
      <rect x="138" y="20" width="94" height="66" rx="7" fill="none" stroke="var(--fig-node-b)" stroke-width="1.3" />
      <text x="146" y="35" font-size="9.5" font-weight="700" fill="var(--fig-node-b)">② Broker / ISR</text>
      <text x="146" y="50" font-size="8" fill="var(--fig-node-d)">丢：副本未同步就切换</text>
      <text x="146" y="63" font-size="8" fill="var(--fig-node-d)">丢：默认不 fsync 就应答</text>
      <text x="146" y="78" font-size="8" fill="var(--fig-node-c)">防：min.insync + unclean 关闭</text>

      <path d="M234 53 L266 53" stroke="var(--fig-node-a)" stroke-width="1.7" marker-end="url(#arrMq)" />

      <!-- 消费者 -->
      <rect x="270" y="20" width="64" height="66" rx="7" fill="var(--fig-node-c)" opacity=".09" />
      <rect x="270" y="20" width="64" height="66" rx="7" fill="none" stroke="var(--fig-node-c)" stroke-width="1.3" />
      <text x="278" y="35" font-size="9.5" font-weight="700" fill="var(--fig-node-c)">③ 消费者</text>
      <text x="278" y="50" font-size="7.5" fill="var(--fig-node-d)">丢：先提交</text>
      <text x="278" y="60" font-size="7.5" fill="var(--fig-node-d)">offset 再处理</text>
      <text x="278" y="78" font-size="7.5" fill="var(--fig-node-c)">防：先处理</text>

      <!-- 重复 -->
      <rect x="6" y="96" width="328" height="44" rx="7" fill="var(--fig-node-d)" opacity=".1" />
      <rect x="6" y="96" width="328" height="44" rx="7" fill="none" stroke="var(--fig-node-d)" stroke-width="1.2" />
      <text x="16" y="112" font-size="9" font-weight="700" fill="var(--fig-node-d)">「不丢」的代价：多半会「重复」</text>
      <text x="16" y="126" font-size="8.5" fill="var(--fig-text)">重试、ack 超时重发、rebalance 重新消费 offset —— 都会导致同一条消息被处理两次</text>
      <text x="16" y="136" font-size="8.5" fill="var(--fig-node-c)">所以消费端必须「幂等」：唯一键去重 / 状态机判断 / 数据库 upsert</text>

      <!-- 语义 -->
      <text x="6" y="162" font-size="9.5" font-weight="700" fill="var(--fig-text)">三种投递语义</text>
      <text x="6" y="176" font-size="8.5" fill="var(--fig-muted)">at-most-once（最多一次）：先提交 offset 再处理 → 可能丢，不会重</text>
      <text x="6" y="189" font-size="8.5" fill="var(--fig-muted)">at-least-once（至少一次）：先处理再提交 → 不会丢，可能重（最常见）</text>
      <text x="6" y="202" font-size="8.5" fill="var(--fig-node-c)">exactly-once（恰好一次）：需要事务/幂等配合，成本高</text>

      <text x="6" y="220" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">实践结论：选 at-least-once + 消费端幂等，这是绝大多数业务的最优解</text>
    </svg>
    <figcaption>「消息会不会丢」要分三段看；多数线上「丢消息」其实是第三段先提交 offset 导致的</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
