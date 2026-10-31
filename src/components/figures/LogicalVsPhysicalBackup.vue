<script setup>
/**
 * 数据库备份方式与「逻辑备份不能单独作为唯一方案」（题 2409）。
 *
 * 核心洞察：逻辑备份（导出 SQL）可跨版本、可挑表恢复，但慢且恢复耗时长；
 * 物理备份快、能快速拉起，但绑版本平台 —— 生产要两种都有。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 258" role="img" aria-label="逻辑备份与物理备份的对比：速度、跨版本、恢复粒度，以及为什么两者都要有">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">逻辑备份灵活但慢，物理备份快但绑版本 —— 生产要两种都有</text>

      <rect x="6" y="20" width="160" height="86" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">逻辑备份（mysqldump 等）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">导出 SQL 语句</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">优点：可跨版本、可挑表/挑库</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">优点：人类可读、易审计</text>
      <text x="14" y="82" font-size="7.5" fill="#e5484d">缺点：慢（大库几小时）</text>
      <text x="14" y="94" font-size="7.5" fill="#e5484d">缺点：恢复更慢（要重放 SQL）</text>

      <rect x="174" y="20" width="160" height="86" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">物理备份（xtrabackup 等）</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">直接拷数据文件</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">优点：快（可增量、可并行）</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">优点：恢复快（拷回即用）</text>
      <text x="182" y="82" font-size="7.5" fill="#e5484d">缺点：绑版本/平台</text>
      <text x="182" y="94" font-size="7.5" fill="#e5484d">缺点：不能只恢复单表（多数情况）</text>

      <!-- 为什么不能只用逻辑 -->
      <rect x="6" y="116" width="328" height="50" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="129" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">为什么逻辑备份不能是唯一方案</text>
      <text x="14" y="142" font-size="7.5" fill="var(--fig-text)">① 大库导出与恢复都以小时计 → RTO 目标达不到（业务已中断太久）</text>
      <text x="14" y="154" font-size="7.5" fill="var(--fig-text)">② 高峰期导出会拖慢生产库（锁与 IO）</text>
      <text x="14" y="166" font-size="7" fill="var(--fig-node-c)">③ 只覆盖「导出那一刻」，配合 binlog 才能做时间点恢复</text>

      <rect x="6" y="176" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="189" font-size="8" font-weight="700" fill="var(--fig-node-d)">生产的标准组合</text>
      <text x="14" y="201" font-size="7.5" fill="var(--fig-text)">每周物理全量 + 每日增量 + binlog 持续归档 → 支持任意时间点恢复</text>

      <rect x="6" y="218" width="328" height="20" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="232" font-size="7.5" fill="var(--fig-text)">别忘了验证：定期真恢复一次，记录耗时（这才是实测 RTO）</text>

      <text x="6" y="248" font-size="7.5" fill="var(--fig-muted)">选择依据：先定 RTO/RPO 数字，再倒推备份方式与频率</text>
    </svg>
    <figcaption>逻辑备份可跨版本可挑表但慢、恢复更慢；物理备份快但绑版本。生产用「物理全量 + 增量 + binlog」组合</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
