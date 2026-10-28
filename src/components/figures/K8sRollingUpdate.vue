<script setup>
/**
 * K8s 滚动更新与就绪探针图。
 * 展示 maxSurge / maxUnavailable 如何控制新旧 Pod 的替换节奏，
 * 以及 readinessProbe 失败时「不接流量但仍算 Running」这个高频误解。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 234" role="img" aria-label="K8s 滚动更新过程中新旧 Pod 的替换节奏与就绪探针">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">Deployment 滚动更新：maxSurge=1 / maxUnavailable=0（零停机配置）</text>

      <!-- 阶段1 -->
      <text x="6" y="32" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① 新增 1 个新版本（旧 3 个仍在跑）</text>
      <g>
        <rect x="6" y="38" width="30" height="16" rx="3" fill="var(--fig-node-c)" opacity=".85" />
        <rect x="40" y="38" width="30" height="16" rx="3" fill="var(--fig-node-c)" opacity=".85" />
        <rect x="74" y="38" width="30" height="16" rx="3" fill="var(--fig-node-c)" opacity=".85" />
        <rect x="108" y="38" width="30" height="16" rx="3" fill="var(--fig-node-b)" opacity=".9" />
        <text x="123" y="49" text-anchor="middle" font-size="7" fill="#fff">new</text>
        <text x="146" y="49" font-size="8" fill="var(--fig-muted)">总量 4，可用 ≥4</text>
      </g>

      <!-- 阶段2 -->
      <text x="6" y="70" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">② 新 Pod 就绪后，才摘掉 1 个旧 Pod</text>
      <g>
        <rect x="40" y="76" width="30" height="16" rx="3" fill="var(--fig-node-c)" opacity=".85" />
        <rect x="74" y="76" width="30" height="16" rx="3" fill="var(--fig-node-c)" opacity=".85" />
        <rect x="108" y="76" width="30" height="16" rx="3" fill="var(--fig-node-b)" opacity=".9" />
        <rect x="6" y="76" width="30" height="16" rx="3" fill="none" stroke="var(--fig-muted)" stroke-width="1" stroke-dasharray="2 2" />
        <text x="21" y="87" text-anchor="middle" font-size="7" fill="var(--fig-muted)">终止中</text>
        <text x="146" y="87" font-size="8" fill="var(--fig-muted)">先加后减 → 可用数不下降</text>
      </g>

      <!-- 阶段3 -->
      <text x="6" y="108" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">③ 逐批替换，直到全部是新版本</text>
      <g>
        <rect x="6" y="114" width="30" height="16" rx="3" fill="var(--fig-node-b)" opacity=".9" />
        <rect x="40" y="114" width="30" height="16" rx="3" fill="var(--fig-node-b)" opacity=".9" />
        <rect x="74" y="114" width="30" height="16" rx="3" fill="var(--fig-node-b)" opacity=".9" />
        <rect x="108" y="114" width="30" height="16" rx="3" fill="var(--fig-node-b)" opacity=".9" />
        <text x="146" y="125" font-size="8" fill="var(--fig-node-c)">完成；任何时刻都有可用 Pod</text>
      </g>

      <!-- 探针对比 -->
      <rect x="6" y="142" width="328" height="88" rx="8" fill="var(--fig-node-d)" opacity=".09" />
      <rect x="6" y="142" width="328" height="88" rx="8" fill="none" stroke="var(--fig-node-d)" stroke-width="1.2" />
      <text x="16" y="158" font-size="9.5" font-weight="700" fill="var(--fig-node-d)">三种探针的分工（最容易混淆）</text>

      <text x="16" y="174" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">livenessProbe</text>
      <text x="100" y="174" font-size="8.5" fill="var(--fig-text)">失败 → 重启容器（治「卡死」）</text>

      <text x="16" y="190" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">readinessProbe</text>
      <text x="100" y="190" font-size="8.5" fill="var(--fig-text)">失败 → 从 Service 摘除流量（治「不能服务」）</text>

      <text x="16" y="206" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">startupProbe</text>
      <text x="100" y="206" font-size="8.5" fill="var(--fig-text)">启动期用它，成功后才启用上面两个（治「启动慢被误杀」）</text>

      <text x="16" y="222" font-size="8" fill="#e5484d">✗ 只配 liveness 不配 readiness → 应用假死时 Pod 仍是 Running，流量继续打进来 → 502</text>
    </svg>
    <figcaption>零停机的关键：readinessProbe 查业务路径、maxUnavailable 设 0、preStop 里 sleep 等摘流生效</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
