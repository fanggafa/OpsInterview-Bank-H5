<script setup>
/**
 * K8s 灰度发布的四种手段（题 4764）。
 *
 * 核心洞察：按「分流粒度」从粗到细四种做法，越细越可控但依赖越重；
 * 灰度必须配指标对比与快速回滚，否则只是「分批上线」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 246" role="img" aria-label="灰度四种手段：副本比例、Ingress 权重、Header 切流、服务网格，粒度递增">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">按分流粒度从粗到细：副本 → 权重 → Header → 网格</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① 多 Deployment + 副本比例（最粗）</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">旧 9 副本 / 新 1 副本，Service 同时选中两者 → 约 10% 流量</text>

      <rect x="6" y="54" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="67" font-size="8" font-weight="700" fill="var(--fig-node-b)">② Ingress 权重（推荐）</text>
      <text x="14" y="79" font-size="7.5" fill="var(--fig-text)">Nginx Ingress 的 canary + canary-weight 注解，比例精确可控</text>

      <rect x="6" y="88" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="101" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ 按 Header / Cookie 切流（更细）</text>
      <text x="14" y="113" font-size="7.5" fill="var(--fig-text)">canary-by-header → 只让带特定头的请求进灰度（可指定测试用户）</text>

      <rect x="6" y="122" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="135" font-size="8" font-weight="700" fill="var(--fig-node-d)">④ 服务网格（最细）</text>
      <text x="14" y="147" font-size="7.5" fill="var(--fig-text)">Istio VirtualService 按权重/匹配规则，支持按用户分桶</text>

      <!-- 必须配套 -->
      <rect x="6" y="158" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="171" font-size="8.5" font-weight="700" fill="#e5484d">灰度必须配套两件事</text>
      <text x="14" y="184" font-size="7.5" fill="var(--fig-text)">① 指标对比：灰度组与基线组的错误率/延迟要能分别看</text>
      <text x="14" y="196" font-size="7.5" fill="var(--fig-text)">② 快速回滚：把权重调回 0，而不是「重新发布一次」</text>
      <text x="14" y="208" font-size="7" fill="var(--fig-node-c)">没有指标对比的灰度只是「分批上线」，出问题无法归因</text>

      <rect x="6" y="214" width="328" height="18" rx="3" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="227" font-size="7.5" fill="var(--fig-text)">注意：两版共享同一 DB schema 时，回滚可能不兼容</text>

      <text x="6" y="238" font-size="7.5" fill="var(--fig-muted)">粒度越细，对 Ingress/网格的依赖越重 —— 简单场景别上服务网格</text>
    </svg>
    <figcaption>四种灰度手段按粒度：副本比例、Ingress 权重、Header 切流、服务网格；必须配指标对比与权重归零回滚</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
