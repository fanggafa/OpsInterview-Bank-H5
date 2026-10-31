<script setup>
/**
 * HPA 的工作原理与常见问题（题 4759）。
 *
 * 核心洞察：HPA 只解决「副本数」这一维；而 CPU 百分比是**相对 requests** 算的 ——
 * 没设 requests，HPA 根本不工作，这是「配了却不生效」的第一大原因。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 238" role="img" aria-label="HPA 流程：采集指标、计算副本、更新 replicas、冷却；以及五个常见问题">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">它只解决「副本数」，解决不了「节点不够」和「瓶颈在别处」</text>

      <rect x="6" y="20" width="328" height="44" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">工作流程四步</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">① 采集指标（CPU/内存需 metrics-server；QPS 等需 Prometheus Adapter）</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">② 计算：期望副本 = 当前 × (当前指标 / 目标) ③ 更新 replicas ④ 冷却窗口</text>

      <rect x="6" y="72" width="328" height="46" rx="5" fill="#e5484d" opacity=".12" />
      <text x="14" y="85" font-size="8.5" font-weight="700" fill="#e5484d">最关键前提（最易漏）</text>
      <text x="14" y="98" font-size="7.5" fill="var(--fig-text)">CPU 百分比是相对 **requests** 计算的</text>
      <text x="14" y="110" font-size="7.5" fill="var(--fig-text)">没设 requests → 无基准 → HPA 完全无法工作</text>
      <text x="14" y="122" font-size="7" fill="var(--fig-node-c)">这是「配了 HPA 却不生效」的第一大原因</text>

      <rect x="6" y="126" width="328" height="52" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="139" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">五个常见问题</text>
      <text x="14" y="152" font-size="7.5" fill="var(--fig-text)">① 完全不扩缩容（无 metrics-server / 无 requests）</text>
      <text x="14" y="164" font-size="7.5" fill="var(--fig-text)">② 反复抖动（目标值过紧 / 冷却太短）　③ 扩了没用（瓶颈不在 CPU）</text>
      <text x="14" y="176" font-size="7.5" fill="var(--fig-text)">④ 扩不上去（节点资源不足 → 新 Pod Pending）　⑤ 只看 CPU 不准</text>

      <rect x="6" y="186" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="199" font-size="8" font-weight="700" fill="var(--fig-node-c)">更好的实践</text>
      <text x="14" y="211" font-size="7.5" fill="var(--fig-text)">用自定义指标（QPS/队列长度）· 配 Cluster Autoscaler 扩节点 · 目标留缓冲</text>

      <text x="6" y="230" font-size="7.5" fill="var(--fig-muted)">注意：扩容有延迟（启动+预热），要配合排队/限流避免雪崩</text>
    </svg>
    <figcaption>HPA 按指标算副本并更新 replicas；CPU 百分比相对 requests，没设 requests 就不工作；只解决副本数，需配 Autoscaler</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
