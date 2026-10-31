<script setup>
/**
 * etcd 查看集群状态（题 4769）。
 *
 * 核心洞察：etcdctl 的重点是四个命令（健康、成员、端点状态、快照），
 * 而 dbSize 接近配额会让集群变只读 —— 这是最需要提前监控的指标。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 240" role="img" aria-label="etcdctl 四个关键命令：endpoint health、member list、endpoint status、snapshot save">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">四个命令看健康、成员、端点状态、备份</text>

      <rect x="6" y="20" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="37" font-size="7.5" fill="var(--fig-node-a)"><tspan font-weight="700">endpoint health --cluster</tspan>　所有端点是否健康（最常用）</text>

      <rect x="6" y="50" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="67" font-size="7.5" fill="var(--fig-node-b)"><tspan font-weight="700">member list -w table</tspan>　有几个成员、谁是 learner</text>

      <rect x="6" y="80" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="97" font-size="7.5" fill="var(--fig-node-c)"><tspan font-weight="700">endpoint status -w table</tspan>　isLeader / raftIndex / dbSize</text>

      <rect x="6" y="110" width="328" height="26" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="127" font-size="7.5" fill="var(--fig-node-d)"><tspan font-weight="700">snapshot save</tspan>　备份（必须演练恢复，否则等于没备份）</text>

      <!-- 关键字段 -->
      <rect x="6" y="144" width="328" height="46" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="157" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">输出里最该看的四个字段</text>
      <text x="14" y="170" font-size="7.5" fill="var(--fig-text)">isLeader（只能有一个）· raftIndex/raftTerm（差距大说明落后）</text>
      <text x="14" y="182" font-size="7.5" fill="var(--fig-text)">dbSize（含碎片，接近配额会告警）· errors（端点是否可达）</text>

      <rect x="6" y="196" width="328" height="30" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="209" font-size="8" font-weight="700" fill="#e5484d">最危险的运维项</text>
      <text x="14" y="221" font-size="7.5" fill="var(--fig-text)">dbSize 达到配额（默认 2GB）→ NOSPACE 告警 → 集群变只读</text>

      <text x="6" y="232" font-size="7.5" fill="var(--fig-muted)">etcd 慢会表现为「所有 kubectl 操作变慢」—— 排查整体卡顿的关键切入点</text>
    </svg>
    <figcaption>四个命令看健康/成员/端点状态/备份；重点看 isLeader、raftIndex 差、dbSize；dbSize 触配额会让集群变只读</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
