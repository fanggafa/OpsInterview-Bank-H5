<script setup>
/**
 * DNS 解析链路图（彩色版）。
 * 4 种颜色区分「浏览器缓存 / 系统级 / 递归查询 / 结果缓存」四类步骤。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 250" role="img" aria-label="DNS 解析链路：浏览器缓存到权威服务器">
      <defs>
        <linearGradient id="dnsLine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--fig-node-a)" stop-opacity=".9" />
          <stop offset="50%" stop-color="var(--fig-node-b)" stop-opacity=".9" />
          <stop offset="100%" stop-color="var(--fig-node-c)" stop-opacity=".9" />
        </linearGradient>
      </defs>

      <path d="M60 34 L60 228" stroke="url(#dnsLine)" stroke-width="2.2" fill="none" opacity=".55" />

      <g font-size="11" fill="var(--fig-text)">
        <circle cx="60" cy="34" r="10" fill="var(--fig-node-a)" />
        <text x="60" y="38" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">1</text>
        <text x="82" y="30" font-weight="600">浏览器缓存 / Service Worker</text>
        <text x="82" y="45" font-size="9.5" fill="var(--fig-muted)">命中即返回，最快</text>

        <circle cx="60" cy="80" r="10" fill="var(--fig-node-b)" />
        <text x="60" y="84" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">2</text>
        <text x="82" y="76" font-weight="600">/etc/hosts</text>
        <text x="82" y="91" font-size="9.5" fill="var(--fig-muted)">本地静态映射，优先级高于 DNS</text>

        <circle cx="60" cy="126" r="10" fill="var(--fig-node-c)" />
        <text x="60" y="130" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">3</text>
        <text x="82" y="122" font-weight="600">本地 DNS（resolv.conf 的递归解析器）</text>
        <text x="82" y="137" font-size="9.5" fill="var(--fig-muted)">有缓存则直接返回</text>

        <!-- 第 4 步：根 → 顶级 → 权威，这一组用左侧细竖条表示包含三个子步骤 -->
        <path d="M60 160 L60 210" stroke="var(--fig-node-d)" stroke-width="2" stroke-opacity=".35" stroke-linecap="round" />
        <circle cx="60" cy="170" r="10" fill="var(--fig-node-d)" />
        <text x="60" y="174" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">4</text>
        <text x="82" y="166" font-weight="600">根服务器 → .com 顶级域</text>
        <text x="82" y="181" font-size="9.5" fill="var(--fig-muted)">逐级返回「去问下一台」</text>
        <text x="82" y="197" font-weight="600" fill="var(--fig-node-d)">权威服务器 → 返回 A/AAAA 记录</text>

        <circle cx="60" cy="228" r="10" fill="var(--fig-node-b)" opacity=".85" />
        <text x="60" y="232" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">5</text>
        <text x="82" y="224" font-weight="600">按 TTL 缓存结果，返回给浏览器</text>
        <text x="82" y="239" font-size="9.5" fill="var(--fig-muted)">TTL 过长 → 换 IP 后生效慢</text>
      </g>
    </svg>
    <figcaption>DNS 解析链路：缓存越靠前越快；排查用 dig +trace 逐跳看断在哪一层</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
