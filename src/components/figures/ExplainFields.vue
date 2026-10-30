<script setup>
/**
 * EXPLAIN 关键字段怎么读（题 26）。
 *
 * 核心洞察：EXPLAIN 不是「看一眼有没有索引」，
 * 要按 type → key → rows → Extra 的顺序读，才能判断「扫了多少、为什么慢」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 262" role="img" aria-label="EXPLAIN 关键字段：type 好坏排序、key 用了哪个索引、rows 扫描行数、Extra 是否覆盖与filesort">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">按 type → key → rows → Extra 的顺序读，而不是只看「有没有索引」</text>

      <!-- type -->
      <rect x="6" y="20" width="328" height="62" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① type：访问类型（从好到差）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">system > const > eq_ref > ref > range > index > ALL</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">ALL = 全表扫描（重点关注）；index = 扫整个索引（也慢）</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-node-c)">注意：小表 ALL 是正常的，别盲目加索引</text>

      <!-- key 与 rows -->
      <rect x="6" y="88" width="328" height="50" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="101" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">② key / key_len：实际用了哪个索引、用了几列</text>
      <text x="14" y="114" font-size="7.5" fill="var(--fig-text)">key 为 NULL → 没走索引；key_len 能看出复合索引用了几列</text>
      <text x="14" y="126" font-size="7.5" fill="var(--fig-node-c)">③ rows：预计扫描行数 —— 与返回行数差距越大越糟</text>

      <!-- Extra -->
      <rect x="6" y="144" width="328" height="58" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="157" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">④ Extra：最关键的补充信息</text>
      <text x="14" y="170" font-size="7.5" fill="var(--fig-node-a)">Using index → 覆盖索引（好）</text>
      <text x="14" y="182" font-size="7.5" fill="var(--fig-text)">Using index condition → 索引下推（仍需回表）</text>
      <text x="14" y="194" font-size="7.5" fill="#e5484d">Using filesort / Using temporary → 额外排序/临时表（要优化）</text>

      <!-- 判读 -->
      <rect x="6" y="208" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="221" font-size="8" font-weight="700" fill="var(--fig-node-d)">典型判读</text>
      <text x="14" y="233" font-size="7.5" fill="var(--fig-text)">type=ALL 且 rows 很大 → 加索引；有 filesort → 让排序列进索引</text>

      <text x="6" y="258" font-size="7.5" fill="var(--fig-muted)">进阶：EXPLAIN FORMAT=JSON 看 used_columns 与 cost，比表格更细</text>
    </svg>
    <figcaption>type 看访问方式、key 看用哪个索引、rows 看扫描量、Extra 看覆盖与排序；四者合起来才能判断为什么慢</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
