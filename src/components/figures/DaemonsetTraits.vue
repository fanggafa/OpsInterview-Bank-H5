<script setup>
/**
 * DaemonSet 的资源特性（题 4743）。
 *
 * 核心洞察：它的副本数由「节点数量」决定而不是 replicas ——
 * 新节点加入自动补，节点移除自动回收，这就是它与 Deployment 的根本区别。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 242" role="img" aria-label="DaemonSet 每节点一个 Pod，副本数由节点数决定，用于日志采集与监控 agent">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">保证每个（或指定的）节点上恰好运行一个 Pod</text>

      <rect x="6" y="20" width="328" height="42" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">特性一：每节点一个（自动跟随）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">新节点加入 → 自动调度上去；节点移除 → 对应 Pod 回收</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">节点 NotReady 时不调度，等 Ready 后才补</text>

      <rect x="6" y="68" width="328" height="42" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="81" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">特性二：副本数由节点数决定</text>
      <text x="14" y="94" font-size="7.5" fill="var(--fig-text)">没有 replicas 字段 —— 想「少跑几个」只能靠 nodeSelector/亲和限制</text>
      <text x="14" y="106" font-size="7.5" fill="var(--fig-text)">对比 Deployment：replicas 手动指定，Pod 可能集中在少数节点</text>

      <rect x="6" y="116" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="129" font-size="8" font-weight="700" fill="var(--fig-node-c)">特性三：支持节点筛选</text>
      <text x="14" y="141" font-size="7.5" fill="var(--fig-text)">nodeSelector / 亲和性 / 污点容忍，可限定只跑在部分节点</text>

      <!-- 用途 -->
      <rect x="6" y="154" width="328" height="46" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="167" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">典型用途（都是「节点级 agent」）</text>
      <text x="14" y="180" font-size="7.5" fill="var(--fig-text)">日志采集（fluentd/filebeat）· 监控（node-exporter）· 网络插件（calico-node）</text>
      <text x="14" y="192" font-size="7" fill="var(--fig-node-c)">共性：要访问宿主机资源，每台都要一个</text>

      <rect x="6" y="208" width="328" height="18" rx="3" fill="#e5484d" opacity=".1" />
      <text x="14" y="221" font-size="7.5" fill="var(--fig-text)">注意：DaemonSet 的 Pod 通常要 hostPath / hostNetwork，安全代价要评估</text>

      <text x="6" y="234" font-size="7.5" fill="var(--fig-muted)">更新模板也会滚动替换各节点上的 Pod（与 Deployment 类似）</text>
    </svg>
    <figcaption>DaemonSet 每节点一个、副本数由节点数决定、支持节点筛选；典型用途是日志采集、监控 agent、CNI 组件</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
