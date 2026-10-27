<script setup>
/** DNS 常用记录类型对照图 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 200" role="img" aria-label="DNS 常用记录类型对照">
      <g font-size="11" fill="currentColor">
        <!-- 表头 -->
        <rect x="8" y="10" width="52" height="24" rx="4" fill="currentColor" opacity=".12" />
        <rect x="64" y="10" width="120" height="24" rx="4" fill="currentColor" opacity=".08" />
        <rect x="188" y="10" width="144" height="24" rx="4" fill="currentColor" opacity=".08" />
        <text x="34" y="26" text-anchor="middle" font-weight="700">类型</text>
        <text x="124" y="26" text-anchor="middle" font-weight="700">作用</text>
        <text x="260" y="26" text-anchor="middle" font-weight="700">典型用途</text>

        <!-- 行 -->
        <g opacity=".95">
          <line x1="8" y1="40" x2="332" y2="40" stroke="currentColor" stroke-width=".6" opacity=".2" />
          <text x="34" y="57" text-anchor="middle" font-weight="600">A</text>
          <text x="124" y="57" text-anchor="middle" opacity=".85">域名 → IPv4 地址</text>
          <text x="260" y="57" text-anchor="middle" opacity=".7" font-size="10">最常用，网站解析</text>

          <line x1="8" y1="66" x2="332" y2="66" stroke="currentColor" stroke-width=".6" opacity=".2" />
          <text x="34" y="83" text-anchor="middle" font-weight="600">AAAA</text>
          <text x="124" y="83" text-anchor="middle" opacity=".85">域名 → IPv6 地址</text>
          <text x="260" y="83" text-anchor="middle" opacity=".7" font-size="10">IPv6 双栈</text>

          <line x1="8" y1="92" x2="332" y2="92" stroke="currentColor" stroke-width=".6" opacity=".2" />
          <text x="34" y="109" text-anchor="middle" font-weight="600">CNAME</text>
          <text x="124" y="109" text-anchor="middle" opacity=".85">别名 → 另一个域名</text>
          <text x="260" y="109" text-anchor="middle" opacity=".7" font-size="10">CDN、多域名指向同一处</text>

          <line x1="8" y1="118" x2="332" y2="118" stroke="currentColor" stroke-width=".6" opacity=".2" />
          <text x="34" y="135" text-anchor="middle" font-weight="600">MX</text>
          <text x="124" y="135" text-anchor="middle" opacity=".85">邮件服务器，带优先级</text>
          <text x="260" y="135" text-anchor="middle" opacity=".7" font-size="10">邮件收发</text>

          <line x1="8" y1="144" x2="332" y2="144" stroke="currentColor" stroke-width=".6" opacity=".2" />
          <text x="34" y="161" text-anchor="middle" font-weight="600">NS</text>
          <text x="124" y="161" text-anchor="middle" opacity=".85">该域由哪些 DNS 服务器负责</text>
          <text x="260" y="161" text-anchor="middle" opacity=".7" font-size="10">域名托管、委派子域</text>

          <line x1="8" y1="170" x2="332" y2="170" stroke="currentColor" stroke-width=".6" opacity=".2" />
          <text x="34" y="187" text-anchor="middle" font-weight="600">TXT</text>
          <text x="124" y="187" text-anchor="middle" opacity=".85">文本记录</text>
          <text x="260" y="187" text-anchor="middle" opacity=".7" font-size="10">域名验证、SPF 反垃圾</text>
        </g>
      </g>
    </svg>
    <figcaption>记忆点：A/AAAA 是「地址」，CNAME 是「别名」，MX 是「邮件」，NS 是「谁负责」</figcaption>
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
