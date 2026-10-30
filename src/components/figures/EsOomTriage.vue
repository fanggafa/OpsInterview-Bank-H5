<script setup>
/**
 * ES 节点频繁 OOM / 重启的排查（题 3027）。
 *
 * 核心洞察：ES 的堆内存「不能太大也不能太小」，且大部分内存要留给文件系统缓存；
 * OOM 常见于分片过多、聚合过大、以及堆设置不当。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 260" role="img" aria-label="ES OOM 排查：堆设置不当、分片过多、聚合与深分页、字段爆炸，以及内存分配的黄金比例">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">堆不能太大（留缓存给 Lucene），也不能太小；OOM 多与分片和查询有关</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">黄金比例：堆 ≤ 物理内存的 50%，且不超过约 31GB</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">剩下 50% 留给文件系统缓存（Lucene 的段靠它加速）</text>

      <rect x="6" y="54" width="328" height="30" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="67" font-size="8" font-weight="700" fill="#e5484d">原因① 分片过多</text>
      <text x="14" y="79" font-size="7.5" fill="var(--fig-text)">每个分片都有段与元数据开销 → 分片太多直接把堆吃满</text>

      <rect x="6" y="88" width="328" height="30" rx="4" fill="#e5484d" opacity=".09" />
      <text x="14" y="101" font-size="8" font-weight="700" fill="#e5484d">原因② 聚合 / 深分页</text>
      <text x="14" y="113" font-size="7.5" fill="var(--fig-text)">terms 聚合桶太多、from+size 深分页 → 堆里堆满中间结果</text>

      <rect x="6" y="122" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="135" font-size="8" font-weight="700" fill="var(--fig-node-c)">原因③ 字段爆炸（mapping 膨胀）</text>
      <text x="14" y="147" font-size="7.5" fill="var(--fig-text)">动态 mapping 把大量字段都索引了 → 元数据与索引结构暴涨</text>

      <rect x="6" y="156" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="169" font-size="8" font-weight="700" fill="var(--fig-node-d)">原因④ 同机部署多个实例</text>
      <text x="14" y="181" font-size="7.5" fill="var(--fig-text)">每个实例都按「全部物理内存」算堆 → 总占用超物理内存被 OOM kill</text>

      <rect x="6" y="190" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="203" font-size="8" font-weight="700" fill="var(--fig-node-a)">排查手段</text>
      <text x="14" y="215" font-size="7.5" fill="var(--fig-text)">看 GC 日志与 _nodes/stats/jvm；heap dump 分析；GET _cat/shards?v 看分片数</text>

      <text x="6" y="236" font-size="7.5" fill="var(--fig-muted)">JVM 的 OutOfMemoryError（堆）与被内核 OOM killer 杀掉（容器超 limit）是两回事</text>
      <text x="6" y="248" font-size="7.5" fill="var(--fig-muted)">修复顺序：先限制分片与查询，再调堆；直接加堆往往只是延后问题</text>
    </svg>
    <figcaption>ES 堆不超物理内存 50% 且不超 31GB；OOM 多因分片过多、聚合深分页、字段爆炸或同机多实例</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
