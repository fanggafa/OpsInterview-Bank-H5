<script setup>
/**
 * 日志与链路追踪如何串起来（题 3038）。
 *
 * 核心洞察：trace_id 是「粘合剂」——追踪给结构，日志给细节；
 * 关键是把它放进日志的每一行，并在异步/线程池处正确传递。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 250" role="img" aria-label="trace_id 把追踪与日志串起来；日志每行带 trace_id，异步与线程池处最易丢失">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">追踪给「结构」，日志给「细节」，trace_id 是把两者粘起来的胶水</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">链路追踪：一次请求的 span 树</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">看「调用了哪些服务、每段耗时」——结构清晰，但看不到细节内容</text>

      <rect x="6" y="58" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="71" font-size="8" font-weight="700" fill="var(--fig-node-b)">日志：每行的具体内容</text>
      <text x="14" y="84" font-size="7.5" fill="var(--fig-text)">错误堆栈、请求参数、业务状态——细节全，但难以还原调用关系</text>

      <rect x="6" y="96" width="328" height="34" rx="4" fill="#e5484d" opacity=".12" />
      <text x="14" y="109" font-size="8" font-weight="700" fill="#e5484d">串起来的方式：日志每行都带 trace_id</text>
      <text x="14" y="122" font-size="7.5" fill="var(--fig-text)">在追踪里点「查看日志」→ 用 trace_id 搜一次拿到全链路所有日志</text>

      <!-- 最容易丢的地方 -->
      <rect x="6" y="138" width="328" height="52" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="151" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">trace_id 最容易丢的四个位置</text>
      <text x="14" y="164" font-size="7.5" fill="var(--fig-text)">① 线程池：提交任务时上下文没传（MDC/ThreadLocal 丢失）</text>
      <text x="14" y="176" font-size="7.5" fill="var(--fig-text)">② 异步/定时任务　③ MQ 生产/消费　④ 网关或代理丢弃 header</text>

      <rect x="6" y="196" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="209" font-size="8" font-weight="700" fill="var(--fig-node-d)">实施要点</text>
      <text x="14" y="222" font-size="7.5" fill="var(--fig-text)">日志格式统一（JSON）· trace_id 字段名统一 · 入口生成、全程透传</text>

      <text x="6" y="246" font-size="7.5" fill="var(--fig-muted)">验收：随便挑一次线上请求，能把「追踪 → 日志」一路串起来，才算建成</text>
    </svg>
    <figcaption>追踪给结构与耗时、日志给细节；靠日志每行带 trace_id 串起来，异步/线程池/MQ 是最易断的地方</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
