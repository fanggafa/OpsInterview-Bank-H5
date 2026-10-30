<script setup>
/**
 * Pod 被 OOMKilled 与 requests/limits 的关系（题 44）。
 *
 * 核心洞察：requests 影响「能不能被调度」，limits 影响「会不会被杀」；
 * 两者还共同决定 QoS 等级 —— 这是「为什么有的 Pod 先被杀」的答案。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 270" role="img" aria-label="requests 决定调度与保障下限，limits 是上限，内存超 limit 会 OOMKilled；两者组合决定 QoS 等级">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">requests 决定「能否调度」，limits 决定「会不会被杀」</text>

      <rect x="6" y="20" width="160" height="60" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">requests</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">调度依据：节点剩余 request 够才调度</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">保障「至少有这么多」</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-node-c)">不够 → Pod Pending</text>

      <rect x="174" y="20" width="160" height="60" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">limits</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">上限：内存超了立即 OOMKilled</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">CPU 超了被 throttle</text>
      <text x="182" y="70" font-size="7.5" fill="#e5484d">不设 = 不保护也不限制</text>

      <!-- QoS -->
      <rect x="6" y="90" width="328" height="62" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="103" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">两者组合决定 QoS（谁先被杀）</text>
      <text x="14" y="116" font-size="7.5" fill="var(--fig-text)">Guaranteed：requests == limits（最稳，最难调度）</text>
      <text x="14" y="128" font-size="7.5" fill="var(--fig-text)">Burstable：设了 requests 但 limits 更大（常见）</text>
      <text x="14" y="140" font-size="7.5" fill="var(--fig-text)">BestEffort：两者都没设（资源紧张时最先被驱逐）</text>

      <!-- 实践 -->
      <rect x="6" y="160" width="328" height="50" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="173" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">常见误区与建议</text>
      <text x="14" y="186" font-size="7.5" fill="var(--fig-text)">只设 requests 不设 CPU limits → 避免 throttle（很多团队的选择）</text>
      <text x="14" y="198" font-size="7.5" fill="var(--fig-text)">内存 limits 一定要设且留余量：JVM 堆 + 元空间 + 线程栈要算进去</text>

      <rect x="6" y="218" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="231" font-size="8" font-weight="700" fill="var(--fig-node-a)">怎么确认是被 OOMKilled</text>
      <text x="14" y="243" font-size="7.5" fill="var(--fig-text)">kubectl describe pod 看 Last State: OOMKilled；Exit Code 137</text>

      <text x="6" y="262" font-size="7.5" fill="var(--fig-muted)">易混点：容器内存超 limit 是「立即被杀」，不是「变慢」；这与 Java 的 OOM 不同</text>
    </svg>
    <figcaption>requests 决定调度与保障、limits 决定是否被杀；Guaranteed/Burstable/BestEffort 决定资源紧张时谁先被驱逐</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
