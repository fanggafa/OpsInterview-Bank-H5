<script setup>
/**
 * 虚拟化平台的容量规划（题 2621）。
 *
 * 核心洞察：不能只看 CPU 和内存 —— 存储 IOPS、网络带宽、
 * 以及「超分后的实际争抢」才是决定能跑多少虚拟机的关键。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 240" role="img" aria-label="虚拟化容量规划四个维度：CPU 与内存超分、存储 IOPS、网络带宽、故障冗余">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">只看 CPU/内存会严重高估容量 —— IOPS 与带宽常先到瓶颈</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① CPU / 内存：按超分比算，不按物理核</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">vCPU:物理核常见 4:1~8:1；超分过度 → ready time 飙升（见另一题）</text>

      <rect x="6" y="54" width="328" height="30" rx="4" fill="#e5484d" opacity=".12" />
      <text x="14" y="67" font-size="8" font-weight="700" fill="#e5484d">② 存储 IOPS：最常被漏掉的瓶颈</text>
      <text x="14" y="79" font-size="7.5" fill="var(--fig-text)">N 台 VM 共享同一后端 → 总 IOPS = 各 VM 需求之和，别按单台估</text>

      <rect x="6" y="88" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="101" font-size="8" font-weight="700" fill="var(--fig-node-b)">③ 网络带宽：存储网与业务网分开算</text>
      <text x="14" y="113" font-size="7.5" fill="var(--fig-text)">vMotion、副本同步、备份都吃带宽；万兆是底线</text>

      <rect x="6" y="122" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="135" font-size="8" font-weight="700" fill="var(--fig-node-c)">④ 故障冗余：N+1 起</text>
      <text x="14" y="147" font-size="7.5" fill="var(--fig-text)">容量要保证「挂一台」后剩余宿主仍能承载全部 VM</text>

      <!-- 计算方式 -->
      <rect x="6" y="158" width="328" height="50" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="171" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">可行的规划方法</text>
      <text x="14" y="184" font-size="7.5" fill="var(--fig-text)">① 统计现有 VM 的实际峰值（不是分配值）　② 按峰值×增长×N+1 倒推</text>
      <text x="14" y="196" font-size="7.5" fill="var(--fig-text)">③ 用压测确认「单宿主满载」「存储 IOPS」「vMotion 耗时」三个数字</text>
      <text x="14" y="208" font-size="7" fill="var(--fig-node-c)">分配值（requested）与实际用量（used）往往差很多，别用前者规划</text>

      <text x="6" y="230" font-size="7.5" fill="var(--fig-muted)">注意：超分是「赌峰值不重叠」，同一时刻所有业务都峰值就会集体雪崩</text>
    </svg>
    <figcaption>四维：CPU/内存按超分比、存储 IOPS 按总量、网络分存储网与业务网、冗余 N+1；用实际峰值而非分配值规划</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
