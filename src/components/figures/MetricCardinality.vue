<script setup>
/**
 * 指标基数爆炸的排查与治理（题 5031）。
 *
 * 核心洞察：序列数 = 标签组合数，只要某个标签取值很多（用户 ID、URL 全路径），
 * 基数就会爆炸 —— 排查靠「按指标统计序列数」，治理靠「去掉高基数标签」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 254" role="img" aria-label="指标基数爆炸由高基数标签引起，排查按指标统计序列数，治理是去掉高基数标签">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">序列数 = 标签组合数；一个高基数标签就能让基数爆炸</text>

      <rect x="6" y="20" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="#e5484d">典型高基数标签（都要避免）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">user_id / request_id / trace_id / 时间戳 / error_message 原文</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">URL 全路径（/api/orders/123456，每个 ID 一条序列）</text>

      <rect x="6" y="70" width="328" height="42" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="83" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">排查：哪个指标序列最多</text>
      <text x="14" y="96" font-size="7.5" fill="var(--fig-text)">topk(10, count by (__name__)({__name__=~".+"}))</text>
      <text x="14" y="108" font-size="7.5" fill="var(--fig-node-c)">再看该指标里哪个标签取值最多（用 count by (标签)）</text>

      <rect x="6" y="116" width="328" height="46" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="129" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">治理手段</text>
      <text x="14" y="142" font-size="7.5" fill="var(--fig-text)">① URL 用路由模板（/api/orders/:id）而不是实际路径</text>
      <text x="14" y="154" font-size="7.5" fill="var(--fig-text)">② 需要维度分析就用日志/追踪，不要塞进指标标签</text>

      <rect x="6" y="166" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="179" font-size="8" font-weight="700" fill="var(--fig-node-c)">还有两条</text>
      <text x="14" y="191" font-size="7.5" fill="var(--fig-text)">③ 用 relabeling 丢弃无用标签 ④ 给基数设阈值告警（早发现）</text>

      <rect x="6" y="204" width="328" height="24" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="220" font-size="7.5" fill="var(--fig-node-d)">后果：Prometheus 内存暴涨、查询变慢、甚至 OOM 重启</text>

      <text x="6" y="244" font-size="7.5" fill="var(--fig-muted)">经验：单指标序列数上千就值得怀疑；上万基本必须治理</text>
    </svg>
    <figcaption>基数是标签组合数：user_id/URL 全路径等标签会爆炸；排查用 count by 找序列最多的指标，治理靠改模板与 relabel</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
