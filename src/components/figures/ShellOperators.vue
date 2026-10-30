<script setup>
/**
 * Shell 的 , || ; && 与 {} () 分组（题 4203）。
 *
 * 核心洞察：`;` 与 `&&` 决定「是否继续执行」，`,` 在花括号里连接命令，
 * `{}` 在当前 shell 执行（能改环境），`()` 在子 shell 执行（改不到外面）。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 260" role="img" aria-label="Shell 中分号与与号决定是否继续、花括号在当前 shell、圆括号在子 shell">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">两个维度：要不要继续执行（; && ||）、在哪个 shell 执行（{ } vs ( )）</text>

      <rect x="6" y="20" width="328" height="28" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="38" font-size="7.5" fill="var(--fig-text)">cmd1 ; cmd2　不论 cmd1 成败都执行 cmd2</text>

      <rect x="6" y="52" width="328" height="28" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">cmd1 &amp;&amp; cmd2　cmd1 成功才执行 cmd2</text>

      <rect x="6" y="84" width="328" height="28" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="102" font-size="7.5" fill="var(--fig-text)">cmd1 || cmd2　cmd1 失败才执行 cmd2（常用于兜底）</text>

      <!-- 分组 -->
      <rect x="6" y="120" width="160" height="62" rx="5" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="133" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">{ ... }</text>
      <text x="14" y="146" font-size="7.5" fill="var(--fig-text)">当前 shell 执行</text>
      <text x="14" y="158" font-size="7.5" fill="var(--fig-text)">能改外部变量</text>
      <text x="14" y="170" font-size="7.5" fill="var(--fig-node-c)">末尾必须有 ; 或换行</text>

      <rect x="174" y="120" width="160" height="62" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="182" y="133" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">( ... )</text>
      <text x="182" y="146" font-size="7.5" fill="var(--fig-text)">子 shell 执行</text>
      <text x="182" y="158" font-size="7.5" fill="var(--fig-text)">外部拿不到变量变化</text>
      <text x="182" y="170" font-size="7.5" fill="var(--fig-node-c)">适合隔离 cd 等副作用</text>

      <!-- 经典组合 -->
      <rect x="6" y="190" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="203" font-size="8" font-weight="700" fill="var(--fig-node-b)">最常见写法</text>
      <text x="14" y="216" font-size="7.5" fill="var(--fig-text)">cmd &gt;/dev/null 2&gt;&amp;1 || { echo 失败; exit 1; }　（兜底必须用花括号）</text>

      <text x="6" y="240" font-size="7.5" fill="var(--fig-muted)">坑：&amp;&amp; 与 || 按「左结合」判断，混用要加括号，否则逻辑易错</text>
      <text x="6" y="252" font-size="7.5" fill="var(--fig-muted)">配合 set -o pipefail 才能让管道失败也被 &amp;&amp; 捕获</text>
    </svg>
    <figcaption>；无视成败都执行、&amp;&amp; 成功才继续、|| 失败才继续；{} 在当前 shell（能改变量）、() 在子 shell（隔离副作用）</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
