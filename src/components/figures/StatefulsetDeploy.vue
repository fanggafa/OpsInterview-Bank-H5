<script setup>
/**
 * 部署有状态服务：StatefulSet 三件套（题 4772）。
 *
 * 核心洞察：StatefulSet 之所以能跑有状态服务，靠三样 Deployment 没有的东西 ——
 * 稳定网络标识、独立存储、有序启停；三者缺一，重启后「身份」就丢了。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 240" role="img" aria-label="StatefulSet 三件套：稳定网络标识、独立 PVC、有序启停，以及部署步骤">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">三样 Deployment 没有的东西，缺一个身份就丢了</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① 稳定网络标识</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">Pod 名固定有序（mysql-0/1/2）+ Headless Service → 稳定 DNS</text>

      <rect x="6" y="58" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="71" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">② 独立存储（每副本一个 PVC）</text>
      <text x="14" y="83" font-size="7.5" fill="var(--fig-text)">volumeClaimTemplates 自动创建；Pod 重建后仍挂回原盘</text>

      <rect x="6" y="96" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="109" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">③ 有序启停</text>
      <text x="14" y="121" font-size="7.5" fill="var(--fig-text)">默认按序启动、逆序停止（可配 podManagementPolicy 改并行）</text>

      <!-- 步骤 -->
      <rect x="6" y="136" width="328" height="46" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="149" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">部署四步</text>
      <text x="14" y="162" font-size="7.5" fill="var(--fig-text)">① 准备 StorageClass（动态供给）② 建 Headless Service（clusterIP: None）</text>
      <text x="14" y="174" font-size="7.5" fill="var(--fig-text)">③ 写 StatefulSet（serviceName + volumeClaimTemplates）④ 用 mysql-0.mysql 验证</text>

      <rect x="6" y="188" width="328" height="30" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="201" font-size="8" font-weight="700" fill="#e5484d">两个易错点</text>
      <text x="14" y="213" font-size="7.5" fill="var(--fig-text)">有序启动只保证顺序，不保证数据复制；PVC 不会随 Pod 删除</text>

      <text x="6" y="234" font-size="7.5" fill="var(--fig-muted)">复杂中间件（MySQL 主从/Redis 集群）建议用 Operator，别只写 StatefulSet</text>
    </svg>
    <figcaption>StatefulSet 三件套：稳定网络标识（Headless + 固定名）、独立 PVC、有序启停；有序不等于数据复制，需应用层或 Operator</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
