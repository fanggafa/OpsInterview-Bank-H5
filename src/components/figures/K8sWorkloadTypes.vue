<script setup>
/**
 * Deployment / StatefulSet / DaemonSet 对比（题 4600）。
 *
 * 核心洞察：三者都管 Pod，差别在「Pod 有没有身份」——
 * Deployment 的 Pod 可互换，StatefulSet 的 Pod 有固定身份与存储，
 * DaemonSet 则在每个节点各跑一份。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 262" role="img" aria-label="Deployment 无状态可互换、StatefulSet 有固定身份与独立存储、DaemonSet 每节点一份">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">三者都管 Pod，差别在「Pod 有没有身份」</text>

      <!-- Deployment -->
      <rect x="6" y="20" width="328" height="62" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="34" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">Deployment：无状态、Pod 可互换</text>
      <text x="14" y="47" font-size="7.5" fill="var(--fig-text)">Pod 名带随机后缀（web-7d9f-x2k），删掉重建视为「另一个」</text>
      <text x="14" y="59" font-size="7.5" fill="var(--fig-text)">任意节点调度、共享无状态、滚动更新与回滚简单</text>
      <text x="14" y="73" font-size="7.5" fill="var(--fig-node-c)">适合：Web 服务、无状态 API、可水平扩展的业务</text>

      <!-- StatefulSet -->
      <rect x="6" y="90" width="328" height="72" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="104" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">StatefulSet：有状态、身份固定且有序</text>
      <text x="14" y="117" font-size="7.5" fill="var(--fig-text)">Pod 名固定有序（mysql-0 / mysql-1 / mysql-2），重建还是「同一个」</text>
      <text x="14" y="129" font-size="7.5" fill="var(--fig-text)">稳定网络标识（headless Service）+ 每 Pod 独立 PVC</text>
      <text x="14" y="141" font-size="7.5" fill="var(--fig-text)">启停有序：0 → 1 → 2，缩容逆序（依赖顺序的业务需要）</text>
      <text x="14" y="155" font-size="7.5" fill="var(--fig-node-c)">适合：数据库、消息队列、需要稳定身份的集群成员</text>

      <!-- DaemonSet -->
      <rect x="6" y="170" width="328" height="56" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="184" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">DaemonSet：每个节点各跑一份</text>
      <text x="14" y="197" font-size="7.5" fill="var(--fig-text)">新节点加入自动创建，节点下线自动清理</text>
      <text x="14" y="211" font-size="7.5" fill="var(--fig-node-c)">适合：日志采集、监控 agent、节点级网络组件</text>

      <!-- 选择 -->
      <rect x="6" y="234" width="328" height="20" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="247" font-size="7.5" fill="var(--fig-node-d)">口诀：Pod 可互换→Deployment；Pod 有身份→StatefulSet；每节点一份→DaemonSet</text>
    </svg>
    <figcaption>Deployment 的 Pod 可互换，StatefulSet 的 Pod 有固定身份与独立存储，DaemonSet 每节点各一份</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
