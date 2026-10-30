<script setup>
/**
 * 流量控制 vs 拥塞控制，以及拥塞控制四阶段（题 4400）。
 *
 * 核心洞察：两者解决的是**不同对象**的问题——流量控制怕「接收方撑不住」，
 * 拥塞控制怕「网络撑不住」；实际发送量 = min(rwnd, cwnd)。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 278" role="img" aria-label="流量控制针对接收方、拥塞控制针对网络，实际发送量取 rwnd 与 cwnd 的较小值，拥塞控制分慢启动、拥塞避免、快重传、快恢复四阶段">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">两个完全不同的问题：怕接收方撑不住 vs 怕网络撑不住</text>

      <!-- 对比 -->
      <rect x="6" y="20" width="160" height="66" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">流量控制 Flow Control</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">解决：接收方处理不过来</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">依据：接收窗口 rwnd</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">谁通知：接收方在 ACK 里告知</text>
      <text x="14" y="82" font-size="7.5" fill="var(--fig-node-c)">方向：接收方 → 发送方</text>

      <rect x="174" y="20" width="160" height="66" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">拥塞控制 Congestion</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">解决：网络处理不过来</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">依据：拥塞窗口 cwnd</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">谁通知：发送方自己探测</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-node-c)">方向：发送方自我约束</text>

      <!-- 核心公式 -->
      <rect x="6" y="92" width="328" height="22" rx="4" fill="var(--fig-node-c)" opacity=".14" />
      <text x="14" y="106" font-size="9" font-weight="700" fill="var(--fig-node-c)">实际发送量 = min(rwnd, cwnd) —— 两个窗口取小的，谁紧就听谁</text>

      <!-- 四阶段 -->
      <text x="6" y="130" font-size="9.5" font-weight="700" fill="var(--fig-text)">拥塞控制四阶段</text>

      <rect x="6" y="138" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="150" font-size="7.5" font-weight="700" fill="var(--fig-node-a)">① 慢启动</text>
      <text x="62" y="155" font-size="7.5" fill="var(--fig-text)">cwnd 从 1 MSS 起，每个 RTT 翻倍（指数增长）到慢启动阈值 ssthresh</text>

      <rect x="6" y="166" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="178" font-size="7.5" font-weight="700" fill="var(--fig-node-b)">② 拥塞避免</text>
      <text x="62" y="183" font-size="7.5" fill="var(--fig-text)">超过 ssthresh 后改为每 RTT 加 1（线性增长），谨慎试探</text>

      <rect x="6" y="194" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="206" font-size="7.5" font-weight="700" fill="var(--fig-node-c)">③ 快重传</text>
      <text x="62" y="211" font-size="7.5" fill="var(--fig-text)">收到 3 个重复 ACK 就立即重传，不等超时（超时太慢）</text>

      <rect x="6" y="222" width="328" height="26" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="234" font-size="7.5" font-weight="700" fill="var(--fig-node-d)">④ 快恢复</text>
      <text x="62" y="239" font-size="7.5" fill="var(--fig-text)">ssthresh 减半、cwnd 降到 ssthresh，直接进入拥塞避免（非慢启动）</text>

      <text x="6" y="262" font-size="7.5" fill="var(--fig-muted)">超时重传 vs 三次重复 ACK：前者更严重（网络可能真堵了），后者较轻微</text>
      <text x="6" y="272" font-size="7.5" fill="var(--fig-muted)">面试要点：说清「rwnd 是别人给的、cwnd 是自己算的」</text>
    </svg>
    <figcaption>流量控制怕接收方撑不住、拥塞控制怕网络撑不住；发送量取两者最小值，拥塞控制走「慢启动→避免→快重传→快恢复」</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
