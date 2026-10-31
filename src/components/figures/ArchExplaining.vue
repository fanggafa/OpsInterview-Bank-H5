<script setup>
/**
 * 新同事问「我们系统架构是怎样的」怎么讲清楚（题 5456）。
 *
 * 核心洞察：讲架构要「分层 + 数据流 + 边界」，而不是罗列组件名；
 * 先给全景（一句话），再按请求路径展开，最后点出关键约束与单点。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 250" role="img" aria-label="讲清架构的四步：一句话全景、按请求路径分层、点出数据与依赖、明确单点与约束">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">别罗列组件名——按「全景 → 路径 → 依赖 → 单点」讲</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① 一句话全景</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">「这是给 X 业务用的服务，入口是 LB，核心是 3 个服务 + 2 个存储」</text>

      <rect x="6" y="54" width="328" height="46" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="67" font-size="8" font-weight="700" fill="var(--fig-node-b)">② 按「一次请求」走一遍</text>
      <text x="14" y="80" font-size="7.5" fill="var(--fig-text)">用户 → DNS/CDN → LB → 网关 → 应用（几个服务）→ 缓存/DB/MQ</text>
      <text x="14" y="92" font-size="7.5" fill="var(--fig-node-c)">顺着数据流讲，比按组件名讲更容易记住</text>

      <rect x="6" y="104" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="117" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">③ 关键依赖与数据在哪</text>
      <text x="14" y="130" font-size="7.5" fill="var(--fig-text)">哪些是自研、哪些是中间件、哪些是云服务（分清「我们能改的」与「只能用的」）</text>
      <text x="14" y="142" font-size="7.5" fill="var(--fig-text)">数据放哪、谁是唯一真相源（避免出现两个都在写的情况）</text>

      <rect x="6" y="154" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="167" font-size="8.5" font-weight="700" fill="#e5484d">④ 点出单点与约束</text>
      <text x="14" y="180" font-size="7.5" fill="var(--fig-text)">哪里是单点（挂了就全停）、哪里有限流/降级、峰值能扛多少</text>
      <text x="14" y="192" font-size="7.5" fill="var(--fig-text)">这块最能体现「你真的懂」，而不是只会背组件名</text>

      <rect x="6" y="204" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="217" font-size="8" font-weight="700" fill="var(--fig-node-d)">推荐顺序</text>
      <text x="14" y="229" font-size="7.5" fill="var(--fig-text)">从「用户点一下会发生什么」开始讲，比宏大叙事有效得多</text>

      <text x="6" y="246" font-size="7.5" fill="var(--fig-muted)">配一张手画草图（入口/服务/存储/依赖方向），比纯口头讲快 3 倍</text>
    </svg>
    <figcaption>按全景→请求路径→依赖与数据→单点约束四步讲；顺数据流讲比罗列组件名好懂，单点最能体现理解深度</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
