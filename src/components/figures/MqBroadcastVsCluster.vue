<script setup>
/**
 * 广播消费与集群消费的区别（题 2229）。
 *
 * 核心洞察：广播是「每个消费者都拿到全量」，集群消费是「组内分摊」；
 * 差别在「消费组」这个概念 —— 同组分摊、不同组各拿一份。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 254" role="img" aria-label="集群消费在同组内分摊消息，广播消费每个消费者都收到全量；不同消费组各自拿一份">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">分水岭是「消费组」：同组内分摊，不同组各拿一份全量</text>

      <rect x="6" y="20" width="160" height="70" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">集群消费（Clustering）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">同组消费者分摊消息</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">一条消息只被组内一个消费</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">可水平扩容提升吞吐</text>
      <text x="14" y="82" font-size="7.5" fill="var(--fig-node-c)">最常用（如订单处理）</text>

      <rect x="174" y="20" width="160" height="70" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">广播消费（Broadcasting）</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">每个消费者都收到全量</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">不能靠加机器提升吞吐</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">适合「通知/刷新缓存」</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-node-c)">RocketMQ 有原生广播模式</text>

      <!-- 怎么实现 -->
      <rect x="6" y="100" width="328" height="52" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="113" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">两种语义怎么实现</text>
      <text x="14" y="126" font-size="7.5" fill="var(--fig-text)">Kafka：用「不同的 consumer group」实现广播（每组各消费全量）</text>
      <text x="14" y="138" font-size="7.5" fill="var(--fig-text)">RabbitMQ：用 fanout 交换机 + 每个消费者一个队列实现广播</text>
      <text x="14" y="150" font-size="7" fill="var(--fig-node-c)">RocketMQ：同一 group 内默认集群消费，广播需显式设置</text>

      <rect x="6" y="162" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="175" font-size="8" font-weight="700" fill="var(--fig-node-d)">业务判断</text>
      <text x="14" y="188" font-size="7.5" fill="var(--fig-text)">要「一件事只做一次」→ 集群消费；要「所有节点都收到」→ 广播</text>

      <rect x="6" y="204" width="328" height="24" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="220" font-size="7.5" fill="var(--fig-text)">误用后果：用广播处理订单 → 同一订单被多次处理（必须幂等）</text>

      <text x="6" y="244" font-size="7.5" fill="var(--fig-muted)">Kafka 里「不同 group 各拿全量」是最常用的广播实现，不需要额外组件</text>
    </svg>
    <figcaption>集群消费在组内分摊（可扩容）、广播每个消费者都收全量（不可扩容）；Kafka 用不同 group 实现广播</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
