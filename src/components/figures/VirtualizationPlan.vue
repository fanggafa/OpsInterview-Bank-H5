<script setup>
/**
 * 虚拟化平台的规划（题 2612）。
 *
 * 核心洞察：规划要覆盖「硬件 → 计算 → 存储 → 网络 → 管理面」五层，
 * 其中最容易被低估的是存储与网络，而不是服务器本身。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 232" role="img" aria-label="虚拟化平台规划五层：硬件、计算、存储、网络、管理面">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">五层规划：硬件 → 计算 → 存储 → 网络 → 管理面，后两层最易低估</text>

      <rect x="6" y="20" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="36" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">① 硬件</tspan>　CPU 型号/核数、内存容量、网卡与 RAID 卡；同代同型号便于 vMotion 兼容</text>

      <rect x="6" y="50" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="66" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">② 计算</tspan>　超分比例（vCPU/物理核）、预留与限额、虚拟机密度</text>

      <rect x="6" y="80" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="96" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">③ 存储</tspan>　容量 + IOPS + 延迟；本地盘 / SAN / 超融合，副本与快照策略</text>

      <rect x="6" y="110" width="328" height="26" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="126" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">④ 网络</tspan>　管理网/业务网/存储网分离，万兆起步；虚拟交换机与上行冗余</text>

      <rect x="6" y="140" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="156" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">⑤ 管理面</tspan>　管理平台、权限与审计、备份方案、监控与告警接入</text>

      <!-- 最容易低估 -->
      <rect x="6" y="176" width="328" height="34" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="189" font-size="8" font-weight="700" fill="#e5484d">最容易被低估的两块</text>
      <text x="14" y="201" font-size="7.5" fill="var(--fig-text)">存储 IOPS 往往先到瓶颈（不是容量）；网络少了存储网会让迁移与副本变慢</text>

      <text x="6" y="228" font-size="7.5" fill="var(--fig-muted)">验收：按规划压测「单宿主满负载 + 存储 IOPS + 迁移耗时」，而非只看容量够不够</text>
    </svg>
    <figcaption>五层规划：硬件同型号、计算定超分、存储算 IOPS、网络分离三张网、管理面接监控；存储 IOPS 与网络常先成瓶颈</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
