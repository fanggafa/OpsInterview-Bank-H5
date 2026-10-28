<script setup>
/**
 * 缓存三大问题（穿透 / 击穿 / 雪崩）对照图。
 * 这三个概念几乎必被问到，而它们的「触发条件」和「解法」完全不同，
 * 并排对比最能说清区别。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 234" role="img" aria-label="缓存穿透、击穿、雪崩三种问题的触发条件与解法对比">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">三者都会「把请求打到数据库」，但原因和解法完全不同</text>

      <!-- 穿透 -->
      <rect x="6" y="20" width="328" height="62" rx="6" fill="var(--fig-node-a)" opacity=".09" />
      <rect x="6" y="20" width="328" height="62" rx="6" fill="none" stroke="var(--fig-node-a)" stroke-width="1.3" />
      <text x="14" y="36" font-size="9" font-weight="700" fill="var(--fig-node-a)">缓存穿透（Penetration）</text>
      <text x="14" y="50" font-size="7.5" fill="var(--fig-text)">查的 key 根本不存在 → 缓存永远不命中 → 每次都查库（还可能被恶意刷）</text>
      <text x="14" y="63" font-size="7.5" fill="var(--fig-node-c)">解法：布隆过滤器拦住不存在的 key ／ 缓存空值（设短 TTL）／ 参数校验</text>
      <text x="14" y="75" font-size="7" fill="var(--fig-muted)">特征：库的 QPS 升高，但缓存命中率没变化（因为本来就查不到）</text>

      <!-- 击穿 -->
      <rect x="6" y="88" width="328" height="62" rx="6" fill="var(--fig-node-d)" opacity=".09" />
      <rect x="6" y="88" width="328" height="62" rx="6" fill="none" stroke="var(--fig-node-d)" stroke-width="1.3" />
      <text x="14" y="104" font-size="9" font-weight="700" fill="var(--fig-node-d)">缓存击穿（Breakdown）</text>
      <text x="14" y="118" font-size="7.5" fill="var(--fig-text)">单个热点 key 恰好过期 → 瞬间大量请求同时涌向库查同一条数据</text>
      <text x="14" y="131" font-size="7.5" fill="var(--fig-node-c)">解法：互斥锁（只放一个请求回源）／ 逻辑过期（不真过期，后台异步刷新）</text>
      <text x="14" y="143" font-size="7" fill="var(--fig-muted)">特征：某个时刻库上突然出现大量「完全相同的查询」</text>

      <!-- 雪崩 -->
      <rect x="6" y="156" width="328" height="62" rx="6" fill="#e5484d" opacity=".08" />
      <rect x="6" y="156" width="328" height="62" rx="6" fill="none" stroke="#e5484d" stroke-width="1.3" />
      <text x="14" y="172" font-size="9" font-weight="700" fill="#e5484d">缓存雪崩（Avalanche）</text>
      <text x="14" y="186" font-size="7.5" fill="var(--fig-text)">大量 key 在同一时刻过期（或缓存服务整体宕掉）→ 请求全部打到库</text>
      <text x="14" y="199" font-size="7.5" fill="var(--fig-node-c)">解法：过期时间加随机值错峰 ／ 多级缓存 ／ 缓存集群高可用 ／ 降级限流</text>
      <text x="14" y="211" font-size="7" fill="var(--fig-muted)">特征：库瞬间被打满，且「所有接口」一起慢，不只是某一个</text>
    </svg>
    <figcaption>三者的区别：不存在（穿透）、单个过期（击穿）、大面积过期（雪崩）</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
