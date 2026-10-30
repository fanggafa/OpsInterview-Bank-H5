<script setup>
/**
 * Kafka ISR 机制（题 2204）。
 *
 * 核心洞察：ISR 是「跟得上 Leader 的副本集合」，它的目的是让 acks=all
 * 不必等「所有副本」——否则一个慢节点就能把写入卡死。
 * 跟不上就踢出 ISR，恢复后再加回来。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 266" role="img" aria-label="Kafka ISR 机制：Leader 与同步副本组成 ISR，落后超过阈值被踢出 ISR，acks=all 只需 ISR 内确认">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">ISR = 跟得上 Leader 的副本集合；acks=all 等的是 ISR，不是所有副本</text>

      <!-- 要解决的问题 -->
      <rect x="6" y="20" width="328" height="34" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">为什么需要 ISR</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">若 acks=all 要求「所有副本」确认，一台慢/挂的 Follower 就会把写入永久卡住</text>

      <!-- 示意图 -->
      <text x="6" y="70" font-size="9" font-weight="700" fill="var(--fig-text)">分区 P0 的三个副本</text>

      <rect x="6" y="78" width="104" height="46" rx="5" fill="var(--fig-node-b)" opacity=".14" />
      <text x="14" y="93" font-size="8" font-weight="700" fill="var(--fig-node-b)">Leader</text>
      <text x="14" y="106" font-size="7.5" fill="var(--fig-text)">处理读写</text>
      <text x="14" y="118" font-size="7.5" fill="var(--fig-node-c)">始终在 ISR 内</text>

      <rect x="118" y="78" width="104" height="46" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="126" y="93" font-size="8" font-weight="700" fill="var(--fig-node-c)">Follower A</text>
      <text x="126" y="106" font-size="7.5" fill="var(--fig-text)">同步正常</text>
      <text x="126" y="118" font-size="7.5" fill="var(--fig-node-c)">在 ISR 内 ✓</text>

      <rect x="230" y="78" width="104" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="238" y="93" font-size="8" font-weight="700" fill="#e5484d">Follower B</text>
      <text x="238" y="106" font-size="7.5" fill="var(--fig-text)">磁盘慢/网络差</text>
      <text x="238" y="118" font-size="7.5" fill="#e5484d">被踢出 ISR ✗</text>

      <rect x="6" y="132" width="216" height="18" rx="3" fill="var(--fig-node-c)" opacity=".16" />
      <text x="14" y="145" font-size="7.5" font-weight="700" fill="var(--fig-node-c)">ISR = { Leader, Follower A } → acks=all 只需这两个确认</text>

      <!-- 进出条件 -->
      <text x="6" y="168" font-size="9" font-weight="700" fill="var(--fig-text)">进 / 出 ISR 的条件</text>
      <rect x="6" y="176" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="189" font-size="7.5" fill="var(--fig-text)">踢出：落后超过 replica.lag.time.max.ms（默认 10s）没有追上新消息</text>
      <text x="14" y="202" font-size="7.5" fill="var(--fig-text)">加入：落后追平后自动重新加入（无需人工干预）</text>

      <!-- 联动 -->
      <rect x="6" y="218" width="328" height="34" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="231" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">关键联动：min.insync.replicas</text>
      <text x="14" y="244" font-size="7.5" fill="var(--fig-text)">ISR 数量 &lt; min.insync.replicas 时，broker 直接拒绝写入（保一致，宁可不可写）</text>

      <text x="6" y="262" font-size="7.5" fill="var(--fig-muted)">排查：kafka-topics --describe 看 ISR 列表是否比 Replicas 短 → 说明有副本掉队</text>
    </svg>
    <figcaption>ISR 用「同步进度门槛」把跟不上的副本踢出去，让 acks=all 不被慢节点拖死；ISR 不足则拒绝写入</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
