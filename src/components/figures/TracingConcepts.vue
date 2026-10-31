<script setup>
/**
 * 分布式链路追踪的核心概念（题 5018）。
 *
 * 核心洞察：trace 是「一次请求的全景」，span 是「其中一段」；
 * 靠 trace_id 串起来、靠 parent/child 表达调用关系，落地关键是透传与采样。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 248" role="img" aria-label="Tracing 概念：trace 是整条请求、span 是其中一段，靠 trace_id 与父子关系串联">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">trace = 一次请求的全景；span = 其中一段（有起止时间与父子关系）</text>

      <rect x="6" y="20" width="328" height="28" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="38" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">trace_id</tspan>　整条请求的唯一标识，贯穿所有服务与日志</text>

      <rect x="6" y="52" width="328" height="28" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">span</tspan>　一段操作：名称、起止时间、状态、标签（可有 parent_span_id）</text>

      <rect x="6" y="84" width="328" height="28" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="102" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">父子关系</tspan>　网关 → 服务 A → 服务 B 的调用树，一眼看出「慢在哪一段」</text>

      <!-- 落地要点 -->
      <rect x="6" y="120" width="328" height="50" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="133" font-size="8.5" font-weight="700" fill="#e5484d">落地的三个关键点</text>
      <text x="14" y="146" font-size="7.5" fill="var(--fig-text)">① 透传：跨 HTTP/MQ/线程池 都要带 trace_id（异步最易丢，见另一题）</text>
      <text x="14" y="158" font-size="7.5" fill="var(--fig-text)">② 采样：全量太贵 → 头部采样（按比例）或尾部采样（保慢与错的）</text>
      <text x="14" y="170" font-size="7" fill="var(--fig-node-c)">③ 存储与查询：按 trace_id 检索，保留期通常短于日志</text>

      <rect x="6" y="178" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="191" font-size="8" font-weight="700" fill="var(--fig-node-d)">为什么要「尾部采样」</text>
      <text x="14" y="203" font-size="7.5" fill="var(--fig-text)">按比例采样会随机丢掉「慢请求」；尾部采样能保留所有异常与长耗时</text>

      <rect x="6" y="218" width="328" height="18" rx="3" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="231" font-size="7.5" fill="var(--fig-text)">标准协议：OpenTelemetry（OTLP）；厂商方案多兼容它，便于迁移</text>

      <text x="6" y="240" font-size="7.5" fill="var(--fig-muted)">注意：span 太多会放大开销与存储 —— 只记关键环节，别每个函数都打点</text>
    </svg>
    <figcaption>trace 是整条请求、span 是其中一段，靠 trace_id 与父子关系串联；落地关键在透传、采样（尤其尾部采样）与存储</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
