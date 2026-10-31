<script setup>
/**
 * Nginx access.log 的关键信息与排查用法（题 1434）。
 *
 * 核心洞察：日志字段组合能回答「谁慢、慢在哪、为什么失败」——
 * 关键是把 upstream 耗时与状态码拆开看。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 246" role="img" aria-label="access.log 的关键字段与排查用途：状态码分布、上游耗时、请求时间、来源统计">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">字段组合能回答：谁在访问、哪个慢、为什么失败</text>

      <rect x="6" y="20" width="328" height="28" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="38" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">$status</tspan>　状态码：统计 4xx/5xx 占比，定位失败类型</text>

      <rect x="6" y="52" width="328" height="28" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">$request_time</tspan>　总耗时（含网络与排队），看「用户体感」</text>

      <rect x="6" y="84" width="328" height="28" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="102" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">$upstream_response_time</tspan>　后端耗时；与总耗时对比能区分「网络慢」与「后端慢」</text>

      <rect x="6" y="116" width="328" height="28" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="134" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">$remote_addr / $http_user_agent</tspan>　来源 IP 与客户端类型（识别爬虫/攻击）</text>

      <!-- 关键对比 -->
      <rect x="6" y="148" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="161" font-size="8.5" font-weight="700" fill="#e5484d">最有价值的一招：两个耗时相减</text>
      <text x="14" y="174" font-size="7.5" fill="var(--fig-text)">request_time 大但 upstream 小 → 网络/带宽/客户端慢</text>
      <text x="14" y="186" font-size="7.5" fill="var(--fig-text)">两者都大 → 后端处理慢（转去查应用与 DB）</text>

      <rect x="6" y="198" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="211" font-size="8" font-weight="700" fill="var(--fig-node-a)">必须提前配置</text>
      <text x="14" y="223" font-size="7.5" fill="var(--fig-text)">默认格式不含耗时字段 → 自定义 log_format 才能记录 request_time 等</text>

      <text x="6" y="240" font-size="7.5" fill="var(--fig-muted)">注意：日志量大时要配轮转与索引，别让它本身成为磁盘瓶颈</text>
    </svg>
    <figcaption>status 看失败、request_time 看体感、upstream 看后端；两耗时相减即可区分网络慢与后端慢，但需自定义 log_format</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
