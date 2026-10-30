<script setup>
/**
 * 告警疲劳治理图。
 *
 * 对应题 5418。核心洞察：告警疲劳比没有告警更危险（真故障被淹没）；
 * 治理必须先量化，再把告警分成「通知类/抖动类/重复类/无效类」分别处理。
 *
 * 画布 340 宽，文字须控制在列内（npm run check:figures 校验）。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 290" role="img" aria-label="告警疲劳治理：先量化现状，再把告警分为通知类、抖动类、重复类、无效类四类分别处理">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">告警疲劳比没有告警更危险——真故障会被噪音淹没</text>

      <rect x="6" y="20" width="328" height="46" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① 先量化（凭感觉治理一定失败）</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">每天告警总数 · Top 10 规则贡献占比 · 无人处理比例 · 误报率</text>
      <text x="14" y="57" font-size="7.5" font-weight="700" fill="var(--fig-node-c)">经验值：通常 5~10 条规则贡献了 80% 的告警量</text>

      <text x="6" y="82" font-size="9.5" font-weight="700" fill="var(--fig-text)">② 四类告警分别处理（不同病不同药）</text>

      <rect x="6" y="90" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="102" font-size="8" font-weight="700" fill="var(--fig-node-b)">通知类：不需要行动</text>
      <text x="14" y="114" font-size="7.5" fill="var(--fig-text)">如「部署完成」「备份成功」→ 移出告警，改成看板或日志</text>

      <rect x="6" y="124" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="136" font-size="8" font-weight="700" fill="var(--fig-node-c)">抖动类：反复触发又自动恢复</text>
      <text x="14" y="148" font-size="7.5" fill="var(--fig-text)">加 for（持续 N 分钟才报）· 调阈值 · 加抑制</text>

      <rect x="6" y="158" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="170" font-size="8" font-weight="700" fill="var(--fig-node-d)">重复类：同一故障触发多条</text>
      <text x="14" y="182" font-size="7.5" fill="var(--fig-text)">分组 group_by（按服务聚合）· 抑制 inhibit（根因抑制下游）</text>

      <rect x="6" y="192" width="328" height="30" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="204" font-size="8" font-weight="700" fill="#e5484d">无效类：阈值不合理（常年红或从不触发）</text>
      <text x="14" y="216" font-size="7.5" fill="var(--fig-text)">删除，或按「是否影响用户」重新校准基线</text>

      <rect x="6" y="228" width="328" height="42" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="241" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">③ 三条硬规则（防止反弹）</text>
      <text x="14" y="253" font-size="7.5" fill="var(--fig-text)">每条规则必须有负责人 + runbook + 「触发后做什么」</text>
      <text x="14" y="265" font-size="7.5" fill="var(--fig-text)">新增规则要评审；每月复盘 Top 告警来源，持续清理</text>

      <text x="6" y="282" font-size="7.5" fill="var(--fig-muted)">衡量目标：每人每周被无效告警打扰 < 1 次，且真故障零漏报</text>
    </svg>
    <figcaption>告警治理先量化再分类：通知类移出、抖动类加 for、重复类做聚合抑制、无效类删除或重校准</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
