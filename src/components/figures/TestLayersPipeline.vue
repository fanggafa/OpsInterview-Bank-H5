<script setup>
/**
 * 自动化测试在流水线里的分层（题 4817）。
 *
 * 核心洞察：金字塔=底层多且快、顶层少且慢；
 * 流水线按「越早失败越便宜」的安排，把慢测试放在最后。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 248" role="img" aria-label="测试分层与流水线安排：单元测试多且快、集成测试居中、端到端少且慢，按由快到慢顺序执行">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">越底层越多越快、越顶层越少越慢 —— 流水线按「越早失败越便宜」排</text>

      <rect x="66" y="20" width="208" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="74" y="37" font-size="7.5" fill="var(--fig-text)">端到端 E2E：少、慢、脆；只覆盖关键链路</text>

      <rect x="42" y="50" width="256" height="26" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="50" y="67" font-size="7.5" fill="var(--fig-text)">集成测试：验证模块协作（DB/HTTP/MQ）</text>

      <rect x="18" y="80" width="304" height="26" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="26" y="97" font-size="7.5" fill="var(--fig-text)">单元测试：最多、最快、最便宜，应占绝大多数</text>

      <!-- 流水线 -->
      <rect x="6" y="116" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="129" font-size="8" font-weight="700" fill="var(--fig-node-d)">流水线顺序</text>
      <text x="14" y="141" font-size="7.5" fill="var(--fig-text)">lint → 单元（分钟级）→ 集成（十分钟级）→ E2E（更久，只在大分支/合并前跑）</text>

      <rect x="6" y="156" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="169" font-size="8.5" font-weight="700" fill="#e5484d">为什么不能只靠端到端测试</text>
      <text x="14" y="182" font-size="7.5" fill="var(--fig-text)">① 慢：反馈周期长，开发者会绕开它　② 脆：环境/网络/时序不稳 → 假失败多</text>
      <text x="14" y="194" font-size="7.5" fill="var(--fig-text)">③ 定位难：失败了不知道是哪个模块的问题</text>

      <rect x="6" y="208" width="328" height="20" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="222" font-size="7.5" fill="var(--fig-text)">不变式：PR 阶段必须几分钟内给出结果，否则大家会跳过等 CI</text>

      <text x="6" y="240" font-size="7.5" fill="var(--fig-muted)">实践：E2E 用隔离环境+固定数据，失败要有清晰截图/日志，避免「重跑就好」</text>
    </svg>
    <figcaption>单元测试占多数且最快、集成居中、E2E 少而慢；流水线按 lint→单元→集成→E2E 排，PR 阶段必须几分钟出结果</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
