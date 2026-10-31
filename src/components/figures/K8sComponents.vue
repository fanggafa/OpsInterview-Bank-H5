<script setup>
/**
 * K8s 核心组件与作用（题 4727）。
 *
 * 核心洞察：组件分两组 —— 控制面（做决策）+ 工作节点（做执行）；
 * 面试最常追问的是「哪些是单点」，答案指向 etcd 与 apiserver 的多副本设计。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 256" role="img" aria-label="控制面组件 apiserver/etcd/scheduler/controller-manager，工作节点 kubelet/kube-proxy/运行时">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">控制面「做决策」，工作节点「做执行」</text>

      <text x="6" y="30" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">控制面</text>
      <rect x="6" y="36" width="328" height="24" rx="3" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="52" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">apiserver</tspan>　唯一入口，校验后读写 etcd；无状态可多副本</text>

      <rect x="6" y="64" width="328" height="24" rx="3" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="80" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">etcd</tspan>　存全部集群状态（唯一真相源）；有状态，必须备份</text>

      <rect x="6" y="92" width="328" height="24" rx="3" fill="var(--fig-node-a)" opacity=".08" />
      <text x="14" y="108" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">scheduler</tspan>　为未调度 Pod 选节点（看资源/亲和/污点）</text>

      <rect x="6" y="120" width="328" height="24" rx="3" fill="var(--fig-node-a)" opacity=".08" />
      <text x="14" y="136" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">controller-manager</tspan>　各控制器集合，靠调谐循环补齐期望状态</text>

      <text x="6" y="158" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">工作节点</text>
      <rect x="6" y="164" width="328" height="24" rx="3" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="180" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">kubelet</tspan>　本机 Pod 的实际运行（调 CRI/CNI/CSI）</text>

      <rect x="6" y="192" width="328" height="24" rx="3" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="208" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">kube-proxy</tspan>　实现 Service 转发（写 iptables/IPVS 规则）</text>

      <rect x="6" y="220" width="328" height="18" rx="3" fill="var(--fig-node-b)" opacity=".08" />
      <text x="14" y="233" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">容器运行时</tspan>　真正跑容器（containerd / CRI-O）</text>

      <text x="6" y="248" font-size="7.5" fill="var(--fig-muted)">常被追问：哪些是单点 → etcd 与 apiserver 的多副本是重点</text>
    </svg>
    <figcaption>控制面：apiserver（唯一入口、无状态）、etcd（唯一真相源、有状态）、scheduler、controller-manager；节点侧 kubelet/kube-proxy/运行时</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
