<script setup>
/**
 * apiserver 的高可用（题 4736）。
 *
 * 核心洞察：apiserver 无状态（每次都是读 etcd→处理→写 etcd），
 * 所以高可用 = 多副本 + 统一入口（VIP/LB）+ 共享 etcd；
 * 最常见的错误是 kubeconfig 写死某台 IP。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 232" role="img" aria-label="apiserver 高可用三要素：多副本、统一入口 VIP、共享 etcd">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">它本身无状态，所以高可用 = 多副本 + 统一入口 + 共享 etcd</text>

      <rect x="6" y="22" width="328" height="28" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="40" font-size="7.5" fill="var(--fig-node-a)">① 为什么能多副本并行：每次请求都「读 etcd → 处理 → 写 etcd」，不在内存存状态</text>

      <rect x="6" y="54" width="328" height="28" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="72" font-size="7.5" fill="var(--fig-node-b)">② 统一入口：kubectl/kubelet 不知道有多个 → 需 VIP(keepalived) 或外部 LB</text>

      <rect x="6" y="86" width="328" height="28" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="104" font-size="7.5" fill="var(--fig-node-c)">③ 共享 etcd（3~5 节点）：所有 apiserver 连同一套 → 状态天然一致</text>

      <!-- 对比 -->
      <rect x="6" y="118" width="328" height="44" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="131" font-size="8.5" font-weight="700" fill="#e5484d">与 controller-manager/scheduler 的关键差别</text>
      <text x="14" y="144" font-size="7.5" fill="var(--fig-text)">apiserver 多副本**都干活**（只读多写共享后端）</text>
      <text x="14" y="156" font-size="7.5" fill="var(--fig-text)">controller-manager/scheduler 会做决策 → 靠**选主**只让 leader 干活</text>

      <rect x="6" y="166" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="179" font-size="8" font-weight="700" fill="var(--fig-node-d)">最常见配置错误</text>
      <text x="14" y="191" font-size="7.5" fill="var(--fig-text)">kubeconfig 里 server 写成某台具体 IP → 那台挂了全体失联</text>

      <text x="6" y="228" font-size="7.5" fill="var(--fig-muted)">验证：随机停一台 apiserver，kubectl 应照常工作</text>
    </svg>
    <figcaption>apiserver 无状态故多副本并行，靠 VIP/LB 统一入口 + 共享 etcd；kubeconfig 必须指向 VIP 而非具体节点 IP</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
