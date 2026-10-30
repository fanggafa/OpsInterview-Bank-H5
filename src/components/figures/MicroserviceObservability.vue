<script setup>
/**
 * 微服务化后「重建排查能力」的三项建设。
 *
 * 对应题 5437。核心洞察：一次请求跨多服务后，「登机器看日志」失效；
 * 要靠「全链路追踪 + 统一日志 + 依赖拓扑」三件套重建可观测性。
 *
 * 画布 340 宽，文字须控制在列内（npm run check:figures 校验）。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 288" role="img" aria-label="微服务排查能力建设：全链路追踪、统一日志带 trace_id、依赖拓扑与指标，以及 trace_id 容易断的四个位置">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">一次请求跨多服务 → 「登机器看日志」失效，必须重建可观测性</text>

      <!-- 1 追踪 -->
      <rect x="6" y="20" width="328" height="58" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① 全链路追踪（最重要）</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">每个请求一个 trace_id，跨服务传递 → 看清「经过哪些服务、每段耗时」</text>
      <text x="14" y="57" font-size="7.5" fill="var(--fig-text)">标准：W3C traceparent　工具：Jaeger / SkyWalking / OTel Collector</text>
      <text x="14" y="69" font-size="7.5" fill="var(--fig-node-c)">关键：入口注入 + 全程透传，缺一环链路就断</text>

      <!-- 2 日志 -->
      <rect x="6" y="86" width="328" height="46" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="99" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">② 统一日志（必须带 trace_id）</text>
      <text x="14" y="111" font-size="7.5" fill="var(--fig-text)">格式统一（JSON）且都带 trace_id → 搜一次拿到所有服务相关日志</text>
      <text x="14" y="123" font-size="7.5" fill="var(--fig-text)">实现：ELK / Loki；字段规范要强约束（否则搜不到）</text>

      <!-- 3 拓扑与指标 -->
      <rect x="6" y="140" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="153" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">③ 依赖拓扑 + 每服务指标</text>
      <text x="14" y="165" font-size="7.5" fill="var(--fig-text)">谁调用谁（含未知依赖）、每服务的延迟/错误/饱和度</text>
      <text x="14" y="177" font-size="7.5" fill="var(--fig-text)">作用：故障时快速判断「影响面」与「该叫谁」</text>

      <!-- 断点 -->
      <rect x="6" y="194" width="328" height="52" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="207" font-size="8.5" font-weight="700" fill="#e5484d">trace_id 最容易断的四个位置（重点排查）</text>
      <text x="14" y="219" font-size="7.5" fill="var(--fig-text)">① 线程池：提交任务时上下文没传（MDC/ThreadLocal 丢失）</text>
      <text x="14" y="231" font-size="7.5" fill="var(--fig-text)">② 异步/定时任务：新线程从零开始，没有父上下文</text>
      <text x="14" y="243" font-size="7.5" fill="var(--fig-text)">③ MQ：生产者要写进消息头，消费者要读出来继续传　④ 网关/代理：header 被丢弃</text>

      <rect x="6" y="254" width="328" height="22" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="268" font-size="7.5" fill="var(--fig-node-d)">验收：随便挑一次线上请求，能一路串起所有服务与日志，才算真的建成</text>

      <text x="6" y="282" font-size="7.5" fill="var(--fig-muted)">面试要点：主动说「线程池/MQ 会断链路」，这是踩过坑的人才会提到的细节</text>
    </svg>
    <figcaption>微服务排查靠「追踪 + 统一日志 + 拓扑」三件套，重点守住 trace_id 不断</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
