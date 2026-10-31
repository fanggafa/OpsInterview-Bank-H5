<script setup>
/**
 * 虚拟机里数据库 IO 性能很差（题 2609）。
 *
 * 核心洞察：虚拟化多了一层「存储路径」，IO 差往往不是磁盘本身，
 * 而是缓存策略、队列深度、存储后端（本地/共享/NFS）与超分。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 258" role="img" aria-label="虚拟机数据库 IO 差的四层原因：缓存策略、队列深度、存储后端、资源超分，以及排查手段">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">物理机 IO 好不代表 VM 好 —— 中间多了缓存与队列两层</text>

      <rect x="6" y="20" width="328" height="32" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">降低 IO 差的三层怀疑</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">① 磁盘缓存策略（writeback 快但有丢数据风险）；② 虚拟队列深度不足</text>

      <rect x="6" y="56" width="328" height="32" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="69" font-size="8" font-weight="700" fill="var(--fig-node-b)">③ 存储后端类型</text>
      <text x="14" y="81" font-size="7.5" fill="var(--fig-text)">本地 SSD &gt; SAN &gt; NFS/网络存储；后端带宽与 IOPS 上限决定天花板</text>

      <rect x="6" y="92" width="328" height="32" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="105" font-size="8" font-weight="700" fill="var(--fig-node-c)">④ 是否超分（overcommit）</text>
      <text x="14" y="117" font-size="7.5" fill="var(--fig-text)">多台 VM 共享同一 LUN/后端 → 互相抢 IOPS，单看一台看不出问题</text>

      <!-- 排查 -->
      <rect x="6" y="128" width="328" height="50" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="141" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">排查手段（VM 内 + 宿主机）</text>
      <text x="14" y="154" font-size="7.5" fill="var(--fig-text)">VM 内：iostat -x 看 await/%util、fio 压测基线；explain 看是否缺索引</text>
      <text x="14" y="166" font-size="7.5" fill="var(--fig-text)">宿主机：看数据存储延迟（datastore latency）、队列深度、其他 VM 的 IO</text>

      <rect x="6" y="184" width="328" height="32" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="197" font-size="8" font-weight="700" fill="var(--fig-node-a)">数据库侧（别只怪虚拟化）</text>
      <text x="14" y="209" font-size="7.5" fill="var(--fig-text)">redo/binlog 刷盘频率、脏页比例、临时表落盘都会放大 IO 问题</text>

      <rect x="6" y="222" width="328" height="20" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="236" font-size="7.5" fill="var(--fig-text)">结论：先用 fio 测「裸存储基线」，再和业务实际 IO 对比，才知道差在哪</text>

      <text x="6" y="248" font-size="7.5" fill="var(--fig-muted)">优化：给关键 DB 独立 LUN/物理盘、开足够队列深度、避开与高 IO 业务同宿主机</text>
    </svg>
    <figcaption>IO 差要看缓存策略、队列深度、存储后端与超分四层；用 fio 测裸存储基线再与业务 IO 对比定位</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
