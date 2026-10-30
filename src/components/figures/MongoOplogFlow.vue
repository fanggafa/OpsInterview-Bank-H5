<script setup>
/**
 * MongoDB oplog 工作原理与运维要点（题 2006）。
 *
 * 核心洞察：oplog 是固定大小的 capped collection，从节点 tail 它重放；
 * 它不是 binlog —— 记录的是「幂等的操作效果」，且窗口大小决定
 * 「从节点能落后多久还能追上」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 274" role="img" aria-label="MongoDB oplog 原理：主节点写操作同时写入 oplog，从节点 tail 并重放，oplog 是固定大小环形集合">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">oplog 是固定大小的 capped collection，从节点 tail 它重放</text>

      <!-- 数据流 -->
      <rect x="6" y="20" width="96" height="34" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">主节点</text>
      <text x="14" y="46" font-size="7" fill="var(--fig-text)">执行写操作</text>

      <text x="106" y="40" font-size="9" fill="var(--fig-muted)">→</text>

      <rect x="118" y="20" width="106" height="34" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="126" y="33" font-size="8" font-weight="700" fill="var(--fig-node-b)">local.oplog.rs</text>
      <text x="126" y="46" font-size="7" fill="var(--fig-text)">记录操作（幂等）</text>

      <text x="228" y="40" font-size="9" fill="var(--fig-muted)">→</text>

      <rect x="238" y="20" width="96" height="34" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="246" y="33" font-size="8" font-weight="700" fill="var(--fig-node-c)">从节点</text>
      <text x="246" y="46" font-size="7" fill="var(--fig-text)">tail + 重放</text>

      <!-- 不是 binlog -->
      <rect x="6" y="62" width="328" height="34" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="75" font-size="8.5" font-weight="700" fill="#e5484d">关键：它不是 binlog</text>
      <text x="14" y="88" font-size="7.5" fill="var(--fig-text)">binlog 记「逻辑语句」，oplog 记「操作效果（apply）」→ 重放天然幂等</text>

      <!-- 固定大小 -->
      <rect x="6" y="104" width="328" height="52" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="117" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">固定大小 = 环形缓冲（窗口）</text>
      <text x="14" y="130" font-size="7.5" fill="var(--fig-text)">写满后覆盖最旧的记录 → 窗口 = 「从节点最多能落后多久还能追上」</text>
      <text x="14" y="142" font-size="7.5" fill="var(--fig-text)">窗口太短的后果：从节点维护/网络中断超过窗口 → 必须全量重同步</text>

      <!-- 运维要点 -->
      <text x="6" y="172" font-size="9" font-weight="700" fill="var(--fig-text)">运维要点</text>

      <rect x="6" y="180" width="328" height="24" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="196" font-size="7.5" fill="var(--fig-text)">查看窗口：rs.printReplicationInfo() 的 log length start to end</text>

      <rect x="6" y="208" width="328" height="24" rx="4" fill="var(--fig-node-c)" opacity=".08" />
      <text x="14" y="224" font-size="7.5" fill="var(--fig-text)">扩窗口：db.adminCommand({replSetResizeOplog:1, size:&lt;MB&gt;})（4.0+ 可在线）</text>

      <rect x="6" y="236" width="328" height="24" rx="4" fill="var(--fig-node-c)" opacity=".06" />
      <text x="14" y="252" font-size="7.5" fill="var(--fig-text)">看延迟：rs.printSlaveReplicationInfo() 显示落后多少秒</text>

      <text x="6" y="266" font-size="7.5" fill="var(--fig-muted)">容量建议：窗口至少覆盖「最长维护窗口 + 从节点落后时间」再留余量</text>
    </svg>
    <figcaption>oplog 记录「操作效果」而非语句，天然幂等；它是固定大小的环形窗口，窗口太短就会逼从节点全量重同步</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
