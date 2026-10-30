<script setup>
/**
 * [ ]、[[ ]]、(( )) 的区别（题 4230）。
 *
 * 核心洞察：三者分属「POSIX 测试、bash 扩展测试、算术求值」；
 * 用错会踩「字符串未加引号报错」「不支持 && 逻辑」这类坑。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 256" role="img" aria-label="单方括号是 POSIX 测试、双方括号是 bash 增强测试、双圆括号是算术求值">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">三者定位不同：POSIX 测试 / bash 增强测试 / 算术求值</text>

      <rect x="6" y="20" width="328" height="42" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">[ ... ]（POSIX test）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">最兼容（sh/dash 都支持）；变量必须加引号否则报错</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-node-c)">不支持 &amp;&amp; / || 在里面，要用 -a / -o</text>

      <rect x="6" y="66" width="328" height="42" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="79" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">[[ ... ]]（bash/ksh 增强）</text>
      <text x="14" y="92" font-size="7.5" fill="var(--fig-text)">支持 &amp;&amp; || 、模式匹配、正则 =~，变量不加引号也安全</text>
      <text x="14" y="104" font-size="7.5" fill="var(--fig-node-c)">注意：脚本若写 #!/bin/sh 可能不支持</text>

      <rect x="6" y="112" width="328" height="42" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="125" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">(( ... ))（算术求值）</text>
      <text x="14" y="138" font-size="7.5" fill="var(--fig-text)">纯数学运算：(( i &lt; 10 )) 可直接用于 if</text>
      <text x="14" y="150" font-size="7.5" fill="var(--fig-node-c)">支持 ++/+=/- 等运算符，性能也比 expr 好</text>

      <!-- 选择 -->
      <rect x="6" y="162" width="328" height="44" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="175" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">怎么选</text>
      <text x="14" y="188" font-size="7.5" fill="var(--fig-text)">要可移植（sh/dash）→ 用 [ ] 并严格加引号</text>
      <text x="14" y="200" font-size="7.5" fill="var(--fig-text)">确定是 bash 且要复杂条件 → 用 [[ ]]；数字比较 → 用 (( ))</text>

      <rect x="6" y="212" width="328" height="24" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="228" font-size="7.5" fill="var(--fig-text)">经典坑：`[ $var = x ]` 在 var 为空时报 unary operator expected</text>

      <text x="6" y="246" font-size="7.5" fill="var(--fig-muted)">提示：shellcheck 会直接提示这三种用法的常见错误，强烈建议接入 CI</text>
    </svg>
    <figcaption>[ ] 最兼容但需加引号、[[ ]] 支持逻辑与正则但不一定可移植、(( )) 专用于算术</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
