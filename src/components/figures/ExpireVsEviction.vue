<script setup>
/**
 * Redis 的过期删除与内存淘汰（题 3918）。
 *
 * 核心洞察：过期删除是「按 key 的 TTL 清理」，内存淘汰是「内存满了赶谁走」；
 * 前者定时+惰性，后者靠 maxmemory-policy 策略 —— 两套机制完全不同。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 252" role="img" aria-label="过期删除是定时加惰性清理 TTL 到期 key，内存淘汰是 maxmemory 满后按策略驱逐">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">两套机制：一套管「key 到期」，一套管「内存满了赶谁」</text>

      <rect x="6" y="20" width="160" height="86" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">过期删除</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">依据：每个 key 的 TTL</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">① 惰性：访问时检查已到期</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">② 定期：周期抽样扫描</text>
      <text x="14" y="82" font-size="7.5" fill="var(--fig-node-c)">未及时清理的会一直占内存</text>
      <text x="14" y="94" font-size="7" fill="var(--fig-node-c)">不会删「没设 TTL 的 key」</text>

      <rect x="174" y="20" width="160" height="86" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">内存淘汰</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">依据：maxmemory 上限</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">触发：内存用满才启动</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">策略：allkeys-* / volatile-*</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-text)">可选 LRU / LFU / random / ttl</text>
      <text x="182" y="94" font-size="7" fill="#e5484d">noeviction 会写失败（默认）</text>

      <!-- 关键区别 -->
      <rect x="6" y="116" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="129" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">三个容易混淆的点</text>
      <text x="14" y="142" font-size="7.5" fill="var(--fig-text)">① allkeys 会淘汰所有 key（含没设 TTL 的）；volatile 只淘汰设了 TTL 的</text>
      <text x="14" y="154" font-size="7.5" fill="var(--fig-text)">② 淘汰不看「重要性」，只看策略 —— 别把不可丢的数据和缓存放同一个实例</text>

      <rect x="6" y="170" width="328" height="34" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="183" font-size="8" font-weight="700" fill="#e5484d">最常见的生产事故</text>
      <text x="14" y="195" font-size="7.5" fill="var(--fig-text)">默认 noeviction → 内存满后**写入全部报错**，但读还能用（容易被误判成「偶发」）</text>

      <rect x="6" y="212" width="328" height="20" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="226" font-size="7.5" fill="var(--fig-text)">建议：纯缓存用 allkeys-lru；有持久数据要评估 maxmemory 与实例隔离</text>

      <text x="6" y="244" font-size="7.5" fill="var(--fig-muted)">排查：info memory 看 used_memory、evicted_keys、expired_keys 三个关键计数</text>
    </svg>
    <figcaption>过期删除按 TTL（惰性+定期），内存淘汰在 maxmemory 满后按策略驱逐；默认 noeviction 会让写入直接失败</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
