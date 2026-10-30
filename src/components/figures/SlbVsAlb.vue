<script setup>
/**
 * 云上 SLB/ALB 选型：四层与七层（题 3402）。
 *
 * 核心洞察：四层只看 IP+端口（快、通用），七层能看 HTTP 内容（可按域名/路径路由）；
 * 选型看「是否需要按内容分流」与「性能预算」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 244" role="img" aria-label="四层负载均衡只看 IP 与端口、七层能解析 HTTP 按域名路径路由；SLB 与 ALB 的选型依据">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">四层看「IP+端口」，七层能看「HTTP 内容」——这才是选型分水岭</text>

      <rect x="6" y="20" width="160" height="72" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">四层（SLB / NLB）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">只看 IP、端口、协议</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">性能高、延迟低</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">支持 TCP/UDP（数据库、MQ）</text>
      <text x="14" y="82" font-size="7.5" fill="#e5484d">不能按域名/路径分流</text>

      <rect x="174" y="20" width="160" height="72" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">七层（ALB / CLB）</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">解析 HTTP：域名/路径/Header</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">可做 TLS 卸载、灰度、改写</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">支持健康检查按状态码</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-node-c)">性能略低（要解析内容）</text>

      <rect x="6" y="100" width="328" height="42" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="113" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">怎么选</text>
      <text x="14" y="126" font-size="7.5" fill="var(--fig-text)">要按域名/路径路由、做 TLS 与灰度 → ALB；纯转发或非 HTTP → SLB/NLB</text>
      <text x="14" y="138" font-size="7.5" fill="var(--fig-node-c)">典型组合：四层入口 + 七层路由 + 应用</text>

      <rect x="6" y="150" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="163" font-size="8" font-weight="700" fill="var(--fig-node-d)">容易忽略的点</text>
      <text x="14" y="176" font-size="7.5" fill="var(--fig-text)">真实 IP 传递（四层要 proxy protocol / 七层要 X-Forwarded-For）</text>

      <rect x="6" y="192" width="328" height="24" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="208" font-size="7.5" fill="var(--fig-text)">会话保持：四层按源 IP（易不均），七层可用 Cookie 粘性</text>

      <text x="6" y="238" font-size="7.5" fill="var(--fig-muted)">排查：先确认「LB 有没有收到请求」（访问日志），再看后端是否健康</text>
    </svg>
    <figcaption>四层只看 IP+端口、性能高但不能按内容分流；七层可解析 HTTP 做域名/路径路由与 TLS，性能略低</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
