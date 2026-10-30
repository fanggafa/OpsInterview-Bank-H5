<script setup>
/**
 * 「单主库如何做同城双活」的分阶段演进图。
 *
 * 对应题 5417。核心洞察：应用双活容易，**数据双活受单主库限制**；
 * 所以要分成「应用双活 + 读分流 → 写切换预案 → 数据双活」三步走。
 *
 * 画布 340 宽，文字须控制在列内（npm run check:figures 校验）。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 268" role="img" aria-label="单主库做同城双活的三阶段演进：应用双活与读分流、写切换预案、数据双活">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">单主库是唯一写入点 → 双活必须分阶段，不能一步到位</text>

      <!-- 两个层次 -->
      <rect x="6" y="20" width="160" height="34" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">应用双活</text>
      <text x="14" y="45" font-size="8" fill="var(--fig-text)">两机房都跑应用、都能接流量</text>
      <text x="14" y="55" font-size="8" fill="var(--fig-node-c)">单主库可以支持 ✓</text>

      <rect x="174" y="20" width="160" height="34" rx="5" fill="#e5484d" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="#e5484d">数据双活</text>
      <text x="182" y="45" font-size="8" fill="var(--fig-text)">两机房都能读写</text>
      <text x="182" y="55" font-size="8" fill="#e5484d">需改造单主库 ✗</text>

      <!-- 阶段1 -->
      <rect x="6" y="62" width="328" height="54" rx="6" fill="var(--fig-node-b)" opacity=".08" />
      <text x="14" y="76" font-size="9" font-weight="700" fill="var(--fig-node-b)">阶段 1：应用双活 + 读分流（最容易、收益最大）</text>
      <text x="14" y="89" font-size="8" fill="var(--fig-text)">机房 A：应用集群 + 主库　　机房 B：应用集群 + 从库（只读）</text>
      <text x="14" y="101" font-size="8" fill="var(--fig-text)">读请求走本机房从库，写请求回 A 机房主库</text>
      <text x="14" y="113" font-size="8" fill="var(--fig-node-c)">要点：读写分离 + 延迟容忍度评估（延迟大时读回主）</text>

      <!-- 阶段2 -->
      <rect x="6" y="122" width="328" height="54" rx="6" fill="var(--fig-node-c)" opacity=".08" />
      <text x="14" y="136" font-size="9" font-weight="700" fill="var(--fig-node-c)">阶段 2：写切换预案（把「A 挂了怎么办」变成可执行）</text>
      <text x="14" y="149" font-size="8" fill="var(--fig-text)">主库故障 → 提升 B 机房从库为主，应用写切到 B</text>
      <text x="14" y="161" font-size="8" fill="var(--fig-text)">要点：切换前校验复制位置（防丢数据）+ 防脑裂</text>
      <text x="14" y="173" font-size="8" fill="var(--fig-node-c)">演练：每季度真切换一次，记录 RTO 与数据差</text>

      <!-- 阶段3 -->
      <rect x="6" y="182" width="328" height="54" rx="6" fill="var(--fig-node-d)" opacity=".08" />
      <text x="14" y="196" font-size="9" font-weight="700" fill="var(--fig-node-d)">阶段 3：数据双活（改造单主库）</text>
      <text x="14" y="209" font-size="8" fill="var(--fig-text)">方案：主主同步（有冲突）/ 单元化分片（按用户切）/ 分布式库</text>
      <text x="14" y="221" font-size="8" fill="var(--fig-text)">代价：一致性模型变了，业务要改造「写冲突」处理</text>
      <text x="14" y="233" font-size="8" fill="var(--fig-node-c)">前提：阶段 1、2 已稳定运行，否则不要跳步</text>

      <text x="6" y="255" font-size="8" fill="var(--fig-muted)">顺序不能颠倒：先做「读分摊」，再做「写接管」，最后才「两边都写」</text>
    </svg>
    <figcaption>单主库做双活的正确路径是「读分流 → 写接管 → 双写」，跳步会把数据一致性搞坏</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
