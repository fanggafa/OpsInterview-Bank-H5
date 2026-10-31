<script setup>
/**
 * Pod 异常的定位四步（题 4750）。
 *
 * 核心洞察：先用「状态」决定往哪查，再用 Events（信息密度最高），
 * 再看日志（CrashLoop 必须用 --previous），最后核对资源配置。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 252" role="img" aria-label="Pod 异常四步：看状态决定方向、看 Events、看日志含 previous、核对资源与配置">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">四步：状态定方向 → Events → 日志 → 资源核对</text>

      <rect x="6" y="20" width="328" height="52" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① 看状态（决定往哪查）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">Pending → 调度；ContainerCreating → 落地；CrashLoop → 日志</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">Running 不 Ready → 探针；Evicted → 节点压力；Terminating → 优雅终止</text>

      <rect x="6" y="76" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="89" font-size="8" font-weight="700" fill="var(--fig-node-b)">② 看 Events（信息密度最高）</text>
      <text x="14" y="101" font-size="7.5" fill="var(--fig-text)">kubectl describe pod → 末尾 Events 常直接写出原因</text>

      <rect x="6" y="114" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="127" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ 看日志（CrashLoop 必须加 --previous）</text>
      <text x="14" y="139" font-size="7.5" fill="var(--fig-text)">容器已重启时，当前实例日志里没有崩溃现场 → 用 --previous</text>

      <rect x="6" y="152" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="165" font-size="8" font-weight="700" fill="var(--fig-node-d)">④ 核对资源与配置</text>
      <text x="14" y="177" font-size="7.5" fill="var(--fig-text)">limits/requests、探针、挂载；必要时 exec 进容器或开 debug 容器</text>

      <!-- 退出码 -->
      <rect x="6" y="190" width="328" height="42" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="203" font-size="8" font-weight="700" fill="var(--fig-node-a)">先看 Exit Code（最快分流）</text>
      <text x="14" y="216" font-size="7.5" fill="var(--fig-text)">137 = OOMKilled（128+9）　·　143 = SIGTERM（128+15，正常优雅终止）</text>
      <text x="14" y="228" font-size="7.5" fill="var(--fig-text)">1 = 应用自身报错　·　0 = 正常退出（可能被误判为异常）</text>

      <text x="6" y="244" font-size="7.5" fill="var(--fig-muted)">137 与 143 都是「正常机制」，别误当成应用 bug</text>
    </svg>
    <figcaption>四步定位：状态定方向、Events 看原因、日志（CrashLoop 加 --previous）、核对资源；先看退出码 137/143 可快速分流</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
