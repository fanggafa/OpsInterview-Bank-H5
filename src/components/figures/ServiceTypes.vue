<script setup>
/**
 * Service 的作用与四种类型（题 4770）。
 *
 * 核心洞察：Service 存在的理由只有一个 —— Pod 是易变的（IP/副本/节点都会变）。
 * 它提供稳定 IP + 稳定 DNS + 自动负载均衡，本身却「不是进程」，只是一组内核规则。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 238" role="img" aria-label="Service 解决 Pod 易变问题，提供稳定 IP 与 DNS，四种类型及其场景">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">Pod 会变（IP/副本/节点），Service 提供稳定入口</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">它提供三样东西</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">稳定 IP（ClusterIP 虚拟地址）· 稳定 DNS 名 · 自动负载到 Ready 的 Pod</text>

      <rect x="6" y="56" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="73" font-size="7.5" fill="var(--fig-node-b)"><tspan font-weight="700">ClusterIP</tspan>（默认）集群内虚拟 IP → 服务间调用</text>

      <rect x="6" y="86" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="103" font-size="7.5" fill="var(--fig-node-c)"><tspan font-weight="700">NodePort</tspan>　每节点开端口(30000-32767) → 无 LB 时对外暴露</text>

      <rect x="6" y="116" width="328" height="26" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="133" font-size="7.5" fill="var(--fig-node-d)"><tspan font-weight="700">LoadBalancer</tspan>　对接云 LB 分配外部 IP → 云上生产对外</text>

      <rect x="6" y="146" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="163" font-size="7.5" fill="var(--fig-node-a)"><tspan font-weight="700">ExternalName</tspan>　DNS CNAME 到外部域名（不做转发）→ 包装外部依赖</text>

      <!-- 机制 -->
      <rect x="6" y="178" width="328" height="34" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="191" font-size="8" font-weight="700" fill="#e5484d">关键：Service 本身不是进程</text>
      <text x="14" y="203" font-size="7.5" fill="var(--fig-text)">只是规则 —— kube-proxy 把转发规则写进 iptables/IPVS</text>

      <text x="6" y="230" font-size="7.5" fill="var(--fig-muted)">最高频故障：get endpoints 为空（selector 没选中 Pod 或 Pod 未 Ready）</text>
    </svg>
    <figcaption>Service 提供稳定 IP、DNS 与负载均衡，解决 Pod 易变；四种类型 ClusterIP/NodePort/LoadBalancer/ExternalName 按场景选</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
