<script setup>
/**
 * iptables 的 DROP 与 REJECT（题 1208）。
 *
 * 核心洞察：DROP 静默丢弃（客户端只能等到超时），REJECT 主动回拒（立即报错）；
 * 语义差异决定了排障体验与「像不像服务挂了」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 234" role="img" aria-label="DROP 静默丢包导致客户端超时，REJECT 主动回 ICMP 拒绝立即报错">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">DROP 是「当没收到」，REJECT 是「明确告诉你不让过」</text>

      <rect x="6" y="20" width="160" height="86" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">DROP</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">静默丢弃，不回任何包</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">客户端只能等超时</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">抓包只看到重传的 SYN</text>
      <text x="14" y="82" font-size="7.5" fill="var(--fig-text)">无日志（要额外配置）</text>
      <text x="14" y="94" font-size="7" fill="var(--fig-node-c)">更安全：不暴露端口的存在</text>

      <rect x="174" y="20" width="160" height="86" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">REJECT</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">回 ICMP 拒绝 / TCP RST</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">客户端立即报错</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">排查体验好（不会误判超时）</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-text)">可有 reject-with 指定类型</text>
      <text x="182" y="94" font-size="7" fill="var(--fig-node-c)">会暴露端口存在</text>

      <!-- 怎么选 -->
      <rect x="6" y="116" width="328" height="50" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="129" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">怎么选</text>
      <text x="14" y="142" font-size="7.5" fill="var(--fig-text)">对内网设备/自家服务：DROP（不暴露信息，更安全）</text>
      <text x="14" y="154" font-size="7.5" fill="var(--fig-text)">对要调试的规则、或希望快速失败：REJECT（排障快很多）</text>

      <rect x="6" y="176" width="328" height="34" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="189" font-size="8" font-weight="700" fill="#e5484d">一个常见误判</text>
      <text x="14" y="201" font-size="7.5" fill="var(--fig-text)">用 DROP 挡掉的端口，telnet 会「卡住不返回」→ 容易被当成网络不通</text>

      <text x="6" y="226" font-size="7.5" fill="var(--fig-muted)">区分方法：立即报 refused = REJECT；卡住等到超时 = DROP</text>
    </svg>
    <figcaption>DROP 静默丢包、客户端等到超时；REJECT 主动回拒、立即报错。内部设备用 DROP，需调试的用 REJECT</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
