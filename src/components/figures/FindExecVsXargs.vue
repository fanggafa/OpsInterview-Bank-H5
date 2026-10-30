<script setup>
/**
 * find 的 -exec 与 xargs 的区别（题 4214）。
 *
 * 核心洞察：-exec {...} + 批量传参、-exec {...} \; 逐个执行、
 * xargs 走管道需要 -0 才安全；三者性能与安全性不同。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 256" role="img" aria-label="find 的 -exec 加号批量传参、分号逐个执行，xargs 走管道需 -0 处理特殊字符">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">三种写法：批量、逐个、走管道 —— 性能与安全性都不一样</text>

      <rect x="6" y="20" width="328" height="46" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">-exec ... {} +（批量传参，推荐）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">把多个文件累积成一次命令调用，效率高</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-node-c)">find . -name "*.log" -exec rm -f {} +</text>

      <rect x="6" y="70" width="328" height="46" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="83" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">-exec ... {} \；（逐个执行）</text>
      <text x="14" y="96" font-size="7.5" fill="var(--fig-text)">每个文件单独执行一次，最安全但最慢</text>
      <text x="14" y="108" font-size="7.5" fill="var(--fig-node-c)">适合需要「每个文件单独输出/计数」的场景</text>

      <rect x="6" y="120" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="133" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">find | xargs（走管道）</text>
      <text x="14" y="146" font-size="7.5" fill="var(--fig-text)">默认按空格分词 → 文件名含空格会被拆坏</text>
      <text x="14" y="158" font-size="7.5" fill="var(--fig-node-c)">必须用 -print0 | xargs -0 才安全</text>

      <!-- 判断 -->
      <rect x="6" y="178" width="328" height="34" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="191" font-size="8" font-weight="700" fill="#e5484d">什么时候该用 xargs</text>
      <text x="14" y="204" font-size="7.5" fill="var(--fig-text)">命令不是 find 的产物（如从文件读列表）、或需要并行（xargs -P）</text>

      <rect x="6" y="218" width="328" height="22" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="233" font-size="7.5" fill="var(--fig-node-d)">安全习惯：先换成 echo 跑一遍，看清参数怎么被拆，再换 rm</text>

      <text x="6" y="246" font-size="7.5" fill="var(--fig-muted)">性能对比：{} + 最快、xargs -0 次之、{} \; 最慢（大目录差距明显）</text>
    </svg>
    <figcaption>-exec {} + 批量传参（快）、{} \; 逐个（慢但安全）、xargs 走管道必须 -0 才能处理空格与特殊字符</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
