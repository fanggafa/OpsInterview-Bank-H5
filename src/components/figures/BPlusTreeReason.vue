<script setup>
/**
 * MySQL 索引为什么用 B+ 树（题 24）。
 *
 * 核心洞察：核心矛盾是「磁盘 IO 次数」与「范围查询」——
 * B+ 树非叶子只存 key（扇出大、树矮）、叶子有链表（范围扫描顺序读），
 * 这两点同时解决了「树太高」和「范围查询跨层跳转」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 274" role="img" aria-label="哈希、红黑树、B 树、B+ 树对比：B+ 树扇出大、树高 3-4 层、叶子链表支持范围查询">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">核心矛盾：磁盘 IO 次数 + 范围查询能力</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-d)">哈希表</text>
      <text x="60" y="33" font-size="7.5" fill="var(--fig-text)">等值 O(1)，但</text>
      <text x="14" y="45" font-size="7.5" fill="#e5484d">不支持范围查询与排序（仅 Memory 引擎用）</text>

      <rect x="6" y="54" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="67" font-size="8" font-weight="700" fill="var(--fig-node-c)">红黑树 / 二叉搜索树</text>
      <text x="14" y="79" font-size="7.5" fill="#e5484d">树高太大：几百万行约 20 层 → 20 次磁盘随机 IO，不可接受</text>

      <rect x="6" y="88" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="101" font-size="8" font-weight="700" fill="var(--fig-node-b)">B 树</text>
      <text x="14" y="113" font-size="7.5" fill="var(--fig-text)">非叶子节点也存数据 → 单页放的 key 少 → 扇出小、树更高</text>

      <rect x="6" y="126" width="328" height="52" rx="5" fill="var(--fig-node-a)" opacity=".14" />
      <text x="14" y="139" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">B+ 树（InnoDB 的选择）</text>
      <text x="14" y="152" font-size="7.5" fill="var(--fig-text)">① 非叶子只存 key → 一页放几百个 key → 扇出大、树高仅 3~4 层</text>
      <text x="14" y="164" font-size="7.5" fill="var(--fig-text)">② 数据全在叶子 + 叶子用双向链表串联 → 范围扫描顺序读，无需中序跳转</text>
      <text x="14" y="176" font-size="7.5" fill="var(--fig-node-c)">③ 所有查询都要走到叶子（路径等长，性能稳定可预测）</text>

      <!-- 量化 -->
      <rect x="6" y="186" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="199" font-size="8" font-weight="700" fill="var(--fig-node-c)">换算成「几次磁盘 IO」</text>
      <text x="14" y="211" font-size="7.5" fill="var(--fig-text)">B+ 树 3~4 层 = 3~4 次 IO；红黑树 20 层 = 20 次 —— 差距就在这里</text>

      <!-- 实践 -->
      <rect x="6" y="228" width="328" height="26" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="245" font-size="7.5" fill="var(--fig-text)">推论：主键要短、自增 → 扇出更大、顺序写减少页分裂</text>

      <text x="6" y="264" font-size="7.5" fill="var(--fig-muted)">面试加分：说「非叶子不存数据是为了扇出」比只说「B+树更矮」更具体</text>
    </svg>
    <figcaption>B+ 树非叶子只存 key（扇出大、树高 3~4 层）+ 叶子链表（范围查询顺序读），同时解决 IO 次数与范围查询</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
