<script setup>
/**
 * 云上跨 VPC / 跨账号打通的方案（题 3416）。
 *
 * 核心洞察：同厂商优先 VPC 对等（简单、延迟低），跨账号要加授权，
 * 跨厂商只能走专线/VPN；选型看「是否同厂商」与「是否同账号」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 248" role="img" aria-label="跨 VPC 打通方案：同账号用 VPC 对等、跨账号加 RAM 授权、跨厂商走专线或 VPN">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">选型先看两件事：是否同厂商、是否同账号</text>

      <rect x="6" y="20" width="328" height="42" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">同账号跨 VPC：VPC 对等（Peering）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">直接打通两个 VPC，延迟低、配置简单、按流量计费</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-node-c)">注意：对等连接是「点对点」，多 VPC 全互通要建多条</text>

      <rect x="6" y="68" width="328" height="42" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="81" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">跨账号：对等 + 资源授权</text>
      <text x="14" y="94" font-size="7.5" fill="var(--fig-text)">需要双方账号显式接受授权（谁发起、谁批准要写清楚）</text>
      <text x="14" y="106" font-size="7.5" fill="var(--fig-node-c)">还要处理「安全组互相放行」与「路由互指」</text>

      <rect x="6" y="116" width="328" height="42" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="129" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">跨厂商 / 跨地域：专线或 VPN</text>
      <text x="14" y="142" font-size="7.5" fill="var(--fig-text)">专线稳定但贵且开通慢；VPN 便宜但质量受公网影响</text>
      <text x="14" y="154" font-size="7.5" fill="var(--fig-node-c)">注意 MTU 与丢包对 TCP 性能的影响</text>

      <!-- 排查 -->
      <rect x="6" y="166" width="328" height="30" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="179" font-size="8" font-weight="700" fill="#e5484d">打不通时按四层查</text>
      <text x="14" y="191" font-size="7.5" fill="var(--fig-text)">① 对等/隧道建成没 ② 路由有没有互指 ③ 安全组双向放行 ④ 目标监听地址</text>

      <rect x="6" y="202" width="328" height="24" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="218" font-size="7.5" fill="var(--fig-node-d)">云上还有「中转/中转网关（Transit Gateway）」适合多 VPC 星形组网</text>

      <text x="6" y="238" font-size="7.5" fill="var(--fig-muted)">验证方式：两端分别 curl + 抓包，确认包到哪一端就断了</text>
    </svg>
    <figcaption>同账号用 VPC 对等、跨账号需授权并互放安全组、跨厂商走专线或 VPN；不通时按建成/路由/安全组/监听四层查</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
