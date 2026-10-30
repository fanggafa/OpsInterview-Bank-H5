<script setup>
/**
 * Kafka / RabbitMQ / RocketMQ 选型对比（题 2200）。
 *
 * 核心洞察：三者差异源于「设计目标」——Kafka 为吞吐、RabbitMQ 为灵活路由与低延迟、
 * RocketMQ 居中且带事务消息。选型要按「吞吐 vs 延迟 vs 路由」三轴取。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 276" role="img" aria-label="Kafka、RabbitMQ、RocketMQ 在吞吐、延迟、路由能力、典型场景上的对比">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">差异源于「设计目标」：吞吐优先 / 路由灵活 / 折中方案</text>

      <text x="86" y="32" font-size="8" font-weight="700" fill="var(--fig-node-a)">Kafka</text>
      <text x="164" y="32" font-size="8" font-weight="700" fill="var(--fig-node-b)">RabbitMQ</text>
      <text x="256" y="32" font-size="8" font-weight="700" fill="var(--fig-node-c)">RocketMQ</text>
      <line x1="6" y1="37" x2="334" y2="37" stroke="var(--fig-muted)" stroke-width=".5" opacity=".5" />

      <text x="6" y="52" font-size="7.5" font-weight="700" fill="var(--fig-text)">模型</text>
      <text x="86" y="52" font-size="7" fill="var(--fig-text)">分区+副本日志</text>
      <text x="164" y="52" font-size="7" fill="var(--fig-text)">AMQP 交换机+队列</text>
      <text x="256" y="52" font-size="7" fill="var(--fig-text)">CommitLog+索引</text>

      <text x="6" y="70" font-size="7.5" font-weight="700" fill="var(--fig-text)">吞吐</text>
      <text x="86" y="70" font-size="7" font-weight="700" fill="var(--fig-node-a)">百万级/秒</text>
      <text x="164" y="70" font-size="7" fill="var(--fig-text)">万级</text>
      <text x="256" y="70" font-size="7" fill="var(--fig-text)">十万级</text>

      <text x="6" y="88" font-size="7.5" font-weight="700" fill="var(--fig-text)">延迟</text>
      <text x="86" y="88" font-size="7" fill="var(--fig-text)">毫秒（批量后几十）</text>
      <text x="164" y="88" font-size="7" font-weight="700" fill="var(--fig-node-b)">微秒级（最低）</text>
      <text x="256" y="88" font-size="7" fill="var(--fig-text)">毫秒</text>

      <text x="6" y="106" font-size="7.5" font-weight="700" fill="var(--fig-text)">路由能力</text>
      <text x="86" y="106" font-size="7" fill="var(--fig-text)">弱（Topic 分区）</text>
      <text x="164" y="106" font-size="7" font-weight="700" fill="var(--fig-node-b)">最强（4 种交换机）</text>
      <text x="256" y="106" font-size="7" fill="var(--fig-text)">中（Tag 过滤）</text>

      <text x="6" y="124" font-size="7.5" font-weight="700" fill="var(--fig-text)">消息回溯</text>
      <text x="86" y="124" font-size="7" font-weight="700" fill="var(--fig-node-a)">强（按 offset）</text>
      <text x="164" y="124" font-size="7" fill="var(--fig-text)">弱</text>
      <text x="256" y="124" font-size="7" fill="var(--fig-text)">中</text>

      <text x="6" y="142" font-size="7.5" font-weight="700" fill="var(--fig-text)">事务消息</text>
      <text x="86" y="142" font-size="7" fill="var(--fig-text)">支持（0.11+）</text>
      <text x="164" y="142" font-size="7" fill="var(--fig-text)">弱</text>
      <text x="256" y="142" font-size="7" font-weight="700" fill="var(--fig-node-c)">原生强支持</text>

      <text x="6" y="166" font-size="9" font-weight="700" fill="var(--fig-text)">怎么选</text>

      <rect x="6" y="174" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="182" font-size="7.5" font-weight="700" fill="var(--fig-node-a)">要吞吐/日志管道</text>
      <text x="110" y="186" font-size="7.5" fill="var(--fig-text)">Kafka：埋点、日志采集、流式计算、CDC</text>

      <rect x="6" y="204" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="212" font-size="7.5" font-weight="700" fill="var(--fig-node-b)">要复杂路由/低延迟</text>
      <text x="122" y="216" font-size="7.5" fill="var(--fig-text)">RabbitMQ：业务解耦、任务分发、优先级队列</text>

      <rect x="6" y="234" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="242" font-size="7.5" font-weight="700" fill="var(--fig-node-c)">要事务/顺序消息</text>
      <text x="122" y="246" font-size="7.5" fill="var(--fig-text)">RocketMQ：电商交易、订单状态流转（国内常见）</text>

      <text x="6" y="270" font-size="7.5" fill="var(--fig-muted)">别只看吞吐：选 Kafka 后「按路由/优先级分发」极难做，常要加业务层补丁</text>
    </svg>
    <figcaption>Kafka 胜在吞吐与回溯、RabbitMQ 胜在路由与低延迟、RocketMQ 折中且有事务消息</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
