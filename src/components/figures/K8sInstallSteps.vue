<script setup>
/**
 * K8s 安装过程（题 4734）。
 *
 * 核心洞察：安装分三段（准备节点 → 装运行时与组件 → kubeadm init/join），
 * 最容易漏的是「关 swap、开 ip_forward、装 CNI」这三件，
 * 它们直接对应「kubelet 起不来 / 网络不通 / Node NotReady」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 248" role="img" aria-label="K8s 安装三段：前置准备、装组件、kubeadm 初始化与 join">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">三段式：准备 → 装组件 → init/join；三个坑对应三种症状</text>

      <text x="6" y="30" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① 前置准备（所有节点）</text>
      <rect x="6" y="36" width="328" height="38" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="49" font-size="7.5" fill="var(--fig-text)">关 swap · 关 SELinux · 时间同步 · 加载 overlay/br_netfilter</text>
      <text x="14" y="61" font-size="7.5" fill="var(--fig-text)">开 net.ipv4.ip_forward 与桥接转发 · 规划 Pod/Service CIDR（勿与宿主重叠）</text>
      <text x="14" y="71" font-size="7" fill="#e5484d">漏了会怎样：忘关 swap → kubelet 起不来；忘开转发 → Pod 网络不通</text>

      <text x="6" y="90" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">② 装运行时与组件</text>
      <rect x="6" y="96" width="328" height="38" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="109" font-size="7.5" fill="var(--fig-text)">装 containerd（配置 systemd cgroup 驱动）</text>
      <text x="14" y="121" font-size="7.5" fill="var(--fig-text)">装 kubeadm / kubelet / kubectl，版本必须一致；kubelet 设开机自启</text>
      <text x="14" y="131" font-size="7" fill="var(--fig-node-c)">此时 kubelet 还起不来，属正常（还没 init）</text>

      <text x="6" y="150" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">③ 初始化与加入</text>
      <rect x="6" y="156" width="328" height="40" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="169" font-size="7.5" fill="var(--fig-text)">首台 master：kubeadm init（指定 pod-network-cidr）→ 配 kubeconfig</text>
      <text x="14" y="181" font-size="7.5" fill="var(--fig-text)">装 CNI 插件（flannel/calico）→ 其他 master join --control-plane → worker join</text>
      <text x="14" y="191" font-size="7" fill="#e5484d">漏装 CNI → Node 一直 NotReady（这是最高频原因）</text>

      <rect x="6" y="202" width="328" height="28" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="215" font-size="8" font-weight="700" fill="var(--fig-node-d)">验证三步</text>
      <text x="14" y="226" font-size="7.5" fill="var(--fig-text)">get nodes 全 Ready · get pods -A 无异常 · 跨节点 Pod 互通</text>

      <text x="6" y="240" font-size="7.5" fill="var(--fig-muted)">记住：Node NotReady 第一反应查 CNI 装没装</text>
    </svg>
    <figcaption>安装三段：前置准备（关 swap、开转发、规划网段）、装运行时与三个组件、kubeadm init 后装 CNI 再 join</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
