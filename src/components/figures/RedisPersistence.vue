<script setup>
/**
 * Redis 持久化与过期淘汰图。
 * 展示 RDB/AOF 两种持久化的取舍，以及 maxmemory-policy 的常见选择。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 236" role="img" aria-label="Redis 的 RDB 与 AOF 持久化对比及内存淘汰策略">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">持久化解决「重启不丢数据」，淘汰解决「内存满了怎么办」</text>

      <!-- RDB -->
      <rect x="6" y="20" width="160" height="86" rx="7" fill="var(--fig-node-a)" opacity=".08" />
      <rect x="6" y="20" width="160" height="86" rx="7" fill="none" stroke="var(--fig-node-a)" stroke-width="1.4" />
      <text x="14" y="36" font-size="9.5" font-weight="700" fill="var(--fig-node-a)">RDB · 快照</text>
      <text x="14" y="52" font-size="8" fill="var(--fig-text)">按条件 fork 子进程，把全量数据写成快照文件</text>
      <text x="14" y="66" font-size="8" fill="var(--fig-node-c)">✓ 文件小、恢复快（适合备份/迁移）</text>
      <text x="14" y="80" font-size="8" fill="var(--fig-node-d)">✗ 会丢「最后一次快照之后」的数据</text>
      <text x="14" y="94" font-size="8" fill="var(--fig-node-d)">✗ fork 时内存翻倍风险（大实例）</text>

      <!-- AOF -->
      <rect x="174" y="20" width="160" height="86" rx="7" fill="var(--fig-node-c)" opacity=".08" />
      <rect x="174" y="20" width="160" height="86" rx="7" fill="none" stroke="var(--fig-node-c)" stroke-width="1.4" />
      <text x="182" y="36" font-size="9.5" font-weight="700" fill="var(--fig-node-c)">AOF · 追加日志</text>
      <text x="182" y="52" font-size="8" fill="var(--fig-text)">把每条写命令追加到日志（appendonly yes）</text>
      <text x="182" y="66" font-size="8" fill="var(--fig-node-c)">✓ 丢数据少（everysec 最多丢 1 秒）</text>
      <text x="182" y="80" font-size="8" fill="var(--fig-node-d)">✗ 文件大、恢复慢（要重放全部命令）</text>
      <text x="182" y="94" font-size="8" fill="var(--fig-node-b)">→ 需定期 rewrite 压缩</text>

      <!-- 常见配置 -->
      <text x="6" y="122" font-size="9.5" font-weight="700" fill="var(--fig-text)">生产的现实选择</text>
      <text x="6" y="136" font-size="8.5" fill="var(--fig-muted)">纯缓存（可重建）→ 关闭持久化，只靠主从</text>
      <text x="6" y="150" font-size="8.5" fill="var(--fig-node-c)">既要快又要少丢 → RDB + AOF 同时开（4.0+ 默认混合持久化）</text>
      <text x="6" y="164" font-size="8.5" fill="var(--fig-node-d)">appendfsync: everysec（默认，折中）｜ always（最安全但极慢）｜ no（最快，靠 OS）</text>

      <!-- 淘汰策略 -->
      <rect x="6" y="174" width="328" height="56" rx="7" fill="var(--fig-node-b)" opacity=".08" />
      <rect x="6" y="174" width="328" height="56" rx="7" fill="none" stroke="var(--fig-node-b)" stroke-width="1.2" />
      <text x="16" y="190" font-size="9.5" font-weight="700" fill="var(--fig-node-b)">maxmemory-policy（内存满时的行为）</text>
      <text x="16" y="204" font-size="8.5" fill="var(--fig-node-c)">allkeys-lru / allkeys-lfu → 纯缓存场景（推荐 lru，热点用 lfu）</text>
      <text x="16" y="218" font-size="8.5" fill="var(--fig-node-d)">noeviction（默认）→ 写请求直接报 OOM 错误，这是「新装 Redis 撑爆业务」的常见原因</text>
      <text x="16" y="228" font-size="8" fill="var(--fig-muted)">volatile-* 只淘汰设了过期时间的 key —— 若没设 TTL，等于不淘汰 </text>
    </svg>
    <figcaption>排查 Redis 内存问题先看两项：maxmemory 设了多少、policy 是什么</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
