<script setup>
/**
 * ES 分片与副本的设计权衡（日志与ELK）。
 *
 * 核心洞察：分片数决定「并行度上限」且建索引后不可改（除非 reindex），
 * 副本决定「高可用与读吞吐」但翻倍占空间 —— 所以要按「数据量 + 保留期」倒推。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 274" role="img" aria-label="ES 分片决定并行度且不可改，副本决定高可用与读吞吐但翻倍空间，按数据量倒推分片数">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">分片数建完就改不了（除非 reindex），副本翻倍占空间 —— 要按数据量倒推</text>

      <rect x="6" y="20" width="160" height="72" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">分片 Primary</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">决定并行度上限</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">每个分片是独立 Lucene 索引</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">写入分散到多个分片</text>
      <text x="14" y="84" font-size="7.5" fill="#e5484d">建索引后不可改（除 reindex）</text>

      <rect x="174" y="20" width="160" height="72" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">副本 Replica</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">高可用 + 提升读吞吐</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">节点挂了副本还能用</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">查询可分散到副本</text>
      <text x="182" y="84" font-size="7.5" fill="var(--fig-node-c)">代价：存储翻倍</text>

      <!-- 怎么定 -->
      <rect x="6" y="102" width="328" height="62" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="115" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">分片数怎么定（经验法）</text>
      <text x="14" y="128" font-size="7.5" fill="var(--fig-text)">单分片建议 10~50GB（按「日增量 × 保留天数 ÷ 节点数」估算）</text>
      <text x="14" y="140" font-size="7.5" fill="var(--fig-text)">分片过多：每个分片都有开销（段、元数据、查询合并）→ 反而更慢</text>
      <text x="14" y="152" font-size="7.5" fill="var(--fig-node-c)">分片过少：无法并行、单分片过大影响恢复速度</text>

      <!-- 日志场景 -->
      <rect x="6" y="172" width="328" height="50" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="185" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">日志场景的最佳实践</text>
      <text x="14" y="198" font-size="7.5" fill="var(--fig-text)">按时间建索引（如 logstash-2026.10.30）+ ILM 自动滚动与删除</text>
      <text x="14" y="210" font-size="7.5" fill="var(--fig-text)">分片按「单日数据量」定，不要一开始就设几十个分片</text>

      <rect x="6" y="230" width="328" height="26" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="247" font-size="7.5" fill="var(--fig-text)">常见误判：把「分片多」当成「性能好」—— 分片本身就有固定开销</text>

      <text x="6" y="264" font-size="7.5" fill="var(--fig-muted)">排查提示：GET _cat/shards?v 看分片大小与分布；GET _cluster/health 看副本是否补齐</text>
    </svg>
    <figcaption>分片定并行度且建完不可改、副本保高可用但翻倍空间；按「日增 × 保留 ÷ 节点」倒推分片，单分片 10~50GB</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
