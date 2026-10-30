<script setup>
/**
 * kube-proxy 的 iptables 与 IPVS 模式（题 4613）。
 *
 * 核心洞察：两者都实现 Service 负载均衡，但 iptables 是「线性规则链」（规模大时慢），
 * IPVS 用哈希表（O(1)），且支持更多调度算法 —— 大规模集群的关键区别。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 260" role="img" aria-label="kube-proxy 的 iptables 模式用线性规则链、IPVS 模式用哈希表与调度算法，大规模集群性能差异明显">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">两者都做 Service 转发，差别在「查找复杂度」与可用的调度算法</text>

      <rect x="6" y="20" width="160" height="76" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">iptables 模式</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">每条 Service 生成一串规则</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">包要顺序遍历规则链</text>
      <text x="14" y="70" font-size="7.5" fill="#e5484d">Service/Pod 多时明显变慢</text>
      <text x="14" y="82" font-size="7.5" fill="var(--fig-text)">规则更新是全量刷新</text>
      <text x="14" y="94" font-size="7.5" fill="var(--fig-node-c)">调度只支持随机</text>

      <rect x="174" y="20" width="160" height="76" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">IPVS 模式</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">虚拟服务表 + 哈希查找</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">O(1) 定位后端</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-node-b)">大规模集群性能稳定</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-text)">支持 rr / wrr / lc 等算法</text>
      <text x="182" y="94" font-size="7.5" fill="var(--fig-node-c)">需要内核 ip_vs 模块</text>

      <!-- 排查 -->
      <rect x="6" y="106" width="328" height="42" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="119" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">怎么确认当前模式</text>
      <text x="14" y="132" font-size="7.5" fill="var(--fig-text)">看 kube-proxy 日志/配置的 mode 字段；IPVS 下 ipvsadm -Ln 能看到虚拟服务</text>
      <text x="14" y="144" font-size="7.5" fill="var(--fig-node-c)">iptables 下 iptables-save | grep KUBE-SERVICES 规则会很多</text>

      <rect x="6" y="158" width="328" height="42" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="171" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">常见问题</text>
      <text x="14" y="184" font-size="7.5" fill="var(--fig-text)">IPVS 模式在 Service 后面 Pod 少时，可能退化为「只有一个后端」的异常</text>

      <rect x="6" y="208" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="221" font-size="8" font-weight="700" fill="var(--fig-node-a)">实践建议</text>
      <text x="14" y="234" font-size="7.5" fill="var(--fig-text)">Service 上千或 node 很多时切 IPVS；小集群 iptables 足够且更少依赖</text>

      <text x="6" y="252" font-size="7.5" fill="var(--fig-muted)">注意：kube-proxy 只是转发；真正的四层后端选择还可交给云 LB</text>
    </svg>
    <figcaption>iptables 线性遍历、Service 多时变慢且只支持随机；IPVS 哈希查找 O(1)、支持多算法，大规模更优</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
