<script setup>
/**
 * Kafka 分区与消费者的关系（题 2315）。
 *
 * 核心洞察：一个分区同一时刻只能被「同一个消费组内的一个消费者」消费；
 * 消费者多于分区时多出来的会空转 —— 正确顺序是先扩分区、再扩消费者。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 234" role="img" aria-label="分区与消费者三种关系：消费者少于分区、相等、多于分区；以及消费组语义">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">一个分区同一时刻只能被组内一个消费者消费</text>

      <rect x="6" y="20" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="37" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">消费者 &lt; 分区</tspan>　多对一：一人负责多个分区（正常，负载更高）</text>

      <rect x="6" y="50" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="67" font-size="7.5" fill="var(--fig-node-b)"><tspan font-weight="700">消费者 = 分区</tspan>　一对一（理想均衡）</text>

      <rect x="6" y="80" width="328" height="30" rx="4" fill="#e5484d" opacity=".12" />
      <text x="14" y="93" font-size="7.5" fill="#e5484d"><tspan font-weight="700">消费者 &gt; 分区</tspan>　多出来的消费者分不到分区 → 空转</text>
      <text x="14" y="105" font-size="7.5" fill="var(--fig-text)">看起来「扩了消费者」，实际吞吐没变 —— 瓶颈是分区数</text>

      <!-- 消费组语义 -->
      <rect x="6" y="114" width="328" height="40" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="127" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">消费组的关键语义</text>
      <text x="14" y="140" font-size="7.5" fill="var(--fig-text)">同组：分区被组内成员瓜分（一条消息只被消费一次）</text>
      <text x="14" y="152" font-size="7.5" fill="var(--fig-text)">不同组：每个组都收到全量 → 这就是「广播」的实现方式</text>

      <rect x="6" y="162" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="175" font-size="8" font-weight="700" fill="var(--fig-node-d)">为什么「多对一」不会乱序</text>
      <text x="14" y="187" font-size="7.5" fill="var(--fig-text)">每个分区由单线程处理，多分区分给同一消费者互不干扰</text>

      <rect x="6" y="200" width="328" height="18" rx="3" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="213" font-size="7.5" fill="var(--fig-text)">顺序消费前提：同 key 落同分区 + 该分区单线程消费</text>

      <text x="6" y="226" font-size="7.5" fill="var(--fig-muted)">正确扩容顺序：先扩分区数，再扩消费者（反过来无效）</text>
    </svg>
    <figcaption>消费者少于/等于/多于分区三种关系；多于分区会空转，扩容要先加分区再加消费者；同组分摊、不同组各拿全量</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
