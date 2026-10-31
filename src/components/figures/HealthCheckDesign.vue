<script setup>
/**
 * 健康检查机制设计（题 12164）。
 *
 * 核心洞察：liveness 回答「进程还活着吗」（失败→重启），
 * readiness 回答「能接流量吗」（失败→摘流量）。把依赖检查放进 liveness，
 * 会让一次外部抖动变成整批容器重启的闭环雪崩。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 342" role="img" aria-label="liveness 与 readiness 对比，以及 liveness 检查依赖时「数据库慢→探针失败→全部重启→更慢→再失败」的雪崩重启循环">
      <defs>
        <marker id="arrHcd" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#e5484d" />
        </marker>
        <marker id="arrHcdA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-node-a)" />
        </marker>
      </defs>

      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">两类探针回答两个不同问题，失效动作也不同</text>

      <!-- liveness -->
      <rect x="6" y="20" width="160" height="64" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <rect x="6" y="20" width="160" height="64" rx="5" fill="none" stroke="var(--fig-node-a)" stroke-width="1" />
      <text x="14" y="35" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">liveness 存活</text>
      <text x="14" y="47" font-size="7.5" fill="var(--fig-text)">问：进程还活着吗？</text>
      <text x="14" y="59" font-size="7.5" fill="var(--fig-text)">只看进程自身（能否响应）</text>
      <text x="14" y="73" font-size="7.5" font-weight="700" fill="var(--fig-node-c)">失败 → 重启容器</text>

      <!-- readiness -->
      <rect x="174" y="20" width="160" height="64" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <rect x="174" y="20" width="160" height="64" rx="5" fill="none" stroke="var(--fig-node-b)" stroke-width="1" />
      <text x="182" y="35" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">readiness 就绪</text>
      <text x="182" y="47" font-size="7.5" fill="var(--fig-text)">问：现在能接流量吗？</text>
      <text x="182" y="59" font-size="7.5" fill="var(--fig-text)">查依赖是否就绪</text>
      <text x="182" y="73" font-size="7.5" font-weight="700" fill="var(--fig-node-c)">失败 → 摘除流量</text>

      <text x="6" y="96" font-size="8.5" font-weight="700" fill="#e5484d">坑：liveness 里查数据库 → 雪崩重启循环</text>

      <!-- 循环 -->
      <rect x="6" y="102" width="158" height="32" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="117" font-size="8" font-weight="700" fill="#e5484d">① 数据库变慢</text>
      <text x="14" y="128" font-size="7.5" fill="var(--fig-text)">查询超时、连接池耗尽</text>

      <path d="M166 118 L172 118" stroke="#e5484d" stroke-width="1.5" marker-end="url(#arrHcd)" />

      <rect x="176" y="102" width="158" height="32" rx="4" fill="#e5484d" opacity=".1" />
      <text x="184" y="117" font-size="8" font-weight="700" fill="#e5484d">② 探针失败</text>
      <text x="184" y="128" font-size="7.5" fill="var(--fig-text)">连续 2~3 次即判定</text>

      <path d="M255 134 L255 140" stroke="#e5484d" stroke-width="1.5" marker-end="url(#arrHcd)" />

      <rect x="176" y="142" width="158" height="32" rx="4" fill="#e5484d" opacity=".1" />
      <text x="184" y="157" font-size="8" font-weight="700" fill="#e5484d">③ 全部容器重启</text>
      <text x="184" y="168" font-size="7.5" fill="var(--fig-text)">同一时刻、整批被杀</text>

      <path d="M174 158 L168 158" stroke="#e5484d" stroke-width="1.5" marker-end="url(#arrHcd)" />

      <rect x="6" y="142" width="158" height="32" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="157" font-size="8" font-weight="700" fill="#e5484d">④ 冷启动、缓存空</text>
      <text x="14" y="168" font-size="7.5" fill="var(--fig-text)">预热又压满数据库</text>

      <path d="M85 142 L85 136" stroke="#e5484d" stroke-width="1.5" marker-end="url(#arrHcd)" />

      <text x="6" y="188" font-size="7.5" fill="#e5484d">回路不收敛：每次重启都让下次失败来得更快</text>

      <!-- 正确做法 -->
      <rect x="6" y="196" width="328" height="46" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="210" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">正确分工</text>
      <text x="14" y="222" font-size="7.5" fill="var(--fig-text)">liveness 只查进程自身：能响应、无死锁；重启就能救活</text>
      <text x="14" y="234" font-size="7.5" fill="var(--fig-text)">readiness 查依赖：DB 不可用就摘流量，恢复后自动加回</text>

      <!-- 判据 -->
      <rect x="6" y="248" width="328" height="38" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="262" font-size="8" font-weight="700" fill="var(--fig-node-d)">用哪一类只需一问：重启能不能解决？</text>
      <text x="14" y="275" font-size="7.5" fill="var(--fig-text)">解决不了的问题别放 liveness，如依赖慢、外部不可用</text>

      <!-- 参数 -->
      <rect x="6" y="292" width="328" height="46" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="305" font-size="8" font-weight="700" fill="var(--fig-node-c)">参数要点</text>
      <text x="14" y="317" font-size="7.5" fill="var(--fig-text)">failureThreshold 2~3 次，防偶发抖动误判</text>
      <text x="14" y="329" font-size="7.5" fill="var(--fig-text)">timeout 1~5s；启动慢就用 startupProbe</text>
    </svg>
    <figcaption>liveness 失败重启容器、readiness 失败摘流量；liveness 一旦查依赖，一次抖动就会把整批实例拖入重启循环</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
