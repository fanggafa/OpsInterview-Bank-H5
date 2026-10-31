<script setup>
/**
 * 未来 3 年架构演进规划的写法（题 5421）。
 *
 * 核心洞察：演进规划不是「画出理想架构」，而是「以业务目标为锚，
 * 分阶段定目标、留演进接口、给出可验证的里程碑」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 232" role="img" aria-label="架构演进规划四步：业务目标锚定、现状与差距、分阶段路线、验证指标">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">不是画理想架构，而是「业务目标 → 差距 → 分阶段 → 可验证」</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① 业务目标锚定（最重要）</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">业务三年要做什么（扩品类？出海？大促？合规要求）→ 决定架构方向</text>

      <rect x="6" y="54" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="67" font-size="8" font-weight="700" fill="var(--fig-node-b)">② 现状盘点与差距</text>
      <text x="14" y="79" font-size="7.5" fill="var(--fig-text)">当前架构的痛点（慢在哪、贵在哪、哪不稳定）+ 与目标的差距清单</text>

      <rect x="6" y="88" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="101" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ 分阶段路线（每年一个主题）</text>
      <text x="14" y="113" font-size="7.5" fill="var(--fig-text)">第一年打基础（可观测/自动化）、第二年做弹性与解耦、第三年做多活与成本</text>

      <rect x="6" y="122" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="135" font-size="8" font-weight="700" fill="var(--fig-node-d)">④ 里程碑与验证指标</text>
      <text x="14" y="147" font-size="7.5" fill="var(--fig-text)">每年给出「可验证的结果」：发布频率、MTTR、单机成本、峰值承载能力</text>

      <!-- 原则 -->
      <rect x="6" y="160" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="173" font-size="8.5" font-weight="700" fill="#e5484d">写规划的三条原则</text>
      <text x="14" y="186" font-size="7.5" fill="var(--fig-text)">① 演进而非重写：每步都要能上线、可回退　② 留接口：为未来预留扩展点</text>
      <text x="14" y="198" font-size="7.5" fill="var(--fig-text)">③ 不追新：选团队能维护的技术，而不是最新最热</text>

      <rect x="6" y="214" width="328" height="16" rx="3" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="227" font-size="7.5" fill="var(--fig-text)">反面案例：一上来写「全部微服务 + 双活」，但没人力维护 → 半途而废</text>

      <text x="6" y="230" font-size="7.5" fill="var(--fig-muted)"> </text>
    </svg>
    <figcaption>四步：业务目标锚定、现状与差距、每年一个主题的分阶段路线、可验证里程碑；演进而非重写，不追新</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
