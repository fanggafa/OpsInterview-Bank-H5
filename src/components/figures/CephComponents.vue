<script setup>
/**
 * Ceph 三个核心组件 MON / OSD / MDS 的职责（题 2408）。
 *
 * 核心洞察：三者职责完全不同 —— MON 管「集群地图」、OSD 管「数据存储与副本」、
 * MDS 只服务于 CephFS；所以「OSD 挂了」和「MON 挂了」的后果不一样。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 250" role="img" aria-label="Ceph 三组件：MON 维护集群地图、OSD 存数据并管理副本、MDS 服务 CephFS 元数据">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">三者职责完全不同，「谁挂了」后果也不同</text>

      <rect x="6" y="20" width="328" height="52" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">MON（Monitor）—— 集群地图</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">维护集群状态：OSD 映射、PG 映射、CRUSH 规则</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">通常 3 个（奇数），用 Paxos 达成一致；挂了集群会失去「地图」</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-node-c)">不存业务数据，但它是「决定数据放哪」的大脑</text>

      <rect x="6" y="78" width="328" height="52" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="91" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">OSD（Object Storage Daemon）—— 数据与副本</text>
      <text x="14" y="104" font-size="7.5" fill="var(--fig-text)">每块盘一个 OSD，负责实际读写与副本复制</text>
      <text x="14" y="116" font-size="7.5" fill="var(--fig-text)">数据按 CRUSH 算法分布；副本数由规则决定（如 3 副本）</text>
      <text x="14" y="128" font-size="7.5" fill="var(--fig-node-c)">数量最多、最吃 IO；OSD 掉线会触发数据重平衡</text>

      <rect x="6" y="136" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="149" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">MDS（Metadata Server）—— 只有 CephFS 需要</text>
      <text x="14" y="162" font-size="7.5" fill="var(--fig-text)">管理文件系统的目录树与文件元数据（inode、目录项）</text>
      <text x="14" y="174" font-size="7.5" fill="var(--fig-node-c)">块存储（RBD）和对象存储（RGW）不需要 MDS</text>

      <rect x="6" y="188" width="328" height="34" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="201" font-size="8" font-weight="700" fill="#e5484d">常见误区</text>
      <text x="14" y="214" font-size="7.5" fill="var(--fig-text)">把 Ceph 当成「一装就有三副本」—— 副本要靠 CRUSH 规则与足够 OSD 才成立</text>

      <text x="6" y="240" font-size="7.5" fill="var(--fig-muted)">排查：ceph -s 看集群健康 · ceph osd tree 看 OSD 状态 · ceph health detail 看具体问题</text>
    </svg>
    <figcaption>MON 维护集群地图（3 个奇数节点）、OSD 存数据并管副本、MDS 只服务 CephFS；三者挂了的后果不同</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
