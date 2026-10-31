<script setup>
/**
 * list / dict / set 的底层结构与复杂度（题 5605）。
 *
 * 核心洞察：list 是数组（查找 O(n)），dict/set 是哈希表（查找 O(1)）——
 * 这就是「in 判断要用 set」的根本原因。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 232" role="img" aria-label="list 数组查找 O(n)，dict/set 哈希查找 O(1)；为什么 in 要用 set">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">复杂度差在这里：数组线性扫描 vs 哈希直接定位</text>

      <rect x="6" y="20" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="36" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">list</tspan>　动态数组：按索引 O(1)，查找 in 是 <tspan font-weight="700">O(n)</tspan>，中部插入 O(n)</text>

      <rect x="6" y="50" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="66" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">dict</tspan>　哈希表：查找/插入平均 <tspan font-weight="700">O(1)</tspan>；3.7+ 保持插入顺序</text>

      <rect x="6" y="80" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="96" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">set</tspan>　只存 key 的哈希表：查找/去重平均 <tspan font-weight="700">O(1)</tspan>，无序</text>

      <!-- 为什么 -->
      <rect x="6" y="114" width="328" height="50" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="127" font-size="8.5" font-weight="700" fill="#e5484d">为什么 in 判断必须用 set/dict</text>
      <text x="14" y="140" font-size="7.5" fill="var(--fig-text)">用 list 做成员判断：每查一次都要遍历一遍 → 循环里就是 O(n²)</text>
      <text x="14" y="152" font-size="7.5" fill="var(--fig-text)">用 set：每查一次是哈希定位 → 整体 O(n)</text>
      <text x="14" y="164" font-size="7" fill="var(--fig-node-c)">数据量上万后，差距是数量级的（小数据看不出差别，最容易被忽略）</text>

      <rect x="6" y="172" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="185" font-size="8" font-weight="700" fill="var(--fig-node-d)">dict/set 的代价</text>
      <text x="14" y="197" font-size="7.5" fill="var(--fig-text)">内存比 list 大（要留哈希空位）；key 必须可哈希（list 不能当 key，tuple 可以）</text>

      <rect x="6" y="212" width="328" height="18" rx="3" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="225" font-size="7.5" fill="var(--fig-text)">其他：频繁头插用 deque（list.insert(0) 是 O(n)）；计数用 collections.Counter</text>
    </svg>
    <figcaption>list 查找 O(n)、dict/set 哈希查找 O(1)；循环里用 list 做成员判断会退化成 O(n²)，这是改用 set 的根本理由</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
