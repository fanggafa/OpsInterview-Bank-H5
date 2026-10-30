<script setup>
/**
 * MySQL 四种隔离级别与幻读、InnoDB 的实现方式（题 27）。
 *
 * 核心洞察：隔离级别本质是「允许读到什么」的取舍；
 * InnoDB 用「MVCC（快照读）+ 间隙锁（当前读）」在 RR 下避免幻读。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 272" role="img" aria-label="MySQL 四种隔离级别分别解决脏读、不可重复读、幻读，InnoDB 在 RR 下用 MVCC 加快照、间隙锁防幻读">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">隔离级别是「允许读到什么」的取舍；越严格一致性越好、并发越低</text>

      <!-- 四个级别 -->
      <text x="6" y="32" font-size="9" font-weight="700" fill="var(--fig-text)">四种级别与它们解决的问题</text>

      <rect x="6" y="40" width="328" height="26" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="56" font-size="7.5" fill="var(--fig-text)">READ UNCOMMITTED：能读到未提交（脏读）→ 生产几乎不用</text>

      <rect x="6" y="70" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="86" font-size="7.5" fill="var(--fig-text)">READ COMMITTED：解决脏读，仍有不可重复读（同事务两次读不同）</text>

      <rect x="6" y="100" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="116" font-size="7.5" font-weight="700" fill="var(--fig-node-b)">REPEATABLE READ（InnoDB 默认）：解决不可重复读，理论上仍有幻读</text>

      <rect x="6" y="130" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="146" font-size="7.5" fill="var(--fig-text)">SERIALIZABLE：全部串行化，一致性最强、并发最差</text>

      <!-- InnoDB 如何避免幻读 -->
      <rect x="6" y="162" width="328" height="56" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="175" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">InnoDB 在 RR 下如何避免幻读（关键考点）</text>
      <text x="14" y="188" font-size="7.5" fill="var(--fig-text)">快照读（普通 SELECT）→ MVCC：读的是事务开始时的快照，看不到新插入</text>
      <text x="14" y="200" font-size="7.5" fill="var(--fig-text)">当前读（SELECT ... FOR UPDATE / UPDATE / DELETE）→ 间隙锁 + Next-Key Lock</text>
      <text x="14" y="212" font-size="7.5" fill="var(--fig-node-c)">两者配合：快照读不会被幻读影响，当前读用间隙锁阻止插入</text>

      <!-- 实践 -->
      <rect x="6" y="224" width="328" height="34" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="237" font-size="8" font-weight="700" fill="var(--fig-node-c)">实践建议</text>
      <text x="14" y="250" font-size="7.5" fill="var(--fig-text)">多数业务用默认 RR；读多写少可考虑 RC（减少间隙锁、降低死锁概率）</text>

      <text x="6" y="268" font-size="7.5" fill="var(--fig-muted)">排查提示：RC 与 RR 的死锁表现不同，线上改隔离级别要评估间隙锁的影响</text>
    </svg>
    <figcaption>四级别分别解决脏读/不可重复读/幻读；InnoDB 在 RR 下靠 MVCC 处理快照读、间隙锁处理当前读</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
