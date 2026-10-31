<script setup>
/**
 * MQ 的容量规划与压测（题 2236）。
 *
 * 核心洞察：MQ 容量要看「峰值吞吐 + 堆积容忍 + 保留期」三件事，
 * 压测必须模拟「消费者变慢」而不只是正常消费。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 252" role="img" aria-label="MQ 容量规划三项：峰值吞吐、堆积容忍、保留期；压测要模拟消费者变慢与故障">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">容量不是「日常够用」，而是「峰值 + 故障时能不能扛」</text>

      <rect x="6" y="20" width="328" height="28" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="38" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">①</tspan> 峰值吞吐：按峰值（含大促/重放）规划，不是日均</text>

      <rect x="6" y="52" width="328" height="28" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">②</tspan> 堆积容忍：消费者全挂 1 小时，消息要能存住（算磁盘）</text>

      <rect x="6" y="84" width="328" height="28" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="102" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">③</tspan> 保留期：消息保留多久 vs 磁盘容量，两者互相约束</text>

      <!-- 压测要点 -->
      <rect x="6" y="116" width="328" height="56" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="129" font-size="8.5" font-weight="700" fill="#e5484d">压测必须覆盖的四种场景</text>
      <text x="14" y="142" font-size="7.5" fill="var(--fig-text)">① 正常消费　② 消费者变慢（模拟堆积增长）</text>
      <text x="14" y="154" font-size="7.5" fill="var(--fig-text)">③ 消费者全挂（看堆积与磁盘增速）　④ 单 broker 故障（看是否自动恢复）</text>
      <text x="14" y="166" font-size="7" fill="var(--fig-node-c)">只测「正常消费」等于没测 —— 真实事故都是异常场景</text>

      <rect x="6" y="178" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="191" font-size="8" font-weight="700" fill="var(--fig-node-d)">容量公式（粗略）</text>
      <text x="14" y="203" font-size="7.5" fill="var(--fig-text)">磁盘 = 峰值消息量/秒 × 消息大小 × 保留秒数 × 副本数</text>

      <rect x="6" y="218" width="328" height="20" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="232" font-size="7.5" fill="var(--fig-text)">关键指标：生产速率、消费速率、堆积深度、磁盘增速、端到端延迟</text>

      <text x="6" y="242" font-size="7.5" fill="var(--fig-muted)">注意：扩容分区后「旧消息仍在旧分区」，容量不会立刻均衡</text>
    </svg>
    <figcaption>容量看峰值吞吐、堆积容忍、保留期；压测必须覆盖消费者变慢/全挂/单broker故障，只测正常消费等于没测</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
