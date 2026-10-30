<script setup>
/**
 * Nginx 的 request_time 与 upstream_response_time 怎么用（题 1414）。
 *
 * 核心洞察：两个时间口径覆盖不同区段 —— 前者是整个请求，
 * 后者只算上游；差值就是「Nginx 自身 + 网络传输」的耗时，
 * 这决定了「该查后端还是查网关」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 258" role="img" aria-label="request_time 覆盖整个请求、upstream_response_time 只算上游，两者差值定位慢在网关还是后端">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">两个口径覆盖不同区段，差值就是「网关自身 + 传输」的耗时</text>

      <!-- 时间轴示意 -->
      <rect x="6" y="20" width="328" height="20" rx="4" fill="var(--fig-node-a)" opacity=".14" />
      <text x="14" y="34" font-size="7.5" font-weight="700" fill="var(--fig-node-a)">request_time：读第一个字节 → 发完最后一个字节（整个请求）</text>

      <rect x="66" y="44" width="236" height="20" rx="4" fill="var(--fig-node-b)" opacity=".14" />
      <text x="74" y="58" font-size="7.5" font-weight="700" fill="var(--fig-node-b)">upstream_response_time：建连 → 读完上游响应（只算后端）</text>

      <text x="6" y="58" font-size="7" fill="var(--fig-text)">网关侧</text>
      <text x="310" y="58" font-size="7" fill="var(--fig-text)">回传</text>

      <!-- 三种判读 -->
      <text x="6" y="84" font-size="9" font-weight="700" fill="var(--fig-text)">三种判读</text>

      <rect x="6" y="92" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="105" font-size="7.5" font-weight="700" fill="var(--fig-node-c)">两者接近 → 慢在后端</text>
      <text x="14" y="117" font-size="7.5" fill="var(--fig-text)">去查应用的慢查询、外部依赖、GC（Nginx 只是如实等待）</text>

      <rect x="6" y="126" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="139" font-size="7.5" font-weight="700" fill="var(--fig-node-d)">request_time 远大于 upstream</text>
      <text x="14" y="151" font-size="7.5" fill="var(--fig-text)">慢在网关侧或网络传输：看 Nginx 自身资源、磁盘、客户端带宽</text>

      <rect x="6" y="160" width="328" height="30" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="173" font-size="7.5" font-weight="700" fill="#e5484d">upstream 为空 / 有多个值</text>
      <text x="14" y="185" font-size="7.5" fill="var(--fig-text)">空：没走到上游（本地静态/rewrite 返回）；多个：有重试或内部跳转</text>

      <!-- 配置与用法 -->
      <rect x="6" y="198" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="211" font-size="8" font-weight="700" fill="var(--fig-node-a)">配置与统计</text>
      <text x="14" y="224" font-size="7.5" fill="var(--fig-text)">log_format 里加 $request_time 与 $upstream_response_time，再按分位统计</text>

      <text x="6" y="248" font-size="7.5" fill="var(--fig-muted)">用法：取 95 分位而非平均值；再按上游 IP 分组，立刻看出是哪台后端慢</text>
    </svg>
    <figcaption>两者接近说明后端慢；request_time 远大于 upstream 说明慢在网关或传输；按上游 IP 分组能定位具体后端</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
