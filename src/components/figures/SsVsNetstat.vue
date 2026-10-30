<script setup>
/**
 * ss 与 netstat 的区别与迁移（题 4418）。
 *
 * 核心洞察：ss 直接从内核读取（netlink），比 netstat 快得多且不用装 net-tools；
 * 关键是参数含义对应，迁移时别把过滤条件写错。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 250" role="img" aria-label="ss 通过 netlink 直接读内核，比遍历 /proc 的 netstat 快；常用参数对应关系">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">ss 直读内核，netstat 遍历 /proc —— 大连接数时差距明显</text>

      <rect x="6" y="20" width="160" height="52" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">ss</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">netlink 直接读内核</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">快、默认已安装</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-node-c)">iproute2 包内</text>

      <rect x="174" y="20" width="160" height="52" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">netstat</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">遍历 /proc/net/*</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">连接多时明显变慢</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-node-c)">net-tools 已逐步淘汰</text>

      <text x="6" y="92" font-size="9" font-weight="700" fill="var(--fig-text)">常用参数对应</text>

      <rect x="6" y="100" width="328" height="22" rx="4" fill="var(--fig-node-c)" opacity=".08" />
      <text x="14" y="115" font-size="7.5" fill="var(--fig-text)">-t TCP　·　-u UDP　·　-l 只看监听　·　-n 不解析　·　-p 显示进程</text>

      <rect x="6" y="126" width="328" height="22" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="141" font-size="7.5" fill="var(--fig-text)">ss -tlnp　≈　netstat -tlnp　（最常用的组合）</text>

      <rect x="6" y="152" width="328" height="22" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="167" font-size="7.5" fill="var(--fig-text)">ss -tan state time-wait | wc -l　统计 TIME_WAIT（netstat 做不到这么方便）</text>

      <rect x="6" y="182" width="328" height="46" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="195" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">ss 独有的便利</text>
      <text x="14" y="208" font-size="7.5" fill="var(--fig-text)">按状态过滤（state）、按端口过滤（sport/dport）、-o 看定时器</text>
      <text x="14" y="220" font-size="7.5" fill="var(--fig-text)">-i 看 TCP 内部信息（RTT、重传、拥塞窗口）</text>

      <text x="6" y="244" font-size="7.5" fill="var(--fig-muted)">排查建议：容器镜像常不带 net-tools → 优先用 ss；两者都没有时看 /proc/net/tcp</text>
    </svg>
    <figcaption>ss 用 netlink 直读内核（快）、netstat 遍历 /proc（连接多时慢）；ss -tlnp 是 netstat -tlnp 的等价替代</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
