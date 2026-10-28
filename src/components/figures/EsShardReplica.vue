<script setup>
/**
 * Elasticsearch 索引的「分片 + 副本」分布图。
 * 展示 3 主分片 + 1 副本如何在多节点上分布，
 * 以及「主分片挂了副本顶上」「节点挂了某个副本不可用」两种情况。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 240" role="img" aria-label="ES 三主分片一副本在三节点上的分布与故障切换">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">3 主分片(P) + 1 副本(R) 分布在 3 个数据节点</text>

      <!-- 节点1 -->
      <rect x="6" y="20" width="104" height="92" rx="7" fill="var(--fig-node-a)" opacity=".07" />
      <rect x="6" y="20" width="104" height="92" rx="7" fill="none" stroke="var(--fig-node-a)" stroke-width="1.3" />
      <text x="14" y="35" font-size="9" font-weight="700" fill="var(--fig-node-a)">Node 1</text>
      <rect x="14" y="42" width="42" height="18" rx="3" fill="var(--fig-node-a)" opacity=".9" />
      <text x="35" y="54" text-anchor="middle" font-size="8.5" fill="#fff" font-weight="700">P0</text>
      <rect x="60" y="42" width="42" height="18" rx="3" fill="none" stroke="var(--fig-node-c)" stroke-width="1.3" stroke-dasharray="3 2" />
      <text x="81" y="54" text-anchor="middle" font-size="8.5" fill="var(--fig-node-c)" font-weight="700">R1</text>
      <rect x="14" y="66" width="42" height="18" rx="3" fill="none" stroke="var(--fig-node-b)" stroke-width="1.3" stroke-dasharray="3 2" />
      <text x="35" y="78" text-anchor="middle" font-size="8.5" fill="var(--fig-node-b)" font-weight="700">R2</text>
      <text x="14" y="100" font-size="7.5" fill="var(--fig-muted)">共 3 个分片</text>

      <!-- 节点2 -->
      <rect x="118" y="20" width="104" height="92" rx="7" fill="var(--fig-node-c)" opacity=".07" />
      <rect x="118" y="20" width="104" height="92" rx="7" fill="none" stroke="var(--fig-node-c)" stroke-width="1.3" />
      <text x="126" y="35" font-size="9" font-weight="700" fill="var(--fig-node-c)">Node 2</text>
      <rect x="126" y="42" width="42" height="18" rx="3" fill="var(--fig-node-c)" opacity=".9" />
      <text x="147" y="54" text-anchor="middle" font-size="8.5" fill="#fff" font-weight="700">P1</text>
      <rect x="172" y="42" width="42" height="18" rx="3" fill="none" stroke="var(--fig-node-a)" stroke-width="1.3" stroke-dasharray="3 2" />
      <text x="193" y="54" text-anchor="middle" font-size="8.5" fill="var(--fig-node-a)" font-weight="700">R0</text>
      <rect x="126" y="66" width="42" height="18" rx="3" fill="none" stroke="var(--fig-node-b)" stroke-width="1.3" stroke-dasharray="3 2" />
      <text x="147" y="78" text-anchor="middle" font-size="8.5" fill="var(--fig-node-b)" font-weight="700">R2</text>
      <text x="126" y="100" font-size="7.5" fill="var(--fig-muted)">共 3 个分片</text>

      <!-- 节点3 -->
      <rect x="230" y="20" width="104" height="92" rx="7" fill="var(--fig-node-b)" opacity=".07" />
      <rect x="230" y="20" width="104" height="92" rx="7" fill="none" stroke="var(--fig-node-b)" stroke-width="1.3" />
      <text x="238" y="35" font-size="9" font-weight="700" fill="var(--fig-node-b)">Node 3</text>
      <rect x="238" y="42" width="42" height="18" rx="3" fill="var(--fig-node-b)" opacity=".9" />
      <text x="259" y="54" text-anchor="middle" font-size="8.5" fill="#fff" font-weight="700">P2</text>
      <rect x="284" y="42" width="42" height="18" rx="3" fill="none" stroke="var(--fig-node-a)" stroke-width="1.3" stroke-dasharray="3 2" />
      <text x="305" y="54" text-anchor="middle" font-size="8.5" fill="var(--fig-node-a)" font-weight="700">R0</text>
      <rect x="238" y="66" width="42" height="18" rx="3" fill="none" stroke="var(--fig-node-c)" stroke-width="1.3" stroke-dasharray="3 2" />
      <text x="259" y="78" text-anchor="middle" font-size="8.5" fill="var(--fig-node-c)" font-weight="700">R1</text>
      <text x="238" y="100" font-size="7.5" fill="var(--fig-muted)">共 3 个分片</text>

      <!-- 状态说明 -->
      <text x="6" y="132" font-size="9.5" font-weight="700" fill="var(--fig-node-c)">green</text>
      <text x="52" y="132" font-size="8.5" fill="var(--fig-text)">主副本全部就位（上图就是 green）</text>

      <text x="6" y="150" font-size="9.5" font-weight="700" fill="var(--fig-node-d)">yellow</text>
      <text x="52" y="150" font-size="8.5" fill="var(--fig-text)">主分片都在、部分副本没分配 → 数据不丢，但无冗余</text>
      <text x="52" y="162" font-size="8.5" fill="var(--fig-text)">（单节点/磁盘水位/节点数不足）</text>

      <text x="6" y="180" font-size="9.5" font-weight="700" fill="#e5484d">red</text>
      <text x="38" y="180" font-size="8.5" fill="var(--fig-text)">有主分片未分配 → 部分数据不可用，要靠快照恢复</text>

      <rect x="6" y="190" width="328" height="42" rx="7" fill="var(--fig-node-a)" opacity=".09" />
      <text x="16" y="204" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">关键约束</text>
      <text x="16" y="217" font-size="8" fill="var(--fig-text)">主分片数创建后不可改 → 日志按天滚动索引，分片固定 3-5 个；副本数可随时改</text>
      <text x="16" y="228" font-size="8" fill="var(--fig-muted)">单分片建议 20-30GB；单节点分片数控制在「20 × 堆GB数」以内</text>
    </svg>
    <figcaption>副作用最小的排查入口：GET _cluster/allocation/explain 会直接说明分片为何没分配</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
