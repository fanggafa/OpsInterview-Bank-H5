<script setup>
/**
 * ES 日志告警的方案选择（题 3013）。
 *
 * 核心洞察：Watcher 在 ES 内做，省组件但「告警链路与存储耦合」；
 * 第三方（ElastAlert/Grafana/自研）更灵活，但要额外维护与保证送达。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 252" role="img" aria-label="日志告警三种方案：ES Watcher、第三方工具、指标化后走 Prometheus 告警">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">三条路：ES 自带 Watcher、第三方工具、或「转成指标」走成熟告警栈</text>

      <rect x="6" y="20" width="328" height="44" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① ES Watcher</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">优点：无需额外组件、直接在 ES 里定时查询</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">缺点：执行占用集群资源、告警规则能力有限、要商业 license（部分版本）</text>

      <rect x="6" y="72" width="328" height="44" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="85" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">② 第三方工具（ElastAlert / 自研）</text>
      <text x="14" y="98" font-size="7.5" fill="var(--fig-text)">优点：规则灵活、可接各种通知渠道、可做去重与抑制</text>
      <text x="14" y="110" font-size="7.5" fill="var(--fig-text)">缺点：多一个要运维的服务；要自己保证「查询失败也别静默」</text>

      <rect x="6" y="124" width="328" height="44" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="137" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">③ 转成指标 → 走 Prometheus/Alertmanager（推荐）</text>
      <text x="14" y="150" font-size="7.5" fill="var(--fig-text)">把「错误数/耗时」聚合成指标（如从日志统计后暴露或由 exporter 抓取）</text>
      <text x="14" y="162" font-size="7.5" fill="var(--fig-node-c)">优点：告警去重、抑制、分级、值班轮转这些能力现成的</text>

      <!-- 关键提醒 -->
      <rect x="6" y="176" width="328" height="34" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="189" font-size="8" font-weight="700" fill="#e5484d">最容易出的问题</text>
      <text x="14" y="201" font-size="7.5" fill="var(--fig-text)">告警规则本身挂了没人知道 → 给「告警链路」加心跳（watchdog 定时发条测试告警）</text>

      <rect x="6" y="218" width="328" height="20" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="232" font-size="7.5" fill="var(--fig-text)">注意：日志告警天然「有延迟」（写入+索引后才可查），不适合秒级要求</text>

      <text x="6" y="244" font-size="7.5" fill="var(--fig-muted)">选型：简单少量规则 → Watcher；规则多或要成熟值班体系 → 转指标走 Alertmanager</text>
    </svg>
    <figcaption>Watcher 省组件但耦合 ES 且能力有限；第三方更灵活但多一个服务；把错误转成指标走 Alertmanager 能力最全</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
