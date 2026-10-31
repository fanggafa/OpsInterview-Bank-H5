<script setup>
/**
 * iSCSI（块存储）与 NFS（文件存储）的区别与选型（题 2418）。
 *
 * 核心洞察：块存储给的是「一块裸盘」，文件系统由客户端自己管；
 * 文件存储给的是「一个共享目录」，并发写由服务端统一协调。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 252" role="img" aria-label="iSCSI 是块存储需客户端自建文件系统，NFS 是文件存储共享目录，多机并发写行为不同">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">块存储给「裸盘」，文件存储给「共享目录」——差别在谁管文件系统</text>

      <rect x="6" y="20" width="160" height="82" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">iSCSI（块存储）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">呈现为一块块设备（/dev/sdb）</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">客户端自己建 ext4/xfs/LVM</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">性能接近本地盘、延迟低</text>
      <text x="14" y="82" font-size="7.5" fill="#e5484d">一块盘一般只给一台用</text>
      <text x="14" y="94" font-size="7" fill="var(--fig-node-c)">适合：数据库、单机高 IO</text>

      <rect x="174" y="20" width="160" height="82" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">NFS（文件存储）</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">呈现为一个挂载目录</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">多台可同时挂载共享</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">文件级锁与一致性由服务端管</text>
      <text x="182" y="82" font-size="7.5" fill="#e5484d">延迟高于块存储（走网络协议）</text>
      <text x="182" y="94" font-size="7" fill="var(--fig-node-c)">适合：共享文件、K8s 共享卷</text>

      <!-- 选型 -->
      <rect x="6" y="112" width="328" height="50" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="125" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">怎么选（三个问题）</text>
      <text x="14" y="138" font-size="7.5" fill="var(--fig-text)">① 要不要多机同时读写同一份数据？要 → NFS（块存储多写会损坏文件系统）</text>
      <text x="14" y="150" font-size="7.5" fill="var(--fig-text)">② 是不是数据库这种高 IO 低延迟？是 → iSCSI</text>
      <text x="14" y="162" font-size="7" fill="var(--fig-node-c)">③ 是否需要共享锁/SMB 语义？是 → 文件存储</text>

      <rect x="6" y="170" width="328" height="34" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="183" font-size="8" font-weight="700" fill="#e5484d">最常见的事故</text>
      <text x="14" y="195" font-size="7.5" fill="var(--fig-text)">两台机器同时挂同一个 iSCSI 块设备并各自建文件系统 → 数据损坏</text>

      <rect x="6" y="212" width="328" height="20" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="226" font-size="7.5" fill="var(--fig-text)">注意：NFS 的延迟与丢包对数据库是致命的，别把数据库数据文件放 NFS</text>

      <text x="6" y="244" font-size="7.5" fill="var(--fig-muted)">还有对象存储（S3）：适合海量小文件与备份归档，不适合随机读写</text>
    </svg>
    <figcaption>iSCSI 给裸块设备、性能高但一般不共享；NFS 给共享目录、多机可挂但延迟高。多机同写必须用文件存储</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
