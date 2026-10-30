<script setup>
/**
 * SLI / SLO / SLA 与错误预算（题 59）。
 *
 * 核心洞察：三者是「度量 → 内部目标 → 对外承诺」的递进；
 * 错误预算把「稳定性 vs 变更速度」变成可计算的数字，而不是口号。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 250" role="img" aria-label="SLI 是度量、SLO 是内部目标、SLA 是对外承诺；错误预算决定能不能继续发布">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">度量 → 内部目标 → 对外承诺；错误预算让「稳 vs 快」可计算</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">SLI（Indicator）：怎么算</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">如「5 分钟内 HTTP 2xx 占比」——口径必须明确（分母含不含探针）</text>

      <rect x="6" y="58" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="71" font-size="8" font-weight="700" fill="var(--fig-node-b)">SLO（Objective）：要多好</text>
      <text x="14" y="84" font-size="7.5" fill="var(--fig-text)">如「可用性 99.9%/月」——内部目标，通常比 SLA 更严格</text>

      <rect x="6" y="96" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="109" font-size="8" font-weight="700" fill="var(--fig-node-c)">SLA（Agreement）：不达标怎么办</text>
      <text x="14" y="122" font-size="7.5" fill="var(--fig-text)">对外合同，含赔付条款；一般设得比 SLO 宽松，留缓冲</text>

      <!-- 错误预算 -->
      <rect x="6" y="138" width="328" height="52" rx="5" fill="#e5484d" opacity=".12" />
      <text x="14" y="151" font-size="8.5" font-weight="700" fill="#e5484d">错误预算（Error Budget）</text>
      <text x="14" y="164" font-size="7.5" fill="var(--fig-text)">SLO 99.9% → 每月可「坏」约 43 分钟（预算）</text>
      <text x="14" y="176" font-size="7.5" fill="var(--fig-text)">预算剩余多 → 可冒险发布；快耗尽 → 冻结变更、优先稳定</text>

      <rect x="6" y="198" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="211" font-size="8" font-weight="700" fill="var(--fig-node-d)">实践要点</text>
      <text x="14" y="224" font-size="7.5" fill="var(--fig-text)">SLO 不要定 100%（意味着零变更）；按业务分级，不同服务不同目标</text>

      <text x="6" y="246" font-size="7.5" fill="var(--fig-muted)">常见误用：只对外承诺 SLA，内部没有 SLO 与预算 → 出问题才发现没有预警</text>
    </svg>
    <figcaption>SLI 是度量、SLO 是内部目标、SLA 是对外合同；错误预算把稳定性与发布速度的取舍量化成可用分钟数</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
