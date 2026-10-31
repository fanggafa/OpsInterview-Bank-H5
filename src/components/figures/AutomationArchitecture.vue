<script setup>
/**
 * 大规模自动化架构的设计（题 3220）。
 *
 * 核心洞察：规模上来后要分层 —— 主机分组、角色化、配置与代码分离，
 * 再加执行层（串行/并发控制）与状态记录，否则 playbook 会变成一团乱麻。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 252" role="img" aria-label="大规模自动化架构五层：资产与分组、角色化、配置分层、执行控制、状态与审计">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">规模上来后靠「分层」而不是靠写更多 playbook</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① 资产与分组（inventory）</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">按「环境 → 角色 → 机房/可用区」多维分组，而不是一张平铺清单</text>

      <rect x="6" y="54" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="67" font-size="8" font-weight="700" fill="var(--fig-node-b)">② 角色化（role）</text>
      <text x="14" y="79" font-size="7.5" fill="var(--fig-text)">把「nginx / java / 监控 agent」拆成可复用 role，20 个服务=组合 role</text>

      <rect x="6" y="88" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="101" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ 配置分层（变量优先级）</text>
      <text x="14" y="113" font-size="7.5" fill="var(--fig-text)">全局默认 &lt; 组变量 &lt; 主机变量；差异只在最细一层写</text>

      <rect x="6" y="122" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="135" font-size="8" font-weight="700" fill="var(--fig-node-d)">④ 执行控制</text>
      <text x="14" y="147" font-size="7.5" fill="var(--fig-text)">分批并发（serial）+ 失败比例（max_fail_percentage）避免一波全挂</text>

      <rect x="6" y="156" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="169" font-size="8" font-weight="700" fill="var(--fig-node-a)">⑤ 状态与审计</text>
      <text x="14" y="181" font-size="7.5" fill="var(--fig-text)">谁在何时改了哪台机器（日志/审计）；配置纳入 Git 版本管理</text>

      <!-- 推进 -->
      <rect x="6" y="192" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="205" font-size="8" font-weight="700" fill="var(--fig-node-b)">落地节奏</text>
      <text x="14" y="217" font-size="7.5" fill="var(--fig-text)">先抽 1 个服务写成 role → 再抽公共部分 → 最后统一 inventory 与变量分层</text>

      <rect x="6" y="230" width="328" height="20" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="244" font-size="7.5" fill="var(--fig-text)">反模式：20 个服务写 20 个巨型 playbook —— 改一处要改 20 处</text>
    </svg>
    <figcaption>五层：inventory 多维分组、role 复用、变量分层、分批并发控制、状态与审计；先抽一个服务试点再统一</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
