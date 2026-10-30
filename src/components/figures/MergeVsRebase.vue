<script setup>
/**
 * merge 与 rebase 的区别与团队选择（题 2801）。
 *
 * 核心洞察：merge 保留「真实分叉」（历史可追溯），rebase 把历史拉直
 * （干净但改写提交）。团队选择取决于「要真实还是整洁」，以及有没有共享分支。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 262" role="img" aria-label="merge 保留分叉并生成合并提交，rebase 把提交重新应用到目标分支形成直线，各自适用场景">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">merge 保留真实分叉，rebase 把历史拉直（但改写了提交）</text>

      <!-- merge -->
      <rect x="6" y="20" width="328" height="46" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">merge：保留分叉</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">A—B—C————M　（M 是合并提交，两条线都留在历史里）</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-node-c)">优点：真实反映协作过程、不改写已推送的提交</text>

      <!-- rebase -->
      <rect x="6" y="74" width="328" height="46" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="87" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">rebase：拉成直线</text>
      <text x="14" y="100" font-size="7.5" fill="var(--fig-text)">A—B—C—D'—E'　（提交被重新应用，hash 变了）</text>
      <text x="14" y="112" font-size="7.5" fill="var(--fig-node-c)">优点：历史整洁、便于阅读与 bisect</text>

      <!-- 关键风险 -->
      <rect x="6" y="128" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="141" font-size="8.5" font-weight="700" fill="#e5484d">铁律：不要在「别人已经拉取」的分支上 rebase</text>
      <text x="14" y="154" font-size="7.5" fill="var(--fig-text)">改写提交会让协作者的本地历史与远端分叉 → 强制推送后冲突混乱</text>
      <text x="14" y="166" font-size="7.5" fill="var(--fig-node-c)">安全用法：只 rebase「自己的、未共享的」feature 分支</text>

      <!-- 选择 -->
      <rect x="6" y="182" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="195" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">团队怎么选</text>
      <text x="14" y="208" font-size="7.5" fill="var(--fig-text)">主干合并用 merge（保真实）· feature 分支同步主干用 rebase（减少无意义合并）</text>
      <text x="14" y="220" font-size="7.5" fill="var(--fig-node-c)">无论哪种：合并前跑 CI，冲突要在本地解决而不是在远端</text>

      <rect x="6" y="236" width="328" height="20" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="250" font-size="7.5" fill="var(--fig-node-d)">本仓库实践：每个改动一个短分支 → PR → 合并（squash 或 merge 由保护规则定）</text>
    </svg>
    <figcaption>merge 保留分叉与真实协作史，rebase 让历史变干净但改写了提交；共享分支上禁止 rebase</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
