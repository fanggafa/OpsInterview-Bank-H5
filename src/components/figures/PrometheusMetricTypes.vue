<script setup>
/**
 * Prometheus 四种指标类型与 counter 为何要配 rate（题 55）。
 *
 * 核心洞察：四种类型各回答不同问题；counter 是「只增不减的累计值」，
 * 直接看原值没有意义 —— 必须 rate/increase 才能变成「速率」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 270" role="img" aria-label="Prometheus 四种指标类型 Counter、Gauge、Histogram、Summary 的用途，以及 counter 必须用 rate 才有意义">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">四种类型各回答不同问题；counter 必须用 rate 才有意义</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">Counter（只增不减）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">请求总数、错误总数、发送字节数（重启会归零）</text>

      <rect x="6" y="58" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="71" font-size="8" font-weight="700" fill="var(--fig-node-b)">Gauge（可增可减）</text>
      <text x="14" y="84" font-size="7.5" fill="var(--fig-text)">当前并发数、队列长度、内存占用、温度</text>

      <rect x="6" y="96" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="109" font-size="8" font-weight="700" fill="var(--fig-node-c)">Histogram（分桶计数）</text>
      <text x="14" y="122" font-size="7.5" fill="var(--fig-text)">延迟分布：_bucket/_sum/_count，可算分位数（需 by (le)）</text>

      <rect x="6" y="134" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="147" font-size="8" font-weight="700" fill="var(--fig-node-d)">Summary（客户端算分位）</text>
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)">也在客户端算分位数，但各实例分位数不能跨实例平均</text>

      <!-- 为什么用 rate -->
      <rect x="6" y="176" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="189" font-size="8.5" font-weight="700" fill="#e5484d">为什么 counter 要配 rate</text>
      <text x="14" y="202" font-size="7.5" fill="var(--fig-text)">counter 原值是「自启动以来的累计」，看它只会看到单调上升的斜线</text>
      <text x="14" y="214" font-size="7.5" fill="var(--fig-text)">rate(x[5m]) = 过去 5 分钟平均每秒增长 → 这才是有意义的「速率」</text>

      <rect x="6" y="230" width="328" height="20" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="244" font-size="7.5" fill="var(--fig-node-c)">rate 会自动处理重启归零（这是它优于手算差值的原因）</text>

      <text x="6" y="262" font-size="7.5" fill="var(--fig-muted)">易混点：increase(x[5m]) 是「5 分钟内增量」，rate 是「每秒增量」</text>
    </svg>
    <figcaption>Counter 只增、Gauge 可增减、Histogram 可算分位、Summary 客户端算；counter 必须 rate 才有意义</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
