<script setup>
/**
 * Shell 四种引号/替换写法与变量展开（题 98 / 11）。
 *
 * 核心洞察：单引号「全部原样」、双引号「展开变量与命令」，
 * 反引号与 $() 都做命令替换但 $() 可嵌套 —— 走错一步就是「变量没展开」或「意外执行」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 272" role="img" aria-label="Shell 单引号不展开、双引号展开变量与命令、反引号与 $() 做命令替换，$() 可嵌套">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">区别是「是否展开变量、是否执行命令」</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">单引号 \' ... \'</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">全部原样：变量不展开、命令不执行（适合 awk 脚本、正则）</text>

      <rect x="6" y="58" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="71" font-size="8" font-weight="700" fill="var(--fig-node-b)">双引号 \" ... \"</text>
      <text x="14" y="84" font-size="7.5" fill="var(--fig-text)">展开变量与命令替换（文件名含空格时必须用它）</text>

      <rect x="6" y="96" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="109" font-size="8" font-weight="700" fill="var(--fig-node-c)">反引号 ` ... `</text>
      <text x="14" y="122" font-size="7.5" fill="var(--fig-text)">命令替换，但嵌套要转义，可读性差（旧写法）</text>

      <rect x="6" y="134" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="147" font-size="8" font-weight="700" fill="var(--fig-node-d)">$ ( ... )（推荐）</text>
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)">命令替换，可自然嵌套：echo $(echo $(date +%Y))</text>

      <!-- 经典坑 -->
      <rect x="6" y="176" width="328" height="44" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="189" font-size="8.5" font-weight="700" fill="#e5484d">两个经典坑</text>
      <text x="14" y="202" font-size="7.5" fill="var(--fig-text)">① awk '{print $1}' 用单引号才对；用双引号会让 shell 先展开 $1</text>
      <text x="14" y="214" font-size="7.5" fill="var(--fig-text)">② cp $file /bak/ 在文件名含空格时会被拆成多个参数</text>

      <rect x="6" y="226" width="328" height="20" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="240" font-size="7.5" fill="var(--fig-node-c)">口诀：要原样用单引号，要展开用双引号，命令替换一律用 $()</text>

      <text x="6" y="266" font-size="7.5" fill="var(--fig-muted)">排查：bash -x script.sh 能看到实际展开后的命令</text>
    </svg>
    <figcaption>单引号原样、双引号展开变量与命令、反引号与 $() 都是命令替换但 $() 可嵌套；awk 用单引号、含空格变量必须加引号</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
