<script setup>
/**
 * 数据归档与数据备份（题 2422）。
 *
 * 核心洞察：备份是「为了恢复」，归档是「为了留存/合规」；
 * 两者目的不同，所以保留期、介质、可检索性都不一样，不能互相替代。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 252" role="img" aria-label="备份用于恢复、保留短；归档用于合规与历史留存、保留长且可检索；两者不可互换">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">备份为「能恢复」，归档为「能留存」—— 目的不同，介质与保留期也不同</text>

      <rect x="6" y="20" width="160" height="82" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">备份 Backup</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">目的是「出事能快速恢复」</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">保留期短（天~月）</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">格式要「能直接恢复」</text>
      <text x="14" y="82" font-size="7.5" fill="var(--fig-text)">通常全量+增量滚动</text>
      <text x="14" y="94" font-size="7" fill="var(--fig-node-c)">关注：RTO / RPO</text>

      <rect x="174" y="20" width="160" height="82" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">归档 Archive</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">目的是「长期留存 / 合规」</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">保留期长（年~十年）</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">格式要「可检索/可读」</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-text)">往往迁到低频/对象存储</text>
      <text x="182" y="94" font-size="7" fill="var(--fig-node-c)">关注：成本 / 可查性 / 合规</text>

      <!-- 为什么都要 -->
      <rect x="6" y="112" width="328" height="50" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="125" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">为什么两者都需要</text>
      <text x="14" y="138" font-size="7.5" fill="var(--fig-text)">只有备份：几个月前的数据查不到（审计/纠纷/分析需要历史）</text>
      <text x="14" y="150" font-size="7.5" fill="var(--fig-text)">只有归档：出事时要从归档拉回全量再恢复 → 慢到不可用</text>
      <text x="14" y="162" font-size="7" fill="var(--fig-node-c)">互补：备份管「最近的恢复点」，归档管「久远的历史」</text>

      <rect x="6" y="170" width="328" height="34" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="183" font-size="8" font-weight="700" fill="#e5484d">常见误解</text>
      <text x="14" y="195" font-size="7.5" fill="var(--fig-text)">「归档了就等于备份了」—— 归档常是删除线上数据后的唯一副本，风险更高</text>

      <rect x="6" y="212" width="328" height="20" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="226" font-size="7.5" fill="var(--fig-text)">归档要注意：介质寿命（磁带需轮换）、格式可读性（别用私有格式）</text>

      <text x="6" y="244" font-size="7.5" fill="var(--fig-muted)">合规场景：归档常要求「不可篡改」与「保留年限」，备份不承担这个职责</text>
    </svg>
    <figcaption>备份目的是快速恢复（保留短、可直接恢复），归档目的是长期留存与合规（保留长、可检索），两者不能替代</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
