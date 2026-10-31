<script setup>
/**
 * RabbitMQ 消息丢失的三段与对策（题 2316）。
 *
 * 核心洞察：丢失分三处 —— 生产端没送到、Broker 没落盘、消费端没 ack 就崩。
 * 三段都要防，缺一处就有洞。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 250" role="img" aria-label="消息丢失三段：生产端靠 confirm、Broker 靠持久化、消费端靠手动 ack">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">三段都要防：生产端 → Broker → 消费端</text>

      <rect x="6" y="20" width="328" height="40" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① 生产端：消息没送到 Broker</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">原因：网络中断、Broker 拒收，客户端以为发出去了</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-node-c)">对策：开启 publisher confirm（异步确认）</text>

      <rect x="6" y="68" width="328" height="40" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="81" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">② Broker：未落盘就崩溃</text>
      <text x="14" y="94" font-size="7.5" fill="var(--fig-text)">原因：消息在内存里，Broker 重启就丢</text>
      <text x="14" y="106" font-size="7.5" fill="var(--fig-node-b)">对策：队列 durable + 消息 delivery_mode=2（两个都要设）</text>

      <rect x="6" y="116" width="328" height="40" rx="5" fill="#e5484d" opacity=".12" />
      <text x="14" y="129" font-size="8.5" font-weight="700" fill="#e5484d">③ 消费端：未 ack 就崩溃（最高频）</text>
      <text x="14" y="142" font-size="7.5" fill="var(--fig-text)">原因：autoAck=true 时，消息一投递就算「消费成功」</text>
      <text x="14" y="154" font-size="7.5" fill="#e5484d">对策：关闭 autoAck，处理完再手动 basic_ack</text>

      <!-- 取舍 -->
      <rect x="6" y="164" width="328" height="40" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="177" font-size="8" font-weight="700" fill="var(--fig-node-c)">防了丢失，会出现「重复」</text>
      <text x="14" y="190" font-size="7.5" fill="var(--fig-text)">confirm + 手动 ack 是「至少一次」语义 → 可能重复投递</text>
      <text x="14" y="202" font-size="7.5" fill="var(--fig-node-c)">所以消费端必须幂等（唯一键去重 / 状态机校验）</text>

      <rect x="6" y="210" width="328" height="16" rx="3" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="222" font-size="7.5" fill="var(--fig-text)">已经丢了：从生产端日志重放 + 幂等消费 + 补「未 ack 数」告警</text>

      <text x="6" y="242" font-size="7.5" fill="var(--fig-muted)">最容易被漏：只设队列 durable 却没设消息持久化，等于没设</text>
    </svg>
    <figcaption>三段丢失：生产端靠 confirm、Broker 靠 durable+持久化（两者都要）、消费端靠手动 ack；防丢会带来重复，需幂等</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
