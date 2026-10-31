<script setup>
/**
 * 访问站点返回 5xx 的快速定位（题 4757）。
 *
 * 核心洞察：先分清是 502/504/503/500 哪个、由哪一层写的 ——
 * 502 查「连不连得上」，504 查「后端慢不慢」，500 查「应用为什么抛错」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 232" role="img" aria-label="5xx 分层定位：先看码的来源，再按 CDN/LB/网关/应用/依赖逐层查">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">先看是哪个 5xx、哪一层返回的</text>

      <rect x="6" y="20" width="328" height="44" rx="5" fill="#e5484d" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="#e5484d">第一步：分清来源</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">502/504/503 通常由**网关**写（连不上/超时/无可用后端）</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">500 通常是**应用**抛的（内部错误）—— 看错误页/响应头能区分</text>

      <text x="6" y="78" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">第二步：按链路定位</text>
      <rect x="6" y="84" width="328" height="40" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="97" font-size="7.5" fill="var(--fig-text)">用户 → CDN → LB → 网关(Nginx) → 应用(Pod) → 依赖(DB/缓存)</text>
      <text x="14" y="109" font-size="7.5" fill="var(--fig-text)">CDN/LB 看回源与健康检查；网关看 access.log 的 status 与 upstream 耗时</text>
      <text x="14" y="121" font-size="7" fill="var(--fig-node-c)">应用看日志/重启；依赖看连接数与慢查询</text>

      <rect x="6" y="130" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="143" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">第三步：三个最快的动作</text>
      <text x="14" y="156" font-size="7.5" fill="var(--fig-text)">① 看网关 access.log（status + upstream_response_time）</text>
      <text x="14" y="168" font-size="7.5" fill="var(--fig-text)">② curl 直连后端（绕过网关）→ 区分「网关问题」还是「后端问题」</text>
      <text x="14" y="180" font-size="7" fill="var(--fig-node-c)">③ get pods 看有没有 CrashLoop / Evicted / OOM</text>

      <rect x="6" y="186" width="328" height="18" rx="3" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="199" font-size="7.5" fill="var(--fig-text)">部分 502 常见于滚动发布：新 Pod 未 Ready 就被打流量</text>

      <text x="6" y="228" font-size="7.5" fill="var(--fig-muted)">口诀：502 查连得上，504 查后端慢，500 查应用抛错，503 查限流/无后端</text>
    </svg>
    <figcaption>先分 5xx 来源（网关 502/504/503、应用 500），再按链路逐层查，最快三招是 access.log、curl 直连后端、看 Pod 状态</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
