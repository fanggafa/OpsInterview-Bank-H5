<script setup>
/**
 * metrics / logging / tracing 三者的区别与配合（题 58）。
 *
 * 核心洞察：三者回答不同问题 —— 指标告诉你「不对劲」，
 * 追踪告诉你「慢在哪一段」，日志告诉你「具体为什么」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 252" role="img" aria-label="metrics 看趋势与告警、tracing 定位环节、logging 看细节原因，三者配合使用">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">指标说「不对劲」，追踪说「慢在哪」，日志说「具体为什么」</text>

      <rect x="6" y="20" width="328" height="44" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">Metrics（指标）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">数值 + 标签，可聚合 → 趋势、告警、容量规划、SLO</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-node-c)">成本低、查询快；但不能记录「单次请求发生了什么」</text>

      <rect x="6" y="70" width="328" height="44" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="83" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">Tracing（链路追踪）</text>
      <text x="14" y="96" font-size="7.5" fill="var(--fig-text)">一次请求贯穿多服务的 span 树 → 每段耗时与调用关系</text>
      <text x="14" y="108" font-size="7.5" fill="var(--fig-node-c)">成本中（需采样）；解决「慢在哪个服务/哪一段」</text>

      <rect x="6" y="120" width="328" height="44" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="133" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">Logging（日志）</text>
      <text x="14" y="146" font-size="7.5" fill="var(--fig-text)">事件文本 + 上下文 → 具体参数、异常堆栈、业务细节</text>
      <text x="14" y="158" font-size="7.5" fill="var(--fig-node-c)">成本最高（量大）；不适合做趋势与高频告警</text>

      <!-- 配合 -->
      <rect x="6" y="176" width="328" height="42" rx="5" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="189" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">标准排查动线</text>
      <text x="14" y="202" font-size="7.5" fill="var(--fig-text)">指标发现异常（错误率上升）→ 追踪定位环节（下游 A）→ 日志看细节（403 token 过期）</text>

      <rect x="6" y="226" width="328" height="20" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="240" font-size="7.5" fill="var(--fig-text)">关键：日志要带 trace_id，三者才能串起来</text>

      <text x="6" y="252" font-size="7.5" fill="var(--fig-muted)"> </text>
    </svg>
    <figcaption>metrics 看趋势与告警、tracing 定位哪一段慢、logging 看具体原因；日志带 trace_id 才能三者串联</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
