<script setup>
/**
 * ping 不通的分层排查（题 103）。
 *
 * 核心洞察：ping 不通不等于网络坏 —— 要先分清是本机、链路、还是目标禁 ICMP，
 * 最终用业务端口验证才算数。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 254" role="img" aria-label="ping 不通排查：本机网络、网关、同网段、跨网段 traceroute、DNS、目标是否禁 ICMP，最后用业务端口验证">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">ping 不通 ≠ 网络坏；先分层，再用「业务端口」下结论</text>

      <rect x="6" y="20" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="36" font-size="7.5" fill="var(--fig-text)">① 本机：ip addr / ip route / ip neigh（网卡、路由、网关 ARP）</text>

      <rect x="6" y="50" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="66" font-size="7.5" fill="var(--fig-text)">② 网关：ping 网关不通 → 二层/本机问题（网线、交换机、VLAN）</text>

      <rect x="6" y="80" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="96" font-size="7.5" fill="var(--fig-text)">③ 跨网段：mtr / traceroute 看断在哪一跳</text>

      <rect x="6" y="110" width="328" height="26" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="126" font-size="7.5" fill="var(--fig-text)">④ 域名：先 dig 确认能解析（ping 域名失败常是 DNS 问题）</text>

      <rect x="6" y="140" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="156" font-size="7.5" fill="var(--fig-text)">⑤ 目标侧：是否禁 ICMP（icmp_echo_ignore_all）、防火墙是否拦</text>

      <rect x="6" y="170" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="186" font-size="7.5" fill="var(--fig-text)">⑥ 抓包：两端 tcpdump icmp，看包有没有到、有没有回</text>

      <rect x="6" y="204" width="328" height="34" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="217" font-size="8" font-weight="700" fill="#e5484d">最后一定要做的验证</text>
      <text x="14" y="230" font-size="7.5" fill="var(--fig-text)">nc -vz host 443 / curl -v 测「业务端口」—— ping 通不代表服务可用</text>

      <text x="6" y="250" font-size="7.5" fill="var(--fig-muted)">常见误判：目标禁 ICMP（安全基线要求）被当成「网络不通」</text>
    </svg>
    <figcaption>ping 不通按本机→网关→跨网段→DNS→目标禁 ICMP 分层排查，最后必须用业务端口验证才算数</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
