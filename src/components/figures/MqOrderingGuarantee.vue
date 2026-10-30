<script setup>
/**
 * 消息队列的顺序消费（题 2221）。
 *
 * 核心洞察：顺序只可能在「同一分区/队列内」成立，
 * Kafka 靠「同 key 同分区 + 单线程消费」，RocketMQ 靠「同一 MessageQueue + 顺序投递」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 252" role="img" aria-label="顺序消费只在分区内成立：Kafka 同 key 同分区加单线程，RocketMQ 同 MessageQueue 顺序投递">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">顺序只能在「分区/队列内」保证，跨分区一定无序</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">前提：同一条业务消息要落到同一个分区</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">按业务主键（订单号/用户 ID）哈希选分区，而不是随机或轮询</text>

      <rect x="6" y="54" width="160" height="72" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="67" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">Kafka</text>
      <text x="14" y="80" font-size="7.5" fill="var(--fig-text)">同 key → 同分区</text>
      <text x="14" y="92" font-size="7.5" fill="var(--fig-text)">该分区单线程消费</text>
      <text x="14" y="104" font-size="7.5" fill="var(--fig-text)">不要用多线程并行处理同分区</text>
      <text x="14" y="116" font-size="7.5" fill="#e5484d">扩分区会破坏同 key 顺序</text>

      <rect x="174" y="54" width="160" height="72" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="182" y="67" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">RocketMQ</text>
      <text x="182" y="80" font-size="7.5" fill="var(--fig-text)">顺序消息按 key 选同一队列</text>
      <text x="182" y="92" font-size="7.5" fill="var(--fig-text)">队列级顺序投递</text>
      <text x="182" y="104" font-size="7.5" fill="var(--fig-text)">支持顺序消费（加锁保证）</text>
      <text x="182" y="116" font-size="7.5" fill="var(--fig-node-c)">代价：并发度受限（按队列串行）</text>

      <!-- 代价 -->
      <rect x="6" y="134" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="147" font-size="8.5" font-weight="700" fill="#e5484d">顺序的代价</text>
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)">串行意味着吞吐受单分区上限约束；故障重试也会打乱严格顺序</text>
      <text x="14" y="172" font-size="7.5" fill="var(--fig-text)">实务折中：只对「需要顺序的业务键」串行，其余并行</text>

      <rect x="6" y="188" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="201" font-size="8" font-weight="700" fill="var(--fig-node-d)">常见误判</text>
      <text x="14" y="214" font-size="7.5" fill="var(--fig-text)">「我只有一个消费者，所以全局有序」——若多分区，仍可能乱序</text>

      <text x="6" y="244" font-size="7.5" fill="var(--fig-muted)">补救：在消费端按业务键做「本地排队 + 去重」，或改用状态机校验</text>
    </svg>
    <figcaption>顺序只在分区/队列内成立：Kafka 靠同 key 同分区加单线程、RocketMQ 靠同队列顺序投递，代价是并发度受限</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
