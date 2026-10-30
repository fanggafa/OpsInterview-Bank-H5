<script setup>
/**
 * 云上「网络延迟高」的排查（题 3435）。
 *
 * 核心洞察：云上延迟要高，先分辨「是网络还是代码」——
 * 用各阶段耗时拆分（DNS/连接/传输），并用两端对照排除代码因素。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 252" role="img" aria-label="云上网络延迟排查：先拆分各阶段耗时，再两端对照判断是网络还是代码">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">先回答「是网络还是代码」——用分段耗时与两端对照来证明</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">第一步：把耗时拆开</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">curl -w 看 DNS / 建连 / TLS / 首字节 / 传输各阶段耗时</text>

      <rect x="6" y="54" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">DNS 慢 → 解析问题（ndots/search、递归服务器）</text>

      <rect x="6" y="84" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="100" font-size="7.5" fill="var(--fig-text)">建连慢 → RTT 高/丢包/安全组拦截重试</text>

      <rect x="6" y="114" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="130" font-size="7.5" fill="var(--fig-text)">首字节慢（TTFB）→ 后端处理慢，不是网络</text>

      <rect x="6" y="144" width="328" height="26" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)">传输慢 → 带宽受限或窗口太小（大文件场景）</text>

      <!-- 两端对照 -->
      <rect x="6" y="178" width="328" height="34" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="191" font-size="8" font-weight="700" fill="#e5484d">决定性手段：两端对照</text>
      <text x="14" y="203" font-size="7.5" fill="var(--fig-text)">同机房内调用 vs 跨机房调用：差距 = 网络；都慢 = 代码/数据库</text>

      <rect x="6" y="216" width="328" height="20" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="230" font-size="7.5" fill="var(--fig-text)">辅助：mtr 看丢包、ss -i 看 RTT/重传、云监控看带宽与包量</text>

      <text x="6" y="244" font-size="7.5" fill="var(--fig-muted)">注意：云上「延迟」常是「丢包引发重传」造成，看重传率比看平均延迟更有效</text>
    </svg>
    <figcaption>把耗时拆成 DNS/建连/TTFB/传输四段，再用「同机房 vs 跨机房」两端对照，判断是网络还是代码</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
