<script setup>
/**
 * NetworkPolicy 的实现机制（题 4762）。
 *
 * 核心洞察：K8s 只负责「存策略对象」，真正拦流量的是 CNI 插件；
 * 而且策略是**白名单语义** —— 一旦某个 Pod 被选中，未写明的流量全部拒绝。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 244" role="img" aria-label="NetworkPolicy 由 K8s 存储、CNI 执行；白名单语义，一旦选中就默认拒绝其余">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">K8s 只存策略，真正拦流量的是 CNI 插件</text>

      <rect x="6" y="20" width="328" height="28" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="38" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">声明在 K8s</tspan>　NetworkPolicy 对象存进 etcd，本体不实现流量控制</text>

      <rect x="6" y="52" width="328" height="28" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">执行在 CNI</tspan>　calico（iptables/eBPF）· cilium（eBPF）· flannel 不支持</text>

      <!-- 白名单语义 -->
      <rect x="6" y="88" width="328" height="52" rx="5" fill="#e5484d" opacity=".12" />
      <text x="14" y="101" font-size="8.5" font-weight="700" fill="#e5484d">三个关键语义（最常被误解）</text>
      <text x="14" y="114" font-size="7.5" fill="var(--fig-text)">① 没有任何策略时：所有 Pod 之间默认全通</text>
      <text x="14" y="126" font-size="7.5" fill="var(--fig-text)">② 一旦有策略选中该 Pod：变成白名单，未写明的全部拒绝</text>
      <text x="14" y="138" font-size="7" fill="var(--fig-node-c)">③ Ingress 与 Egress 独立：只写 ingress 不影响出方向</text>

      <rect x="6" y="148" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="161" font-size="8" font-weight="700" fill="var(--fig-node-c)">最容易踩的坑</text>
      <text x="14" y="173" font-size="7.5" fill="var(--fig-text)">给某 Pod 加了一条 ingress 后，它原本能访问的其他东西全断了 —— 不是 bug</text>

      <rect x="6" y="190" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="203" font-size="8" font-weight="700" fill="var(--fig-node-d)">排查手段</text>
      <text x="14" y="215" font-size="7.5" fill="var(--fig-text)">calico: calicoctl get networkpolicy -o yaml · cilium: cilium policy trace</text>

      <text x="6" y="236" font-size="7.5" fill="var(--fig-muted)">前提：CNI 必须支持 NetworkPolicy，否则策略对象存在但不生效（flannel 就是如此）</text>
    </svg>
    <figcaption>K8s 存策略、CNI 执行（flannel 不支持）；白名单语义：一旦被选中就默认拒绝，Ingress/Egress 相互独立</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
