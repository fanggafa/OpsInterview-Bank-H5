<script setup>
/**
 * Redis 性能突然下降的排查优先级（题 3833）。
 *
 * 核心洞察：先排除「不是 Redis 的问题」（网络/客户端），
 * 再按成本从低到高查：慢查询、大 key、内存与淘汰、持久化、CPU。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 254" role="img" aria-label="Redis 性能下降排查优先级：先排除网络与客户端，再查慢查询、大key、内存淘汰、持久化">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">按「成本从低到高」查：先排除外部因素，再挖内部</text>

      <rect x="6" y="20" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="36" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">①</tspan> 先排除：网络、客户端连接数、超时重试（看 latency 基线）</text>

      <rect x="6" y="50" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="66" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">②</tspan> 慢查询：SLOWLOG GET 看有没有慢命令（KEYS、大范围 ZRANGE）</text>

      <rect x="6" y="80" width="328" height="26" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="96" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">③</tspan> 大 key / 热 key：redis-cli --bigkeys，大 key 删改会造成阻塞</text>

      <rect x="6" y="110" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="126" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">④</tspan> 内存与淘汰：used_memory 是否接近 maxmemory，evicted_keys 是否飙升</text>

      <rect x="6" y="140" width="328" height="26" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="156" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">⑤</tspan> 持久化：AOF rewrite / RDB fork 会明显拖慢（看 latest_fork_usec）</text>

      <rect x="6" y="170" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="186" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">⑥</tspan> CPU 与阻塞：慢命令、过大的 O(N) 操作、swap 是否被使用</text>

      <!-- 关键提醒 -->
      <rect x="6" y="204" width="328" height="34" rx="4" fill="#e5484d" opacity=".12" />
      <text x="14" y="217" font-size="8" font-weight="700" fill="#e5484d">三个杀手级操作</text>
      <text x="14" y="229" font-size="7.5" fill="var(--fig-text)">KEYS * / FLUSHALL / 大 key 的 DEL（用 UNLINK 异步删）—— 都会阻塞主线程</text>

      <text x="6" y="246" font-size="7.5" fill="var(--fig-muted)">注意：Redis 单线程，任何 O(N) 命令在数据量大时都会让整个实例卡住</text>
    </svg>
    <figcaption>按成本从低到高：排除网络/客户端→慢查询→大key→内存淘汰→持久化 fork→CPU阻塞；KEYS/FLUSHALL/大key DEL 是杀手</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
