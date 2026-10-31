<script setup>
/**
 * Pod 重启策略 restartPolicy（题 4731）。
 *
 * 核心洞察：它只作用于「容器退出」时是否重启，由 kubelet 执行；
 * 与控制器补副本是两套机制，最容易被混淆。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 232" role="img" aria-label="三种重启策略 Always、OnFailure、Never，以及它与控制器补副本的区别">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">只作用于「容器退出」，由 kubelet 执行 —— 不是控制器行为</text>

      <rect x="6" y="20" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="37" font-size="7.5" fill="var(--fig-node-a)"><tspan font-weight="700">Always</tspan>（默认）　容器退出就重启，不看退出码 → 长期运行的服务</text>

      <rect x="6" y="50" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="67" font-size="7.5" fill="var(--fig-node-b)"><tspan font-weight="700">OnFailure</tspan>　只有非 0 退出码才重启 → 批处理、可能失败的任务</text>

      <rect x="6" y="80" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="97" font-size="7.5" fill="var(--fig-node-c)"><tspan font-weight="700">Never</tspan>　从不重启 → 一次性任务、调试</text>

      <!-- 关键区分 -->
      <rect x="6" y="116" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="129" font-size="8.5" font-weight="700" fill="#e5484d">关键：它管容器，不管 Pod</text>
      <text x="14" y="142" font-size="7.5" fill="var(--fig-text)">容器进程崩了 → kubelet 按 restartPolicy 重启（这一层）</text>
      <text x="14" y="154" font-size="7.5" fill="var(--fig-text)">Pod 被删 / 节点挂掉 → 控制器（ReplicaSet）创建新 Pod（另一层）</text>

      <rect x="6" y="170" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="183" font-size="8" font-weight="700" fill="var(--fig-node-d)">与探针的分工</text>
      <text x="14" y="195" font-size="7.5" fill="var(--fig-text)">restartPolicy 管「退出」；livenessProbe 管「没退出但卡住」</text>

      <text x="6" y="228" font-size="7.5" fill="var(--fig-muted)">Job 通常用 OnFailure/Never；普通服务用 Always（默认）</text>
    </svg>
    <figcaption>Always 看退出就重启、OnFailure 仅非 0 才重启、Never 不重启；它只管容器，Pod 级重建由控制器负责，探针管假死</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
