<script setup>
/**
 * RAID 级别对比图。
 * 用「数据块格子」直观展示磁盘利用率、容错数量与最小盘数。
 * 五种配色区分 RAID 0/1/5/6/10 的权衡。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 234" role="img" aria-label="RAID 0、1、5、6、10 五种的磁盘占用与容错对比">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">灰=数据，彩=校验，空=镜像副本</text>

      <!-- RAID 0 -->
      <g>
        <text x="6" y="30" font-size="10" font-weight="700" fill="var(--fig-node-a)">RAID 0 · 条带</text>
        <text x="104" y="30" font-size="9" fill="var(--fig-muted)">利用率100% · 容错0 · 最少2盘</text>
        <rect x="6" y="36" width="42" height="14" rx="3" fill="var(--fig-node-a)" opacity=".75" />
        <rect x="52" y="36" width="42" height="14" rx="3" fill="var(--fig-node-a)" opacity=".75" />
        <rect x="98" y="36" width="42" height="14" rx="3" fill="var(--fig-node-a)" opacity=".75" />
        <text x="6" y="62" font-size="8.5" fill="var(--fig-muted)">一块坏 = 全丢</text>
      </g>

      <!-- RAID 1 -->
      <g>
        <text x="6" y="80" font-size="10" font-weight="700" fill="var(--fig-node-c)">RAID 1 · 镜像</text>
        <text x="104" y="80" font-size="9" fill="var(--fig-muted)">利用率50% · 容错1</text>
        <rect x="6" y="86" width="42" height="14" rx="3" fill="var(--fig-node-c)" opacity=".75" />
        <rect x="52" y="86" width="42" height="14" rx="3" fill="none" stroke="var(--fig-node-c)" stroke-width="1.4" stroke-dasharray="3 2" />
        <rect x="98" y="86" width="42" height="14" rx="3" fill="var(--fig-node-c)" opacity=".75" />
        <rect x="144" y="86" width="42" height="14" rx="3" fill="none" stroke="var(--fig-node-c)" stroke-width="1.4" stroke-dasharray="3 2" />
        <text x="6" y="112" font-size="8.5" fill="var(--fig-muted)">写两份，读可并行</text>
      </g>

      <!-- RAID 5 -->
      <g>
        <text x="6" y="130" font-size="10" font-weight="700" fill="var(--fig-node-b)">RAID 5 · 单校验</text>
        <text x="104" y="130" font-size="9" fill="var(--fig-muted)">利用率(N-1)/N · 容1</text>
        <rect x="6" y="136" width="34" height="14" rx="3" fill="var(--fig-node-b)" opacity=".75" />
        <rect x="44" y="136" width="34" height="14" rx="3" fill="var(--fig-node-b)" opacity=".75" />
        <rect x="82" y="136" width="34" height="14" rx="3" fill="var(--fig-node-d)" opacity=".9" />
        <rect x="120" y="136" width="34" height="14" rx="3" fill="var(--fig-node-b)" opacity=".75" />
        <text x="140" y="147" font-size="8.5" fill="var(--fig-node-d)">← 校验轮转</text>
        <text x="6" y="162" font-size="8.5" fill="var(--fig-muted)">重建期再坏一块就全丢（高风险窗口）</text>
      </g>

      <!-- RAID 6 -->
      <g>
        <text x="6" y="180" font-size="10" font-weight="700" fill="var(--fig-node-d)">RAID 6 · 双校验</text>
        <text x="104" y="180" font-size="9" fill="var(--fig-muted)">利用率(N-2)/N · 容2</text>
        <rect x="6" y="186" width="30" height="14" rx="3" fill="var(--fig-node-d)" opacity=".75" />
        <rect x="40" y="186" width="30" height="14" rx="3" fill="var(--fig-node-d)" opacity=".75" />
        <rect x="74" y="186" width="30" height="14" rx="3" fill="var(--fig-node-a)" opacity=".9" />
        <rect x="108" y="186" width="30" height="14" rx="3" fill="var(--fig-node-b)" opacity=".9" />
        <rect x="142" y="186" width="30" height="14" rx="3" fill="var(--fig-node-d)" opacity=".75" />
        <text x="6" y="212" font-size="8.5" fill="var(--fig-muted)">能容忍重建期间再坏一块</text>
      </g>

      <rect x="196" y="24" width="138" height="168" rx="8" fill="var(--fig-node-c)" opacity=".07" />
      <rect x="196" y="24" width="138" height="168" rx="8" fill="none" stroke="var(--fig-node-c)" stroke-width="1.2" />
      <text x="204" y="40" font-size="9.5" font-weight="700" fill="var(--fig-node-c)">生产怎么选</text>
      <text x="204" y="56" font-size="8.5" fill="var(--fig-text)">数据库 → RAID 10</text>
      <text x="204" y="70" font-size="8.5" fill="var(--fig-muted)">（写多、怕重建）</text>
      <text x="204" y="86" font-size="8.5" fill="var(--fig-text)">日志/归档 → RAID 5/6</text>
      <text x="204" y="100" font-size="8.5" fill="var(--fig-muted)">（读多、要容量）</text>
      <text x="204" y="116" font-size="8.5" fill="var(--fig-text)">缓存/临时 → RAID 0</text>
      <text x="204" y="130" font-size="8.5" fill="var(--fig-muted)">（不怕丢）</text>
      <text x="204" y="148" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">大容量盘慎用 RAID 5</text>
      <text x="204" y="162" font-size="8.5" fill="var(--fig-muted)">重建 10TB 要数十小时</text>
      <text x="204" y="176" font-size="8.5" fill="var(--fig-muted)">期间再坏就全没了</text>
    </svg>
    <figcaption>选 RAID 看三件事：容错几块、写惩罚多重、重建窗口多长</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
