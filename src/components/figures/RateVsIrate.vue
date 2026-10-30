<script setup>
/**
 * PromQL 的 rate / irate 与 P99 的正确写法（题 56）。
 *
 * 核心洞察：rate 用整个窗口做线性回归（平滑），irate 只看最后两点（灵敏但抖）；
 * 而 P99 必须用 histogram_quantile 配 sum by (le)，直接平均各实例 P99 是错的。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 258" role="img" aria-label="rate 用整窗口平滑、irate 只看最后两点；P99 要用 histogram_quantile 且 sum by le，不能平均各实例分位数">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">rate 平滑但迟钝，irate 灵敏但抖；P99 不能靠平均</text>

      <rect x="6" y="20" width="160" height="58" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">rate</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">用窗口内所有点做回归</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">平滑、适合告警</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-node-c)">缺点：反应慢</text>

      <rect x="174" y="20" width="160" height="58" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">irate</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">只看最后两个点</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">灵敏、适合看瞬时变化</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-node-c)">缺点：抖动大，不适合告警</text>

      <!-- P99 -->
      <rect x="6" y="86" width="328" height="60" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="99" font-size="8.5" font-weight="700" fill="#e5484d">P99 的正确写法</text>
      <text x="14" y="112" font-size="7.5" fill="var(--fig-text)">histogram_quantile(0.99, sum by (le) (rate(http_duration_bucket[5m])))</text>
      <text x="14" y="124" font-size="7.5" fill="var(--fig-text)">必须 sum by (le)：先聚合分桶再算分位</text>
      <text x="14" y="136" font-size="7.5" fill="var(--fig-node-c)">分桶边界要覆盖业务范围，太粗会让 P99 失真</text>

      <rect x="6" y="154" width="328" height="42" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="167" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">最常见的错误</text>
      <text x="14" y="180" font-size="7.5" fill="var(--fig-text)">把各实例的 P99 取平均 → 数学上错误，会严重低估长尾</text>
      <text x="14" y="192" font-size="7.5" fill="var(--fig-text)">Summary 类型的分位数不能跨实例聚合（这也是要用 Histogram 的原因）</text>

      <rect x="6" y="204" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="217" font-size="8" font-weight="700" fill="var(--fig-node-d)">写规则的建议</text>
      <text x="14" y="230" font-size="7.5" fill="var(--fig-text)">告警用 rate（平滑，避免抖动误报）；排查瞬时尖峰用 irate</text>

      <text x="6" y="252" font-size="7.5" fill="var(--fig-muted)">窗口至少含 2 个采样点：rate(x[1m]) 在 15s 抓取下只有 4 点，已接近极限</text>
    </svg>
    <figcaption>rate 平滑适合告警、irate 灵敏适合看瞬时；P99 必须 histogram_quantile + sum by (le)，不能平均各实例分位数</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
