<script setup>
/**
 * Redis 主从切换后的两类故障分流（题 3816）。
 *
 * 核心洞察：切换后的问题分两条线——「连不上/报错」和「丢数据」，
 * 报错很多是客户端还连着旧角色（READONLY）或集群槽位问题（MOVED/CLUSTERDOWN）。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 268" role="img" aria-label="Redis 主从切换后的排查：报错类 READONLY、MOVED、CLUSTERDOWN，数据类丢写与延迟">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">切换后的故障分两条线：报错（连错角色）与丢数据（窗口内写丢失）</text>

      <!-- A 报错 -->
      <rect x="6" y="20" width="328" height="76" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="34" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">A. 客户端报错（多数是「连错角色」）</text>
      <text x="14" y="47" font-size="7.5" fill="var(--fig-text)">READONLY：连到了从库（从库默认 read_only）→ 客户端要能跟随切主</text>
      <text x="14" y="59" font-size="7.5" fill="var(--fig-text)">MOVED xxx：集群模式，key 不在当前节点 → 客户端应跟随重定向</text>
      <text x="14" y="71" font-size="7.5" fill="var(--fig-text)">CLUSTERDOWN：槽位未全覆盖 → 检查节点加入与 cluster info</text>
      <text x="14" y="87" font-size="7.5" fill="var(--fig-node-d)">连接超时/被拒：新主未就绪、DNS/VIP 未切换、安全组未放行</text>

      <!-- B 丢数据 -->
      <rect x="6" y="104" width="328" height="62" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="118" font-size="8.5" font-weight="700" fill="#e5484d">B. 数据丢失（异步复制的固有代价）</text>
      <text x="14" y="131" font-size="7.5" fill="var(--fig-text)">主库在切换前已确认、但还没同步到从库的写入 → 永久丢失</text>
      <text x="14" y="143" font-size="7.5" fill="var(--fig-text)">RPO 不为 0：要压低就得用 WAIT 命令或 min-replicas-to-write</text>
      <text x="14" y="157" font-size="7.5" fill="var(--fig-node-c)">排查：对比主从 offset、看 INFO replication 的 repl_offset 差</text>

      <!-- 排查顺序 -->
      <rect x="6" y="174" width="328" height="46" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="187" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">排查顺序</text>
      <text x="14" y="199" font-size="7.5" fill="var(--fig-text)">① 先确认「谁是主」（INFO replication 的 role）→ ② 客户端指向是否正确</text>
      <text x="14" y="211" font-size="7.5" fill="var(--fig-text)">③ 再看是否有数据缺口（对比 offset / 业务对账）</text>

      <rect x="6" y="228" width="328" height="24" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="244" font-size="7.5" fill="var(--fig-text)">易混点：READONLY 是「连错库」，不是「没权限」——别去查 ACL</text>

      <text x="6" y="260" font-size="7.5" fill="var(--fig-muted)">收官建议：客户端要有「切主后重连/重读拓扑」能力，否则每次切换都会疼一次</text>
    </svg>
    <figcaption>切换后先分两条线：报错多是连错角色（READONLY/MOVED），丢数据是异步复制窗口内的写</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
