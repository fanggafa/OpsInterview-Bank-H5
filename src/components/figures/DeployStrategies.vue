<script setup>
/**
 * CI/CD 发布策略对比图（滚动 / 蓝绿 / 灰度）。
 * 用「实例方块」直观展示三种策略在发布过程中的状态差异，
 * 并标出各自的「回滚成本」与「资源代价」——这是选型的关键。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 250" role="img" aria-label="滚动、蓝绿、灰度三种发布策略的过程与回滚成本对比">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">蓝=旧版本，橙=新版本；看「发布过程中有多少用户会碰到新版本」</text>

      <!-- 滚动 -->
      <text x="6" y="30" font-size="9.5" font-weight="700" fill="var(--fig-node-a)">① 滚动发布（Rolling）</text>
      <g>
        <rect x="6" y="36" width="26" height="16" rx="3" fill="var(--fig-node-a)" opacity=".8" />
        <rect x="36" y="36" width="26" height="16" rx="3" fill="var(--fig-node-a)" opacity=".8" />
        <rect x="66" y="36" width="26" height="16" rx="3" fill="var(--fig-node-d)" opacity=".9" />
        <rect x="96" y="36" width="26" height="16" rx="3" fill="var(--fig-node-a)" opacity=".8" />
        <text x="130" y="48" font-size="8" fill="var(--fig-muted)">逐批替换 → 新旧短暂共存</text>
      </g>
      <text x="6" y="66" font-size="8" fill="var(--fig-node-c)">✓ 资源省（不需双份）　✗ 回滚要再滚一遍（慢）</text>

      <!-- 蓝绿 -->
      <text x="6" y="86" font-size="9.5" font-weight="700" fill="var(--fig-node-b)">② 蓝绿发布（Blue-Green）</text>
      <g>
        <rect x="6" y="92" width="22" height="16" rx="3" fill="var(--fig-node-a)" opacity=".8" />
        <rect x="32" y="92" width="22" height="16" rx="3" fill="var(--fig-node-a)" opacity=".8" />
        <rect x="58" y="92" width="22" height="16" rx="3" fill="var(--fig-node-a)" opacity=".8" />
        <text x="86" y="104" font-size="8" fill="var(--fig-node-a)">蓝（旧，全量）</text>
        <rect x="152" y="92" width="22" height="16" rx="3" fill="var(--fig-node-d)" opacity=".9" />
        <rect x="178" y="92" width="22" height="16" rx="3" fill="var(--fig-node-d)" opacity=".9" />
        <rect x="204" y="92" width="22" height="16" rx="3" fill="var(--fig-node-d)" opacity=".9" />
        <text x="232" y="104" font-size="8" fill="var(--fig-node-d)">绿（新，待切）</text>
      </g>
      <text x="6" y="122" font-size="8" fill="var(--fig-node-c)">✓ 切换/回滚都是秒级（切流量即可）　✗ 需要双倍资源</text>

      <!-- 灰度 -->
      <text x="6" y="142" font-size="9.5" font-weight="700" fill="var(--fig-node-d)">③ 灰度 / 金丝雀（Canary）</text>
      <g>
        <rect x="6" y="148" width="22" height="16" rx="3" fill="var(--fig-node-a)" opacity=".8" />
        <rect x="32" y="148" width="22" height="16" rx="3" fill="var(--fig-node-a)" opacity=".8" />
        <rect x="58" y="148" width="22" height="16" rx="3" fill="var(--fig-node-a)" opacity=".8" />
        <rect x="84" y="148" width="22" height="16" rx="3" fill="var(--fig-node-a)" opacity=".8" />
        <rect x="110" y="148" width="22" height="16" rx="3" fill="var(--fig-node-d)" opacity=".9" />
        <text x="140" y="160" font-size="8" fill="var(--fig-node-d)">只有约 1/5 流量打新版本</text>
      </g>
      <text x="6" y="178" font-size="8" fill="var(--fig-node-c)">✓ 影响面最小，能提前发现问题　✗ 需要按维度分流能力</text>

      <!-- 对比表 -->
      <rect x="6" y="188" width="328" height="46" rx="7" fill="var(--fig-node-a)" opacity=".09" />
      <text x="16" y="202" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">怎么选</text>
      <text x="16" y="215" font-size="8" fill="var(--fig-text)">资源紧 → 滚动｜需秒级回滚 → 蓝绿</text>
      <text x="16" y="227" font-size="8" fill="var(--fig-text)">风险高/不确定 → 灰度（最常见：灰度渐进到全量）</text>
      <text x="16" y="239" font-size="8" fill="var(--fig-muted)">K8s 的 RollingUpdate 属于①</text>
    </svg>
    <figcaption>三种策略的本质区别是「回滚要多快」与「愿意花多少资源」——不是「哪个更先进」</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
