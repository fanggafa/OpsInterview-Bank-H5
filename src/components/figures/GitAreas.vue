<script setup>
/**
 * Git 三个工作区域与常用命令的流向图。
 * 「改了却提交不上」和「撤销到底该 reset 还是 revert」这两类高频困惑，
 * 根源都是没把「工作区 → 暂存区 → 本地库 → 远程库」四层看清楚。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 234" role="img" aria-label="Git 工作区、暂存区、本地仓库、远程仓库四层结构与常用命令的流向">
      <defs>
        <marker id="arrGit" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-node-a)" />
        </marker>
        <marker id="arrGit2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-node-d)" />
        </marker>
      </defs>

      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">数据往右走是「提交」，往左走是「撤销/取回」</text>

      <!-- 四个区域 -->
      <rect x="6" y="20" width="74" height="46" rx="6" fill="var(--fig-node-a)" opacity=".1" />
      <rect x="6" y="20" width="74" height="46" rx="6" fill="none" stroke="var(--fig-node-a)" stroke-width="1.3" />
      <text x="43" y="38" text-anchor="middle" font-size="9" font-weight="700" fill="var(--fig-node-a)">工作区</text>
      <text x="43" y="52" text-anchor="middle" font-size="7.5" fill="var(--fig-muted)">你改的文件</text>

      <rect x="92" y="20" width="74" height="46" rx="6" fill="var(--fig-node-b)" opacity=".1" />
      <rect x="92" y="20" width="74" height="46" rx="6" fill="none" stroke="var(--fig-node-b)" stroke-width="1.3" />
      <text x="129" y="38" text-anchor="middle" font-size="9" font-weight="700" fill="var(--fig-node-b)">暂存区</text>
      <text x="129" y="52" text-anchor="middle" font-size="7.5" fill="var(--fig-muted)">index / stage</text>

      <rect x="178" y="20" width="74" height="46" rx="6" fill="var(--fig-node-c)" opacity=".1" />
      <rect x="178" y="20" width="74" height="46" rx="6" fill="none" stroke="var(--fig-node-c)" stroke-width="1.3" />
      <text x="215" y="38" text-anchor="middle" font-size="9" font-weight="700" fill="var(--fig-node-c)">本地库</text>
      <text x="215" y="52" text-anchor="middle" font-size="7.5" fill="var(--fig-muted)">.git/objects</text>

      <rect x="264" y="20" width="70" height="46" rx="6" fill="var(--fig-node-d)" opacity=".1" />
      <rect x="264" y="20" width="70" height="46" rx="6" fill="none" stroke="var(--fig-node-d)" stroke-width="1.3" />
      <text x="299" y="38" text-anchor="middle" font-size="9" font-weight="700" fill="var(--fig-node-d)">远程库</text>
      <text x="299" y="52" text-anchor="middle" font-size="7.5" fill="var(--fig-muted)">origin</text>

      <!-- 向右：提交 -->
      <path d="M82 34 L88 34" stroke="var(--fig-node-a)" stroke-width="1.6" marker-end="url(#arrGit)" />
      <path d="M168 34 L174 34" stroke="var(--fig-node-a)" stroke-width="1.6" marker-end="url(#arrGit)" />
      <path d="M254 34 L260 34" stroke="var(--fig-node-a)" stroke-width="1.6" marker-end="url(#arrGit)" />

      <text x="6" y="80" font-size="8.5" fill="var(--fig-node-a)">提交方向：</text>
      <text x="6" y="93" font-size="8" fill="var(--fig-text)">改文件 → git add → git commit → git push</text>

      <!-- 向左：撤销 -->
      <text x="6" y="112" font-size="8.5" fill="var(--fig-node-d)">撤销方向（按「动了几层」区分）：</text>

      <text x="6" y="127" font-size="8" fill="var(--fig-text)">git checkout -- &lt;file&gt;</text>
      <text x="150" y="127" font-size="7.5" fill="var(--fig-muted)">丢弃工作区改动（未 add 时用）</text>

      <text x="6" y="141" font-size="8" fill="var(--fig-text)">git restore --staged &lt;file&gt;</text>
      <text x="150" y="141" font-size="7.5" fill="var(--fig-muted)">把暂存区退回工作区（add 错了）</text>

      <text x="6" y="155" font-size="8" fill="var(--fig-text)">git reset --soft / --mixed / --hard</text>
      <text x="150" y="155" font-size="7.5" fill="var(--fig-muted)">只退 HEAD / 退暂存 / 连工作区一起退</text>

      <text x="6" y="169" font-size="8" fill="var(--fig-node-c)">git revert &lt;sha&gt;</text>
      <text x="150" y="169" font-size="7.5" fill="var(--fig-muted)">生成反向提交 —— 已推送的分支只能用这个</text>

      <!-- 关键提醒 -->
      <rect x="6" y="180" width="328" height="50" rx="7" fill="var(--fig-node-d)" opacity=".09" />
      <rect x="6" y="180" width="328" height="50" rx="7" fill="none" stroke="var(--fig-node-d)" stroke-width="1.2" />
      <text x="16" y="195" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">两个最常见的困惑，根源都在这张图上</text>
      <text x="16" y="209" font-size="8" fill="var(--fig-text)">①「我改了却提交不上」→ 漏了 git add（commit 只带走暂存区的内容）</text>
      <text x="16" y="222" font-size="8" fill="var(--fig-text)">②「撤不回/撤坏了」→ reset 改历史（已推送会冲突），revert 才不改历史</text>
    </svg>
    <figcaption>搞清楚「动了哪一层」，Git 的绝大多数「莫名其妙」都有解释</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
