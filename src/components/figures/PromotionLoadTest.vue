<script setup>
/**
 * 大促前的容量评估与压测方案（题 5542）。
 *
 * 核心洞察：大促容量不是「压测一次」，而是「算清目标 → 分层压测 → 全链路演练 → 留预案」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 240" role="img" aria-label="大促容量评估五步：估算目标流量、分层压测、全链路演练、扩容与限流预案、复盘">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">不是「压一次」，而是算目标 → 分层压 → 全链路演练 → 留预案</text>

      <rect x="6" y="20" width="328" height="28" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="38" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">①</tspan> 估算目标：历史峰值 × 增长 × 大促系数（如 3~5 倍），按峰值不按均值</text>

      <rect x="6" y="52" width="328" height="28" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">②</tspan> 分层压测：单接口 → 核心链路 → 全链路（含 DB/缓存/MQ/三方）</text>

      <rect x="6" y="84" width="328" height="28" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="102" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">③</tspan> 找出瓶颈：哪个环节先到饱和（DB 连接/缓存命中/队列堆积/带宽）</text>

      <rect x="6" y="116" width="328" height="28" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="134" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">④</tspan> 预案：扩容方案、限流阈值、降级开关、熔断策略（并演练过）</text>

      <rect x="6" y="148" width="328" height="28" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="166" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">⑤</tspan> 演练与复盘：真跑一遍全链路，压测环境尽量贴近生产</text>

      <!-- 关键提醒 -->
      <rect x="6" y="182" width="328" height="30" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="195" font-size="8" font-weight="700" fill="#e5484d">最容易被忽略</text>
      <text x="14" y="207" font-size="7.5" fill="var(--fig-text)">压测流量要「像人」：均匀打会把缓存全打透，真实用户访问是不均匀的</text>

      <text x="6" y="230" font-size="7.5" fill="var(--fig-muted)">验收标准：压到目标峰值的 1.2 倍仍稳定；任何一环到瓶颈都有对应预案已演练</text>
    </svg>
    <figcaption>五步：估算峰值目标、分层压测、找先饱和的环节、扩容限流降级预案并演练、全链路复盘；压测流量要贴近真实用户分布</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
