<script setup>
/**
 * Deployment 的创建过程（题 4738）。
 *
 * 核心洞察：Deployment 不直接管 Pod，中间有 ReplicaSet ——
 * 这层不是多余的：每个 Pod 模板对应一个 RS，新旧并存就是滚动升级的基础。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 238" role="img" aria-label="Deployment 创建三级链路 Deployment→ReplicaSet→Pod，以及为何要有 RS 这层">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">三级链路：Deployment → ReplicaSet → Pod</text>

      <rect x="6" y="22" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".14" />
      <text x="14" y="39" font-size="7.5" fill="var(--fig-node-a)">① Deployment（顶层，声明 replicas 与 Pod 模板）</text>

      <rect x="6" y="52" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="69" font-size="7.5" fill="var(--fig-node-b)">② Deployment 控制器按模板生成 ReplicaSet（名字带模板 hash 后缀）</text>

      <rect x="6" y="82" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="99" font-size="7.5" fill="var(--fig-text)">③ ReplicaSet 控制器按 replicas 创建 Pod → 调度 → kubelet 起容器</text>

      <!-- 为什么要有 RS -->
      <rect x="6" y="120" width="328" height="48" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="133" font-size="8.5" font-weight="700" fill="#e5484d">为什么中间要有 ReplicaSet（这层不是多余的）</text>
      <text x="14" y="146" font-size="7.5" fill="var(--fig-text)">滚动升级需要「新旧两批 Pod 同时存在」→ 每个模板一个 RS</text>
      <text x="14" y="158" font-size="7.5" fill="var(--fig-text)">旧 RS 保留（revisionHistoryLimit 默认 10）→ 这就是回滚的依据</text>

      <rect x="6" y="176" width="328" height="26" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="193" font-size="7.5" fill="var(--fig-text)">查看链路：get deploy → get rs（能看到新旧两个）→ get pods</text>

      <text x="6" y="228" font-size="7.5" fill="var(--fig-muted)">出问题要顺着 RS → Pod 往下看，Deployment 本身不直接管 Pod</text>
    </svg>
    <figcaption>Deployment 创建三级链路：Deployment→ReplicaSet→Pod；RS 的存在是为滚动升级与回滚（旧 RS 保留即回滚依据）</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
