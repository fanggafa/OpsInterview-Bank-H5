<script setup>
/**
 * 数据生命周期管理（题 2433）。
 *
 * 核心洞察：数据从「产生 → 活跃 → 归档 → 销毁」全程都要有策略，
 * 只管存储不管销毁，成本会无限增长且带来合规风险。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 240" role="img" aria-label="数据生命周期四阶段：产生与分级、活跃使用、归档、销毁，各阶段的管理要点">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">四个阶段：产生分级 → 活跃 → 归档 → 销毁，每段都要有策略</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① 产生与分级</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">入库时就打标签：业务属性、敏感级别、保留期（别事后补）</text>

      <rect x="6" y="58" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="71" font-size="8" font-weight="700" fill="var(--fig-node-b)">② 活跃使用</text>
      <text x="14" y="84" font-size="7.5" fill="var(--fig-text)">热数据放高性能存储；按时序分区便于按时间淘汰</text>

      <rect x="6" y="96" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="109" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ 归档</text>
      <text x="14" y="122" font-size="7.5" fill="var(--fig-text)">迁到低频/对象存储；保持可检索（否则等于删了）</text>

      <rect x="6" y="134" width="328" height="34" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="147" font-size="8" font-weight="700" fill="#e5484d">④ 销毁（最容易被忽略）</text>
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)">到期必须真删（含备份与副本），并留删除审计记录</text>

      <!-- 要点 -->
      <rect x="6" y="176" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="189" font-size="8" font-weight="700" fill="var(--fig-node-d)">三个常被漏掉的点</text>
      <text x="14" y="201" font-size="7.5" fill="var(--fig-text)">① 备份里的数据也要按保留期清理　② 销毁要覆盖所有副本与缓存</text>

      <text x="6" y="230" font-size="7.5" fill="var(--fig-muted)">合规视角：GDPR/个人信息保护要求「到期删除」，不能只有归档没有销毁</text>
    </svg>
    <figcaption>四阶段：入库分级打标签、活跃期按时序分区、归档保持可检索、到期真删除（含备份副本）并留审计</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
