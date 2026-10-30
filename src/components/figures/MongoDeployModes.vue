<script setup>
/**
 * MongoDB 三种部署形态与最小节点数（题 2002）。
 *
 * 核心洞察：单机 → 副本集 → 分片集群，是「高可用 → 水平扩展」的递进；
 * 副本集最小 3 节点，分片集群至少 2 个 shard + 3 个 config + N 个 mongos。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 250" role="img" aria-label="MongoDB 三种部署形态：单机、副本集最少 3 节点、分片集群需要 shard 加 config 加 mongos">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">单机 → 副本集（高可用）→ 分片集群（水平扩展）</text>

      <rect x="6" y="20" width="328" height="60" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① 单机 Standalone</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">最简单：一台 mongod，无副本无扩展</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">适合开发测试；生产单点故障即全停</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-node-c)">数据无冗余，磁盘损坏即丢</text>

      <rect x="6" y="86" width="328" height="66" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="99" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">② 副本集 Replica Set</text>
      <text x="14" y="112" font-size="7.5" fill="var(--fig-text)">最少 3 个成员（多数派 = 2，可容忍 1 台故障）</text>
      <text x="14" y="124" font-size="7.5" fill="var(--fig-text)">1 主 + 2 从（或 2 数据 + 1 arbiter）自动选主与故障转移</text>
      <text x="14" y="136" font-size="7.5" fill="var(--fig-node-c)">解决高可用；但单主写入，容量与写吞吐仍有上限</text>

      <rect x="6" y="158" width="328" height="66" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="171" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">③ 分片集群 Sharded Cluster</text>
      <text x="14" y="184" font-size="7.5" fill="var(--fig-text)">shard（≥2 个副本集）+ config server（必须 3 节点副本集）</text>
      <text x="14" y="196" font-size="7.5" fill="var(--fig-text)">+ mongos（≥1，通常 2+）</text>
      <text x="14" y="208" font-size="7.5" fill="var(--fig-node-c)">解决水平扩展；代价是分片键设计与运维复杂度上升</text>

      <text x="6" y="244" font-size="7.5" fill="var(--fig-muted)">记忆点：副本集「3」是为了多数派；config server 也必须是 3 节点副本集</text>
    </svg>
    <figcaption>单机无冗余、副本集最少 3 节点（多数派 2）、分片集群需 shard + 3 节点 config + mongos</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
