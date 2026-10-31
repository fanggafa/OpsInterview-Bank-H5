<script setup>
/**
 * Token 与按 Token 计费（题 5801）。
 *
 * 核心洞察：Token 是「子词」而不是字或词，所以同一句话中英文开销不同；
 * 输入可以并行算、便宜，输出必须串行逐个生成、贵 2~4 倍。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 262" role="img" aria-label="Token 切分概念、输入与输出两个计费方向、中英文 token 差异">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">Token = 模型眼里最小的文本单位，不是字也不是词</text>

      <rect x="6" y="22" width="328" height="50" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="35" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① 切分：按子词（subword）切</text>
      <text x="14" y="47" font-size="7.5" fill="var(--fig-text)">中文 1 字 ≈ 1~2 token，英文 1 词 ≈ 1~3 token</text>
      <text x="14" y="59" font-size="7.5" fill="var(--fig-text)">生僻词会被切碎，同义两句话 token 数可能差一截</text>

      <rect x="6" y="76" width="328" height="52" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="89" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">② 输入 token：读一遍，便宜</text>
      <text x="14" y="101" font-size="7.5" fill="var(--fig-text)">所有输入并行做一次前向，算力摊得开</text>
      <text x="14" y="113" font-size="7.5" fill="var(--fig-text)">同一段前缀重复出现时，缓存命中还能再打折</text>

      <rect x="6" y="132" width="328" height="64" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="145" font-size="8.5" font-weight="700" fill="#e5484d">③ 输出 token：逐个生成，贵 2~4 倍</text>
      <text x="14" y="157" font-size="7.5" fill="var(--fig-text)">一次只出一个，且每步都要把前文重算一遍</text>
      <text x="14" y="169" font-size="7.5" fill="var(--fig-text)">生成是串行的 → 长回答比长提问贵得多</text>
      <text x="14" y="181" font-size="7.5" fill="var(--fig-text)">所以「让它多解释几句」才是账单主要来源</text>

      <rect x="6" y="200" width="328" height="44" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="213" font-size="8" font-weight="700" fill="var(--fig-node-c)">计费 = 输入 token × 单价 + 输出 token × 更高单价</text>
      <text x="14" y="225" font-size="7.5" fill="var(--fig-text)">省钱三招：精简 system prompt、限长、少让它复述</text>
      <text x="14" y="237" font-size="7.5" fill="var(--fig-text)">中文常比同义英文更费 token（1 字 ≈ 1~2）</text>

      <text x="6" y="252" font-size="7.5" fill="var(--fig-muted)">记住：输出单价通常是输入的 2~4 倍，长回答最烧钱</text>
    </svg>
    <figcaption>Token 按子词切分，中英文开销不同；输入并行计算便宜，输出串行逐 token 生成所以贵 2~4 倍，账单主要被长回答吃掉</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
