<script setup>
/**
 * flannel 工作模式（题 4745）。
 *
 * 核心洞察：选模式的唯一依据是「节点是否在同一二层网络」——
 * 在同一网段用 host-gw（最快，无封装），跨网段只能用 VXLAN。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 242" role="img" aria-label="flannel 三种模式 VXLAN、host-gw、UDP，按是否同二层网络选型；flannel 不做网络策略">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">选模式的唯一依据：节点是否在同一二层网络</text>

      <rect x="6" y="20" width="328" height="40" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">VXLAN（默认）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">把 Pod 包封进 UDP 再传（封装开销）→ 可跨三层网络</text>
      <text x="14" y="58" font-size="7" fill="var(--fig-node-c)">端口 UDP 8472，防火墙要放行</text>

      <rect x="6" y="66" width="328" height="40" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="79" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">host-gw（性能最好）</text>
      <text x="14" y="92" font-size="7.5" fill="var(--fig-text)">直接写宿主机路由表，Pod 包直接发出 —— 无封装</text>
      <text x="14" y="104" font-size="7.5" fill="#e5484d">要求节点在同一二层网络（同机房/同网段可达）</text>

      <rect x="6" y="112" width="328" height="32" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="125" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">UDP（已淘汰）</text>
      <text x="14" y="137" font-size="7.5" fill="var(--fig-text)">早期用户态封装，性能差，已被 VXLAN 取代（另有较新的 WireGuard）</text>

      <!-- 选型 -->
      <rect x="6" y="150" width="328" height="40" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="163" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">怎么选</text>
      <text x="14" y="176" font-size="7.5" fill="var(--fig-text)">同二层网络 → host-gw（性能最好）；跨子网/跨机房 → VXLAN</text>
      <text x="14" y="188" font-size="7" fill="var(--fig-node-c)">不确定网络条件时，先用默认 VXLAN（兼容性优先）</text>

      <rect x="6" y="196" width="328" height="30" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="209" font-size="8" font-weight="700" fill="#e5484d">flannel 做不了的事</text>
      <text x="14" y="221" font-size="7.5" fill="var(--fig-text)">不支持 NetworkPolicy（网络隔离）→ 需要策略就换 calico / cilium</text>

      <text x="6" y="234" font-size="7.5" fill="var(--fig-muted)">排查：同节点通、跨节点不通 → 优先查 VXLAN 端口与防火墙</text>
    </svg>
    <figcaption>VXLAN 可跨三层但有封装开销、host-gw 无封装但要求同二层、UDP 已淘汰；flannel 不支持 NetworkPolicy</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
