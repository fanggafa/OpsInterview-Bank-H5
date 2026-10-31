<script setup>
/**
 * PV 与 PVC（题 4741）。
 *
 * 核心洞察：PV 是「存储本身」（集群级），PVC 是「申请的凭据」（命名空间级）；
 * 这层抽象让应用不关心底层是 NFS 还是云盘。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 242" role="img" aria-label="PV 是集群级存储实体，PVC 是命名空间级申请，Pod 只挂 PVC">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">PV = 存储本身（集群级）；PVC = 申请单（命名空间级）</text>

      <rect x="6" y="20" width="328" height="38" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">PV（PersistentVolume）— 集群级</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">一块具体存储：NFS / 云盘 / Ceph / 本地盘（类比：仓库里已备好的货）</text>

      <rect x="6" y="64" width="328" height="38" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="77" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">PVC（PersistentVolumeClaim）— 命名空间级</text>
      <text x="14" y="90" font-size="7.5" fill="var(--fig-text)">声明「我要多大、什么访问模式」（类比：用户的采购申请单）</text>

      <rect x="6" y="108" width="328" height="38" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="121" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">Pod — 只挂 PVC，不直接碰 PV</text>
      <text x="14" y="134" font-size="7.5" fill="var(--fig-text)">volumes: [{ persistentVolumeClaim: { claimName: my-pvc } }]</text>

      <!-- 访问模式 -->
      <rect x="6" y="154" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="167" font-size="8" font-weight="700" fill="var(--fig-node-d)">三种访问模式</text>
      <text x="14" y="179" font-size="7.5" fill="var(--fig-text)">RWO 单节点读写（最常见）· ROX 多节点只读 · RWX 多节点读写（需 NFS/CephFS）</text>

      <rect x="6" y="196" width="328" height="30" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="209" font-size="8" font-weight="700" fill="#e5484d">为什么要有这层抽象</text>
      <text x="14" y="221" font-size="7.5" fill="var(--fig-text)">应用不关心底层实现，换存储不用改应用；管理员与开发者职责分离</text>

      <text x="6" y="234" font-size="7.5" fill="var(--fig-muted)">注意：RWO 是「单节点」不是「单 Pod」—— 同节点的多个 Pod 可以共用</text>
    </svg>
    <figcaption>PV 是集群级存储实体、PVC 是命名空间级申请，Pod 只挂 PVC；访问模式 RWO/ROX/RWX 决定能否多节点共享</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
