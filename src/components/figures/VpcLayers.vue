<script setup>
/**
 * 云上 VPC 的四层结构与请求路径（题 3401）。
 *
 * 核心洞察：VPC / 子网 / 安全组 / 路由表各管一件事 ——
 * 「能不能访问到」由路由解决，「能不能通」由安全组解决；
 * 排查时按这个分工，才不会在错误的地方找原因。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 268" role="img" aria-label="VPC 是虚拟机房、子网是房间、安全组是门禁、路由表是指路牌；以及一次请求的走向与排查分工">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">VPC 是机房、子网是房间、安全组是门禁、路由表是指路牌</text>

      <!-- 四层 -->
      <rect x="6" y="20" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="36" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700" fill="var(--fig-node-a)">VPC</tspan>　10.0.0.0/16 —— 隔离的虚拟网络（跨账号/跨 VPC 需对等连接）</text>

      <rect x="6" y="50" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="66" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700" fill="var(--fig-node-b)">子网</tspan>　10.0.1.0/24 —— 属于某个可用区，决定 IP 范围与 AZ</text>

      <rect x="6" y="80" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="96" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700" fill="var(--fig-node-c)">安全组</tspan>　实例级门禁：只放行必要端口与来源（有状态）</text>

      <rect x="6" y="110" width="328" height="26" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="126" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700" fill="var(--fig-node-d)">路由表</tspan>　决定「出子网的流量去哪」：本地 / NAT / 对等连接</text>

      <!-- 请求路径 -->
      <rect x="6" y="146" width="328" height="50" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="159" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">一次外网请求的路径</text>
      <text x="14" y="172" font-size="7.5" fill="var(--fig-text)">用户 →（公网）→ 路由表匹配 → 子网 → 安全组检查 → ECS</text>
      <text x="14" y="184" font-size="7.5" fill="var(--fig-text)">容器/数据库只在内网：安全组只允许应用网段，不对公网开放</text>

      <!-- 排查分工 -->
      <rect x="6" y="204" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="217" font-size="8.5" font-weight="700" fill="#e5484d">排查分工（找错地方最费时间）</text>
      <text x="14" y="230" font-size="7.5" fill="var(--fig-text)">「根本发不出去 / 没有路由」→ 路由表、NAT、对等连接</text>
      <text x="14" y="242" font-size="7.5" fill="var(--fig-text)">「能发出去但被拒」→ 安全组（注意出方向和入方向都要放）</text>

      <text x="6" y="264" font-size="7.5" fill="var(--fig-muted)">易混点：安全组是有状态的（出方向放行后回包自动允许）；网络 ACL 是无状态的</text>
    </svg>
    <figcaption>VPC 管隔离、子网管 IP 与可用区、安全组管能否通过、路由表管流量去哪；排查先分清是「进不来」还是「出不去」</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
