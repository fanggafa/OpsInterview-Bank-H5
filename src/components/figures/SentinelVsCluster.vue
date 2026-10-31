<script setup>
/**
 * Redis 哨兵模式与集群模式（题 3928）。
 *
 * 核心洞察：哨兵解决「高可用」但不分片（每节点全量数据）；
 * 集群解决「高可用 + 水平扩展」（slot 分片），代价是客户端复杂与跨 slot 限制。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 244" role="img" aria-label="哨兵模式一主多从加监控，集群模式按 slot 分片且内置故障转移">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">哨兵保「高可用」，集群保「高可用 + 扩容」</text>

      <rect x="6" y="20" width="160" height="84" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">哨兵 Sentinel</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">一主多从，每个节点全量数据</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">3 个哨兵监控 + 投票选新主</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">客户端连哨兵拿主地址</text>
      <text x="14" y="82" font-size="7.5" fill="var(--fig-text)">多 key 操作无限制</text>
      <text x="14" y="94" font-size="7.5" fill="#e5484d">容量受单机内存限制</text>
      <text x="14" y="104" font-size="7" fill="var(--fig-node-c)">写能力受单主限制</text>

      <rect x="174" y="20" width="160" height="84" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">集群 Cluster</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">数据按 16384 个 slot 分散</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">每主带从，内置故障转移</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">可水平扩（加节点扩容量）</text>
      <text x="182" y="82" font-size="7.5" fill="#e5484d">跨 slot 的 mget/事务受限</text>
      <text x="182" y="94" font-size="7.5" fill="#e5484d">客户端要支持 cluster</text>
      <text x="182" y="104" font-size="7" fill="var(--fig-node-c)">最少 3 主 3 从</text>

      <!-- 选型 -->
      <rect x="6" y="112" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="125" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">怎么选（看两个数字）</text>
      <text x="14" y="138" font-size="7.5" fill="var(--fig-text)">数据量 &lt; 单机内存、只要高可用 → 哨兵（更简单）</text>
      <text x="14" y="150" font-size="7.5" fill="var(--fig-text)">数据超单机内存 / 写压力大 → 集群</text>
      <text x="14" y="162" font-size="7" fill="var(--fig-node-c)">强依赖多 key 事务或 mget → 倾向哨兵</text>

      <rect x="6" y="176" width="328" height="34" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="189" font-size="8" font-weight="700" fill="#e5484d">常见误区</text>
      <text x="14" y="201" font-size="7.5" fill="var(--fig-text)">「集群一定更好」—— 它带来跨 slot 限制与运维复杂度，够用就别上</text>

      <text x="6" y="228" font-size="7.5" fill="var(--fig-muted)">两者都不解决「数据丢失」—— 持久化与备份是另一回事</text>
    </svg>
    <figcaption>哨兵：一主多从 + 3 哨兵投票选主，容量受单机限制；集群：slot 分片 + 内置故障转移，可水平扩展但有跨 slot 限制</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
