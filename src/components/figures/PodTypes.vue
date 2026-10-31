<script setup>
/**
 * 静态 Pod / 自主式 Pod / 动态 Pod（题 4733）。
 *
 * 核心洞察：区分标准不是「有没有控制器」，而是「谁创建、删了会不会回来」。
 * 静态 Pod 最特殊 —— 由 kubelet 读本机文件创建，不经过 apiserver。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 250" role="img" aria-label="三种 Pod：静态由 kubelet 读本机文件创建、自主式直接创建不会被重建、动态由控制器管理">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">按「谁创建、删了会不会回来」划分</text>

      <rect x="6" y="22" width="328" height="46" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="35" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">静态 Pod（Static Pod）</text>
      <text x="14" y="48" font-size="7.5" fill="var(--fig-text)">kubelet 直接读本机目录（默认 /etc/kubernetes/manifests/）创建</text>
      <text x="14" y="60" font-size="7.5" fill="var(--fig-text)">不经过 apiserver；改文件即重建，kubectl delete 删不掉（会再建）</text>
      <text x="14" y="72" font-size="7" fill="var(--fig-node-c)">典型：kubeadm 的控制面组件（apiserver/scheduler/etcd 都是静态 Pod）</text>

      <rect x="6" y="76" width="328" height="46" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="89" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">自主式 Pod（Bare Pod）</text>
      <text x="14" y="102" font-size="7.5" fill="var(--fig-text)">用户直接 kubectl run / 手写 Pod YAML 创建，无控制器管理</text>
      <text x="14" y="114" font-size="7.5" fill="#e5484d">删了就没了；节点挂了也不会重建</text>
      <text x="14" y="126" font-size="7" fill="var(--fig-node-c)">只适合临时调试，生产不要这么干</text>

      <rect x="6" y="130" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="143" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">动态 Pod（Managed Pod）</text>
      <text x="14" y="156" font-size="7.5" fill="var(--fig-text)">由控制器（Deployment/StatefulSet/DaemonSet）创建</text>
      <text x="14" y="168" font-size="7.5" fill="var(--fig-node-c)">删了会自动补、节点挂了会重新调度 → 生产里的绝大多数</text>
      <text x="14" y="180" font-size="7" fill="var(--fig-node-c)">想真正减副本要改 replicas 或删控制器</text>

      <!-- 关键对比 -->
      <rect x="6" y="184" width="328" height="40" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="197" font-size="8" font-weight="700" fill="var(--fig-node-d)">面试常问：静态 Pod 能不能用 kubectl 改？</text>
      <text x="14" y="210" font-size="7.5" fill="var(--fig-text)">不能 —— 改了会被 kubelet 按本机文件覆盖回去</text>
      <text x="14" y="222" font-size="7.5" fill="var(--fig-text)">apiserver 里看到的那个是 mirror pod（镜像），只用于展示、删不掉</text>

      <text x="6" y="242" font-size="7.5" fill="var(--fig-muted)">排查提示：控制面组件起不来时，要查本机文件与 kubelet 日志，而不是 kubectl</text>
    </svg>
    <figcaption>静态 Pod 由 kubelet 读本机文件（不可用 kubectl 改，mirror pod 只读）、自主式删了不回来、动态由控制器自动补</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
