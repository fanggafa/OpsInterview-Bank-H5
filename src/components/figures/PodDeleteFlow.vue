<script setup>
/**
 * Pod 的删除过程（题 4730）。
 *
 * 核心洞察：删除是「先温柔后强硬」——打上删除标记、发 TERM、等宽限期、
 * 超时才 KILL；所以 kubectl delete 后还会看到 Terminating。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 254" role="img" aria-label="Pod 删除六步：打删除标记、preStop、SIGTERM、宽限期等待、SIGKILL、清理资源">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">先温柔后强硬 —— 删除不是瞬间完成，会经过 Terminating</text>

      <rect x="6" y="22" width="328" height="24" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="38" font-size="7.5" fill="var(--fig-node-a)">① kubectl delete → apiserver 打上 deletionTimestamp（对象还在）</text>

      <rect x="6" y="50" width="328" height="24" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="66" font-size="7.5" fill="var(--fig-text)">② preStop hook 执行（若配置：关连接、摘注册中心）</text>

      <rect x="6" y="78" width="328" height="24" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="94" font-size="7.5" fill="var(--fig-node-c)">③ 向容器发 SIGTERM（15，可捕获 → 应用优雅退出）</text>

      <rect x="6" y="106" width="328" height="24" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="122" font-size="7.5" fill="var(--fig-text)">④ 等待 terminationGracePeriodSeconds（默认 30 秒）</text>

      <rect x="6" y="134" width="328" height="24" rx="4" fill="#e5484d" opacity=".12" />
      <text x="14" y="150" font-size="7.5" fill="#e5484d">⑤ 超时未退出 → SIGKILL（9，不可捕获，强杀）</text>

      <rect x="6" y="162" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="175" font-size="7.5" fill="var(--fig-text)">⑥ CNI 删网络 sandbox → 卸载卷 → 上报 → 从 etcd 移除</text>
      <text x="14" y="187" font-size="7" fill="var(--fig-node-c)">若为 Deployment 管理，ReplicaSet 会立刻创建新 Pod</text>

      <!-- 坑 -->
      <rect x="6" y="198" width="328" height="42" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="211" font-size="8" font-weight="700" fill="var(--fig-node-d)">卡在 Terminating 的两个常见原因</text>
      <text x="14" y="224" font-size="7.5" fill="var(--fig-text)">① 应用处理 SIGTERM 太慢（宽限期内没退出）</text>
      <text x="14" y="236" font-size="7.5" fill="var(--fig-text)">② 卷卸载卡住（典型：NFS 挂死，kubelet 一直等）</text>

      <text x="6" y="246" font-size="7.5" fill="var(--fig-muted)">调大宽限期（terminationGracePeriodSeconds）能缓解，但不该是首选</text>
    </svg>
    <figcaption>删除六步：打标记、preStop、SIGTERM、宽限期、SIGKILL、清理资源；卡 Terminating 多为应用退出慢或卷卸载卡住</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
