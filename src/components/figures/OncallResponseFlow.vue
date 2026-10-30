<script setup>
/**
 * 值班工程师的故障响应流程（题 60）。
 *
 * 核心洞察：既要「先止血」又要「别乱动」，还要让信息流动起来 ——
 * 响应流程的价值在于「机器可重复、人不慌张」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 268" role="img" aria-label="值班响应流程：确认告警真实、评估影响面、止血、通报、定位根因、复盘">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">流程的价值：让「不慌张」变成可重复的步骤</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① 确认真假（2 分钟内）</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">看仪表盘与业务指标，避免被单条误报牵着走</text>

      <rect x="6" y="54" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="67" font-size="8" font-weight="700" fill="var(--fig-node-b)">② 评估影响面</text>
      <text x="14" y="79" font-size="7.5" fill="var(--fig-text)">影响哪些用户/功能、是否在扩大 → 决定级别与升级速度</text>

      <rect x="6" y="88" width="328" height="30" rx="4" fill="#e5484d" opacity=".12" />
      <text x="14" y="101" font-size="8" font-weight="700" fill="#e5484d">③ 止血优先（不要先查根因）</text>
      <text x="14" y="113" font-size="7.5" fill="var(--fig-text)">回滚、摘流量、降级、限流 —— 先让用户恢复，再找原因</text>

      <rect x="6" y="122" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="135" font-size="8" font-weight="700" fill="var(--fig-node-c)">④ 同步信息（别一个人闷头查）</text>
      <text x="14" y="147" font-size="7.5" fill="var(--fig-text)">在群里按固定格式播报：现象/影响/已做动作/下一步/需要谁</text>

      <rect x="6" y="156" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="169" font-size="8" font-weight="700" fill="var(--fig-node-d)">⑤ 定位根因</text>
      <text x="14" y="181" font-size="7.5" fill="var(--fig-text)">指标→追踪→日志；结合最近变更记录（发布/配置/证书）</text>

      <rect x="6" y="190" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="203" font-size="8" font-weight="700" fill="var(--fig-node-a)">⑥ 复盘与改进</text>
      <text x="14" y="215" font-size="7.5" fill="var(--fig-text)">时间线、根因、改进项（可验证）与责任人；补监控与 runbook</text>

      <rect x="6" y="228" width="328" height="24" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="244" font-size="7.5" fill="var(--fig-text)">反模式：直接重启「先恢复再说」（毁证据、可能放大问题）</text>

      <text x="6" y="262" font-size="7.5" fill="var(--fig-muted)">升级原则：10 分钟没有明确进展就升级，不要「怕打扰人」而硬扛</text>
    </svg>
    <figcaption>响应流程：确认真假 → 评估影响 → 止血 → 通报 → 查根因 → 复盘；先止血是最重要的一条</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
