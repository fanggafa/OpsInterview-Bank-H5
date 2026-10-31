<script setup>
/**
 * 四层负载均衡传递客户端真实 IP（题 1617）。
 *
 * 核心洞察：四层不改报文内容，所以只能用「协议扩展」或「代理式转发」来保留源 IP；
 * 三种方案各有代价：透明、性能、或需要应用改造。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 258" role="img" aria-label="四层保留真实 IP 的三种方案：透明模式 DR/TUN、PROXY protocol、NAT 后取 XFF">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">四层不改报文，所以只能靠「协议扩展」或「不改源地址」</text>

      <rect x="6" y="20" width="328" height="46" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① 透明模式（DR / TUN）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">不改目的地址，后端直接看到客户端源码 IP</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">代价：需要后端配合（绑 VIP、ARP 抑制、路由调整）</text>

      <rect x="6" y="72" width="328" height="46" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="85" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">② PROXY protocol</text>
      <text x="14" y="98" font-size="7.5" fill="var(--fig-text)">在连接最开始插入一行「真实源 IP 信息」</text>
      <text x="14" y="110" font-size="7.5" fill="var(--fig-text)">代价：后端必须显式支持（如 Nginx 的 proxy_protocol）</text>

      <rect x="6" y="124" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="137" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">③ NAT / 全代理后带 XFF</text>
      <text x="14" y="150" font-size="7.5" fill="var(--fig-text)">源 IP 已被改写，只能靠七层头 X-Forwarded-For 传递</text>
      <text x="14" y="162" font-size="7.5" fill="var(--fig-text)">代价：仅适用于 HTTP，且 XFF 可被伪造，需信任链校验</text>

      <!-- 选型 -->
      <rect x="6" y="178" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="191" font-size="8" font-weight="700" fill="var(--fig-node-d)">怎么选</text>
      <text x="14" y="203" font-size="7.5" fill="var(--fig-text)">HTTP 且能改应用 → XFF；非 HTTP（数据库/MQ）→ 透明模式或 PROXY protocol</text>

      <rect x="6" y="216" width="328" height="20" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="230" font-size="7.5" fill="var(--fig-text)">注意：DR 模式必须后端配 arp_ignore，否则 VIP 被抢、流量绕过 LVS</text>

      <text x="6" y="248" font-size="7.5" fill="var(--fig-muted)">验证：后端日志里打印的 remote_addr 是不是真实客户端 IP（用不同源 IP 测试）</text>
    </svg>
    <figcaption>透明模式不改目的地址但需后端配合，PROXY protocol 插一行头但后端需支持，NAT 后只能靠 XFF（仅 HTTP 且可伪造）</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
