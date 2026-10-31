<script setup>
/**
 * 宿主机负载不高但所有 VM 都卡（题 2624）。
 *
 * 核心洞察：宿主机「CPU 不高」不代表没问题 ——
 * 常见元凶是 CPU 就绪时间（steal）、内存气球/超分、存储延迟、以及硬件降频。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 258" role="img" aria-label="宿主机负载低但 VM 卡的四类原因：CPU 就绪时间、内存超分与气球、存储延迟、硬件与降频">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">「CPU 占用不高」是典型误导 —— 真正指标常被忽略</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① CPU 就绪时间（ready / steal）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">VM 想跑却排不上物理 CPU → CPU 占用低但业务慢；看 %RDY 与 steal time</text>

      <rect x="6" y="58" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="71" font-size="8" font-weight="700" fill="var(--fig-node-b)">② 内存超分与气球（balloon）</text>
      <text x="14" y="84" font-size="7.5" fill="var(--fig-text)">物理内存被超额分配 → 气球回收 + 换页 → 全体变慢（swap 尤其明显）</text>

      <rect x="6" y="96" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="109" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ 存储延迟（共享后端）</text>
      <text x="14" y="122" font-size="7.5" fill="var(--fig-text)">某台 VM 大量 IO 会拖慢同一数据存储上的所有 VM；看 datastore latency</text>

      <rect x="6" y="134" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="147" font-size="8" font-weight="700" fill="var(--fig-node-d)">④ 硬件与降频</text>
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)">CPU 高温降频、网卡/存储控制器瓶颈、BIOS 电源策略省电模式</text>

      <!-- 排查 -->
      <rect x="6" y="174" width="328" height="46" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="187" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">排查顺序</text>
      <text x="14" y="200" font-size="7.5" fill="var(--fig-text)">① 看所有 VM 是否同时变慢（同一宿主机 → 宿主问题）</text>
      <text x="14" y="212" font-size="7.5" fill="var(--fig-text)">② 查 %RDY / steal / 内存气球 / swap　③ 查数据存储延迟与共享后端</text>

      <rect x="6" y="226" width="328" height="20" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="240" font-size="7.5" fill="var(--fig-text)">反模式：直接给 VM 加 CPU —— 超分越严重，反而更卡</text>

      <text x="6" y="250" font-size="7.5" fill="var(--fig-muted)">改进：控制超分比例、给关键 VM 预留资源（reservation）、隔离高 IO 业务</text>
    </svg>
    <figcaption>宿主 CPU 低但 VM 卡，常见于 CPU 就绪时间/steal、内存超分与气球、共享存储延迟、硬件降频；加 CPU 往往更糟</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
