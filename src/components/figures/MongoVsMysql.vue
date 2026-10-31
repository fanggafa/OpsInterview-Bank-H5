<script setup>
/**
 * MongoDB 与 MySQL 的核心区别与选型（题 2000）。
 *
 * 核心洞察：差别不只是「文档 vs 表」，而是「schema 灵活性 vs 强事务与关系」
 * —— 选型看业务的数据形态与一致性要求。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 234" role="img" aria-label="MongoDB 与 MySQL 在数据模型、schema、事务、查询、扩展方式的区别与选型">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">差别在「schema 灵活性 vs 强事务与关系 → 看数据形态和一致性要求</text>

      <rect x="6" y="20" width="160" height="88" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">MongoDB</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">文档模型（类 JSON）</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">schema 灵活，字段可不同</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">支持内嵌文档（减少 join）</text>
      <text x="14" y="82" font-size="7.5" fill="var(--fig-text)">事务较弱（4.0+ 有多文档事务）</text>
      <text x="14" y="94" font-size="7.5" fill="var(--fig-text)">水平扩展靠分片</text>
      <text x="14" y="106" font-size="7" fill="var(--fig-node-c)">适合：日志/内容/物联网/形态多变</text>

      <rect x="174" y="20" width="160" height="88" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">MySQL</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">关系表 + 行/列</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">schema 严格，改表需 DDL</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">join 强、约束强</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-text)">完整事务与隔离级别</text>
      <text x="182" y="94" font-size="7.5" fill="var(--fig-text)">扩展以垂直为主，分库分表麻烦</text>
      <text x="182" y="106" font-size="7" fill="var(--fig-node-c)">适合：交易/财务/关系复杂</text>

      <!-- 选型 -->
      <rect x="6" y="116" width="328" height="48" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="129" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">选型三问</text>
      <text x="14" y="142" font-size="7.5" fill="var(--fig-text)">① 数据结构是否每行不同、以后会频繁加字段？是 → MongoDB</text>
      <text x="14" y="154" font-size="7.5" fill="var(--fig-text)">② 是否需要强事务/多表强关联？是 → MySQL</text>
      <text x="14" y="166" font-size="7" fill="var(--fig-node-c)">③ 数据量增长靠加机器还是加列？后者 MySQL，前者 MongoDB</text>

      <rect x="6" y="172" width="328" height="30" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="185" font-size="8" font-weight="700" fill="#e5484d">常见误选</text>
      <text x="14" y="197" font-size="7.5" fill="var(--fig-text)">用 MongoDB 做财务账本（需要强事务）；用 MySQL 存随时变结构的采集数据</text>

      <text x="6" y="228" font-size="7.5" fill="var(--fig-muted)">补充：很多系统是「MySQL 主数据 + MongoDB 灵活数据」并存，而不是二选一</text>
    </svg>
    <figcaption>MongoDB 文档模型 schema 灵活、内嵌减少 join，适合形态多变；MySQL 强事务强关联，适合交易；也常并存使用</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
