<script setup>
/**
 * Pod 的创建过程（题 4729）。
 *
 * 核心洞察：创建是「对象流水线」——控制器生成对象、调度器选点、kubelet 落地；
 * 两种卡点（Pending / ContainerCreating）指向完全不同的组件。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 256" role="img" aria-label="Pod 创建六步：提交、Deployment 生成 RS、RS 创建 Pod、scheduler 选点、kubelet 落地、就绪">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">六步流水线：前段在控制面，后段在节点上</text>

      <rect x="6" y="22" width="328" height="24" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="38" font-size="7.5" fill="var(--fig-node-a)">① kubectl apply → apiserver 校验 → 写 etcd</text>

      <rect x="6" y="50" width="328" height="24" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="66" font-size="7.5" fill="var(--fig-text)">② Deployment 控制器 → 生成 ReplicaSet</text>

      <rect x="6" y="78" width="328" height="24" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="94" font-size="7.5" fill="var(--fig-text)">③ ReplicaSet → 创建 Pod 对象（nodeName 为空）</text>

      <rect x="6" y="106" width="328" height="24" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="122" font-size="7.5" fill="var(--fig-node-d)">④ scheduler 选节点 → 回写 nodeName</text>

      <rect x="6" y="134" width="328" height="46" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="148" font-size="7.5" fill="var(--fig-node-a)">⑤ kubelet 在自己节点上落地，依次四件事：</text>
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)">CNI 建网络 → 拉镜像 → 挂卷（CSI）→ CRI 起容器</text>
      <text x="14" y="172" font-size="7" fill="var(--fig-node-c)">任何一步失败都会停在 ContainerCreating</text>

      <rect x="6" y="184" width="328" height="22" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="199" font-size="7.5" fill="var(--fig-node-b)">⑥ 探针通过 → Ready；kubelet 持续上报</text>

      <!-- 卡点对照 -->
      <rect x="6" y="212" width="328" height="30" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="225" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700" fill="#e5484d">Pending</tspan> 卡在 ④（FailedScheduling）　·　<tspan font-weight="700" fill="#e5484d">ContainerCreating</tspan> 卡在 ⑤（kubelet 日志）</text>

      <text x="6" y="248" font-size="7.5" fill="var(--fig-muted)">两者属于不同组件，排查入口也不同 —— 别混在一起查</text>
    </svg>
    <figcaption>Pod 创建六步：控制面生成对象与选点、kubelet 落地四件事；Pending 卡在调度、ContainerCreating 卡在本机落地</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
