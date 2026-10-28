<script setup>
/**
 * 发布相关故障的分诊图。
 * 「发布后出问题」是最典型的场景题，关键在于「先判断是哪类问题」，
 * 因为这决定了「回滚」还是「修配置」还是「扩容量」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 234" role="img" aria-label="发布后故障按错误类型分诊：502、5xx、变慢、功能错误对应的不同处置">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">先看「报什么错」，它直接指向不同的处置动作</text>

      <!-- 502 -->
      <rect x="6" y="20" width="328" height="46" rx="6" fill="var(--fig-node-d)" opacity=".1" />
      <rect x="6" y="20" width="328" height="46" rx="6" fill="none" stroke="var(--fig-node-d)" stroke-width="1.2" />
      <text x="14" y="36" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">大量 502（网关连不上后端）</text>
      <text x="14" y="50" font-size="7.5" fill="var(--fig-text)">查：新实例是否就绪就接流量／readinessProbe 是否配／端口协议是否改／后端是否在重启</text>
      <text x="14" y="61" font-size="7" fill="var(--fig-node-c)">处置：先摘掉异常实例，再修就绪与健康检查配置</text>

      <!-- 5xx -->
      <rect x="6" y="72" width="328" height="46" rx="6" fill="#e5484d" opacity=".08" />
      <rect x="6" y="72" width="328" height="46" rx="6" fill="none" stroke="#e5484d" stroke-width="1.2" />
      <text x="14" y="88" font-size="8.5" font-weight="700" fill="#e5484d">5xx 比例上涨（后端返回错误）</text>
      <text x="14" y="102" font-size="7.5" fill="var(--fig-text)">查：日志里的异常类型（连接超时？空指针？限流？）／依赖是否健康／配置是否缺项</text>
      <text x="14" y="113" font-size="7" fill="var(--fig-node-c)">处置：时间点与发布吻合 → 优先回滚；否则限流降级保核心</text>

      <!-- 变慢 -->
      <rect x="6" y="124" width="328" height="46" rx="6" fill="var(--fig-node-b)" opacity=".1" />
      <rect x="6" y="124" width="328" height="46" rx="6" fill="none" stroke="var(--fig-node-b)" stroke-width="1.2" />
      <text x="14" y="140" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">错误率不变但明显变慢</text>
      <text x="14" y="154" font-size="7.5" fill="var(--fig-text)">查：新版本是否多了一次查询／缓存是否失效／资源规格是否不足／连接池是否变小</text>
      <text x="14" y="165" font-size="7" fill="var(--fig-node-c)">处置：先加缓存或扩容量缓解，同时定位新代码的性能问题</text>

      <!-- 功能错误 -->
      <rect x="6" y="176" width="328" height="46" rx="6" fill="var(--fig-node-c)" opacity=".1" />
      <rect x="6" y="176" width="328" height="46" rx="6" fill="none" stroke="var(--fig-node-c)" stroke-width="1.2" />
      <text x="14" y="192" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">接口返回 200 但数据/功能不对</text>
      <text x="14" y="206" font-size="7.5" fill="var(--fig-text)">查：监控看不到这类问题（错误率正常）→ 只能靠业务指标与用户反馈</text>
      <text x="14" y="217" font-size="7" fill="var(--fig-node-d)">处置：立即回滚 —— 数据错误比报错更严重（可能已污染数据）</text>
    </svg>
    <figcaption>「发布后出问题」先按错误形态分诊，再决定回滚还是修配置——不要一律重启</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
