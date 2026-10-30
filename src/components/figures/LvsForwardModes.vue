<script setup>
/**
 * LVS 三种转发模式：NAT / DR / TUN。
 *
 * 核心洞察：三者的差别在「请求怎么进来、响应怎么回去」——
 * DR 性能最好但要求同二层，NAT 最通用但要过 LVS，TUN 可跨机房。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 268" role="img" aria-label="LVS 三种模式：NAT 双向过 LVS、DR 只改写 MAC 响应直接回客户端、TUN 用 IP 隧道跨机房">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">差别在「请求怎么进、响应怎么回」——这决定了性能与网络要求</text>

      <rect x="6" y="20" width="328" height="58" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">NAT 模式（最通用）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">请求：客户端 → LVS（改目标 IP）→ RS　响应：RS → LVS → 客户端</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">优点：RS 可以用任意网关、可跨网段　缺点：LVS 成为带宽瓶颈</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-node-c)">要求：LVS 开启 ip_forward，RS 网关指向 LVS</text>

      <rect x="6" y="86" width="328" height="58" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="99" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">DR 模式（性能最好）</text>
      <text x="14" y="112" font-size="7.5" fill="var(--fig-text)">请求：只改写目标 MAC → RS　响应：RS 直接把结果回给客户端（绕过 LVS）</text>
      <text x="14" y="124" font-size="7.5" fill="var(--fig-text)">优点：响应不经 LVS，吞吐最高　缺点：要求 LVS 与 RS 同二层</text>
      <text x="14" y="136" font-size="7.5" fill="var(--fig-node-c)">要求：VIP 绑在 RS 的 lo 上，并抑制 ARP（否则抢 VIP）</text>

      <rect x="6" y="152" width="328" height="58" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="165" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">TUN 模式（可跨机房）</text>
      <text x="14" y="178" font-size="7.5" fill="var(--fig-text)">请求：用 IP 隧道封装转发到 RS　响应：RS 直接回客户端</text>
      <text x="14" y="190" font-size="7.5" fill="var(--fig-text)">优点：可跨网段/机房　缺点：需要支持隧道、配置更复杂</text>
      <text x="14" y="202" font-size="7.5" fill="var(--fig-node-c)">要求：RS 也要支持 IP 隧道，VIP 绑在 tun 设备上</text>

      <rect x="6" y="218" width="328" height="34" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="231" font-size="8" font-weight="700" fill="var(--fig-node-d)">怎么选</text>
      <text x="14" y="244" font-size="7.5" fill="var(--fig-text)">同机房追求吞吐 → DR；RS 网关不可控 → NAT；跨机房 → TUN</text>

      <text x="6" y="264" font-size="7.5" fill="var(--fig-muted)">排查提示：DR 模式响应不经过 LVS，所以在 LVS 上抓不到完整响应包</text>
    </svg>
    <figcaption>NAT 响应要过 LVS（通用但成瓶颈）、DR 响应直接回（最快但需同二层）、TUN 可跨机房</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
