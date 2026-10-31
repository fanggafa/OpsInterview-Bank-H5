<script setup>
/**
 * MySQL 主从复制延迟的排查（题 3719）。
 *
 * 核心洞察：延迟要么是「主库产生太快」、要么是「从库应用太慢」；
 * 用 Seconds_Behind_Master 与 Relay_Log 堆积先分方向，再往下查。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 248" role="img" aria-label="主从延迟排查：先看 Seconds_Behind_Master 与 Relay_Log 堆积，再分主库产生快或从库应用慢">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">先分清是「主库产得快」还是「从库应用慢」，两侧解法完全不同</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① 看指标：Seconds_Behind_Master</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">SHOW SLAVE STATUS：IO/SQL 线程状态、Relay_Log 位点差</text>

      <rect x="6" y="54" width="160" height="68" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="67" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">A：主库产生太快</text>
      <text x="14" y="80" font-size="7.5" fill="var(--fig-text)">大批量写入 / DDL</text>
      <text x="14" y="92" font-size="7.5" fill="var(--fig-text)">大事务（一次改百万行）</text>
      <text x="14" y="104" font-size="7.5" fill="var(--fig-text)">binlog 量大 → 传输吃不消</text>
      <text x="14" y="116" font-size="7" fill="var(--fig-node-c)">解法：拆小事务、错峰</text>

      <rect x="174" y="54" width="160" height="68" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="182" y="67" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">B：从库应用太慢</text>
      <text x="182" y="80" font-size="7.5" fill="var(--fig-text)">从库磁盘/CPU 弱于主库</text>
      <text x="182" y="92" font-size="7.5" fill="var(--fig-text)">单线程回放（老版本）</text>
      <text x="182" y="104" font-size="7.5" fill="var(--fig-text)">从库上还跑查询/备份</text>
      <text x="182" y="116" font-size="7" fill="var(--fig-node-c)">解法：并行复制、加资源</text>

      <rect x="6" y="130" width="328" height="48" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="143" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">快速判断在 A 还是 B（看 Relay_Log 堆积）</text>
      <text x="14" y="156" font-size="7.5" fill="var(--fig-text)">Relay_Log 持续堆积（IO 追得上、SQL 追不上）→ B：应用慢</text>
      <text x="14" y="168" font-size="7.5" fill="var(--fig-text)">Relay_Log 为空但延迟仍涨（IO 都追不上）→ 网络或主库产生太快</text>

      <rect x="6" y="186" width="328" height="32" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="199" font-size="8" font-weight="700" fill="var(--fig-node-b)">改善手段</text>
      <text x="14" y="211" font-size="7.5" fill="var(--fig-text)">并行复制（slave_parallel_workers）· 半同步 · 按延迟路由读写分离</text>

      <text x="6" y="238" font-size="7.5" fill="var(--fig-muted)">注意：该指标可能显示 0 但仍有延迟（时钟/大事务），要结合位点差判断</text>
    </svg>
    <figcaption>用 Relay_Log 堆积判断是主库产生快还是从库应用慢；解法分别是拆事务错峰与并行复制/加资源</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
