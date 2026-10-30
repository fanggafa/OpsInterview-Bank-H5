<script setup>
/**
 * K8s 监控：kube-state-metrics 与 cAdvisor 的区别（题 5024）。
 *
 * 核心洞察：cAdvisor 报「容器资源用量」（CPU/内存/网络），
 * kube-state-metrics 报「对象状态」（副本数、就绪数、重启次数）——
 * 两者互补，只装一个会漏掉一半问题。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 252" role="img" aria-label="cAdvisor 报容器资源用量，kube-state-metrics 报 K8s 对象状态，两者互补">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">一个看「用了多少资源」，一个看「对象处于什么状态」</text>

      <rect x="6" y="20" width="160" height="76" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">cAdvisor</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">内置于 kubelet</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">容器级 CPU/内存/网络/文件系统</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">回答「这个容器吃了多少资源」</text>
      <text x="14" y="82" font-size="7.5" fill="var(--fig-node-c)">指标形如 container_cpu_usage_*</text>

      <rect x="174" y="20" width="160" height="76" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">kube-state-metrics</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">独立 Deployment</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">从 apiserver 读取对象状态</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">副本数/就绪数/重启次数/状态</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-node-c)">指标形如 kube_deployment_*</text>

      <!-- 互补 -->
      <rect x="6" y="104" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="117" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">为什么两者都要</text>
      <text x="14" y="130" font-size="7.5" fill="var(--fig-text)">只有 cAdvisor：看不出「副本数不足 / Pod 一直未就绪」</text>
      <text x="14" y="142" font-size="7.5" fill="var(--fig-text)">只有 KSM：看不出「容器内存快打满、CPU 被限流」</text>

      <rect x="6" y="158" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="171" font-size="8" font-weight="700" fill="var(--fig-node-d)">常见告警组合</text>
      <text x="14" y="184" font-size="7.5" fill="var(--fig-text)">就绪副本 &lt; 期望（KSM）· 容器内存接近 limit（cAdvisor）· 重启次数增长（KSM）</text>

      <rect x="6" y="200" width="328" height="24" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="216" font-size="7.5" fill="var(--fig-text)">注意：KSM 指标随对象数量增长，是基数大户，要控制命名空间范围</text>

      <text x="6" y="242" font-size="7.5" fill="var(--fig-muted)">补充：节点级指标来自 node_exporter；三者的分工在面试里经常被追问</text>
    </svg>
    <figcaption>cAdvisor 报容器资源用量（CPU/内存/网络）、KSM 报对象状态（副本/就绪/重启）；两者互补，缺一会漏一半问题</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
