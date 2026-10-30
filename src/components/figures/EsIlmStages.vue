<script setup>
/**
 * ES ILM 四个阶段与日志场景配置（题 3011）。
 *
 * 核心洞察：ILM 解决「日志无限增长」——hot 写入、warm 只读、
 * cold 压缩、delete 删除；每个阶段都能配动作与时间条件。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 250" role="img" aria-label="ES ILM 四阶段：hot 写入与滚动、warm 只读、cold 压缩、delete 删除，日志场景按时间推进">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">日志无限增长 → 用 ILM 按「时间 + 大小」推进四个阶段</text>

      <rect x="6" y="20" width="328" height="40" rx="5" fill="var(--fig-node-a)" opacity=".14" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">hot（写入 + 滚动）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">唯一接收写入的阶段；按 size/age 滚动出新索引</text>
      <text x="14" y="56" font-size="7" fill="var(--fig-node-c)">可设 priority 高、副本多、refresh 短</text>

      <rect x="6" y="64" width="328" height="40" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="77" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">warm（只读，仍可查）</text>
      <text x="14" y="90" font-size="7.5" fill="var(--fig-text)">不再写入；可强制 merge 成更少的段、减少副本</text>
      <text x="14" y="100" font-size="7" fill="var(--fig-node-c)">典型时机：索引超过 7 天</text>

      <rect x="6" y="108" width="328" height="40" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="121" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">cold（只读，几乎不查）</text>
      <text x="14" y="134" font-size="7.5" fill="var(--fig-text)">可迁到低成本节点、进一步压缩、降到 0 副本</text>
      <text x="14" y="144" font-size="7" fill="var(--fig-node-c)">查询会变慢，但省空间（日志通常很少查这么老的）</text>

      <rect x="6" y="152" width="328" height="40" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="165" font-size="8.5" font-weight="700" fill="#e5484d">delete（删除）</text>
      <text x="14" y="178" font-size="7.5" fill="var(--fig-text)">到期直接删索引（比逐条删快得多）</text>
      <text x="14" y="188" font-size="7" fill="var(--fig-node-c)">保留期要满足合规与排障需求（常见 30~180 天）</text>

      <rect x="6" y="196" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="209" font-size="8" font-weight="700" fill="var(--fig-node-d)">日志场景的关键决策</text>
      <text x="14" y="221" font-size="7.5" fill="var(--fig-text)">滚动阈值按「单索引大小」定（如 30GB），不要按固定时间一刀切</text>

      <text x="6" y="244" font-size="7.5" fill="var(--fig-muted)">注意：ILM 只改「索引级」策略；写入别名要指向当前 hot 索引，否则新数据进不来</text>
    </svg>
    <figcaption>ILM 四阶段：hot 写入滚动、warm 只读合并、cold 压缩降副本、delete 到期删索引；滚动按大小而非固定时间</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
