<script setup>
/**
 * Pod 网络异常的排查（题 4748）。
 *
 * 核心洞察：用「同节点通不通」做分水岭 ——
 * 同节点也不通说明 Pod 自身或 CNI 完全没工作；
 * 同节点通、跨节点不通，几乎一定是 CNI 隧道问题。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 248" role="img" aria-label="Pod 网络排查分层：Pod 内、同节点、跨节点、Service、被策略拦">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">用「同节点通不通」做分水岭</text>

      <rect x="6" y="22" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="35" font-size="7.5" fill="var(--fig-node-a)">① Pod 内：ip addr 有没有 IP、resolv.conf 是否指向 CoreDNS</text>

      <rect x="6" y="58" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="71" font-size="7.5" fill="var(--fig-text)">② 同节点 Pod 互通 → 排除 Pod 自身配置（DNS、端口）</text>

      <rect x="6" y="94" width="328" height="30" rx="4" fill="#e5484d" opacity=".12" />
      <text x="14" y="107" font-size="7.5" fill="#e5484d">③ 跨节点不通 → 大概率 CNI 隧道（这层最有决定性）</text>

      <rect x="6" y="130" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="143" font-size="7.5" fill="var(--fig-text)">④ Service 通不通：get endpoints 是否为空（selector 没选中）</text>

      <rect x="6" y="166" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="179" font-size="7.5" fill="var(--fig-text)">⑤ 是否被 NetworkPolicy 拦（白名单语义，加了就断其他）</text>

      <!-- 高频原因 -->
      <rect x="6" y="204" width="328" height="32" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="217" font-size="8" font-weight="700" fill="var(--fig-node-a)">最高频三个原因</text>
      <text x="14" y="229" font-size="7.5" fill="var(--fig-text)">防火墙拦 VXLAN(8472) · Pod CIDR 与宿主网段重叠 · CNI 未就绪</text>

      <text x="6" y="240" font-size="7.5" fill="var(--fig-muted)">抓包：宿主 tcpdump -i any port 8472 看隧道包有没有发出</text>
    </svg>
    <figcaption>五层排查：Pod 内地址、同节点互通、跨节点隧道、Service Endpoints、NetworkPolicy；同节点通而跨节点不通优先查 CNI</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
