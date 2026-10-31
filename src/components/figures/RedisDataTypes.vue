<script setup>
/**
 * Redis 常见数据结构与场景（题 3927）。
 *
 * 核心洞察：选型的核心是「类型 ↔ 场景」。最容易踩的是
 * 用 List 做正经消息队列（没有 ack，消费失败就丢）。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 242" role="img" aria-label="Redis 五种基础类型与四种进阶结构的适用场景">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">五种基础 + 四种进阶，关键是类型与场景对上</text>

      <rect x="6" y="20" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="37" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">String</tspan>　缓存对象、计数器、分布式锁、Session</text>

      <rect x="6" y="50" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="67" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">Hash</tspan>　存对象的部分字段、购物车（可局部更新）</text>

      <rect x="6" y="80" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="97" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">List</tspan>　最新列表、简单队列（但没 ack）</text>

      <rect x="6" y="110" width="328" height="26" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="127" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">Set</tspan>　标签、共同好友（交集）、去重</text>

      <rect x="6" y="140" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="157" font-size="7.5" fill="var(--fig-node-a)"><tspan font-weight="700">ZSet</tspan>　排行榜、延时队列、滑动窗口限流（跳表+哈希）</text>

      <!-- 进阶 -->
      <rect x="6" y="172" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="185" font-size="8" font-weight="700" fill="var(--fig-node-b)">进阶四种</text>
      <text x="14" y="197" font-size="7.5" fill="var(--fig-text)">Bitmap 签到 · HyperLogLog 海量 UV · GEO 附近的 · Stream 可靠消息</text>

      <rect x="6" y="206" width="328" height="28" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="224" font-size="7.5" fill="var(--fig-text)">误区：List 做正经 MQ 会丢消息（无 ack）→ 用 Stream 或 Kafka/RabbitMQ</text>

      <text x="6" y="234" font-size="7.5" fill="var(--fig-muted)">底层：小集合用紧凑编码（listpack），超阈值才转跳表/哈希表</text>
    </svg>
    <figcaption>String 缓存/计数/锁、Hash 对象、List 队列、Set 去重交集、ZSet 排行榜；进阶有 Bitmap/HLL/GEO/Stream</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
