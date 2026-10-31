<script setup>
/**
 * Git submodule 与 subtree（题 2830）。
 *
 * 核心洞察：submodule 是「指针」（代码不在本仓库），subtree 是「复制」（代码真在本仓库）——
 * 这决定了 clone 体验、协作复杂度与历史归属。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 248" role="img" aria-label="submodule 只存指针需要额外初始化，subtree 把代码复制进仓库无额外依赖">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">核心差别：submodule 存「指针」，subtree 存「真实的代码」</text>

      <rect x="6" y="20" width="160" height="88" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">submodule（指针）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">本仓库只记「某个 commit」</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">代码仍在独立仓库</text>
      <text x="14" y="70" font-size="7.5" fill="#e5484d">clone 后要 submodule update</text>
      <text x="14" y="82" font-size="7.5" fill="#e5484d">协作易踩「忘了同步指针」</text>
      <text x="14" y="94" font-size="7.5" fill="var(--fig-text)">历史清晰：子仓库独立</text>
      <text x="14" y="106" font-size="7" fill="var(--fig-node-c)">适合：有独立生命周期的组件</text>

      <rect x="174" y="20" width="160" height="88" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">subtree（复制）</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">代码真被合并进本仓库</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">clone 即可用，无额外步骤</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-node-b)">对使用者最省心</text>
      <text x="182" y="82" font-size="7.5" fill="#e5484d">提交历史会混入主仓库</text>
      <text x="182" y="94" font-size="7.5" fill="#e5484d">同步要 subtree pull/push（易冲突）</text>
      <text x="182" y="106" font-size="7" fill="var(--fig-node-c)">适合：第三方库、稳定依赖</text>

      <!-- 选型 -->
      <rect x="6" y="118" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="131" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">怎么选（两个问题）</text>
      <text x="14" y="144" font-size="7.5" fill="var(--fig-text)">① 这个子项目需要独立发布/独立权限吗？需要 → submodule</text>
      <text x="14" y="156" font-size="7.5" fill="var(--fig-text)">② 团队是否能接受「clone 后还要多跑一条命令」？不能 → subtree</text>

      <rect x="6" y="172" width="328" height="34" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="185" font-size="8" font-weight="700" fill="#e5484d">submodule 最常见的坑</text>
      <text x="14" y="197" font-size="7.5" fill="var(--fig-text)">CI 里没配 submodules: true → 构建时缺代码，但本地正常</text>

      <rect x="6" y="214" width="328" height="18" rx="3" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="227" font-size="7.5" fill="var(--fig-text)">CI 写法：先 git submodule update --init --recursive，再构建</text>

      <text x="6" y="240" font-size="7.5" fill="var(--fig-muted)">替代方案：用包管理器（npm/maven/go module）管依赖，比两者都省事</text>
    </svg>
    <figcaption>submodule 只存 commit 指针、代码在独立仓库（clone 需再初始化，CI 易漏）；subtree 复制代码本仓库可 clone 即用但历史混入</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
