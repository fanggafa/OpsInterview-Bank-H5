<script setup>
/**
 * TCP 与 UDP 的核心区别与选型（题 22）。
 *
 * 核心洞察：不是「TCP 好 UDP 差」，而是「要不要为可靠性付出延迟与开销」；
 * 实时音视频选 UDP 恰恰是为了避免重传造成的卡顿。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 258" role="img" aria-label="TCP 面向连接、可靠、有序但开销大；UDP 无连接、不可靠但延迟低；各自适用场景">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">不是好坏之分，而是「是否值得为可靠性付出延迟与开销」</text>

      <rect x="6" y="20" width="160" height="86" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">TCP</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">面向连接（三次握手）</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">可靠：确认 + 重传 + 排序</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">有流量控制与拥塞控制</text>
      <text x="14" y="82" font-size="7.5" fill="var(--fig-text)">开销大：握手、状态、头部</text>
      <text x="14" y="94" font-size="7.5" fill="var(--fig-node-c)">适合：网页、API、数据库、文件</text>

      <rect x="174" y="20" width="160" height="86" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">UDP</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">无连接（直接发）</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">不可靠：丢包不重传</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">无顺序保证</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-text)">头部小、延迟低</text>
      <text x="182" y="94" font-size="7.5" fill="var(--fig-node-c)">适合：DNS、音视频、游戏、监控</text>

      <!-- 关键判断 -->
      <rect x="6" y="116" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="129" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">为什么实时业务选 UDP</text>
      <text x="14" y="142" font-size="7.5" fill="var(--fig-text)">TCP 丢包重传会造成卡顿与延迟堆积；宁可丢帧也不要卡住</text>
      <text x="14" y="154" font-size="7.5" fill="var(--fig-text)">所以音视频在 UDP 上自己实现「可容忍丢包」的编码与补偿</text>

      <rect x="6" y="170" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="183" font-size="8" font-weight="700" fill="var(--fig-node-d)">应用层的常见搭配</text>
      <text x="14" y="196" font-size="7.5" fill="var(--fig-text)">HTTP/2 仍基于 TCP；QUIC / HTTP/3 基于 UDP 自己实现可靠传输</text>

      <rect x="6" y="212" width="328" height="24" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="228" font-size="7.5" fill="var(--fig-text)">运维提示：UDP 没有连接状态 → 排查要靠抓包，防火墙要单独放行</text>

      <text x="6" y="248" font-size="7.5" fill="var(--fig-muted)">易混点：TCP 的「可靠」不等于「不丢」——它只保证尝试重传，超时仍会失败</text>
    </svg>
    <figcaption>TCP 用握手与重传换可靠性，UDP 用低延迟换容忍丢包；实时业务选 UDP 是为了避免重传卡顿</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
