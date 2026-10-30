<script setup>
/**
 * K8s 三种探针的职责分工（题 43）。
 *
 * 核心洞察：三者回答不同问题 —— startup 问「起来了没」、
 * readiness 问「能接流量吗」、liveness 问「还活着吗」；
 * 用错会导致「启动被误杀」或「故障实例继续接流量」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 276" role="img" aria-label="K8s 三种探针：startup 判断启动完成、readiness 判断能否接流量、liveness 判断是否活着，失败后果不同">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">三者回答不同问题，失败后果也完全不同</text>

      <rect x="6" y="20" width="328" height="52" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">startupProbe：起来了吗？</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">成功之前，liveness 与 readiness 都不生效</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">作用：给慢启动应用（如 JVM 预热）更长的宽限，避免被误杀</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-node-c)">失败后果：容器被重启</text>

      <rect x="6" y="78" width="328" height="52" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="91" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">readinessProbe：能接流量吗？</text>
      <text x="14" y="104" font-size="7.5" fill="var(--fig-text)">失败时不重启，只把 Pod 从 Service 的 Endpoints 摘掉</text>
      <text x="14" y="116" font-size="7.5" fill="var(--fig-text)">作用：依赖未就绪/过载时「暂时不接流量」，恢复后自动加回</text>
      <text x="14" y="128" font-size="7.5" fill="var(--fig-node-c)">失败后果：不接流量（但容器继续跑）</text>

      <rect x="6" y="136" width="328" height="52" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="149" font-size="8.5" font-weight="700" fill="#e5484d">livenessProbe：还活着吗？</text>
      <text x="14" y="162" font-size="7.5" fill="var(--fig-text)">失败达阈值 → kubelet 重启容器（相信「重启能恢复」）</text>
      <text x="14" y="174" font-size="7.5" fill="var(--fig-text)">慎用：把「依赖慢」写进 liveness 会导致级联重启风暴</text>
      <text x="14" y="186" font-size="7.5" fill="var(--fig-node-c)">失败后果：容器被重启（可能反复 CrashLoop）</text>

      <!-- 常见误用 -->
      <rect x="6" y="198" width="328" height="34" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="211" font-size="8" font-weight="700" fill="var(--fig-node-d)">最常见的两种误用</text>
      <text x="14" y="224" font-size="7.5" fill="var(--fig-text)">① 只有 liveness 没有 startup → 慢启动应用被反复重启</text>

      <rect x="6" y="236" width="328" height="20" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="249" font-size="7.5" fill="var(--fig-node-c)">② liveness 检查下游依赖 → 依赖抖动引发全量重启风暴</text>

      <text x="6" y="266" font-size="7.5" fill="var(--fig-muted)">口诀：startup 管启动、readiness 管流量、liveness 管存活</text>
    </svg>
    <figcaption>startup 成功前其他探针不生效；readiness 失败只摘流量；liveness 失败会重启容器（最危险）</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
