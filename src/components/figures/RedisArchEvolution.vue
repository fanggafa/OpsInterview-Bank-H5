<script setup>
/**
 * Redis 主从 / 哨兵 / 集群三种架构的演进（题 37）。
 *
 * 核心洞察：三者是「解决不同问题」的递进关系 ——
 * 主从解决读扩展、哨兵解决自动切换、集群解决单主写入的上限。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 272" role="img" aria-label="Redis 三种架构：主从解决读扩展、哨兵增加自动故障转移、集群解决水平扩容，各自局限">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">三者是递进关系：解决「读扩展 → 自动切换 → 写扩展」</text>

      <rect x="6" y="20" width="328" height="56" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① 主从复制</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">一主多从，异步复制 → 解决读扩展与数据冗余</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">局限：故障需人工切换、异步可能丢数据、单主写入有上限</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-node-c)">适用：读多写少、可容忍人工介入</text>

      <rect x="6" y="84" width="328" height="66" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="97" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">② 哨兵 Sentinel</text>
      <text x="14" y="110" font-size="7.5" fill="var(--fig-text)">在主从之上加哨兵集群：监控主库 + 自动故障转移 + 通知客户端</text>
      <text x="14" y="122" font-size="7.5" fill="var(--fig-text)">流程：主观下线 → 客观下线（达 quorum）→ 选出 Leader 哨兵</text>
      <text x="14" y="134" font-size="7.5" fill="var(--fig-text)">→ 选新主（优先级/偏移量最大）→ 其他从库重新指向</text>
      <text x="14" y="146" font-size="7.5" fill="var(--fig-node-c)">局限：仍是单主写入，容量无法水平扩展</text>

      <rect x="6" y="158" width="328" height="66" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="171" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">③ Cluster 集群</text>
      <text x="14" y="184" font-size="7.5" fill="var(--fig-text)">16384 个槽位分到多个主节点，每个主节点带从节点</text>
      <text x="14" y="196" font-size="7.5" fill="var(--fig-text)">解决：写入水平扩展 + 容量扩展 + 自动故障转移</text>
      <text x="14" y="208" font-size="7.5" fill="var(--fig-text)">局限：多 key 操作受限（跨槽）、只有 db0、客户端要支持集群</text>
      <text x="14" y="220" font-size="7.5" fill="var(--fig-node-c)">MOVED/ASK 重定向是集群的日常行为</text>

      <rect x="6" y="232" width="328" height="20" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="246" font-size="7.5" fill="var(--fig-node-d)">选择：读扩展 → 主从；要自动切换 → 哨兵；写扩展/大容量 → Cluster</text>

      <text x="6" y="262" font-size="7.5" fill="var(--fig-muted)">易混点：哨兵不是集群模式，它不能水平扩展写入能力</text>
    </svg>
    <figcaption>主从解决读扩展、哨兵解决自动切换、Cluster 解决写扩展与容量；哨兵不能水平扩展写入</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
