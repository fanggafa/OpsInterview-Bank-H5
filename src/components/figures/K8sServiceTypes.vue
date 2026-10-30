<script setup>
/**
 * K8s 四种 Service 类型与流量入口（题 45）。
 *
 * 核心洞察：ClusterIP / NodePort / LoadBalancer 是四层（逐层包裹），
 * Ingress 是七层而且走的是「域名+路径路由」，不是 Service 的替代品。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 276" role="img" aria-label="K8s Service 四种类型：ClusterIP 集群内、NodePort 每节点端口、LoadBalancer 云负载均衡、Ingress 七层域名路由">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">前三者是四层逐层包裹，Ingress 是七层路由（不是替代品）</text>

      <rect x="6" y="20" width="328" height="42" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">ClusterIP（默认）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">集群内虚拟 IP，靠 kube-proxy 的 iptables/IPVS 转发到 Pod</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-node-c)">仅集群内可达：服务间调用、连数据库</text>

      <rect x="6" y="66" width="328" height="42" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="79" font-size="8" font-weight="700" fill="var(--fig-node-b)">NodePort</text>
      <text x="14" y="92" font-size="7.5" fill="var(--fig-text)">在每个节点开一个端口（默认 30000-32767）</text>
      <text x="14" y="104" font-size="7.5" fill="var(--fig-node-c)">外部用 节点IP:端口 访问 → kube-proxy 转到 Pod</text>

      <rect x="6" y="112" width="328" height="42" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="125" font-size="8" font-weight="700" fill="var(--fig-node-c)">LoadBalancer</text>
      <text x="14" y="138" font-size="7.5" fill="var(--fig-text)">在 NodePort 之上向云厂商申请外部负载均衡器 + 公网 IP</text>
      <text x="14" y="150" font-size="7.5" fill="var(--fig-node-c)">每个 Service 一个 LB（成本高，多服务时不划算）</text>

      <rect x="6" y="158" width="328" height="56" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="171" font-size="8" font-weight="700" fill="var(--fig-node-d)">Ingress（七层，与上面四者不同层）</text>
      <text x="14" y="184" font-size="7.5" fill="var(--fig-text)">按域名/路径把流量路由到不同 Service（需配合 Ingress Controller）</text>
      <text x="14" y="196" font-size="7.5" fill="var(--fig-text)">优点：一个入口承载多个服务、可做 TLS 与灰度</text>
      <text x="14" y="208" font-size="7.5" fill="var(--fig-node-c)">本质是「七层反向代理」，底层仍要靠 Service 找到 Pod</text>

      <!-- 流量路径 -->
      <rect x="6" y="222" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="235" font-size="8" font-weight="700" fill="var(--fig-node-a)">典型流量路径</text>
      <text x="14" y="247" font-size="7.5" fill="var(--fig-text)">用户 → Ingress（七层路由）→ ClusterIP Service → Pod</text>

      <text x="6" y="266" font-size="7.5" fill="var(--fig-muted)">易混点：Ingress 不是 Service 的一种类型，它是独立资源 + 控制器</text>
    </svg>
    <figcaption>ClusterIP 集群内、NodePort 每节点端口、LoadBalancer 云 LB 各占一个；Ingress 是七层路由，底层仍靠 Service</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
