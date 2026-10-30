<script setup>
/**
 * 跨机房 / 跨云组网方案对比（题 4417）。
 *
 * 核心洞察：选型取决于「要不要二层」「要多快」「能接受多少运维成本」——
 * 专线最稳、VPN 最便宜、SD-WAN 折中、云专线最省心。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 262" role="img" aria-label="跨机房组网方案：专线、VPN/IPsec、SD-WAN、云商专线、VPC 对等，各自成本与适用">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">选型看三件事：要不要二层？要多快？能接受多少运维成本？</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">专线（裸光纤 / MPLS）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">延迟最低、最稳定，可承载二层；成本高、开通周期长</text>

      <rect x="6" y="58" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="71" font-size="8" font-weight="700" fill="var(--fig-node-b)">VPN / IPsec（走公网）</text>
      <text x="14" y="84" font-size="7.5" fill="var(--fig-text)">便宜、开通快；质量受公网影响，MTU/重传问题常见</text>

      <rect x="6" y="96" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="109" font-size="8" font-weight="700" fill="var(--fig-node-c)">SD-WAN</text>
      <text x="14" y="122" font-size="7.5" fill="var(--fig-text)">多条链路（专线+宽带）按应用选路、故障自动切换</text>

      <rect x="6" y="134" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="147" font-size="8" font-weight="700" fill="var(--fig-node-d)">云商专线 / 云连接</text>
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)">机房到云 VPC 的托管专线；省运维、按带宽计费</text>

      <rect x="6" y="172" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="185" font-size="8" font-weight="700" fill="var(--fig-node-a)">VPC 对等（Peering）</text>
      <text x="14" y="198" font-size="7.5" fill="var(--fig-text)">同厂商跨 VPC 打通，最简单；跨厂商不适用</text>

      <rect x="6" y="212" width="328" height="30" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="225" font-size="8" font-weight="700" fill="#e5484d">最容易忽略</text>
      <text x="14" y="237" font-size="7.5" fill="var(--fig-text)">跨机房后「丢包与延迟」会放大所有同步机制的代价（如数据库主从）</text>

      <text x="6" y="252" font-size="7.5" fill="var(--fig-muted)">评估方法：先两端 mtr + 压测拿基线，再决定架构（别先画架构再验证网络）</text>
    </svg>
    <figcaption>专线最稳最贵、VPN 便宜但受公网影响、SD-WAN 多链路择优、云商专线省运维、VPC 对等同厂商最简</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
