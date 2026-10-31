<script setup>
/**
 * 云上容灾：RTO/RPO 目标与成本（题 3405）。
 *
 * 核心洞察：容灾方案按「冷/温/热/双活」递进，成本与恢复速度成正比；
 * 先定 RTO/RPO 数字，再选最便宜能达标的方案。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 248" role="img" aria-label="容灾四档：冷备、温备、热备、双活，成本递增而 RTO 递减">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">四档方案：成本与恢复速度成正比 —— 先定 RTO/RPO 再选最便宜达标的</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① 冷备：只备份数据</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">RTO 数小时~天级，成本最低；出事要从零搭环境再恢复数据</text>

      <rect x="6" y="54" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="67" font-size="8" font-weight="700" fill="var(--fig-node-b)">② 温备：环境就绪、数据定期同步</text>
      <text x="14" y="79" font-size="7.5" fill="var(--fig-text)">RTO 小时级；机器/配置已备好，拉起即用（数据可能落后）</text>

      <rect x="6" y="88" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="101" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ 热备：实时同步、随时可切</text>
      <text x="14" y="113" font-size="7.5" fill="var(--fig-text)">RTO 分钟级；持续复制但要切换动作（DNS/流量切换）</text>

      <rect x="6" y="122" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="135" font-size="8" font-weight="700" fill="var(--fig-node-d)">④ 双活：两地同时承载</text>
      <text x="14" y="147" font-size="7.5" fill="var(--fig-text)">RTO 接近 0，成本最高；要解决数据双向同步与写冲突</text>

      <!-- 怎么定目标 -->
      <rect x="6" y="158" width="328" height="48" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="171" font-size="8.5" font-weight="700" fill="#e5484d">RTO/RPO 怎么定（按业务分级）</text>
      <text x="14" y="184" font-size="7.5" fill="var(--fig-text)">按「业务停 1 小时损失多大」定 RTO；按「能丢多少数据」定 RPO</text>
      <text x="14" y="196" font-size="7.5" fill="var(--fig-text)">核心交易（RPO≈0、RTO 分钟级）与内部系统（RTO 天级）不该用同一档</text>
      <text x="14" y="208" font-size="7" fill="var(--fig-node-c)">别给所有业务都上双活 —— 成本会翻好几倍</text>

      <rect x="6" y="214" width="328" height="18" rx="3" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="227" font-size="7.5" fill="var(--fig-text)">验证：定期真切换演练，实测 RTO（不演练等于没有容灾）</text>

      <text x="6" y="240" font-size="7.5" fill="var(--fig-muted)">成本大头常在「跨地域带宽」与「实时复制」上，而不是机器本身</text>
    </svg>
    <figcaption>冷备→温备→热备→双活，成本递增、RTO 递减；按业务分级定目标，核心交易与内部系统不该用同一档</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
