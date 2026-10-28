<script setup>
/**
 * LVS 四种转发模式对比图（DR / NAT / TUN / FULLNAT）。
 * 重点展示「请求包怎么进、响应包怎么出」——这是四种模式的本质差异。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 244" role="img" aria-label="LVS 的 DR、NAT、TUN、FULLNAT 四种模式中请求与响应的路径差异">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">核心差异看两点：请求怎么到 RS、响应怎么回客户端</text>

      <!-- DR -->
      <rect x="6" y="20" width="160" height="52" rx="6" fill="var(--fig-node-a)" opacity=".08" />
      <rect x="6" y="20" width="160" height="52" rx="6" fill="none" stroke="var(--fig-node-a)" stroke-width="1.3" />
      <text x="14" y="35" font-size="9.5" font-weight="700" fill="var(--fig-node-a)">DR · 直接路由（最常用）</text>
      <text x="14" y="50" font-size="8" fill="var(--fig-text)">请求：改目标 MAC，IP 不变 → RS 直接回客户端</text>
      <text x="14" y="62" font-size="8" fill="var(--fig-node-c)">✓ 性能最好（响应不经 LVS）　✗ 要求同二层网络</text>

      <!-- NAT -->
      <rect x="174" y="20" width="160" height="52" rx="6" fill="var(--fig-node-c)" opacity=".08" />
      <rect x="174" y="20" width="160" height="52" rx="6" fill="none" stroke="var(--fig-node-c)" stroke-width="1.3" />
      <text x="182" y="35" font-size="9.5" font-weight="700" fill="var(--fig-node-c)">NAT · 地址转换</text>
      <text x="182" y="50" font-size="8" fill="var(--fig-text)">请求改目标 IP，响应也必须经 LVS 改写回来</text>
      <text x="182" y="62" font-size="8" fill="var(--fig-node-d)">✓ 支持跨网段　✗ LVS 是响应瓶颈</text>

      <!-- TUN -->
      <rect x="6" y="80" width="160" height="52" rx="6" fill="var(--fig-node-b)" opacity=".08" />
      <rect x="6" y="80" width="160" height="52" rx="6" fill="none" stroke="var(--fig-node-b)" stroke-width="1.3" />
      <text x="14" y="95" font-size="9.5" font-weight="700" fill="var(--fig-node-b)">TUN · IP 隧道</text>
      <text x="14" y="110" font-size="8" fill="var(--fig-text)">请求封装成 IP 隧道包发给 RS，RS 解封装后直接回</text>
      <text x="14" y="122" font-size="8" fill="var(--fig-node-d)">✓ 可跨机房　✗ 需 RS 支持隧道，运维复杂</text>

      <!-- FULLNAT -->
      <rect x="174" y="80" width="160" height="52" rx="6" fill="var(--fig-node-d)" opacity=".08" />
      <rect x="174" y="80" width="160" height="52" rx="6" fill="none" stroke="var(--fig-node-d)" stroke-width="1.3" />
      <text x="182" y="95" font-size="9.5" font-weight="700" fill="var(--fig-node-d)">FULLNAT · 全 NAT</text>
      <text x="182" y="110" font-size="8" fill="var(--fig-text)">源与目标 IP 都改，RS 无感知「谁是客户端」</text>
      <text x="182" y="122" font-size="8" fill="var(--fig-node-c)">✓ 部署最灵活（RS 可任意网段）</text>

      <!-- 调度算法 -->
      <text x="6" y="150" font-size="9.5" font-weight="700" fill="var(--fig-text)">四种常用调度算法</text>
      <text x="6" y="164" font-size="8.5" fill="var(--fig-text)">rr / wrr</text>
      <text x="72" y="164" font-size="8.5" fill="var(--fig-muted)">轮询 / 加权轮询 —— 简单，假设每请求开销相近</text>
      <text x="6" y="178" font-size="8.5" fill="var(--fig-text)">lc / wlc</text>
      <text x="72" y="178" font-size="8.5" fill="var(--fig-muted)">最少连接 —— 适合长连接、请求耗时差异大</text>
      <text x="6" y="192" font-size="8.5" fill="var(--fig-text)">sh</text>
      <text x="72" y="192" font-size="8.5" fill="var(--fig-muted)">源地址哈希 —— 会话保持（但会让负载不均）</text>
      <text x="6" y="206" font-size="8.5" fill="var(--fig-text)">wrr + 健康检查</text>
      <text x="120" y="206" font-size="8.5" fill="var(--fig-muted)">生产常态：权重按机器规格，健康检查摘掉坏点</text>

      <rect x="6" y="214" width="328" height="26" rx="6" fill="var(--fig-node-a)" opacity=".1" />
      <text x="16" y="226" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">选型口诀：同机房用 DR（性能最好），跨网段用 NAT/FULLNAT，跨机房用 TUN</text>
      <text x="16" y="237" font-size="8" fill="var(--fig-muted)">DR 的坑：RS 要绑 VIP 到 lo 且抑制 ARP，否则会抢 VIP</text>
    </svg>
    <figcaption>LVS 只做四层转发；七层需求（按域名/路径分流）交给 Nginx 或 HAProxy</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
