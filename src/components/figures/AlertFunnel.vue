<script setup>
/**
 * 告警治理「漏斗」图。
 * 一个指标能产生成千上万条告警，但最终应该只有很少几条真正叫醒人。
 * 这个漏斗把「抑制 → 分组 → 静默 → 分级」四个环节的位置讲清楚。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 236" role="img" aria-label="告警治理漏斗：从海量指标到少数需要人介入的告警">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">目标是「每条叫醒人的告警都值得立即处理」</text>

      <!-- 层1 -->
      <rect x="26" y="20" width="288" height="26" rx="4" fill="var(--fig-node-a)" opacity=".18" />
      <text x="34" y="37" font-size="8" fill="var(--fig-text)">① 所有指标（几千个时间序列）</text>

      <!-- 层2 -->
      <rect x="46" y="50" width="248" height="26" rx="4" fill="var(--fig-node-a)" opacity=".24" />
      <text x="54" y="67" font-size="8" fill="var(--fig-text)">② 超过阈值的（已过滤掉绝大部分）</text>
      <text x="238" y="67" font-size="7" fill="var(--fig-muted)">← 靠 for 持续时长收敛</text>

      <!-- 层3 抑制 -->
      <rect x="66" y="80" width="208" height="26" rx="4" fill="var(--fig-node-b)" opacity=".3" />
      <text x="74" y="97" font-size="8" fill="var(--fig-text)">③ 抑制：底层故障时压掉衍生告警</text>
      <text x="66" y="118" font-size="7" fill="var(--fig-node-b)">数据库挂了 → 不再告警 20 个接口超时</text>

      <!-- 层4 分组 -->
      <rect x="86" y="124" width="168" height="26" rx="4" fill="var(--fig-node-c)" opacity=".36" />
      <text x="94" y="141" font-size="8" fill="var(--fig-text)">④ 分组：同类合并成一条</text>
      <text x="86" y="162" font-size="7" fill="var(--fig-node-c)">10 台机器磁盘满 → 一条「10 台磁盘告警」</text>

      <!-- 层5 分级 -->
      <rect x="116" y="168" width="108" height="26" rx="4" fill="var(--fig-node-d)" opacity=".45" />
      <text x="124" y="185" font-size="8" fill="var(--fig-text)">⑤ 分级：P1电话/P3邮件</text>

      <!-- 层6 -->
      <rect x="136" y="198" width="68" height="24" rx="4" fill="#e5484d" opacity=".55" />
      <text x="170" y="214" text-anchor="middle" font-size="8" fill="#fff" font-weight="600">叫醒人</text>

      <text x="212" y="190" font-size="7.5" fill="var(--fig-node-d)">每条都要有 Runbook</text>
      <text x="212" y="202" font-size="7.5" fill="var(--fig-muted)">「只能看看、什么也做不了」</text>
      <text x="212" y="213" font-size="7.5" fill="var(--fig-muted)">→ 该进看板，不该进告警</text>

      <text x="6" y="232" font-size="7.5" fill="var(--fig-muted)">没有这个漏斗的典型后果：告警风暴 → 全员静音 → 真故障被淹没</text>
    </svg>
    <figcaption>告警治理不是「少配几条」，而是「按根因收敛 + 分级 + 每条都有可执行动作」</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
