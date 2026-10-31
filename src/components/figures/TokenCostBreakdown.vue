<script setup>
/**
 * 大模型 API 调用成本拆解（题 5834）。
 *
 * 核心洞察：成本 = 输入 token × 输入单价 + 输出 token × 输出单价，
 * 输出单价通常是输入的 3~5 倍；降本先处置「重复请求」，再缩短上下文，
 * 最后才动输出长度——顺序反过来，常是白折腾。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 252" role="img" aria-label="Token 成本公式拆解、三条降本路径与手段排序">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">成本 = 输入 Token × 单价 + 输出 Token × 单价</text>

      <!-- ① 公式 -->
      <rect x="6" y="18" width="328" height="48" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="32" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① 公式：输出比输入贵约 4 倍</text>
      <text x="14" y="44" font-size="7.5" fill="var(--fig-text)">输入便宜（约 1/4），但上下文长 → 输入量往往是大头</text>
      <text x="14" y="56" font-size="7.5" fill="var(--fig-text)">输出昂贵（约 4 倍），逐字生成，最难省</text>

      <!-- ② 三条路 -->
      <rect x="6" y="74" width="328" height="60" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="88" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">② 降本三条路（按收益排序）</text>
      <text x="14" y="100" font-size="7.5" fill="var(--fig-text)">减请求：<tspan font-weight="700">语义缓存</tspan>、批处理、去重 —— 收益最大</text>
      <text x="14" y="112" font-size="7.5" fill="var(--fig-text)">缩输入：精简 prompt、RAG 只取最相关的 2~3 段</text>
      <text x="14" y="124" font-size="7.5" fill="var(--fig-text)">缩输出：限 max_tokens、要结构化短答</text>

      <!-- ③ 排序 -->
      <rect x="6" y="142" width="328" height="48" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="156" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">③ 手段排序：先省请求</text>
      <text x="14" y="168" font-size="7.5" fill="var(--fig-text)">缓存 → 裁输入 → 降 top-k → 换小模型 → 才限输出</text>
      <text x="14" y="180" font-size="7.5" fill="var(--fig-text)">别一上来就换小模型：浪费常出在重复调用上</text>

      <!-- 收口 -->
      <rect x="6" y="198" width="328" height="46" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="212" font-size="7.5" fill="var(--fig-text)">账单大头常是「重复请求 + 超长上下文」，不是单价贵</text>
      <text x="14" y="224" font-size="7.5" fill="var(--fig-text)">先按调用方 / Prompt 版本拆账，才知道从哪砍</text>
      <text x="14" y="236" font-size="7.5" fill="var(--fig-node-d)">验收看「单位业务量的 token 成本」（如每单），不看总账单</text>
    </svg>
    <figcaption>成本由输入/输出 token 与各自单价决定，降本先减请求、再缩输入、最后才是输出</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
