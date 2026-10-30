<script setup>
/**
 * CDN 的工作原理与两类故障排查（题 4432）。
 *
 * 核心洞察：CDN 靠「DNS 调度 + 边缘缓存」加速，
 * 出问题无非两类 —— 命中率低（回源压力大）和回源失败（直接 5xx）。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 266" role="img" aria-label="CDN 靠 DNS 就近调度与边缘缓存；命中率低会打满回源，回源失败会直接 5xx">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">CDN = DNS 就近调度 + 边缘缓存；故障分「命中率低」与「回源失败」两类</text>

      <!-- 链路 -->
      <rect x="6" y="20" width="328" height="20" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="34" font-size="7.5" fill="var(--fig-node-a)">用户 → 智能 DNS（按地域/运营商解析）→ 最近边缘节点 → 命中则直接返回</text>

      <rect x="6" y="44" width="328" height="20" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">未命中 → 边缘节点回源（源站/CDN 上层）→ 缓存并按策略返回</text>

      <!-- 命中率低 -->
      <rect x="6" y="72" width="328" height="52" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="85" font-size="8.5" font-weight="700" fill="#e5484d">问题一：命中率低（回源被打满）</text>
      <text x="14" y="98" font-size="7.5" fill="var(--fig-text)">原因：URL 带随机参数 · 缓存头设成 no-store/短 max-age · 资源未预热</text>
      <text x="14" y="110" font-size="7.5" fill="var(--fig-text)">后果：请求都回源，源站带宽/CPU 暴涨，用户反而更慢</text>

      <!-- 回源失败 -->
      <rect x="6" y="128" width="328" height="52" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="141" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">问题二：回源失败（直接 5xx）</text>
      <text x="14" y="154" font-size="7.5" fill="var(--fig-text)">原因：源站不可达 / 回源 Host 配错 / 源站证书过期 / 回源端口被拦</text>
      <text x="14" y="166" font-size="7.5" fill="var(--fig-text)">排查：CDN 控制台看回源状态码、从边缘节点 curl 源站、检查源站安全组</text>

      <!-- 排查手段 -->
      <rect x="6" y="184" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="197" font-size="8" font-weight="700" fill="var(--fig-node-a)">两端对比是最有效的手段</text>
      <text x="14" y="210" font-size="7.5" fill="var(--fig-text)">直接访问源站 vs 经 CDN 访问：结果不同就说明问题在 CDN 或回源链路</text>

      <rect x="6" y="222" width="328" height="20" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="236" font-size="7.5" fill="var(--fig-node-d)">缓存刷新只清边缘，源站内容要先更新（顺序错了用户仍看到旧内容）</text>

      <text x="6" y="258" font-size="7.5" fill="var(--fig-muted)">易混点：CDN 命中率是「按流量/请求数」两个口径，看报表要确认是哪个</text>
    </svg>
    <figcaption>CDN 依赖 DNS 就近调度与边缘缓存；命中率低会打满回源，回源失败会直接 5xx，两端对比最有效</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
