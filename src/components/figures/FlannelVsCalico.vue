<script setup>
/**
 * flannel 与 calico 的区别（题 4753）。
 *
 * 核心洞察：flannel 是「封装式覆盖网络」，calico 是「三层路由 + 策略引擎」；
 * 选型最有决定性的一条是「要不要 NetworkPolicy」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 232" role="img" aria-label="flannel 与 calico 在原理、策略、性能、运维复杂度上的对比">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">flannel 管「连通」，calico 管「连通 + 隔离」</text>

      <rect x="6" y="20" width="160" height="86" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">flannel</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">VXLAN 封装 / host-gw 路由</text>
      <text x="14" y="58" font-size="7.5" fill="#e5484d">不支持 NetworkPolicy</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">依赖少、运维简单</text>
      <text x="14" y="82" font-size="7.5" fill="var(--fig-text)">VXLAN 有封装开销</text>
      <text x="14" y="94" font-size="7.5" fill="var(--fig-text)">跨三层网络可行</text>
      <text x="14" y="104" font-size="7" fill="var(--fig-node-c)">适合：小集群、只要连通</text>

      <rect x="174" y="20" width="160" height="86" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">calico</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">BGP 三层路由（或 IPIP）</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-node-b)">支持 NetworkPolicy，能力强</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">BGP 模式无封装、性能好</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-text)">要规划 IP 池、懂 BGP</text>
      <text x="182" y="94" font-size="7.5" fill="var(--fig-text)">calicoctl 可查端点与策略</text>
      <text x="182" y="104" font-size="7" fill="var(--fig-node-c)">适合：要隔离、规模较大</text>

      <!-- 分水岭 -->
      <rect x="6" y="116" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="129" font-size="8.5" font-weight="700" fill="#e5484d">最关键的分水岭：NetworkPolicy</text>
      <text x="14" y="142" font-size="7.5" fill="var(--fig-text)">需要「A 命名空间不能访问 B」「只有某些 Pod 能连数据库」</text>
      <text x="14" y="154" font-size="7.5" fill="var(--fig-text)">→ 必须 calico（或 cilium），flannel 做不到</text>

      <rect x="6" y="170" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="183" font-size="8" font-weight="700" fill="var(--fig-node-c)">常见误区</text>
      <text x="14" y="195" font-size="7.5" fill="var(--fig-text)">「calico 一定更快」—— IPIP 模式同样有封装，BGP 模式才是优势</text>

      <text x="6" y="228" font-size="7.5" fill="var(--fig-muted)">迁移提醒：flannel 换 calico 涉及 IP 池规划与现网重建，要有回退路径</text>
    </svg>
    <figcaption>flannel 封装/路由、不支持策略、运维简单；calico BGP 路由、支持 NetworkPolicy、需规划 IP 池；分水岭是要不要隔离</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
