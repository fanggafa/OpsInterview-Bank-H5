<script setup>
/**
 * 用监控快速定位生产故障（题 5020）。
 *
 * 核心洞察：可复用的路径是「先确认影响面 → 分层下钻 → 找最近变更」，
 * 而不是在几十个面板里乱点。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 244" role="img" aria-label="用监控定位故障的五步路径：确认影响面、看总体 RED、分层下钻、找最近变更、对比基线">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">可复用的路径：影响面 → 总体指标 → 分层下钻 → 最近变更</text>

      <rect x="6" y="20" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="36" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">①</tspan> 确认影响面：全站还是部分？哪些接口/地区/用户群</text>

      <rect x="6" y="50" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="66" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">②</tspan> 看总体 RED：请求率 Rate、错误率 Errors、耗时 Duration</text>

      <rect x="6" y="80" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="96" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">③</tspan> 分层下钻：入口 → 应用 → 依赖（DB/缓存/MQ/三方）</text>

      <rect x="6" y="110" width="328" height="26" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="126" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">④</tspan> 找最近变更：发布、配置、证书、扩缩容、云厂商事件</text>

      <rect x="6" y="140" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="156" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">⑤</tspan> 对比基线：和上周同日同时段比，判断「真的异常」还是「正常波动」</text>

      <!-- 关键技巧 -->
      <rect x="6" y="176" width="328" height="46" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="189" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">三个提速技巧</text>
      <text x="14" y="202" font-size="7.5" fill="var(--fig-text)">① 从「用户感知的接口」倒推，而不是从资源指标往外猜</text>
      <text x="14" y="214" font-size="7.5" fill="var(--fig-text)">② 指标与追踪/日志联动（trace_id 一搜直达具体请求）</text>
      <text x="14" y="226" font-size="7" fill="var(--fig-node-c)">③ 把「最近变更」与「指标突变时间」对齐，多数故障能直接锁定</text>

      <text x="6" y="240" font-size="7.5" fill="var(--fig-muted)">注意：故障当下先止血（回滚/摘流/降级），再用这套路径定位根因</text>
    </svg>
    <figcaption>五步路径：确认影响面、看 RED 三指标、分层下钻到依赖、对齐最近变更、对比基线；从用户感知接口倒推更快</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
