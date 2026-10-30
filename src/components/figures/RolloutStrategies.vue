<script setup>
/**
 * 三种发布策略对比：滚动、蓝绿、金丝雀（题 4800 相关）。
 *
 * 核心洞察：三者的差别在「新版本占多少流量」与「怎么回滚」——
 * 滚动只省资源，蓝绿切换快，金丝雀最小化风险但需要观测能力。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 286" role="img" aria-label="滚动发布、蓝绿发布、金丝雀发布三种策略的流量占比、回滚方式与适用场景对比">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">差别在「新版本占多少流量」与「怎么回滚」</text>

      <rect x="6" y="20" width="328" height="62" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="34" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① 滚动发布 Rolling</text>
      <text x="14" y="47" font-size="7.5" fill="var(--fig-text)">逐个替换实例，新版本逐渐占满流量（中间是新旧混合）</text>
      <text x="14" y="59" font-size="7.5" fill="var(--fig-text)">回滚：反向再滚一次（较慢，且中间态混合）</text>
      <text x="14" y="73" font-size="7.5" fill="var(--fig-node-c)">优点：省资源　风险：故障会随替换逐步扩大</text>

      <rect x="6" y="90" width="328" height="62" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="104" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">② 蓝绿 Blue-Green</text>
      <text x="14" y="117" font-size="7.5" fill="var(--fig-text)">两套完整环境并存，流量整体切到新环境（0% → 100%）</text>
      <text x="14" y="129" font-size="7.5" fill="var(--fig-text)">回滚：切回旧环境，秒级（旧环境还活着）</text>
      <text x="14" y="141" font-size="7.5" fill="var(--fig-node-c)">代价：双倍资源；切换是「瞬间全量」，风险集中在一个时刻</text>

      <rect x="6" y="160" width="328" height="62" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="174" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">③ 金丝雀 Canary</text>
      <text x="14" y="187" font-size="7.5" fill="var(--fig-text)">先给新版本 1%~5% 流量，观察指标再逐步扩大</text>
      <text x="14" y="199" font-size="7.5" fill="var(--fig-text)">回滚：把流量调回 0，秒级</text>
      <text x="14" y="211" font-size="7.5" fill="var(--fig-node-c)">前提：有按版本分组的指标与自动判定（否则等于没灰度）</text>

      <rect x="6" y="230" width="328" height="34" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="243" font-size="8" font-weight="700" fill="var(--fig-node-d)">怎么选</text>
      <text x="14" y="256" font-size="7.5" fill="var(--fig-text)">资源紧 → 滚动；切换要快且可秒回 → 蓝绿；风险最小化 → 金丝雀（最推荐）</text>

      <text x="6" y="280" font-size="7.5" fill="var(--fig-muted)">易混点：滚动 ≠ 灰度。滚动只是逐个替换，很快全员新版本，没有观察窗口</text>
    </svg>
    <figcaption>滚动省资源但风险逐步扩大、蓝绿可秒回但吃双倍资源、金丝雀风险最小但必须有按版本观测能力</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
