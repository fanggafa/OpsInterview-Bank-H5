<script setup>
/**
 * 从自建机房迁移上云的规划（题 5411）。
 *
 * 核心洞察：上云不是「搬机器」，而是分层迁移 ——
 * 先摸清资产与依赖，再按「无状态 → 有状态 → 核心」的节奏推进。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 234" role="img" aria-label="上云迁移四阶段：资产盘点、选型与试点、分批迁移、切换与优化">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">不是搬机器，是分层推进 —— 先摸清资产，再按风险分批</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① 资产与依赖盘点</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">业务清单、调用关系、数据量、特殊依赖（硬件加密卡/特殊网络/老系统）</text>

      <rect x="6" y="54" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="67" font-size="8" font-weight="700" fill="var(--fig-node-b)">② 选型与试点</text>
      <text x="14" y="79" font-size="7.5" fill="var(--fig-text)">IaaS 还是 PaaS（见另一题）；选 1 个边缘无状态服务试点，摸清网络与运维差异</text>

      <rect x="6" y="88" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="101" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ 分批迁移（按风险递增）</text>
      <text x="14" y="113" font-size="7.5" fill="var(--fig-text)">无状态服务 → 有状态（DB/缓存/MQ）→ 核心交易；每批都要可回退</text>

      <rect x="6" y="122" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="135" font-size="8" font-weight="700" fill="var(--fig-node-d)">④ 切换与优化</text>
      <text x="14" y="147" font-size="7.5" fill="var(--fig-text)">灰度切流量、双跑对比、再下线老机房；之后才是成本与架构优化</text>

      <!-- 关键点 -->
      <rect x="6" y="160" width="328" height="50" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="173" font-size="8.5" font-weight="700" fill="#e5484d">四个最容易翻车的地方</text>
      <text x="14" y="186" font-size="7.5" fill="var(--fig-text)">① 网络（安全组/VPC/跨区延迟）② 数据（一致性与回退窗口）</text>
      <text x="14" y="198" font-size="7.5" fill="var(--fig-text)">③ 带宽成本（跨区流量往往最贵）④ 老系统无人维护、依赖不明</text>

      <rect x="6" y="218" width="328" height="16" rx="3" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="230" font-size="7.5" fill="var(--fig-text)">验收：迁移后监控、备份、审计、权限全部接上，而不是「能跑就行」</text>
    </svg>
    <figcaption>四阶段：资产依赖盘点、选型与试点、按风险分批迁移（无状态→有状态→核心）、灰度切换再优化；易翻车在网络/数据/带宽/老系统</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
