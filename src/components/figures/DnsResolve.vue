<script setup>
/**
 * DNS 解析链路图：从浏览器缓存到权威服务器的完整路径。
 * 用 currentColor 描边，自动适配深色/浅色主题。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 250" role="img" aria-label="DNS 解析链路：浏览器缓存到权威服务器">
      <!-- 竖向步骤流 -->
      <g fill="none" stroke="currentColor" stroke-width="1.4">
        <!-- 连接线 -->
        <path d="M60 34 L60 226" stroke-dasharray="3 3" opacity=".35" />
      </g>

      <g font-size="11" fill="currentColor">
        <!-- 1 浏览器缓存 -->
        <circle cx="60" cy="34" r="9" fill="currentColor" opacity=".9" />
        <text x="60" y="37.5" text-anchor="middle" fill="var(--c-card)" font-size="10" font-weight="700">1</text>
        <text x="82" y="31">浏览器缓存 / Service Worker</text>
        <text x="82" y="45" font-size="9.5" opacity=".7">命中即返回，最快</text>

        <!-- 2 hosts -->
        <circle cx="60" cy="80" r="9" fill="currentColor" opacity=".9" />
        <text x="60" y="83.5" text-anchor="middle" fill="var(--c-card)" font-size="10" font-weight="700">2</text>
        <text x="82" y="77">/etc/hosts</text>
        <text x="82" y="91" font-size="9.5" opacity=".7">本地静态映射，优先级高于 DNS</text>

        <!-- 3 本地 DNS -->
        <circle cx="60" cy="126" r="9" fill="currentColor" opacity=".9" />
        <text x="60" y="129.5" text-anchor="middle" fill="var(--c-card)" font-size="10" font-weight="700">3</text>
        <text x="82" y="123">本地 DNS（resolv.conf 上的递归解析器）</text>
        <text x="82" y="137" font-size="9.5" opacity=".7">有缓存则直接返回</text>

        <!-- 4 根 → 顶级 → 权威 -->
        <rect x="52" y="158" width="16" height="52" rx="4" fill="currentColor" opacity=".15" />
        <circle cx="60" cy="170" r="9" fill="currentColor" opacity=".9" />
        <text x="60" y="173.5" text-anchor="middle" fill="var(--c-card)" font-size="10" font-weight="700">4</text>
        <text x="82" y="167">根服务器 → .com 顶级域</text>
        <text x="82" y="181" font-size="9.5" opacity=".7">逐级返回「去问下一台」</text>
        <text x="82" y="196" font-weight="600">权威服务器 → 返回 A/AAAA 记录</text>

        <!-- 5 缓存并按 TTL 过期 -->
        <circle cx="60" cy="228" r="9" fill="currentColor" opacity=".9" />
        <text x="60" y="231.5" text-anchor="middle" fill="var(--c-card)" font-size="10" font-weight="700">5</text>
        <text x="82" y="225">按 TTL 缓存结果，返回给浏览器</text>
        <text x="82" y="239" font-size="9.5" opacity=".7">TTL 过长 → 换 IP 后生效慢</text>
      </g>
    </svg>
    <figcaption>DNS 解析链路：缓存越靠前越快；排查用 dig +trace 逐跳看断在哪一层</figcaption>
  </figure>
</template>

<style scoped>
.fig {
  margin: 10px 0 2px;
  padding: 8px 6px 6px;
  border-radius: var(--radius-sm);
  background: var(--c-card);
  border: 1px solid var(--c-border);
}
.fig svg {
  display: block;
  width: 100%;
  height: auto;
  max-height: 260px;
  color: var(--c-text-2);
}
.fig figcaption {
  margin-top: 4px;
  font-size: 11px;
  line-height: 1.5;
  color: var(--c-text-3);
  text-align: center;
}
</style>
