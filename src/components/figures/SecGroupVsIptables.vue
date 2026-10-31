<script setup>
/**
 * 安全组 + iptables 都配了但仍不通（题 1220）。
 *
 * 核心洞察：云上链路有多道关卡，必须按「由外到内」的顺序逐层验证，
 * 否则会在已经放行的那一层反复排查。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 268" role="img" aria-label="云上连通性的五道关卡：安全组、网络 ACL、主机 iptables、服务监听、应用层；按由外到内排查">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">多道关卡串联 —— 必须由外到内逐层验证，别在已放行的那层打转</text>

      <rect x="6" y="20" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="36" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">①</tspan> 云安全组（实例/网卡级）：最外层，控制哪些源 IP 能进</text>

      <rect x="6" y="50" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="66" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">②</tspan> 网络 ACL / 子网策略：VPC、网络 ACL、对等连接上的规则</text>

      <rect x="6" y="80" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="96" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">③</tspan> 主机 iptables / firewalld：本机防火墙（常被忘记）</text>

      <rect x="6" y="110" width="328" height="26" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="126" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">④</tspan> 服务监听：ss -tlnp 看端口是否真的在监听、绑的哪个地址</text>

      <rect x="6" y="140" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="156" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">⑤</tspan> 应用层：鉴权、路由转发、反向代理配置</text>

      <!-- 关键方法 -->
      <rect x="6" y="174" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="187" font-size="8.5" font-weight="700" fill="#e5484d">最有效的定位手段：两端抓包</text>
      <text x="14" y="200" font-size="7.5" fill="var(--fig-text)">在客户端与服务端同时 tcpdump：只在一端看到包 → 中间某道关卡挡了</text>
      <text x="14" y="212" font-size="7.5" fill="var(--fig-text)">两端都看到 SYN 但没回 → 目标端口没监听（④ 层）</text>

      <rect x="6" y="228" width="328" height="20" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="242" font-size="7.5" fill="var(--fig-text)">注意：安全组通常是「白名单」语义，没显式放行就是拒绝（不是默认允许）</text>

      <text x="6" y="258" font-size="7.5" fill="var(--fig-muted)">易混：云监控显示「正常运行」不等于端口可达 —— 健康检查也可能是本机回环</text>
    </svg>
    <figcaption>五道关卡由外到内：安全组、网络 ACL、主机防火墙、服务监听、应用层；两端同时抓包是定位挡在哪层的最快手段</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
