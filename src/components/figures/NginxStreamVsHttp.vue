<script setup>
/**
 * Nginx 的 stream（4 层）与 http（7 层）代理（题 1433）。
 *
 * 核心洞察：stream 只转发 TCP/UDP 流（不解析内容），http 能识别 HTTP 做路由与改写；
 * 选型看「协议是不是 HTTP」与「需不需要按内容分流」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 254" role="img" aria-label="stream 四层只转发 TCP/UDP 不解析内容，http 七层可路由改写；各自适用场景">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">stream 只认「字节流」，http 认识「报文」</text>

      <rect x="6" y="20" width="160" height="80" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">stream（4 层）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">转发 TCP/UDP，不看内容</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">性能高、开销小</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">可做 TCP 负载均衡</text>
      <text x="14" y="82" font-size="7.5" fill="var(--fig-text)">适合：MySQL/Redis／MQ 代理</text>
      <text x="14" y="94" font-size="7" fill="var(--fig-node-c)">不能按 URL/Header 分流</text>

      <rect x="174" y="20" width="160" height="80" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">http（7 层）</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">解析 HTTP：URL/Header</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">可按域名/路径路由</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">支持改写、缓存、限流</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-text)">适合：Web/API 网关</text>
      <text x="182" y="94" font-size="7" fill="var(--fig-node-c)">性能略低（要解析报文）</text>

      <!-- 判断 -->
      <rect x="6" y="110" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="123" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">怎么选（两句话）</text>
      <text x="14" y="136" font-size="7.5" fill="var(--fig-text)">协议不是 HTTP（数据库、缓存、MQ）→ stream</text>
      <text x="14" y="148" font-size="7.5" fill="var(--fig-text)">是 HTTP 且需要按内容分流/改写 → http</text>

      <rect x="6" y="164" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="177" font-size="8" font-weight="700" fill="var(--fig-node-d)">两者可组合</text>
      <text x="14" y="190" font-size="7.5" fill="var(--fig-text)">常见架构：stream 做前置四层转发 → http 做七层路由 → 后端服务</text>

      <rect x="6" y="206" width="328" height="24" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="222" font-size="7.5" fill="var(--fig-text)">注意：stream 拿不到真实客户端 IP 之外的 HTTP 信息，限流/灰度做不了</text>

      <text x="6" y="244" font-size="7.5" fill="var(--fig-muted)">排查：stream 层出问题看 error.log 的连接记录；http 层还能看 access.log 的状态码</text>
    </svg>
    <figcaption>stream 只转发 TCP/UDP 字节流（适合数据库/缓存/MQ），http 解析报文可路由改写；两者常组合成前置四层 + 七层</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
