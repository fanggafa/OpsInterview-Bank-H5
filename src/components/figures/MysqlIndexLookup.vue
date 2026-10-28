<script setup>
/**
 * MySQL 索引与「回表」图。
 * 解释聚簇索引 vs 二级索引，以及为什么「覆盖索引」能省掉回表——
 * 这是索引优化题里最关键的一张图。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 226" role="img" aria-label="MySQL 聚簇索引与二级索引的结构差异，以及回表与覆盖索引">
      <defs>
        <marker id="arrIdx" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-node-d)" />
        </marker>
      </defs>

      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">InnoDB 的表本身就是一棵 B+Tree：叶子节点存的是整行数据</text>

      <!-- 聚簇索引 -->
      <rect x="6" y="20" width="160" height="86" rx="6" fill="var(--fig-node-a)" opacity=".09" />
      <rect x="6" y="20" width="160" height="86" rx="6" fill="none" stroke="var(--fig-node-a)" stroke-width="1.3" />
      <text x="14" y="36" font-size="9" font-weight="700" fill="var(--fig-node-a)">聚簇索引（主键）</text>

      <rect x="14" y="44" width="144" height="16" rx="3" fill="var(--fig-card)" stroke="var(--fig-node-a)" stroke-width="1" />
      <text x="20" y="55" font-size="7.5" fill="var(--fig-text)">id=1 → 整行数据（name, age, …）</text>
      <rect x="14" y="64" width="144" height="16" rx="3" fill="var(--fig-card)" stroke="var(--fig-node-a)" stroke-width="1" />
      <text x="20" y="75" font-size="7.5" fill="var(--fig-text)">id=2 → 整行数据（name, age, …）</text>
      <text x="14" y="96" font-size="7.5" fill="var(--fig-node-c)">✓ 一次查找就拿到全部字段</text>

      <!-- 二级索引 -->
      <rect x="174" y="20" width="160" height="86" rx="6" fill="var(--fig-node-b)" opacity=".09" />
      <rect x="174" y="20" width="160" height="86" rx="6" fill="none" stroke="var(--fig-node-b)" stroke-width="1.3" />
      <text x="182" y="36" font-size="9" font-weight="700" fill="var(--fig-node-b)">二级索引（如 name）</text>

      <rect x="182" y="44" width="144" height="16" rx="3" fill="var(--fig-card)" stroke="var(--fig-node-b)" stroke-width="1" />
      <text x="188" y="55" font-size="7.5" fill="var(--fig-text)">name='Tom' → 主键 id=2</text>
      <rect x="182" y="64" width="144" height="16" rx="3" fill="var(--fig-card)" stroke="var(--fig-node-b)" stroke-width="1" />
      <text x="188" y="75" font-size="7.5" fill="var(--fig-text)">name='Jerry' → 主键 id=7</text>
      <text x="182" y="96" font-size="7.5" fill="var(--fig-node-d)">⚠ 只有主键，没有其他字段</text>

      <!-- 回表 -->
      <path d="M244 108 Q244 126 200 126" stroke="var(--fig-node-d)" stroke-width="1.5" fill="none" marker-end="url(#arrIdx)" />
      <text x="252" y="122" font-size="7.5" fill="var(--fig-node-d)">回表</text>

      <rect x="6" y="116" width="180" height="40" rx="6" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="131" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">回表（需要两次查找）</text>
      <text x="14" y="145" font-size="7.5" fill="var(--fig-text)">按 name 查到主键 → 再按主键回聚簇索引取整行</text>
      <text x="14" y="154" font-size="7" fill="var(--fig-muted)">这就是「走二级索引反而更慢」的原因（数据量大时明显）</text>

      <!-- 覆盖索引 -->
      <rect x="6" y="164" width="328" height="52" rx="6" fill="var(--fig-node-c)" opacity=".1" />
      <rect x="6" y="164" width="328" height="52" rx="6" fill="none" stroke="var(--fig-node-c)" stroke-width="1.2" />
      <text x="16" y="180" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">覆盖索引：省掉回表</text>
      <text x="16" y="194" font-size="8" fill="var(--fig-text)">如果 SELECT 要的字段「都在索引里」，就不必回表 —— EXPLAIN 的 Extra 会显示 Using index</text>
      <text x="16" y="207" font-size="7.5" fill="var(--fig-muted)">实践：把「查询频繁用到的字段」一起建进复合索引，让查询变成覆盖索引</text>
    </svg>
    <figcaption>「回表」是二级索引的主要开销；覆盖索引是消除它的唯一手段</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
