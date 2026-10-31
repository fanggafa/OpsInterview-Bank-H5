<script setup>
/**
 * Kafka 大量 Leader 选举 / 分区不可用（题 2224）。
 *
 * 核心洞察：频繁选举通常是「controller 或 broker 不稳定」——
 * 网络抖动、GC 停顿、磁盘慢、或副本同步跟不上，都会让 broker 被踢出 ISR。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 254" role="img" aria-label="Kafka 频繁 Leader 选举的四类原因：controller 不稳定、broker 掉线、磁盘慢、副本同步滞后">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">频繁选举 = broker 被反复判定不可用 —— 先查「它为什么掉」</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="#e5484d" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="#e5484d">① Controller 不稳定</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">controller 频繁切换会引发大范围重新选举（epoch 变化）</text>

      <rect x="6" y="54" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="67" font-size="8" font-weight="700" fill="var(--fig-node-a)">② Broker 掉线 / 心跳超时</text>
      <text x="14" y="79" font-size="7.5" fill="var(--fig-text)">网络抖动、GC 长停顿、负载过高 → 超过 session.timeout 被踢</text>

      <rect x="6" y="88" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="101" font-size="8" font-weight="700" fill="var(--fig-node-b)">③ 磁盘慢 / IO 卡住</text>
      <text x="14" y="113" font-size="7.5" fill="var(--fig-text)">日志段刷盘慢 → 副本落后 → 被移出 ISR 并触发选举</text>

      <rect x="6" y="122" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="135" font-size="8" font-weight="700" fill="var(--fig-node-c)">④ 副本同步滞后</text>
      <text x="14" y="147" font-size="7.5" fill="var(--fig-text)">落后超过 replica.lag.time.max.ms → 出 ISR；两者都出则分区不可用</text>

      <!-- 排查 -->
      <rect x="6" y="160" width="328" height="50" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="173" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">排查手段</text>
      <text x="14" y="186" font-size="7.5" fill="var(--fig-text)">① 看 broker 日志的「isr shrink / leader election / controller」关键字</text>
      <text x="14" y="198" font-size="7.5" fill="var(--fig-text)">② kafka-topics --describe 看 ISR 是否不全；kafka-consumer-groups 看堆积</text>
      <text x="14" y="210" font-size="7" fill="var(--fig-node-c)">③ 看 GC 日志与 iostat（disk await 高说明盘是瓶颈）</text>

      <rect x="6" y="218" width="328" height="16" rx="3" fill="#e5484d" opacity=".1" />
      <text x="14" y="230" font-size="7.5" fill="var(--fig-text)">注意：unclean.leader.election 开启会「丢数据换可用」，务必谨慎</text>

      <text x="6" y="244" font-size="7.5" fill="var(--fig-muted)">分区不可用 = ISR 里没有存活副本；先恢复 broker 再谈其他</text>
    </svg>
    <figcaption>频繁选举多为 controller 不稳、broker 心跳超时、磁盘慢、副本滞后；查 broker 日志的 isr shrink 与 leader election 关键字</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
