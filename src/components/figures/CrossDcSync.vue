<script setup>
/**
 * 跨机房数据同步的方案与一致性（题 2424）。
 *
 * 核心洞察：跨机房必然有延迟，所以要在「同步复制（强一致但慢/易受影响）」
 * 与「异步复制（快但可能丢）」之间取舍，第三种是折中的半同步。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 234" role="img" aria-label="跨机房同步三方案：同步复制、半同步、异步复制，以及一致性与可用性的取舍">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">跨机房必有时延 —— 没有「又快又强一致」的方案，只能取舍</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">同步复制：写完两边才返回</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">强一致、RPO≈0；代价是写延迟 = 跨机房往返，对端故障会拖住写入</text>

      <rect x="6" y="58" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="71" font-size="8" font-weight="700" fill="var(--fig-node-b)">半同步：至少一个副本确认</text>
      <text x="14" y="84" font-size="7.5" fill="var(--fig-text)">折中方案（如 MySQL semi-sync）；延迟可控，但仍受对端影响</text>

      <rect x="6" y="96" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="109" font-size="8" font-weight="700" fill="var(--fig-node-c)">异步复制：先返回再同步</text>
      <text x="14" y="122" font-size="7.5" fill="var(--fig-text)">写延迟低、可用性好；代价是故障时可能丢最后一段数据（RPO &gt; 0）</text>

      <!-- 一致性保障 -->
      <rect x="6" y="134" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="147" font-size="8.5" font-weight="700" fill="#e5484d">异步复制下如何「接近一致」</text>
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)">① 关键读走主库（或读到最新位点才返回）② 用消息队列补偿/对账</text>
      <text x="14" y="172" font-size="7.5" fill="var(--fig-text)">③ 定期全量对账，发现不一致再修复（不能只靠实时同步）</text>

      <rect x="6" y="184" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="197" font-size="8" font-weight="700" fill="var(--fig-node-d)">超远距离的特殊手段</text>
      <text x="14" y="209" font-size="7.5" fill="var(--fig-text)">逻辑复制/CDC（binlog 解析）、对象存储跨区复制、批量归档传输</text>

      <text x="6" y="228" font-size="7.5" fill="var(--fig-muted)">关键判断：先问业务「能容忍丢多少、慢多少」，再定同步模式（RPO/RTO）</text>
    </svg>
    <figcaption>同步复制强一致但延迟高、异步快但可能丢、半同步折中；异步下靠关键读主库、对账与补偿来接近一致</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
