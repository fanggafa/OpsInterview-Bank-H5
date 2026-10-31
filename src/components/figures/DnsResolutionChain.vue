<script setup>
/**
 * DNS 解析的完整过程与常见故障（题 4519）。
 *
 * 核心洞察：完整解析是「本地缓存 → 递归服务器 → 根 → 顶级 → 权威」多级，
 * 每一级都可能出故障，症状各不相同（超时 / NXDOMAIN / 错误地址）。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 249" role="img" aria-label="DNS 解析五级链路与各自的故障症状：本地缓存、递归服务器、根、顶级、权威">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">五级链路：每一级出故障，症状都不一样</text>

      <rect x="6" y="20" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="36" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">① 本地缓存</tspan>　应用/OS 缓存、浏览器缓存；改记录后没生效多因这层</text>

      <rect x="6" y="50" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="66" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">② 本地递归服务器</tspan>　（bind/unbound/内网DNS）；内网解析走这里</text>

      <rect x="6" y="80" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="96" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">③ 根域名服务器</tspan>　返回顶级域（如 .com）的地址</text>

      <rect x="6" y="110" width="328" height="26" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="126" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">④ 顶级域服务器</tspan>　返回该域名的权威服务器地址</text>

      <rect x="6" y="140" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="156" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">⑤ 权威服务器</tspan>　返回最终记录（A/AAAA/CNAME 等）</text>

      <!-- 故障症状对照 -->
      <rect x="6" y="174" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="187" font-size="8.5" font-weight="700" fill="#e5484d">症状对照（快速缩小范围）</text>
      <text x="14" y="200" font-size="7.5" fill="var(--fig-text)">超时：到某一级不通或服务没起　NXDOMAIN：域名不存在/权威配置错</text>
      <text x="14" y="212" font-size="7.5" fill="var(--fig-text)">错误地址：缓存旧值、CNAME 配错、或解析到异常节点</text>
      <text x="14" y="224" font-size="7" fill="var(--fig-node-c)">SERVFAIL：上游故障、DNSSEC 验证失败、或权威返回异常</text>

      <text x="6" y="237" font-size="7.5" fill="var(--fig-muted)">工具：dig +trace 逐步看链路；dig @上游 直连测试；清缓存（ndc/flush）</text>
    </svg>
    <figcaption>解析五级：本地缓存→递归服务器→根→顶级→权威；超时/NXDOMAIN/错地址/SERVFAIL 各自指向不同层级</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
