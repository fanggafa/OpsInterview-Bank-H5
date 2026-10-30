<script setup>
/**
 * LVS + Keepalived + Nginx 三层入口架构（题 1621）。
 *
 * 核心洞察：三层不是「重复造轮子」，而是每层解决不同问题 ——
 * LVS 抗并发的量、Keepalived 解决单点、Nginx 做七层路由。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 270" role="img" aria-label="三层入口架构：LVS 加 Keepalived 做四层转发与高可用、Nginx 做七层路由与 SSL、应用服务器承载业务">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">三层不是重复造轮子，每层解决不同问题</text>

      <!-- 客户端 -->
      <rect x="110" y="20" width="120" height="22" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="150" y="35" font-size="7.5" fill="var(--fig-node-d)">客户端</text>

      <text x="168" y="50" font-size="8" fill="var(--fig-muted)">↓</text>

      <!-- LVS -->
      <rect x="6" y="56" width="328" height="46" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="69" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① LVS + Keepalived（四层）</text>
      <text x="14" y="82" font-size="7.5" fill="var(--fig-text)">LVS：VIP + 内核态转发，承载大并发（Nginx 单机连接数/CPU 有上限）</text>
      <text x="14" y="94" font-size="7.5" fill="var(--fig-node-c)">Keepalived：VRRP 做 VIP 漂移，解决 LVS 自身单点</text>

      <text x="168" y="112" font-size="8" fill="var(--fig-muted)">↓</text>

      <!-- Nginx -->
      <rect x="6" y="118" width="328" height="46" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="131" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">② Nginx 集群（七层）</text>
      <text x="14" y="144" font-size="7.5" fill="var(--fig-text)">按域名/URL 分流 · SSL 卸载 · 缓存 · 限流 · 灰度</text>
      <text x="14" y="156" font-size="7.5" fill="var(--fig-node-c)">这些是 LVS 做不到的：它看不见 HTTP 内容</text>

      <text x="168" y="174" font-size="8" fill="var(--fig-muted)">↓</text>

      <!-- 应用 -->
      <rect x="6" y="180" width="328" height="34" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="193" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">③ 应用服务器</text>
      <text x="14" y="206" font-size="7.5" fill="var(--fig-text)">业务逻辑、数据访问；可水平扩展</text>

      <!-- 为什么不能省 -->
      <rect x="6" y="222" width="328" height="30" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="235" font-size="8" font-weight="700" fill="#e5484d">为什么不能只留一层</text>
      <text x="14" y="247" font-size="7.5" fill="var(--fig-text)">只用 Nginx：扛不住超大并发入口；只用 LVS：做不了七层路由与 SSL</text>

      <text x="6" y="262" font-size="7.5" fill="var(--fig-muted)">排查提示：定位问题时先分清「慢在哪一层」，看每层的连接数与延迟</text>
    </svg>
    <figcaption>LVS 抗并发的量与单点、Keepalived 做 VIP 漂移、Nginx 做七层路由与 SSL、应用层承载业务</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
