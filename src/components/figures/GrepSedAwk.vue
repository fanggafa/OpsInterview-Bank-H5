<script setup>
/**
 * grep、sed、awk 的分工（题 4328）。
 *
 * 核心洞察：三者分别管「找、改、算」——
 * grep 筛选行，sed 编辑行，awk 按字段处理与统计；选错工具会事倍功半。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 252" role="img" aria-label="grep 筛行、sed 改行、awk 按字段计算；各自典型用法与各自不擅长的事">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">三者分工：grep 找、sed 改、awk 算</text>

      <rect x="6" y="20" width="328" height="52" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">grep：按「模式」筛选行</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">典型：日志里找 ERROR、过滤含某关键字行</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">常用：-n 行号、-v 反选、-c 计数、-r 递归、-E 扩展正则</text>
      <text x="14" y="70" font-size="7" fill="var(--fig-node-c)">不擅长：改内容、按字段统计</text>

      <rect x="6" y="80" width="328" height="52" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="93" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">sed：按「行」做编辑</text>
      <text x="14" y="106" font-size="7.5" fill="var(--fig-text)">典型：替换文本、删除行、在指定行后插入</text>
      <text x="14" y="118" font-size="7.5" fill="var(--fig-text)">常用：s/a/b/g、-i 原地改（注意先备份）、d 删除、N 拼行</text>
      <text x="14" y="130" font-size="7" fill="var(--fig-node-c)">不擅长：跨行的复杂计算</text>

      <rect x="6" y="140" width="328" height="52" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="153" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">awk：按「字段」处理与计算</text>
      <text x="14" y="166" font-size="7.5" fill="var(--fig-text)">典型：取第 N 列、求和/求平均、按列分组统计</text>
      <text x="14" y="178" font-size="7.5" fill="var(--fig-text)">常用：-F 指定分隔符、$1/$2 取列、BEGIN/END 块、数组计数</text>
      <text x="14" y="190" font-size="7" fill="var(--fig-node-c)">本质是一门小语言：能做复杂逻辑</text>

      <rect x="6" y="200" width="328" height="30" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="213" font-size="8" font-weight="700" fill="#e5484d">最常见的误用</text>
      <text x="14" y="225" font-size="7.5" fill="var(--fig-text)">用 grep+cut 做统计（列对齐复杂）→ 一条 awk 就够；用 sed 计算求和</text>

      <text x="6" y="242" font-size="7.5" fill="var(--fig-muted)">判断口诀：只筛选 → grep；改文本 → sed；要按列算 → awk</text>
    </svg>
    <figcaption>grep 筛行、sed 改行、awk 按字段计算与统计；只用 grep+cut 做统计往往不如一条 awk</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
