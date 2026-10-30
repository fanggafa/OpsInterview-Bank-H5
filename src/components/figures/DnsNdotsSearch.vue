<script setup>
/**
 * resolv.conf 里 search 与 ndots 的影响（题 1009）。
 *
 * 核心洞察：ndots 决定「短域名要先试几次 search 后缀」，
 * 每次失败都要等超时 —— 这就是容器里「DNS 慢」的头号原因。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 262" role="img" aria-label="resolv.conf 的 search 与 ndots：域名点数少于 ndots 时先拼 search 后缀逐个尝试，导致多次查询与超时">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">ndots 决定「短域名要先试几次后缀」，每次失败都要等超时</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">两个字段</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">search example.com svc.cluster.local　→ 尝试的后缀列表</text>

      <rect x="6" y="58" width="328" height="20" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="72" font-size="7.5" fill="var(--fig-text)">options ndots:5　→ 域名里点数 &lt; 5 就先拼后缀再查原名</text>

      <!-- 展开 -->
      <rect x="6" y="84" width="328" height="60" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="97" font-size="8.5" font-weight="700" fill="#e5484d">查 api（1 次请求变成 4 次）</text>
      <text x="14" y="110" font-size="7.5" fill="var(--fig-text)">① api.example.com → NXDOMAIN（等一个超时）</text>
      <text x="14" y="122" font-size="7.5" fill="var(--fig-text)">② api.svc.cluster.local → NXDOMAIN（再等一个超时）</text>
      <text x="14" y="134" font-size="7.5" fill="var(--fig-text)">③ 最后才查 api（作为完整域名）→ 成功</text>

      <!-- 后果 -->
      <rect x="6" y="150" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="163" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">后果与典型场景</text>
      <text x="14" y="176" font-size="7.5" fill="var(--fig-text)">每次失败都等 timeout（默认 5s）→ 单次解析可能要几秒</text>
      <text x="14" y="188" font-size="7.5" fill="var(--fig-text)">K8s 默认 ndots:5，所以跨 namespace 调用最容易踩</text>

      <!-- 解法 -->
      <rect x="6" y="202" width="328" height="40" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="215" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">三种解法</text>
      <text x="14" y="228" font-size="7.5" fill="var(--fig-text)">① 用带点的完整域名（末尾加点 api.example.com.）② 调小 ndots</text>

      <text x="6" y="252" font-size="7.5" fill="var(--fig-muted)">③ 减少 search 条目；排查用 dig +search 复现，或 tcpdump 看查询次数</text>
    </svg>
    <figcaption>ndots:5 让短域名先拼 search 后缀逐个试，每次失败都等超时；解法是写完整域名、调小 ndots、减少 search 条目</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
