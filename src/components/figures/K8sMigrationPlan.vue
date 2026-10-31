<script setup>
/**
 * 把传统应用迁移到 Kubernetes 的规划（题 117）。
 *
 * 核心洞察：迁移不是「把 jar 塞进镜像」，而是「先理顺配置与假设」——
 * 无状态化、配置外置、健康检查、资源声明，这四件事决定能不能稳定跑。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 250" role="img" aria-label="迁移到 K8s 四步：梳理与无状态化、配置外置、健康检查、资源与观测，以及常见误区">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">难点不在容器化，而在「应用里那些隐含的单机假设」</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① 梳理 + 无状态化</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">找出本地文件/本地缓存/会话粘性 → 改外部存储；否则多副本会数据不一致</text>

      <rect x="6" y="58" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="71" font-size="8" font-weight="700" fill="var(--fig-node-b)">② 配置与密钥外置</text>
      <text x="14" y="84" font-size="7.5" fill="var(--fig-text)">ConfigMap/Secret（或外部密钥管理）；镜像内不放环境差异，一次构建多处部署</text>

      <rect x="6" y="96" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="109" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ 健康检查（别抄默认值）</text>
      <text x="14" y="122" font-size="7.5" fill="var(--fig-text)">liveness 探「要不要重启」、readiness 探「能不能接流量」——配错会引发反复重启</text>

      <rect x="6" y="134" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="147" font-size="8" font-weight="700" fill="var(--fig-node-d)">④ 资源声明与观测</text>
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)">requests/limits 决定调度与 QoS；日志出 stdout、指标接 Prometheus</text>

      <!-- 分步推进 -->
      <rect x="6" y="174" width="328" height="46" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="187" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">推进节奏（降低风险）</text>
      <text x="14" y="200" font-size="7.5" fill="var(--fig-text)">先选 1 个边缘无状态服务试点 → 摸清网关/存储/监控接入 → 再批量迁移</text>
      <text x="14" y="212" font-size="7.5" fill="var(--fig-text)">有状态服务（DB/MQ）建议最后做，或先只把「计算」迁过去</text>

      <rect x="6" y="226" width="328" height="20" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="240" font-size="7.5" fill="var(--fig-text)">常见误区：把「能启动」当成「迁移完成」——没接监控与告警等于裸奔</text>

      <text x="6" y="248" font-size="7.5" fill="var(--fig-muted)"> </text>
    </svg>
    <figcaption>四步：无状态化（去本地文件与会话粘性）、配置密钥外置、正确配置健康检查、声明资源并接入观测；先试点再批量</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
