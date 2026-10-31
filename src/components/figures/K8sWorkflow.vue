<script setup>
/**
 * K8s 基本工作流程（题 4726）。
 *
 * 核心洞察：所有操作都是「声明期望 → 控制器调谐 → kubelet 落地」，
 * 而且是异步的：提交成功 ≠ Pod 已跑起来，中间任何一步都可能卡住。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 258" role="img" aria-label="K8s 工作流程：提交 YAML 写入 etcd，控制器生成对象，调度器选点，kubelet 起容器">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">声明期望状态 → 控制器调谐 → kubelet 落地，全程异步</text>

      <rect x="6" y="22" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="39" font-size="7.5" fill="var(--fig-node-a)">① kubectl apply → apiserver 校验 → 写入 etcd（此刻只有 Deployment）</text>

      <rect x="6" y="54" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="71" font-size="7.5" fill="var(--fig-text)">② Deployment 控制器 → 创建 ReplicaSet（记录期望副本数）</text>

      <rect x="6" y="86" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="103" font-size="7.5" fill="var(--fig-text)">③ ReplicaSet → 创建 Pod 对象（nodeName 尚为空 = 未调度）</text>

      <rect x="6" y="118" width="328" height="26" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="135" font-size="7.5" fill="var(--fig-node-d)">④ scheduler 选节点 → 回写 nodeName</text>

      <rect x="6" y="150" width="328" height="40" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="164" font-size="7.5" fill="var(--fig-node-a)">⑤ kubelet 接管本机 Pod：建网络 → 拉镜像 → 挂卷 → 起容器</text>
      <text x="14" y="178" font-size="7.5" fill="var(--fig-text)">探针通过后变 Ready；kubelet 持续上报状态</text>

      <!-- 卡点 -->
      <rect x="6" y="196" width="328" height="44" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="209" font-size="8" font-weight="700" fill="#e5484d">两个常见卡点（排查时先问「卡在哪一步」）</text>
      <text x="14" y="222" font-size="7.5" fill="var(--fig-text)">Pending = 卡在 ④ 调度（资源/亲和/污点不满足）</text>
      <text x="14" y="234" font-size="7.5" fill="var(--fig-text)">ContainerCreating = 卡在 ⑤ 落地（拉镜像慢/卷挂不上）</text>

      <text x="6" y="250" font-size="7.5" fill="var(--fig-muted)">这条链路是后面所有 Pod 排查题的骨架</text>
    </svg>
    <figcaption>提交 YAML 只写进 etcd，之后由控制器生成 ReplicaSet/Pod、调度器选节点、kubelet 落地；Pending 卡在调度、ContainerCreating 卡在落地</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
