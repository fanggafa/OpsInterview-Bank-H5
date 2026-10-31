<script setup>
/**
 * kube-proxy 的机制与工作模式（题 4771）。
 *
 * 核心洞察：它叫 proxy 但不接管流量 —— 真正的转发由内核规则完成，
 * 它只是「规则的维护者」。名字带来的误解是这题的核心考点。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 242" role="img" aria-label="kube-proxy 只写内核规则不转发流量，三种模式 iptables、IPVS、nftables">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">叫 proxy 但不转发流量 —— 它只是「内核规则维护者」</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="#e5484d" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="#e5484d">真实链路：请求 → 内核规则 → DNAT 到后端 Pod</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">kube-proxy 监听 Service/Endpoint 变化，把这套规则写进内核</text>

      <rect x="6" y="58" width="328" height="32" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="71" font-size="8" font-weight="700" fill="var(--fig-node-a)">iptables（默认）</text>
      <text x="14" y="83" font-size="7.5" fill="var(--fig-text)">每条 Service 一组链，规则是链表 → Service 多时线性遍历变慢</text>

      <rect x="6" y="94" width="328" height="32" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="107" font-size="8" font-weight="700" fill="var(--fig-node-b)">IPVS（大规模推荐）</text>
      <text x="14" y="119" font-size="7.5" fill="var(--fig-text)">内核哈希表查找 O(1) · 支持 rr/lc 等调度算法 · 需 ip_vs 模块</text>

      <rect x="6" y="130" width="328" height="32" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="143" font-size="8" font-weight="700" fill="var(--fig-node-c)">nftables（较新）</text>
      <text x="14" y="155" font-size="7.5" fill="var(--fig-text)">用 nftables 替代 iptables，规则更高效，逐步推广</text>

      <!-- 选型与排查 -->
      <rect x="6" y="166" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="179" font-size="8" font-weight="700" fill="var(--fig-node-d)">怎么选</text>
      <text x="14" y="191" font-size="7.5" fill="var(--fig-text)">Service 少于几百用 iptables；上千或节点多 → IPVS</text>

      <rect x="6" y="200" width="328" height="20" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="214" font-size="7.5" fill="var(--fig-text)">排查：iptables-save | grep KUBE / ipvsadm -Ln --stats</text>

      <text x="6" y="234" font-size="7.5" fill="var(--fig-muted)">常见误解：以为 kube-proxy 是「流量代理进程」→ 实际它只在写规则</text>
    </svg>
    <figcaption>kube-proxy 不接管流量，只把 Service 转发规则写进内核；iptables 链表遍历、IPVS 哈希 O(1)、nftables 较新</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
