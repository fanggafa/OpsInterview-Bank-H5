<script setup>
/**
 * Pod 挂掉后 K8s 的自动恢复机制（题 4751）。
 *
 * 核心洞察：四层机制分工不同 —— 控制器补 Pod、kubelet 重启容器、
 * 驱逐释放压力、GC 清理对象；最容易被忽略的是「应用假死只有探针能发现」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 248" role="img" aria-label="四层恢复机制：控制器补副本、kubelet 重启容器、节点驱逐、GC 清理">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">四层机制，各自负责不同层级的「恢复」</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① 控制器补副本（最主要）</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">ReplicaSet 持续对比期望与实际 → 少一个就创建新的</text>

      <rect x="6" y="58" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="71" font-size="8" font-weight="700" fill="var(--fig-node-b)">② kubelet 重启容器</text>
      <text x="14" y="83" font-size="7.5" fill="var(--fig-text)">按 restartPolicy 处理「容器进程退出」；探针失败也会触发重启</text>

      <rect x="6" y="96" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="109" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ 节点驱逐 Eviction</text>
      <text x="14" y="121" font-size="7.5" fill="var(--fig-text)">内存/磁盘/PID 压力 → 按 QoS 排序驱逐（BestEffort 先走）</text>

      <rect x="6" y="134" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="147" font-size="8" font-weight="700" fill="var(--fig-node-d)">④ GC 清理对象</text>
      <text x="14" y="159" font-size="7.5" fill="var(--fig-text)">已退出容器、终态 Pod、孤儿对象按规则回收（避免堆积）</text>

      <!-- 关键澄清 -->
      <rect x="6" y="176" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="189" font-size="8.5" font-weight="700" fill="#e5484d">最重要的是这层分工（面试常考）</text>
      <text x="14" y="202" font-size="7.5" fill="var(--fig-text)">容器崩了 → kubelet 重启容器；Pod 被删/节点挂 → 控制器建新 Pod</text>
      <text x="14" y="214" font-size="7.5" fill="var(--fig-text)">应用假死（进程在但不响应）→ 只有探针能发现并重启</text>
      <text x="14" y="226" font-size="7" fill="var(--fig-node-c)">没有探针，这类问题永远不会被自动处理</text>

      <text x="6" y="240" font-size="7.5" fill="var(--fig-muted)">注意：「自动清除」不等于「自动重启应用」，两者是不同机制</text>
    </svg>
    <figcaption>四层：控制器补副本、kubelet 重启容器、节点驱逐、GC 清理；假死只有探针能发现，没有探针就不会被自动处理</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
