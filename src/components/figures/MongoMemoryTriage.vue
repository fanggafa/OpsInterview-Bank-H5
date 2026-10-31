<script setup>
/**
 * MongoDB 内存占用高（题 2018）。
 *
 * 核心洞察：MongoDB 的 WiredTiger 会把空闲内存尽量用作缓存 —— 内存高往往「正常」；
 * 真正要警惕的是「工作集超出内存」导致的磁盘 IO 暴涨。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 248" role="img" aria-label="MongoDB 内存高多半是 WiredTiger 缓存正常占满，真正问题是工作集超出内存导致读盘">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">WiredTiger 会「尽量吃满」内存做缓存 —— 高内存占用常常是正常的</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">先分清：缓存占用 vs 真的不够</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">WT 缓存默认 ≈ (内存 - 1GB) 的 50%；RSS 高但 IO 低 → 属于正常</text>

      <rect x="6" y="58" width="328" height="34" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="71" font-size="8" font-weight="700" fill="#e5484d">真正的问题：工作集 &gt; 可用内存</text>
      <text x="14" y="84" font-size="7.5" fill="var(--fig-text)">热数据放不进缓存 → 每次查询都读盘 → IO 打满、延迟飙升</text>

      <rect x="6" y="96" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="109" font-size="8" font-weight="700" fill="var(--fig-node-b)">怎么判断工作集大小</text>
      <text x="14" y="122" font-size="7.5" fill="var(--fig-text)">db.serverStatus().wiredTiger.cache 看 in cache 与 pages read into cache</text>

      <rect x="6" y="134" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="147" font-size="8" font-weight="700" fill="var(--fig-node-c)">优化方向（按性价比）</text>
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)">① 减数据量（归档/删过期）② 加内存 ③ 补索引减少全表扫描</text>

      <rect x="6" y="174" width="328" height="46" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="187" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">容易被误判的三件事</text>
      <text x="14" y="200" font-size="7.5" fill="var(--fig-text)">① 容器里 limit 设为过小，WT 缓存按「宿主机内存」算 → 被 OOMKilled</text>
      <text x="14" y="212" font-size="7.5" fill="var(--fig-text)">② 索引过多占缓存　③ 大量聚合/排序需要额外内存（allowDiskUse）</text>

      <text x="6" y="242" font-size="7.5" fill="var(--fig-muted)">排查组合：db.currentOp() 看慢操作 · mongostat 看页换入换出 · 云监控看 IOPS</text>
    </svg>
    <figcaption>内存高多是 WT 缓存正常占满；真正问题是工作集超出内存导致读盘。容器里要按 limit 配置缓存大小</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
