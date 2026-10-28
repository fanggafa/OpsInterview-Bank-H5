<script setup>
/**
 * 监控四层（USE 方法 + 黄金指标）与告警分层图。
 * 把「资源 → 中间件 → 应用 → 业务」四层指标与各自的典型指标对应起来，
 * 并说明「为什么只有资源监控是不够的」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 240" role="img" aria-label="监控的四层指标与告警分层，以及只看资源指标的盲区">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">越往上，越接近「用户是否真的受影响」</text>

      <!-- 四层 -->
      <rect x="6" y="20" width="328" height="26" rx="6" fill="var(--fig-node-a)" opacity=".1" />
      <rect x="6" y="20" width="328" height="26" rx="6" fill="none" stroke="var(--fig-node-a)" stroke-width="1.2" />
      <text x="14" y="37" font-size="9" font-weight="700" fill="var(--fig-node-a)">④ 业务指标</text>
      <text x="100" y="37" font-size="8.5" fill="var(--fig-text)">订单成功率、支付量、登录数、GMV —— 唯一能证明「用户没受影响」</text>

      <rect x="6" y="50" width="328" height="26" rx="6" fill="var(--fig-node-c)" opacity=".1" />
      <rect x="6" y="50" width="328" height="26" rx="6" fill="none" stroke="var(--fig-node-c)" stroke-width="1.2" />
      <text x="14" y="67" font-size="9" font-weight="700" fill="var(--fig-node-c)">③ 应用指标</text>
      <text x="100" y="67" font-size="8.5" fill="var(--fig-text)">QPS、P99 延迟、错误率、线程池/连接池饱和度（黄金四信号）</text>

      <rect x="6" y="80" width="328" height="26" rx="6" fill="var(--fig-node-b)" opacity=".1" />
      <rect x="6" y="80" width="328" height="26" rx="6" fill="none" stroke="var(--fig-node-b)" stroke-width="1.2" />
      <text x="14" y="97" font-size="9" font-weight="700" fill="var(--fig-node-b)">② 中间件指标</text>
      <text x="100" y="97" font-size="8.5" fill="var(--fig-text)">DB 慢查询/连接数/复制延迟、Redis 命中率/内存、MQ 堆积、ES 拒绝数</text>

      <rect x="6" y="110" width="328" height="26" rx="6" fill="var(--fig-node-d)" opacity=".1" />
      <rect x="6" y="110" width="328" height="26" rx="6" fill="none" stroke="var(--fig-node-d)" stroke-width="1.2" />
      <text x="14" y="127" font-size="9" font-weight="700" fill="var(--fig-node-d)">① 资源指标</text>
      <text x="100" y="127" font-size="8.5" fill="var(--fig-text)">CPU、内存、磁盘使用率与 IO await、网络重传（USE 方法）</text>

      <!-- 盲区 -->
      <rect x="6" y="144" width="328" height="56" rx="7" fill="#e5484d" opacity=".07" />
      <rect x="6" y="144" width="328" height="56" rx="7" fill="none" stroke="#e5484d" stroke-width="1.3" />
      <text x="16" y="160" font-size="9.5" font-weight="700" fill="#e5484d">只做第 ① 层的典型盲区</text>
      <text x="16" y="175" font-size="8.5" fill="var(--fig-text)">CPU 40%、内存 50%、磁盘 60% —— 一切正常，但用户在下单时报 500</text>
      <text x="16" y="189" font-size="8.5" fill="var(--fig-muted)">原因可能是：连接池被打满、下游超时、慢查询堆积 —— 这些都不体现在资源指标里</text>

      <!-- 告警分层 -->
      <text x="6" y="216" font-size="9.5" font-weight="700" fill="var(--fig-text)">告警要分层收口</text>
      <text x="6" y="230" font-size="8" fill="var(--fig-muted)">资源告警 → 运维；应用/业务告警 → 值班；同一异常的多个指标要「抑制」去重</text>
      <text x="6" y="240" font-size="8" fill="var(--fig-node-c)">原则：一条告警必须对应一个可执行的动作（Runbook），否则就是噪音</text>
    </svg>
    <figcaption>「资源指标全绿但业务失败」是监控体系最常见的失效模式——必须有业务层指标兜底</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
