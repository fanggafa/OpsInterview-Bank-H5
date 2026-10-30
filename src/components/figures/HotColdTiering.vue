<script setup>
/**
 * 冷热数据分层与成本优化（题 2411）。
 *
 * 核心洞察：分层不是「挪数据」，而是「按访问频率匹配存储介质」——
 * 热数据用 SSD，温数据用大容量盘，冷数据用对象存储/归档。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 256" role="img" aria-label="冷热数据分层：热数据 SSD、温数据大容量盘、冷数据对象存储归档，按访问频率匹配介质降低成本">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">按「访问频率」匹配介质，而不是把所有数据放最快的地方</text>

      <rect x="6" y="20" width="328" height="42" rx="5" fill="var(--fig-node-a)" opacity=".14" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">热数据（最近 7 天 / 高频访问）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">SSD / 内存缓存；追求低延迟与高 IOPS</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-node-c)">占比通常很小（<10%），但决定体验</text>

      <rect x="6" y="66" width="328" height="42" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="79" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">温数据（近 1~3 月）</text>
      <text x="14" y="92" font-size="7.5" fill="var(--fig-text)">大容量 SATA SSD / HDD；可容忍毫秒~十几毫秒延迟</text>
      <text x="14" y="104" font-size="7.5" fill="var(--fig-node-c)">占比最大，是成本主战场</text>

      <rect x="6" y="112" width="328" height="42" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="125" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">冷数据（更早 / 极少访问）</text>
      <text x="14" y="138" font-size="7.5" fill="var(--fig-text)">对象存储 / 归档层（Glacier 类）；取回有延迟但极便宜</text>
      <text x="14" y="150" font-size="7.5" fill="var(--fig-node-c)">注意「取回时间」——归档层可能要几小时</text>

      <!-- 实施 -->
      <rect x="6" y="162" width="328" height="46" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="175" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">怎么落地</text>
      <text x="14" y="188" font-size="7.5" fill="var(--fig-text)">按时序分区/分表（按月/按天），再用生命周期策略自动迁移与删除</text>
      <text x="14" y="200" font-size="7.5" fill="var(--fig-text)">先量出「数据年龄 × 访问频率」，再决定分界点（别拍脑袋定 30 天）</text>

      <rect x="6" y="214" width="328" height="24" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="230" font-size="7.5" fill="var(--fig-text)">常见误区：把所有数据都放 SSD → 成本翻倍而性能收益有限</text>

      <text x="6" y="248" font-size="7.5" fill="var(--fig-muted)">提醒：分层后「查询跨层」会变复杂，业务要能接受（否则别分）</text>
    </svg>
    <figcaption>热数据 SSD、温数据大容量盘、冷数据对象存储归档；按时序分区 + 生命周期策略落地，先量数据别拍脑袋</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
