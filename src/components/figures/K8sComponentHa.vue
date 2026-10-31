<script setup>
/**
 * K8s 组件的高可用（题 4728）。
 *
 * 核心洞察：无状态组件「多副本都干活」，有状态组件（etcd）靠 Raft 选主；
 * 而 controller-manager/scheduler 是「多副本但只有一个 leader 干活」——
 * 因为它们会做决策，重复执行会出错。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 244" role="img" aria-label="组件高可分三类：apiserver 多副本并行、etcd 靠 Raft 选主、controller-manager 与 scheduler 靠选主只有 leader 工作">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">分三类：并行多副本 / Raft 选主 / 多副本但只有 leader 干活</text>

      <rect x="6" y="22" width="328" height="40" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="35" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① apiserver：多副本并行</text>
      <text x="14" y="48" font-size="7.5" fill="var(--fig-text)">无状态（每次都是读 etcd → 处理 → 写 etcd）→ 所有副本都能干活</text>
      <text x="14" y="60" font-size="7.5" fill="var(--fig-node-c)">前面挂 VIP（keepalived）或 LB；kubeconfig 必须指向 VIP 而非某台 IP</text>

      <rect x="6" y="70" width="328" height="40" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="83" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">② etcd：Raft 选主 + 多数派</text>
      <text x="14" y="96" font-size="7.5" fill="var(--fig-text)">3 或 5 节点（奇数利于容错）；3 节点可挂 1、5 节点可挂 2</text>
      <text x="14" y="108" font-size="7.5" fill="#e5484d">必须真备份 —— etcd 丢了等于整个集群的定义没了</text>

      <rect x="6" y="118" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="131" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">③ controller-manager / scheduler：选主，只 leader 干活</text>
      <text x="14" y="144" font-size="7.5" fill="var(--fig-text)">它们会「做决策」（创建 Pod、调度 Pod）→ 多副本并行会重复执行</text>
      <text x="14" y="156" font-size="7.5" fill="var(--fig-text)">所以 3 副本靠领导者选举，其余待命，leader 挂了才切换</text>
      <text x="14" y="168" font-size="7" fill="var(--fig-node-c)">常被说错：它们不是负载均衡，而是「避免重复决策」</text>

      <rect x="6" y="176" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="189" font-size="8" font-weight="700" fill="var(--fig-node-d)">④ kubelet 不是高可用对象</text>
      <text x="14" y="201" font-size="7.5" fill="var(--fig-text)">每台机器一个本地代理；它挂了该节点 Pod 就失去管理（容器可能还在跑）</text>

      <text x="6" y="228" font-size="7.5" fill="var(--fig-muted)">验证方式：随机停一台 apiserver，kubectl 应照常工作（说明配置指向了 VIP）</text>
    </svg>
    <figcaption>apiserver 多副本并行、etcd 靠 Raft 多数派、controller-manager/scheduler 选主只 leader 干活；kubelet 非 HA 对象</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
