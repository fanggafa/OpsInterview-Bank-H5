<script setup>
/**
 * 「备份 vs 容灾」与 RTO/RPO（题 2430）。
 *
 * 核心洞察：备份解决「数据能回来」，容灾解决「业务能继续」；
 * RPO 决定能丢多少数据（备份频率），RTO 决定多久恢复（架构与演练）。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 260" role="img" aria-label="备份保证数据可恢复、容灾保证业务可继续；RPO 决定丢多少数据，RTO 决定多久恢复">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">备份管「数据回来」，容灾管「业务继续」——两件事不能互相替代</text>

      <rect x="6" y="20" width="160" height="66" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">备份 Backup</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">独立副本，防误删/损坏</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">恢复通常慢（小时级）</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">成本低，可长期保留</text>
      <text x="14" y="82" font-size="7.5" fill="var(--fig-node-c)">重点是「数据完整性」</text>

      <rect x="174" y="20" width="160" height="66" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">容灾 DR</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">备用环境，接管业务</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">切换快（秒~分钟级）</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">成本高，需持续同步</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-node-c)">重点是「可用性」</text>

      <!-- RPO / RTO -->
      <rect x="6" y="94" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="107" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">RPO（能丢多少数据）</text>
      <text x="14" y="120" font-size="7.5" fill="var(--fig-text)">决定备份/复制频率：RPO 5 分钟 → 至少每 5 分钟同步一次</text>
      <text x="14" y="132" font-size="7.5" fill="var(--fig-text)">RPO=0 需要同步复制或多写，代价是延迟</text>

      <rect x="6" y="148" width="328" height="46" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="161" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">RTO（多久能恢复）</text>
      <text x="14" y="174" font-size="7.5" fill="var(--fig-text)">决定恢复手段：热备秒级、冷备 + 备份恢复可能数小时</text>
      <text x="14" y="186" font-size="7.5" fill="var(--fig-text)">RTO 最容易被高估 —— 必须靠演练实测，而不是估算</text>

      <rect x="6" y="204" width="328" height="34" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="217" font-size="8" font-weight="700" fill="#e5484d">常见误区</text>
      <text x="14" y="230" font-size="7.5" fill="var(--fig-text)">「有备份就等于有容灾」——备份恢复几小时，业务早就停了</text>

      <text x="6" y="250" font-size="7.5" fill="var(--fig-muted)">正确做法：先定 RTO/RPO 数字，再选方案；两件都要做，且都要演练</text>
    </svg>
    <figcaption>备份保证数据可恢复（慢但便宜）、容灾保证业务可继续（快但贵）；RPO 管丢多少、RTO 管多久恢复</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
