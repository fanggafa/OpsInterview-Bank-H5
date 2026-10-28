<script setup>
/**
 * Shell 脚本健壮性「三件套」与常见坑图。
 * 把 set -e / set -u / pipefail 三个开关的作用，
 * 以及「它们各自管不到什么」并排展示 —— 这是写运维脚本最容易踩的地方。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 230" role="img" aria-label="Shell 脚本 set -e、set -u、pipefail 三个开关的作用范围与常见坑">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">脚本「静默出错继续往下跑」是最危险的，三个开关专治这个</text>

      <!-- set -e -->
      <rect x="6" y="20" width="160" height="62" rx="6" fill="var(--fig-node-a)" opacity=".09" />
      <rect x="6" y="20" width="160" height="62" rx="6" fill="none" stroke="var(--fig-node-a)" stroke-width="1.3" />
      <text x="14" y="36" font-size="9.5" font-weight="700" fill="var(--fig-node-a)">set -e</text>
      <text x="14" y="50" font-size="8" fill="var(--fig-text)">任一命令返回非 0 就退出</text>
      <text x="14" y="63" font-size="7.5" fill="var(--fig-node-d)">管不到：if / while 条件里的命令</text>
      <text x="14" y="75" font-size="7.5" fill="var(--fig-node-d)">管不到：管道中间的命令（见下）</text>

      <!-- set -u -->
      <rect x="174" y="20" width="160" height="62" rx="6" fill="var(--fig-node-c)" opacity=".09" />
      <rect x="174" y="20" width="160" height="62" rx="6" fill="none" stroke="var(--fig-node-c)" stroke-width="1.3" />
      <text x="182" y="36" font-size="9.5" font-weight="700" fill="var(--fig-node-c)">set -u</text>
      <text x="182" y="50" font-size="8" fill="var(--fig-text)">用到未定义变量就退出</text>
      <text x="182" y="63" font-size="7.5" fill="var(--fig-muted)">防「变量名写错 → 拼出 rm -rf /」</text>
      <text x="182" y="75" font-size="7.5" fill="var(--fig-node-d)">注意：${VAR:-默认值} 不受影响</text>

      <!-- pipefail -->
      <rect x="6" y="88" width="328" height="46" rx="6" fill="var(--fig-node-b)" opacity=".09" />
      <rect x="6" y="88" width="328" height="46" rx="6" fill="none" stroke="var(--fig-node-b)" stroke-width="1.3" />
      <text x="14" y="104" font-size="9.5" font-weight="700" fill="var(--fig-node-b)">set -o pipefail</text>
      <text x="14" y="118" font-size="8" fill="var(--fig-text)">管道的退出码取「最后一个失败的命令」，而不是只看最后一个</text>
      <text x="14" y="129" font-size="7.5" fill="var(--fig-node-d)">不加它：cmd1 失败 | cmd2 成功 → 整体算成功（错误被吞掉）</text>

      <!-- 推荐模板 -->
      <text x="6" y="150" font-size="9.5" font-weight="700" fill="var(--fig-text)">运维脚本的标准开头</text>
      <rect x="6" y="156" width="328" height="30" rx="5" fill="var(--fig-card)" stroke="var(--fig-node-a)" stroke-width="1" />
      <text x="14" y="168" font-size="8" fill="var(--fig-node-a)">#!/usr/bin/env bash</text>
      <text x="14" y="180" font-size="8" fill="var(--fig-node-c)">set -euo pipefail</text>
      <text x="150" y="180" font-size="7.5" fill="var(--fig-muted)">← 三个开关一行搞定（-e -u -o pipefail）</text>

      <!-- 其它坑 -->
      <text x="6" y="200" font-size="9.5" font-weight="700" fill="var(--fig-node-d)">另外三个高频坑</text>
      <text x="6" y="213" font-size="8" fill="var(--fig-text)">① 变量赋值不能有空格：`a = 1` 会被当成「运行命令 a」</text>
      <text x="6" y="225" font-size="8" fill="var(--fig-text)">② 忘加引号：`rm -rf $DIR/` 当 DIR 为空时会删根目录</text>
    </svg>
    <figcaption>把 set -euo pipefail 当作脚本的默认开头，能挡掉一大类「静默失败」</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
