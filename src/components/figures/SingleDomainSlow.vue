<script setup>
/**
 * 「访问某个域名很慢，但换个域名就快」的排查（题 4413）。
 *
 * 核心洞察：换域名就快，说明问题在「这个域名的解析或这个域名的后端」，
 * 而不是整个网络 —— 按 DNS、TLS、路由、后端四层定位。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 240" role="img" aria-label="单域名慢的四类原因：DNS 解析、TLS 握手、网络路由、该域名后端">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">「换域名就快」→ 范围已缩小到「这个域名的链路」</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① DNS 解析慢</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">dig 该域名看耗时；是否解析到远端/异常节点、是否有多次 CNAME 跳转</text>

      <rect x="6" y="54" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="67" font-size="8" font-weight="700" fill="var(--fig-node-b)">② TLS 握手慢</text>
      <text x="14" y="79" font-size="7.5" fill="var(--fig-text)">该域名的证书链不完整、OCSP 拉取慢、或握手要走远端节点</text>

      <rect x="6" y="88" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="101" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ 网络路由差异</text>
      <text x="14" y="113" font-size="7.5" fill="var(--fig-text)">两个域名解析到不同机房 → 到该机房的链路绕行/丢包（mtr 对比）</text>

      <rect x="6" y="122" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="135" font-size="8" font-weight="700" fill="var(--fig-node-d)">④ 该域名的后端本身慢</text>
      <text x="14" y="147" font-size="7.5" fill="var(--fig-text)">同样的网络路径但不同服务 → 是应用/数据库慢，不是网络</text>

      <!-- 排查方法 -->
      <rect x="6" y="160" width="328" height="50" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="173" font-size="8.5" font-weight="700" fill="#e5484d">最快的定位方式：分段计时</text>
      <text x="14" y="186" font-size="7.5" fill="var(--fig-text)">curl -w 拆开「DNS / TCP / TLS / TTFB / 传输」五个阶段，看哪段最慢</text>
      <text x="14" y="198" font-size="7.5" fill="var(--fig-text)">对比两个域名同一阶段 → 立刻能看出是 DNS、TLS 还是后端问题</text>
      <text x="14" y="210" font-size="7" fill="var(--fig-node-c)">再用 mtr 对该域名的 IP 与正常域名做路径对比</text>

      <rect x="6" y="218" width="328" height="16" rx="3" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="230" font-size="7.5" fill="var(--fig-text)">常见结论：CNAME 链太长、证书链缺中间证书、或解析到了非预期机房</text>
    </svg>
    <figcaption>换域名就快说明问题在这个域名的链路；用 curl -w 分段计时区分 DNS/TLS/网络/后端，再用 mtr 对比路径</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
