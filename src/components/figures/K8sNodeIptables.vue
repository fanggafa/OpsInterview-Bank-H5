<script setup>
/**
 * K8s 节点上大量 iptables 规则怎么理解（题 1230）。
 *
 * 核心洞察：那些规则基本都由 kube-proxy 生成，服务于 Service 转发与网络策略；
 * 排查不该逐条读，而要「按链名分类定位 + 用 trace/log 观察」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 264" role="img" aria-label="K8s 节点 iptables 规则由 kube-proxy 与 CNI 生成，按链名分类理解，用 xtables trace 观测">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">别逐条读 —— 按「谁生成的、管什么」分类理解</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">KUBE-* 链：Service 转发</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">KUBE-SERVICES（入口）→ KUBE-SVC-xxx（选择后端）→ KUBE-SEP-xxx（具体 Pod）</text>

      <rect x="6" y="54" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">KUBE-POSTROUTING / KUBE-MARK-*：SNAT、标记等辅助处理</text>

      <rect x="6" y="84" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="100" font-size="7.5" fill="var(--fig-text)">CNI 相关链（calico/cilium 等）：网络策略（NetworkPolicy）与容器网络</text>

      <rect x="6" y="114" width="328" height="26" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="130" font-size="7.5" fill="var(--fig-text)">cali-* / CILIUM_* 之类：具体 CNI 的实现细节，一般不需要手改</text>

      <!-- 排查方法 -->
      <rect x="6" y="148" width="328" height="52" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="161" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">正确的排查方式（三条）</text>
      <text x="14" y="174" font-size="7.5" fill="var(--fig-text)">① 从 KUBE-SERVICES 顺着链名往下找（iptables -L KUBE-SERVICES -n）</text>
      <text x="14" y="186" font-size="7.5" fill="var(--fig-text)">② xtables-monitor / iptables -j TRACE 看「包实际命中哪条」</text>
      <text x="14" y="198" font-size="7.5" fill="var(--fig-text)">③ 用 kubectl 看 Service/Endpoint 与 ipvsadm -Ln（若为 IPVS 模式）</text>

      <rect x="6" y="208" width="328" height="30" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="221" font-size="8" font-weight="700" fill="#e5484d">两条禁令</text>
      <text x="14" y="233" font-size="7.5" fill="var(--fig-text)">不要手改 KUBE 链（会被 kube-proxy 覆盖）；不要用 iptables -F 清空</text>

      <text x="6" y="254" font-size="7.5" fill="var(--fig-muted)">注意：规则多本身正常（每个 Service × 每个 Endpoint 都会生成几条）；多到卡顿才需换 IPVS</text>
    </svg>
    <figcaption>KUBE-* 链由 kube-proxy 生成（Services 转发）、CNI 链管网络策略；排查顺着链名找并配 TRACE，别手改别清空</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
