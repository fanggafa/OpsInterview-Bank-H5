<script setup>
/**
 * 多个应用写 ES 的索引规划（题 3030）。
 *
 * 核心洞察：共用索引会让「保留期、字段映射、权限」互相打架；
 * 按应用/环境分开更稳妥，代价是索引数量增加。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 252" role="img" aria-label="共用索引与按应用分开索引的取舍：保留期、mapping 冲突、权限隔离">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">共用省事但会「互相打架」，分开则要在数量与运维上付出成本</text>

      <rect x="6" y="20" width="160" height="84" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">共用索引</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">索引数少、写入简单</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">一个保留期对所有应用生效</text>
      <text x="14" y="70" font-size="7.5" fill="#e5484d">mapping 冲突：同名不同类型</text>
      <text x="14" y="82" font-size="7.5" fill="#e5484d">权限无法隔离（都能看全部）</text>
      <text x="14" y="94" font-size="7.5" fill="#e5484d">一个应用爆量拖垮整体</text>

      <rect x="174" y="20" width="160" height="84" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">按应用/环境分开</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">各自 mapping、保留期、分片</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">权限可隔离、故障可隔离</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">可按量调整资源</text>
      <text x="182" y="82" font-size="7.5" fill="#e5484d">代价：索引多、分片开销上升</text>
      <text x="182" y="94" font-size="7" fill="var(--fig-node-c)">分片数是主要成本来源</text>

      <!-- 命名规范 -->
      <rect x="6" y="114" width="328" height="48" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="127" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">推荐命名与结构</text>
      <text x="14" y="140" font-size="7.5" fill="var(--fig-text)">索引名：环境-应用-类型-日期（如 prod.order.app-2025.10）</text>
      <text x="14" y="152" font-size="7.5" fill="var(--fig-text)">用「写别名 + 读别名」解耦：应用只写 app-order-write，查询用 app-order-*</text>

      <rect x="6" y="170" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="183" font-size="8" font-weight="700" fill="var(--fig-node-d)">规模上的关键取舍</text>
      <text x="14" y="195" font-size="7.5" fill="var(--fig-text)">小应用可合到一个索引（用字段区分），大应用独立（避免互相影响）</text>

      <rect x="6" y="212" width="328" height="20" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="226" font-size="7.5" fill="var(--fig-text)">注意：分片数过多会拖慢集群（每个分片都有独立开销）</text>

      <text x="6" y="244" font-size="7.5" fill="var(--fig-muted)">判断：两个应用会不会「保留期不同、字段同名不同类型、权限要隔离」？会 → 必须分开</text>
    </svg>
    <figcaption>共用索引省事但 mapping、保留期、权限会冲突；按「环境-应用-类型-日期」分开并用读写别名解耦</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
