<script setup>
/**
 * WiredTiger 的核心结构（题 2010）。
 *
 * 核心洞察：WiredTiger 用「文档级并发 + MVCC + WAL + checkpoint」四件事，
 * 换掉了 MMAPv1 的库级锁；理解这四点就能解释 MongoDB 的并发与持久化行为。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 276" role="img" aria-label="WiredTiger 四个核心机制：文档级并发控制、MVCC、WAL journal、checkpoint，与 MMAPv1 的库级锁对比">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">用「文档级并发 + MVCC + WAL + checkpoint」取代 MMAPv1 的库级锁</text>

      <!-- 四机制 -->
      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① 文档级并发控制</text>
      <text x="150" y="33" font-size="7.5" fill="var(--fig-text)">不同文档可并发写</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-node-c)">对比：MMAPv1 是库级锁，并发写几乎串行</text>

      <rect x="6" y="54" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="67" font-size="8" font-weight="700" fill="var(--fig-node-b)">② MVCC 多版本</text>
      <text x="126" y="67" font-size="7.5" fill="var(--fig-text)">读拿到快照，不阻塞写、写不阻塞读</text>
      <text x="14" y="79" font-size="7.5" fill="var(--fig-node-c)">这也是「读一致性」与 readConcern 的基础</text>

      <rect x="6" y="88" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="101" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ WAL（journal）先写日志</text>
      <text x="172" y="101" font-size="7.5" fill="var(--fig-text)">保证崩溃后可恢复</text>
      <text x="14" y="113" font-size="7.5" fill="var(--fig-node-c)">j:true 时提交即 fsync；决定「断电最多丢多少」</text>

      <rect x="6" y="122" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="135" font-size="8" font-weight="700" fill="var(--fig-node-d)">④ Checkpoint 周期刷盘</text>
      <text x="178" y="135" font-size="7.5" fill="var(--fig-text)">默认 60s 落一个一致快照</text>
      <text x="14" y="147" font-size="7.5" fill="var(--fig-node-c)">决定恢复起点；脏页超过阈值会触发强制刷盘</text>

      <!-- 关键指标 -->
      <rect x="6" y="160" width="328" height="40" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="173" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">两个必看指标（都在 db.serverStatus().wiredTiger.cache）</text>
      <text x="14" y="186" font-size="7.5" fill="var(--fig-text)">dirty bytes：已改未刷盘的页 → 超阈值触发强制驱逐，写入延迟尖峰</text>
      <text x="14" y="197" font-size="7.5" fill="var(--fig-text)">cache used：接近上限说明热数据集超出缓存，需要加内存或改访问模式</text>

      <!-- 结论 -->
      <rect x="6" y="208" width="328" height="34" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="221" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">为什么这些设计重要</text>
      <text x="14" y="234" font-size="7.5" fill="var(--fig-text)">高并发写不互相阻塞（①③），读不被写挡住（②），崩溃能恢复（③④）</text>

      <text x="6" y="258" font-size="7.5" fill="var(--fig-muted)">容量提示：容器里「可用内存」可能按宿主机算，要显式配 cacheSizeGB</text>
      <text x="6" y="270" font-size="7.5" fill="var(--fig-muted)">易混点：journal 决定「丢多少」，checkpoint 决定「恢复起点」，两者互补</text>
    </svg>
    <figcaption>WiredTiger 用文档级并发、MVCC、WAL、checkpoint 四点取代 MMAPv1 库级锁；dirty bytes 与 cache used 是两个必看指标</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
