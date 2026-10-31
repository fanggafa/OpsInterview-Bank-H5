<script setup>
/**
 * Kibana 里按「错误日志突增」做可视化与排查（题 3017）。
 *
 * 核心洞察：突增排查的关键是「先看总量与基线，再按维度拆」——
 * 按服务、异常类型、来源 IP 拆开，很快能定位是「新问题」还是「量变了」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 240" role="img" aria-label="错误日志突增的四步：建立基线看板、按维度拆分、对比变更、沉淀告警">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">先建基线，再按维度拆 —— 不要一上来就翻原始日志</text>

      <rect x="6" y="20" width="328" height="28" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="38" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">①</tspan> 先建基线看板：按时间分桶的错误总数 + 同比昨天同时段</text>

      <rect x="6" y="52" width="328" height="28" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">②</tspan> 按维度拆：service / level / exception 类型 / 来源 IP 的 Top N</text>

      <rect x="6" y="84" width="328" height="28" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="102" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">③</tspan> 对齐变更：突增时间点 vs 发布/配置/上游故障时间</text>

      <rect x="6" y="116" width="328" height="28" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="134" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">④</tspan> 点进具体日志：用看到的 trace_id / 请求 ID 追到下钻</text>

      <!-- 关键判断 -->
      <rect x="6" y="152" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="165" font-size="8.5" font-weight="700" fill="#e5484d">两种情况，处理完全不同</text>
      <text x="14" y="178" font-size="7.5" fill="var(--fig-text)">量变了（QPS 涨、重试涨）→ 看上游与流量，不是代码 bug</text>
      <text x="14" y="190" font-size="7.5" fill="var(--fig-text)">出现「新类型错误」→ 多半是发布/配置/依赖变更引入</text>

      <rect x="6" y="202" width="328" height="18" rx="3" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="215" font-size="7.5" fill="var(--fig-text)">可视化技巧：用 date histogram + 拆分序列（split series）看是哪一维在涨</text>

      <text x="6" y="230" font-size="7.5" fill="var(--fig-muted)">沉淀：把「突增」做成定时告警（同比阈值），而不是每次人工去看</text>
    </svg>
    <figcaption>四步：建基线看板、按维度拆 Top N、对齐变更时间、用 trace_id 下钻；先分清「量变了」还是「新类型错误」</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
