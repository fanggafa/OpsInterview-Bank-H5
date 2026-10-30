<script setup>
/**
 * P99 升高但 QPS 与错误率正常（题 5025）。
 *
 * 核心洞察：平均值/QPS 正常说明「大部分请求没问题」，P99 升高是「长尾变长」；
 * 常见于 GC 停顿、下游偶发慢、连接池排队、缓存偶发未命中。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 250" role="img" aria-label="P99 升高但 QPS 与错误率正常的五类长尾原因：GC 停顿、下游偶发慢、连接池排队、缓存未命中、锁竞争">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">QPS 与错误率正常 = 大部分请求没问题；P99 升高 = 长尾变长了</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">先确认：是「整体变慢」还是「少数极慢」</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">看 P50/P90/P99/P999 一起变还是只有 P99 变 → 后者才是长尾问题</text>

      <rect x="6" y="54" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">① GC 停顿：某些请求刚好落在 STW 窗口里</text>

      <rect x="6" y="84" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="100" font-size="7.5" fill="var(--fig-text)">② 下游偶发慢：DB 慢查询、缓存回源、三方 API 超时</text>

      <rect x="6" y="114" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="130" font-size="7.5" fill="var(--fig-text)">③ 连接池排队：高峰期偶发拿不到连接</text>

      <rect x="6" y="144" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)">④ 缓存偶发未命中：少量请求走了慢路径</text>

      <rect x="6" y="174" width="328" height="26" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="190" font-size="7.5" fill="var(--fig-text)">⑤ 锁竞争 / 线程池打满：少数请求排队等很久</text>

      <rect x="6" y="204" width="328" height="30" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="217" font-size="8" font-weight="700" fill="#e5484d">最有效的手段</text>
      <text x="14" y="229" font-size="7.5" fill="var(--fig-text)">抓「慢请求样本」：追踪里筛 duration &gt; P99，看耗时集中在哪一段</text>

      <text x="6" y="246" font-size="7.5" fill="var(--fig-muted)">对比「正常请求」与「慢请求」的差异（带特定参数？走特定分片？），通常一眼看出</text>
    </svg>
    <figcaption>P99 升高多为长尾：GC 停顿、下游偶发慢、连接池排队、缓存未命中、锁竞争；最有效是抓慢请求样本对比</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
