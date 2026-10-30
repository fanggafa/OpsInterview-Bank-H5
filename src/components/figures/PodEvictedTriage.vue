<script setup>
/**
 * 节点 Pod 大量 Evicted 的排查（题 4645）。
 *
 * 核心洞察：Evicted 是 kubelet「主动驱逐」以保护节点，不是应用自己挂的；
 * 常见触发是磁盘/内存/PID 压力，排查要先看节点的 Condition 与事件。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 262" role="img" aria-label="Pod Evicted 是 kubelet 因节点资源压力主动驱逐，需按磁盘、内存、PID 压力排查并检查驱逐阈值">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">Evicted 是 kubelet「主动驱逐」保节点，不是应用崩溃</text>

      <rect x="6" y="20" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="#e5484d">三种资源压力（按常见度）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">① DiskPressure：磁盘/日志满（最常见，尤其容器日志与镜像层）</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">② MemoryPressure：节点内存紧张　③ PIDPressure：进程/线程数过多</text>

      <rect x="6" y="70" width="328" height="46" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="83" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">排查顺序</text>
      <text x="14" y="96" font-size="7.5" fill="var(--fig-text)">① kubectl describe node 看 Conditions 与 Events（会有明确原因）</text>
      <text x="14" y="108" font-size="7.5" fill="var(--fig-text)">② df -h / df -i（节点与容器运行时目录）③ 看 kubelet 日志的 eviction 记录</text>

      <rect x="6" y="120" width="328" height="46" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="133" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">怎么确认是「驱逐」而不是「OOM」</text>
      <text x="14" y="146" font-size="7.5" fill="var(--fig-text)">Evicted：Pod 状态里 Reason=Evicted，事件写「驱逐原因」</text>
      <text x="14" y="158" font-size="7.5" fill="var(--fig-text)">OOMKilled：Last State 里是 OOMKilled（容器超 limit，节点没压力）</text>

      <rect x="6" y="170" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="183" font-size="8" font-weight="700" fill="var(--fig-node-c)">治本</text>
      <text x="14" y="196" font-size="7.5" fill="var(--fig-text)">容器日志轮转限大小 · 镜像定期清理 · 给系统盘留足空间 · 调 eviction 阈值</text>

      <rect x="6" y="208" width="328" height="24" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="224" font-size="7.5" fill="var(--fig-node-d)">注意：驱逐按 QoS 排序 —— BestEffort 最先被赶走（requests 不设更危险）</text>

      <text x="6" y="252" font-size="7.5" fill="var(--fig-muted)">监控建议：节点磁盘使用率与容器日志增长速率都要告警，别只盯 Pod 状态</text>
    </svg>
    <figcaption>Evicted 因节点 Disk/Memory/PID 压力被 kubelet 驱逐；先查节点 Conditions 与事件，治本是日志轮转与清理</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
