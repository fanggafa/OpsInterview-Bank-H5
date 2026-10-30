<script setup>
/**
 * DNS 解析失败的分层定位（题 1003）。
 *
 * 核心洞察：解析失败要问「断在哪一层」——
 * 本机配置 → 递归服务器 → 权威服务器，三层用不同命令验证，
 * 不分层就会在错误的地方反复试。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 272" role="img" aria-label="DNS 失败分层定位：本机配置与缓存、递归服务器、权威服务器三层，各用不同命令验证">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">先问「断在哪一层」：本机 → 递归 → 权威，三层用不同命令验</text>

      <rect x="6" y="20" width="328" height="50" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① 本机层：配置与缓存</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">cat /etc/resolv.conf 看 nameserver / search / ndots</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-node-c)">dig（绕过 hosts）· getent hosts（走完整 NSS，会查 hosts）</text>

      <rect x="6" y="76" width="328" height="50" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="89" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">② 递归层：本地 DNS 服务器</text>
      <text x="14" y="102" font-size="7.5" fill="var(--fig-text)">dig example.com（看 status 与 Query time）</text>
      <text x="14" y="114" font-size="7.5" fill="var(--fig-node-c)">dig @8.8.8.8 example.com（换一个递归对比：是缓存还是自身故障）</text>

      <rect x="6" y="132" width="328" height="50" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="145" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">③ 权威层：区里到底有没有</text>
      <text x="14" y="158" font-size="7.5" fill="var(--fig-text)">dig @权威NS example.com（直接问权威）</text>
      <text x="14" y="170" font-size="7.5" fill="var(--fig-node-c)">dig +trace example.com（逐级看断在哪一跳，不受缓存影响）</text>

      <!-- 状态码决策 -->
      <rect x="6" y="188" width="328" height="48" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="201" font-size="8.5" font-weight="700" fill="#e5484d">按状态码直接分流</text>
      <text x="14" y="214" font-size="7.5" fill="var(--fig-text)">NXDOMAIN：域名/记录不存在（查拼写、区文件、SOA serial 是否递增）</text>
      <text x="14" y="226" font-size="7.5" fill="var(--fig-text)">SERVFAIL：权威不可达或 DNSSEC 校验失败　·　REFUSED：递归未开放</text>

      <text x="6" y="250" font-size="7.5" fill="var(--fig-muted)">关键分辨：权威能查到但递归 NXDOMAIN → 递归缓存了负结果，等 TTL 或刷新</text>
      <text x="6" y="262" font-size="7.5" fill="var(--fig-muted)">容器里还有第四层：CoreDNS / ndots:5 导致的多后缀查询</text>
    </svg>
    <figcaption>DNS 失败按「本机配置 → 递归服务器 → 权威服务器」三层验证，配合状态码（NXDOMAIN/SERVFAIL/REFUSED）直接分流</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
