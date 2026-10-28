<script setup>
/**
 * MongoDB 副本集与分片架构图。
 * 副本集（高可用）与分片（水平扩展）是两个正交能力，
 * 很多人会混淆「副本集解决什么」和「分片解决什么」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 224" role="img" aria-label="MongoDB 副本集的高可用与分片集群的水平扩展">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">两个正交能力：副本集保可用，分片保扩展</text>

      <!-- 副本集 -->
      <rect x="6" y="20" width="158" height="96" rx="7" fill="var(--fig-node-a)" opacity=".07" />
      <rect x="6" y="20" width="158" height="96" rx="7" fill="none" stroke="var(--fig-node-a)" stroke-width="1.3" />
      <text x="14" y="36" font-size="9.5" font-weight="700" fill="var(--fig-node-a)">副本集（Replica Set）</text>

      <rect x="14" y="44" width="140" height="18" rx="4" fill="var(--fig-node-c)" opacity=".85" />
      <text x="84" y="56" text-anchor="middle" font-size="8.5" fill="#fff" font-weight="600">Primary（唯一可写）</text>

      <rect x="14" y="66" width="66" height="18" rx="4" fill="var(--fig-card)" stroke="var(--fig-node-a)" stroke-width="1.1" />
      <text x="47" y="78" text-anchor="middle" font-size="8" fill="var(--fig-node-a)">Secondary</text>
      <rect x="88" y="66" width="66" height="18" rx="4" fill="var(--fig-card)" stroke="var(--fig-node-a)" stroke-width="1.1" />
      <text x="121" y="78" text-anchor="middle" font-size="8" fill="var(--fig-node-a)">Secondary</text>

      <text x="14" y="96" font-size="8" fill="var(--fig-text)">Primary 挂了 → 自动选举新的 Primary</text>
      <text x="14" y="108" font-size="8" fill="var(--fig-node-c)">✓ 高可用：RTO 秒级-分钟级</text>

      <!-- 分片 -->
      <rect x="176" y="20" width="158" height="96" rx="7" fill="var(--fig-node-b)" opacity=".07" />
      <rect x="176" y="20" width="158" height="96" rx="7" fill="none" stroke="var(--fig-node-b)" stroke-width="1.3" />
      <text x="184" y="36" font-size="9.5" font-weight="700" fill="var(--fig-node-b)">分片集群（Sharded）</text>

      <rect x="184" y="44" width="142" height="16" rx="4" fill="var(--fig-node-b)" opacity=".8" />
      <text x="255" y="55" text-anchor="middle" font-size="8" fill="#fff" font-weight="600">mongos（路由）</text>

      <rect x="184" y="64" width="44" height="16" rx="3" fill="var(--fig-card)" stroke="var(--fig-node-b)" stroke-width="1" />
      <text x="206" y="75" text-anchor="middle" font-size="7.5" fill="var(--fig-node-b)">Shard1</text>
      <rect x="233" y="64" width="44" height="16" rx="3" fill="var(--fig-card)" stroke="var(--fig-node-b)" stroke-width="1" />
      <text x="255" y="75" text-anchor="middle" font-size="7.5" fill="var(--fig-node-b)">Shard2</text>
      <rect x="282" y="64" width="44" height="16" rx="3" fill="var(--fig-card)" stroke="var(--fig-node-b)" stroke-width="1" />
      <text x="304" y="75" text-anchor="middle" font-size="7.5" fill="var(--fig-node-b)">Shard3</text>

      <text x="184" y="96" font-size="8" fill="var(--fig-text)">按分片键把数据切开，每片各存一部分</text>
      <text x="184" y="108" font-size="8" fill="var(--fig-node-b)">✓ 水平扩展：突破单机容量/写入上限</text>

      <!-- 组合 -->
      <text x="6" y="134" font-size="9.5" font-weight="700" fill="var(--fig-text)">生产上通常是「组合」</text>
      <text x="6" y="148" font-size="8.5" fill="var(--fig-muted)">每个 Shard 本身就是一个副本集（3 节点）→ 既高可用又能扩展</text>

      <!-- 分片键 -->
      <rect x="6" y="158" width="328" height="58" rx="7" fill="var(--fig-node-d)" opacity=".09" />
      <rect x="6" y="158" width="328" height="58" rx="7" fill="none" stroke="var(--fig-node-d)" stroke-width="1.2" />
      <text x="16" y="174" font-size="9" font-weight="700" fill="var(--fig-node-d)">分片键选错的代价（最难补救的设计决策）</text>
      <text x="16" y="188" font-size="8.5" fill="var(--fig-text)">✗ 单调递增键（如时间戳、自增 ID）→ 所有写入集中到一个分片（热点）</text>
      <text x="16" y="200" font-size="8.5" fill="var(--fig-text)">✓ 高基数 + 写入分散的键（如 哈希(_id)、用户 ID 取模）</text>
      <text x="16" y="212" font-size="8" fill="var(--fig-node-c)">分片键选定后不可更改，只能重建集合 —— 所以必须提前规划</text>
    </svg>
    <figcaption>副本集解决「挂了怎么办」，分片解决「装不下怎么办」——分片键选错是最贵的错误</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
