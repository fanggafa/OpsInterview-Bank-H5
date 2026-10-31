<script setup>
/**
 * 私有化部署 AI 应用的数据安全四层（题 5822）。
 *
 * 核心洞察：私有化只解决「数据能不能出域」，模型在本机不等于安全；
 * 真正的事故多来自「内部人导出」与「向量库/缓存里存着原文」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 272" role="img" aria-label="私有化 AI 的数据边界、访问控制、脱敏审查、审计追踪四层防护">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">私有化 ≠ 安全：模型在本机，数据仍要四层防护</text>

      <rect x="6" y="18" width="328" height="42" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="32" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① 数据边界：不出域</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">训练/推理数据留在内网；禁止模型外呼公网 API</text>
      <text x="14" y="55" font-size="7.5" fill="var(--fig-text)">模型权重、向量库、日志都在本地，备份也不出内网</text>

      <rect x="6" y="68" width="328" height="42" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="82" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">② 访问控制：谁能问什么</text>
      <text x="14" y="95" font-size="7.5" fill="var(--fig-text)">账号 + RBAC；按部门/密级隔离知识库与向量库</text>
      <text x="14" y="105" font-size="7.5" fill="var(--fig-text)">应用级身份而非个人密钥，离职即失效</text>

      <rect x="6" y="118" width="328" height="44" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="132" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">③ 内容脱敏与审查</text>
      <text x="14" y="145" font-size="7.5" fill="var(--fig-text)">入模前脱敏（身份证/手机号/密钥），出模后审内容</text>
      <text x="14" y="156" font-size="7.5" fill="var(--fig-text)">多租户必须按租户隔离向量库，否则检索会串数据</text>

      <rect x="6" y="170" width="328" height="42" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="184" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">④ 审计与追踪</text>
      <text x="14" y="197" font-size="7.5" fill="var(--fig-text)">谁问了什么、答了什么、检索了哪些片段，全量留痕</text>
      <text x="14" y="207" font-size="7.5" fill="var(--fig-text)">日志防篡改；出事能回放，定位泄露从哪一步发生</text>

      <rect x="6" y="220" width="328" height="38" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="234" font-size="7.5" fill="var(--fig-text)">最易漏：向量库/缓存存的是原文，脱敏常只做在日志</text>
      <text x="14" y="246" font-size="7.5" fill="var(--fig-text)">最大的风险往往来自「内部人导出」，不是外部攻击</text>
    </svg>
    <figcaption>私有化只覆盖「不出域」，还需访问控制、内容脱敏审查与全量审计，并把向量库当敏感数据对待</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
