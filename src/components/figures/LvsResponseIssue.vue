<script setup>
/**
 * LVS「请求到了后端但响应不回客户端」（题 1612）。
 *
 * 核心洞察：问题常出在「回程路径」—— 后端可能绕过 LVS 直接回给客户端，
 * 导致客户端看到的源地址不对（SYN-ACK 不被认可），典型是 DR 模式配置不全。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 252" role="img" aria-label="LVS 请求到后端但响应不回客户端的四类原因：回程绕过、ARP 未抑制、网络不对称、后端地址配置错误">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">请求能到 ≠ 响应能回 —— 多数问题在「回程路径」</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="#e5484d" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="#e5484d">① 回程绕过 LVS（DR 模式最常见）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">后端直接把响应发给客户端 → 客户端收到的包「源地址不对」，SYN-ACK 被丢</text>

      <rect x="6" y="58" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="71" font-size="8" font-weight="700" fill="var(--fig-node-a)">② ARP 未抑制</text>
      <text x="14" y="84" font-size="7.5" fill="var(--fig-text)">后端绑了 VIP 却没设 arp_ignore，把 VIP 抢过去 → 流量不打 LVS 直接到后端</text>

      <rect x="6" y="96" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="109" font-size="8" font-weight="700" fill="var(--fig-node-b)">③ 路由/网络不对称</text>
      <text x="14" y="122" font-size="7.5" fill="var(--fig-text)">去程经 LVS、回程走另一条路 → 防火墙丢包或状态跟踪不一致</text>

      <rect x="6" y="134" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="147" font-size="8" font-weight="700" fill="var(--fig-node-c)">④ 后端监听地址配错</text>
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)">只监听 127.0.0.1 或内网 IP，收不到发往 VIP 的包</text>

      <!-- 排查 -->
      <rect x="6" y="176" width="328" height="50" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="189" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">排查顺序（按投入产出）</text>
      <text x="14" y="202" font-size="7.5" fill="var(--fig-text)">① 三处抓包：客户端、LVS、后端 —— 看响应包「从哪来、源地址是什么」</text>
      <text x="14" y="214" font-size="7.5" fill="var(--fig-text)">② ipvsadm -Ln --stats 看 Conn/InBytes/OutBytes 是否都在增长</text>

      <rect x="6" y="234" width="328" height="20" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="248" font-size="7.5" fill="var(--fig-text)">DR 模式必配：后端 arp_ignore=1、arp_announce=2，且 VIP 只绑不对外宣告</text>
    </svg>
    <figcaption>请求到后端但不回客户端，多为回程绕过 LVS、ARP 未抑制、路由不对称或监听地址错；抓包看响应源地址最快</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
