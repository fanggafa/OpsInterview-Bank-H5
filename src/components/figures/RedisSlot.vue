<script setup>
/**
 * Redis Cluster 的 slot（题 3929）。
 *
 * 核心洞察：key 经 CRC16 计算落到 16384 个 slot 之一，slot 归属某个主节点；
 * 跨 slot 的多 key 操作会报错 —— 需要 hash tag 把相关 key 拉进同一个 slot。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 250" role="img" aria-label="key 经 CRC16 计算落 slot，slot 分布在三个主节点；跨 slot 用 hash tag 修正">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">CRC16(key) mod 16384 → slot → 归属节点</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① 计算：每个 key 落一个 slot</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">16384 个 slot 按区间分给各主节点，例如 A:0-5460 / B:5461-10922 / C:10923-16383</text>

      <rect x="6" y="58" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="71" font-size="8" font-weight="700" fill="var(--fig-node-b)">② 访问：客户端按 slot 找节点</text>
      <text x="14" y="83" font-size="7.5" fill="var(--fig-text)">请求到错误节点 → 返回 MOVED + 正确节点，客户端重连</text>

      <rect x="6" y="96" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="109" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ 迁移中：ASK 临时重定向</text>
      <text x="14" y="121" font-size="7.5" fill="var(--fig-text)">slot 正在搬迁 → 该 key 临时指向目标节点（只这一次）</text>

      <!-- hash tag -->
      <rect x="6" y="134" width="328" height="46" rx="5" fill="#e5484d" opacity=".12" />
      <text x="14" y="147" font-size="8.5" font-weight="700" fill="#e5484d">④ 跨 slot 的坑与解法：hash tag</text>
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)">MGET user:1:name user:2:name → 不同 slot 会报 CROSSSLOT</text>
      <text x="14" y="172" font-size="7.5" fill="var(--fig-text)">改成 {user:1}:name 与 {user:1}:age → 花括号内容决定 slot → 同节点</text>
      <text x="14" y="184" font-size="7" fill="var(--fig-node-c)">代价：相关 key 集中到一个节点，热点风险上升</text>

      <rect x="6" y="188" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="201" font-size="8" font-weight="700" fill="var(--fig-node-d)">为什么是 16384</text>
      <text x="14" y="213" font-size="7.5" fill="var(--fig-text)">2^14：槽位图用 bitmap 只需 2KB，节点间同步成本低</text>

      <text x="6" y="242" font-size="7.5" fill="var(--fig-muted)">排查提示：数据倾斜多半是 hash tag 用得太集中，或 slot 分配不均</text>
    </svg>
    <figcaption>key 经 CRC16 落 slot、slot 归属主节点；跨 slot 报 CROSSSLOT，用 {hash tag} 让相关 key 落同 slot（代价是热点集中）</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
