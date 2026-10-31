<script setup>
/**
 * Deployment 的滚动升级（题 4739）。
 *
 * 核心洞察：升级 = 创建新 RS + 按 maxSurge/maxUnavailable 逐步替换；
 * 全程不掉副本（maxUnavailable=0）要付出「双倍容量」的代价。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 242" role="img" aria-label="滚动升级流程与 maxSurge/maxUnavailable 两种配置的取舍，以及回滚本质">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">升级 = 建新 RS + 逐步替换 Pod；回滚 = 把旧 RS 扩回来</text>

      <rect x="6" y="22" width="328" height="24" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="38" font-size="7.5" fill="var(--fig-node-a)">① 改模板（如换镜像）→ 模板 hash 变 → 建新 RS（副本从 0 开始）</text>

      <rect x="6" y="50" width="328" height="24" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="66" font-size="7.5" fill="var(--fig-text)">② 按策略扩新缩旧，直到全部换成新 Pod</text>

      <rect x="6" y="78" width="328" height="24" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="94" font-size="7.5" fill="var(--fig-text)">③ 旧 RS 缩到 0 但对象保留（供回滚）</text>

      <!-- 两种配置 -->
      <rect x="6" y="110" width="328" height="44" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="123" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">两种关键配置的取舍</text>
      <text x="14" y="136" font-size="7.5" fill="var(--fig-text)">maxSurge:1 + maxUnavailable:0 → 全程不掉副本，但要多一倍容量</text>
      <text x="14" y="148" font-size="7.5" fill="var(--fig-text)">maxSurge:0 + maxUnavailable:1 → 不额外占资源，但升级期间少一个副本</text>

      <rect x="6" y="160" width="328" height="30" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="173" font-size="8" font-weight="700" fill="#e5484d">升级卡住的最常见原因</text>
      <text x="14" y="185" font-size="7.5" fill="var(--fig-text)">新 Pod 的 readinessProbe 一直不过 → 新 RS 扩不起来、旧的不敢缩</text>

      <rect x="6" y="196" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="209" font-size="8" font-weight="700" fill="var(--fig-node-a)">排查三件套</text>
      <text x="14" y="221" font-size="7.5" fill="var(--fig-text)">rollout status 看进度 · rollout history 看版本 · describe rs 看新 Pod</text>

      <text x="6" y="234" font-size="7.5" fill="var(--fig-muted)">回滚：rollout undo（本质是把旧 RS 重新扩容，所以旧 RS 被清理就无法回滚）</text>
    </svg>
    <figcaption>滚动升级三步：建新 RS、按 maxSurge/maxUnavailable 替换、旧 RS 保留供回滚；卡住多为新 Pod 探针不过</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
