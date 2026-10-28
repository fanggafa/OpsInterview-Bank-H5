<script setup>
/**
 * 备份 3-2-1 原则图 + 常见失败点。
 * 左侧画「三份副本 / 两种介质 / 一份异地」，右侧列「为什么 3-2-1 仍不够」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 224" role="img" aria-label="备份 3-2-1 原则与勒索病毒场景下的补充要求">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">3 份副本 · 2 种介质 · 1 份异地</text>

      <!-- 3 份 -->
      <rect x="6" y="20" width="46" height="20" rx="4" fill="var(--fig-node-a)" opacity=".85" />
      <text x="29" y="34" text-anchor="middle" font-size="8.5" fill="#fff" font-weight="600">生产</text>
      <rect x="56" y="20" width="46" height="20" rx="4" fill="var(--fig-node-a)" opacity=".65" />
      <text x="79" y="34" text-anchor="middle" font-size="8.5" fill="#fff" font-weight="600">备份A</text>
      <rect x="106" y="20" width="46" height="20" rx="4" fill="var(--fig-node-a)" opacity=".45" />
      <text x="129" y="34" text-anchor="middle" font-size="8.5" fill="#fff" font-weight="600">备份B</text>
      <text x="158" y="34" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① 三份</text>

      <!-- 2 种介质 -->
      <rect x="6" y="50" width="72" height="20" rx="4" fill="var(--fig-node-c)" opacity=".82" />
      <text x="42" y="64" text-anchor="middle" font-size="8.5" fill="#fff" font-weight="600">块存储快照</text>
      <rect x="82" y="50" width="72" height="20" rx="4" fill="var(--fig-node-c)" opacity=".55" />
      <text x="118" y="64" text-anchor="middle" font-size="8.5" fill="#fff" font-weight="600">逻辑导出</text>
      <text x="158" y="64" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">② 两介质</text>

      <!-- 1 份异地 -->
      <rect x="6" y="80" width="72" height="20" rx="4" fill="var(--fig-node-b)" opacity=".85" />
      <text x="42" y="94" text-anchor="middle" font-size="8.5" fill="#fff" font-weight="600">本地区域</text>
      <path d="M84 90 L108 90" stroke="var(--fig-node-b)" stroke-width="1.6" stroke-dasharray="3 2" />
      <rect x="112" y="80" width="72" height="20" rx="4" fill="var(--fig-node-b)" opacity=".55" />
      <text x="148" y="94" text-anchor="middle" font-size="8.5" fill="#fff" font-weight="600">异地/对象存</text>
      <text x="192" y="94" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">③ 一异地</text>

      <!-- 右侧：3-2-1 不够 -->
      <rect x="228" y="18" width="106" height="86" rx="8" fill="var(--fig-node-d)" opacity=".1" />
      <rect x="228" y="18" width="106" height="86" rx="8" fill="none" stroke="var(--fig-node-d)" stroke-width="1.3" />
      <text x="236" y="34" font-size="9.5" font-weight="700" fill="var(--fig-node-d)">为什么还不够</text>
      <text x="236" y="50" font-size="8" fill="var(--fig-text)">勒索病毒会加密</text>
      <text x="236" y="62" font-size="8" fill="var(--fig-text)">「所有能写到的备份」</text>
      <text x="236" y="78" font-size="8" fill="var(--fig-text)">误删会同步传播</text>
      <text x="236" y="90" font-size="8" fill="var(--fig-text)">潜伏期可达数周</text>

      <!-- 补充要求 -->
      <text x="6" y="122" font-size="9.5" font-weight="700" fill="var(--fig-text)">补充 3 条（勒索时代的必要项）</text>
      <text x="6" y="138" font-size="8.5" fill="var(--fig-node-c)">④ 不可变/离线：Object Lock、WORM、离线磁带</text>
      <text x="6" y="152" font-size="8.5" fill="var(--fig-node-c)">⑤ 备份账号与生产隔离（不同 AK、不同账号）</text>
      <text x="6" y="166" font-size="8.5" fill="var(--fig-node-c)">⑥ 多时间点：保留 30 天以上，防「潜伏期内备份全被覆盖」</text>

      <rect x="6" y="176" width="328" height="26" rx="6" fill="var(--fig-node-a)" opacity=".1" />
      <text x="16" y="187" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">唯一验收标准：定期真实恢复一次</text>
      <text x="16" y="198" font-size="8" fill="var(--fig-muted)">没演练过的备份不等于备份 —— 实际 RTO 往往是估计值的 2-3 倍</text>
    </svg>
    <figcaption>3-2-1 解决「硬件丢失」，不可变 + 账号隔离解决「勒索与误删」</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
