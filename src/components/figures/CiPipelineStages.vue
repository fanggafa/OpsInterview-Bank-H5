<script setup>
/**
 * CI/CD 流水线的阶段与质量门禁（题 4803 / 48）。
 *
 * 核心洞察：流水线的价值不只是「自动化」，而是「每个阶段都有准入条件」——
 * 门禁在前，问题就不会流到生产；同时要保证反馈足够快。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 294" role="img" aria-label="CI/CD 流水线阶段：提交校验、单元测试、构建、扫描、部署预发、集成测试、审批、生产发布，各阶段有准入条件">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">自动化只是手段，真正的价值是「每道门禁都把问题挡在前面」</text>

      <rect x="6" y="20" width="328" height="20" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="34" font-size="7.5" font-weight="700" fill="var(--fig-node-a)">快速反馈区（提交后 5~10 分钟内出结果）</text>

      <rect x="6" y="44" width="328" height="22" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="59" font-size="7.5" fill="var(--fig-text)">① 静态检查：lint / 格式 / 编码检查（门禁：零告警）</text>

      <rect x="6" y="70" width="328" height="22" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="85" font-size="7.5" fill="var(--fig-text)">② 单元测试：快、隔离（门禁：全绿 + 覆盖率不下降）</text>

      <rect x="6" y="96" width="328" height="22" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="111" font-size="7.5" fill="var(--fig-text)">③ 构建制品：镜像/包（门禁：可复现、固定 digest、记录 commit SHA）</text>

      <rect x="6" y="122" width="328" height="22" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="137" font-size="7.5" fill="var(--fig-text)">④ 安全扫描：SAST / 依赖漏洞 / 镜像漏洞（门禁：高危为零）</text>

      <rect x="6" y="148" width="328" height="20" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="162" font-size="7.5" font-weight="700" fill="var(--fig-node-d)">验证区（部署到预发，验证真实依赖）</text>

      <rect x="6" y="172" width="328" height="22" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="187" font-size="7.5" fill="var(--fig-text)">⑤ 部署预发 + 集成测试：连真实 DB/缓存/消息（门禁：冒烟通过）</text>

      <rect x="6" y="198" width="328" height="22" rx="4" fill="var(--fig-node-d)" opacity=".08" />
      <text x="14" y="213" font-size="7.5" fill="var(--fig-text)">⑥ E2E / 回归：覆盖关键路径（门禁：核心用例通过，控制 flaky）</text>

      <rect x="6" y="224" width="328" height="20" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="238" font-size="7.5" font-weight="700" fill="var(--fig-node-a)">发布区</text>

      <rect x="6" y="248" width="328" height="22" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="263" font-size="7.5" fill="var(--fig-text)">⑦ 审批 + 灰度发布（门禁：审批通过、灰度指标正常）→ 全量</text>

      <text x="6" y="286" font-size="7.5" fill="var(--fig-muted)">关键设计：可追溯（镜像 digest + commit）、可回滚（换 tag 而非重建）、失败即阻断</text>
    </svg>
    <figcaption>流水线的核心是「每道门禁都把问题挡在前面」，且反馈要快；制品必须可追溯、可回滚</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
