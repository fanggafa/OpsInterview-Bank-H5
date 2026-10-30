<script setup>
/**
 * 联合索引的最左前缀原则与索引失效（题 25）。
 *
 * 核心洞察：最左前缀不是「顺序必须一样」，而是「必须从最左列开始连续使用」；
 * 一旦中间出现范围条件，后面的列就只能在回表后过滤。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 272" role="img" aria-label="联合索引最左前缀：a 可单独用、ab 可用、abc 可用、跳列失效；范围条件会让后面的列失效">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">最左前缀 = 从最左列开始「连续」使用，不是要求书写顺序一致</text>

      <!-- 索引结构 -->
      <rect x="6" y="20" width="328" height="22" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="35" font-size="7.5" fill="var(--fig-text)">索引 (a, b, c)：先按 a 排序，a 相同再按 b，b 相同再按 c</text>

      <!-- 能用 -->
      <text x="6" y="58" font-size="9" font-weight="700" fill="var(--fig-node-b)">能用上索引的写法</text>

      <rect x="6" y="66" width="328" height="22" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="81" font-size="7.5" fill="var(--fig-text)">WHERE a=?　·　WHERE a=? AND b=?　·　WHERE a=? AND b=? AND c=?（全部用上）</text>

      <rect x="6" y="92" width="328" height="22" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="107" font-size="7.5" fill="var(--fig-text)">WHERE b=? AND a=?（顺序无关，优化器会自动对齐最左前缀）</text>

      <!-- 失效 -->
      <text x="6" y="132" font-size="9" font-weight="700" fill="#e5484d">典型的「用不上」写法</text>

      <rect x="6" y="140" width="328" height="22" rx="4" fill="#e5484d" opacity=".09" />
      <text x="14" y="155" font-size="7.5" fill="var(--fig-text)">WHERE b=?（跳过最左列 a → 索引完全失效）</text>

      <rect x="6" y="166" width="328" height="22" rx="4" fill="#e5484d" opacity=".09" />
      <text x="14" y="181" font-size="7.5" fill="var(--fig-text)">WHERE a=? AND c=?（c 用不上，只能用到 a 后回表过滤）</text>

      <rect x="6" y="192" width="328" height="34" rx="4" fill="#e5484d" opacity=".12" />
      <text x="14" y="205" font-size="7.5" font-weight="700" fill="#e5484d">最隐蔽的一种：范围条件截断</text>
      <text x="14" y="218" font-size="7.5" fill="var(--fig-text)">WHERE a=? AND b&gt;? AND c=? → b 是范围，c 无法参与索引查找</text>

      <!-- 修法 -->
      <rect x="6" y="234" width="328" height="24" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="250" font-size="7.5" fill="var(--fig-node-c)">修法：调整索引列顺序（等值列在前、范围列在后），或把范围列放最后</text>

      <text x="6" y="262" font-size="7.5" fill="var(--fig-muted)">验证：EXPLAIN 看 key_len —— 它能告诉你实际用了索引的几列</text>
    </svg>
    <figcaption>最左前缀要求从 a 开始连续使用；跳过 a 完全失效，中间出现范围条件会让后面的列失效</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
