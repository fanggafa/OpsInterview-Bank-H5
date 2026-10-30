<script setup>
/**
 * LVS 常用调度算法与选择（题 1604）。
 *
 * 核心洞察：算法选择取决于「后端是否同质」与「请求耗时是否均匀」；
 * 轮询最常用，但遇到耗时差异大或长连接时，最少连接更合适。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 258" role="img" aria-label="LVS 调度算法：rr 轮询、wrr 加权轮询、lc 最少连接、wlc 加权最少连接、sh 源地址哈希，各自适用场景">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">选算法看两件事：后端是否同质、请求耗时是否均匀</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">rr（轮询，默认）</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">后端同质、请求耗时均匀 → 最常用</text>

      <rect x="6" y="54" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="67" font-size="8" font-weight="700" fill="var(--fig-node-b)">wrr（加权轮询）</text>
      <text x="14" y="79" font-size="7.5" fill="var(--fig-text)">后端配置不同（新老机器混用）→ 按权重分配</text>

      <rect x="6" y="88" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="101" font-size="8" font-weight="700" fill="var(--fig-node-c)">lc / wlc（最少连接）</text>
      <text x="14" y="113" font-size="7.5" fill="var(--fig-text)">请求耗时差异大或长连接 → 避开正忙的机器</text>

      <rect x="6" y="122" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="135" font-size="8" font-weight="700" fill="var(--fig-node-d)">sh（源地址哈希）</text>
      <text x="14" y="147" font-size="7.5" fill="var(--fig-text)">需要会话保持 → 同源 IP 落同一台（但易不均）</text>

      <!-- 关键提醒 -->
      <rect x="6" y="158" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="171" font-size="8.5" font-weight="700" fill="#e5484d">sh 的经典问题</text>
      <text x="14" y="184" font-size="7.5" fill="var(--fig-text)">客户端都经同一出口（NAT/CDN）→ 全部哈希到一台，严重不均</text>
      <text x="14" y="196" font-size="7.5" fill="var(--fig-node-c)">对策：改用 wrr/wlc，或在上游按真实 IP 分流</text>

      <rect x="6" y="210" width="328" height="28" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="223" font-size="8" font-weight="700" fill="var(--fig-node-a)">怎么验证效果</text>
      <text x="14" y="235" font-size="7.5" fill="var(--fig-text)">ipvsadm -Ln --stats 看各 RS 的 Conns/InBytes 是否均匀</text>

      <text x="6" y="250" font-size="7.5" fill="var(--fig-muted)">还有：sed（最短预期延迟）、nq（最短队列）、dh（目标地址哈希）等较少使用</text>
    </svg>
    <figcaption>rr 适合同质后端、wrr 应对配置差异、lc/wlc 应对耗时差异与长连接、sh 做会话保持但易不均</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
