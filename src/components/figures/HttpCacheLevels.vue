<script setup>
/**
 * HTTP 缓存的三种机制与 Cache-Control 优先级（题 4431）。
 *
 * 核心洞察：强缓存命中则不发请求，协商缓存命中则发请求但只回 304；
 * 优先级是 Cache-Control > Expires，而 no-cache / no-store 含义完全不同。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 266" role="img" aria-label="HTTP 缓存：强缓存命中不发请求、协商缓存回 304、Cache-Control 优先于 Expires">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">强缓存命中「完全不发请求」，协商缓存「发请求但只回 304」</text>

      <rect x="6" y="20" width="328" height="42" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① 强缓存（不发请求）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">Cache-Control: max-age=31536000（或旧式 Expires）</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-node-c)">浏览器直接用本地副本 → 最快，无需任何网络往返</text>

      <rect x="6" y="68" width="328" height="42" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="81" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">② 协商缓存（回 304）</text>
      <text x="14" y="94" font-size="7.5" fill="var(--fig-text)">Last-Modified / If-Modified-Since　·　ETag / If-None-Match</text>
      <text x="14" y="106" font-size="7.5" fill="var(--fig-node-c)">条件请求 → 未变化则 304（省传输体积，仍有一次往返）</text>

      <rect x="6" y="116" width="328" height="42" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="129" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">③ 不缓存</text>
      <text x="14" y="142" font-size="7.5" fill="var(--fig-text)">no-store：完全不存（敏感数据）　·　no-cache：可存但必须回源验证</text>
      <text x="14" y="154" font-size="7.5" fill="var(--fig-node-c)">注意：no-cache ≠ 不缓存，这是最常见的误解</text>

      <!-- 优先级 -->
      <rect x="6" y="174" width="328" height="34" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="187" font-size="8.5" font-weight="700" fill="#e5484d">优先级</text>
      <text x="14" y="200" font-size="7.5" fill="var(--fig-text)">Cache-Control > Expires（后者是绝对时间，受客户端时钟影响）</text>

      <rect x="6" y="214" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="227" font-size="8" font-weight="700" fill="var(--fig-node-d)">前端实践</text>
      <text x="14" y="240" font-size="7.5" fill="var(--fig-text)">静态资源用「文件名哈希 + 长 max-age + immutable」；index.html 用 no-cache</text>

      <text x="6" y="258" font-size="7.5" fill="var(--fig-muted)">排查：curl -I 看响应头；改了资源但用户还是旧的 → 先查是否哈希变了</text>
    </svg>
    <figcaption>强缓存命中不发请求、协商缓存回 304、no-store 才是不存；Cache-Control 优先于 Expires，静态资源靠文件名哈希破缓存</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
