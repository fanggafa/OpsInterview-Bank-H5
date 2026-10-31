<script setup>
/**
 * Redis ZSet 的底层结构（题 3801）。
 *
 * 核心洞察：ZSet 同时需要「按成员查分数」与「按分数排序」，
 * 所以用「哈希表 + 跳表」两种结构组合，而不是单一链表。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 248" role="img" aria-label="ZSet 用哈希表按成员查分数、用跳表按分数范围查询；为什么不用普通链表">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">两个需求要满足：按成员查分数、按分数做范围查询</text>

      <rect x="6" y="20" width="160" height="76" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">哈希表</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">member → score</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">ZSCORE 等操作 O(1)</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">负责「按成员找」</text>
      <text x="14" y="82" font-size="7" fill="var(--fig-node-c)">但哈希表无序</text>

      <rect x="174" y="20" width="160" height="76" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">跳表 skiplist</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">按 score 有序、多层索引</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">范围查询 O(log N)</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">负责「按分数排序/范围」</text>
      <text x="182" y="82" font-size="7" fill="var(--fig-node-c)">ZRANGE / ZRANK 靠它</text>

      <!-- 为什么不用普通链表 -->
      <rect x="6" y="106" width="328" height="50" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="119" font-size="8.5" font-weight="700" fill="#e5484d">为什么不用普通链表</text>
      <text x="14" y="132" font-size="7.5" fill="var(--fig-text)">普通链表查找是 O(n)：按分数定位要逐节点走，百万成员时不可接受</text>
      <text x="14" y="144" font-size="7.5" fill="var(--fig-text)">跳表加多层索引后查找降到 O(log N)，且实现比红黑树简单、范围遍历更自然</text>
      <text x="14" y="156" font-size="7" fill="var(--fig-node-c)">典型用途：排行榜、延时队列、滑动窗口</text>

      <!-- 编码切换 -->
      <rect x="6" y="166" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="179" font-size="8" font-weight="700" fill="var(--fig-node-c)">小集合用 ziplist / listpack</text>
      <text x="14" y="191" font-size="7.5" fill="var(--fig-text)">元素少且短时用紧凑结构省内存，超过阈值才转跳表</text>

      <rect x="6" y="208" width="328" height="20" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="222" font-size="7.5" fill="var(--fig-text)">相关配置：zset-max-listpack-entries / -value（旧版为 ziplist 系列）</text>

      <text x="6" y="240" font-size="7.5" fill="var(--fig-muted)">注意：跳表是随机化的（每层概率 1/4），最坏情况仍理论上 O(n)，实践很稳</text>
    </svg>
    <figcaption>ZSet 用哈希表实现「按成员查分数」O(1)，用跳表实现「按分数范围查询」O(log N)；普通链表查找 O(n) 不可接受</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
