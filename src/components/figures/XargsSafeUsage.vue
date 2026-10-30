<script setup>
/**
 * find + xargs 处理含空格文件名的安全写法（题 12）。
 *
 * 核心洞察：默认 xargs 以空格分词，文件名含空格会被拆成多个参数 ——
 * 配 rm 时就是「误删别的文件」。三种安全写法各有适用场景。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 258" role="img" aria-label="xargs 默认按空格分词会拆散文件名，三种安全写法：print0 配 xargs -0、find -exec 加号、find -exec 分号">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">默认 xargs 以空格分词：文件名含空格会被拆成多个参数，配 rm 就是误删</text>

      <!-- 危险示例 -->
      <rect x="6" y="20" width="328" height="34" rx="5" fill="#e5484d" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="#e5484d">危险写法</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">find . -name "*.log" | xargs rm -f</text>

      <!-- 三种安全写法 -->
      <text x="6" y="70" font-size="9" font-weight="700" fill="var(--fig-text)">三种安全写法</text>

      <rect x="6" y="78" width="328" height="46" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="91" font-size="8" font-weight="700" fill="var(--fig-node-a)">① -print0 + xargs -0（最可靠）</text>
      <text x="14" y="104" font-size="7.5" fill="var(--fig-text)">用 NUL 分隔，任何字符（空格/换行/引号）都不会拆散</text>
      <text x="14" y="116" font-size="7.5" fill="var(--fig-node-c)">find . -name "*.log" -print0 | xargs -0 rm -f</text>

      <rect x="6" y="128" width="328" height="46" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="141" font-size="8" font-weight="700" fill="var(--fig-node-b)">② find -exec {} +（批量传参，无需 xargs）</text>
      <text x="14" y="154" font-size="7.5" fill="var(--fig-text)">把多个文件累积成一次调用，效率高且安全</text>
      <text x="14" y="166" font-size="7.5" fill="var(--fig-node-c)">find . -name "*.log" -exec rm -f {} +</text>

      <rect x="6" y="178" width="328" height="46" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="191" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ find -exec {} \；（逐个处理，最安全但慢）</text>
      <text x="14" y="204" font-size="7.5" fill="var(--fig-text)">每个文件单独执行一次命令，适合复杂操作（如带日志输出）</text>
      <text x="14" y="216" font-size="7.5" fill="var(--fig-node-c)">find . -name "*.log" -exec ls -l {} \;</text>

      <text x="6" y="240" font-size="7.5" fill="var(--fig-muted)">为什么不用引号解决：文件名里的换行、单双引号本身也会破坏引号语义</text>
      <text x="6" y="252" font-size="7.5" fill="var(--fig-muted)">排查提示：先把命令换成 echo 跑一遍，看清参数怎么被拆开，再换成 rm</text>
    </svg>
    <figcaption>文件名含空格时默认 xargs 会拆散它：用 -print0 + xargs -0，或直接 find -exec（+ 批量 / 分号逐个）</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
