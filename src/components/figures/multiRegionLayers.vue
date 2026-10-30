<script setup>
/**
 * 异地多活的四层规划图。
 *
 * 对应题 5404。核心洞察：难点不在「部署两套」，而在**数据两侧都能写**；
 * 主流解法是「单元化」（按用户分片，每个用户只有一个写归属），从而消除写冲突。
 *
 * 画布 340 宽，文字须控制在列内（npm run check:figures 校验）。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 280" role="img" aria-label="异地多活四个层次：流量层、应用层、数据层（单元化是关键）、中间件层">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">难点不是「部署两套」，而是「两边都能写」→ 数据层最难</text>

      <!-- 形态对比 -->
      <rect x="6" y="20" width="328" height="22" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="34" font-size="8" fill="var(--fig-node-a)">形态：同城双活（秒~分钟）→ 两地三中心（异地只读）→ 异地多活（多地可写，最贵）</text>

      <!-- 四层 -->
      <rect x="6" y="48" width="328" height="34" rx="5" fill="var(--fig-node-b)" opacity=".09" />
      <text x="14" y="61" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">① 流量层：就近接入 + 快速切换</text>
      <text x="14" y="73" font-size="8" fill="var(--fig-text)">DNS/GSLB 按地域解析；故障时切走（TTL 短则切换快，但 DNS 压力升）</text>

      <rect x="6" y="88" width="328" height="30" rx="5" fill="var(--fig-node-c)" opacity=".09" />
      <text x="14" y="101" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">② 应用层：最容易（通常无状态）</text>
      <text x="14" y="113" font-size="8" fill="var(--fig-text)">每个机房部署完整应用，读本地数据；注意「跨机房调用的延迟」</text>

      <!-- 数据层（重点） -->
      <rect x="6" y="124" width="328" height="76" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="137" font-size="8.5" font-weight="700" fill="#e5484d">③ 数据层：真正的难点（三种方式）</text>
      <text x="14" y="150" font-size="7.5" fill="var(--fig-text)">单向同步（主备）：A 写 → B 只读，强一致但有延迟</text>
      <text x="14" y="162" font-size="7.5" fill="var(--fig-text)">双向同步：两边都写 → 冲突处理是核心难题（不推荐通用做法）</text>
      <text x="14" y="174" font-size="7.5" font-weight="700" fill="var(--fig-node-a)">单元化（主流）：按用户 ID 分片，每个用户只有一个写归属机房</text>
      <text x="14" y="186" font-size="7.5" fill="var(--fig-node-c)">好处：无写冲突　代价：跨单元访问走专线 · 全局数据（库存总数）要特殊处理</text>
      <text x="14" y="196" font-size="7.5" fill="var(--fig-muted)">用户 A（ID%2==0）→ 机房1 写　用户 B（ID%2==1）→ 机房2 写，另一边只读</text>

      <rect x="6" y="206" width="328" height="34" rx="5" fill="var(--fig-node-d)" opacity=".09" />
      <text x="14" y="219" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">④ 中间件层：消息与缓存也要单元化</text>
      <text x="14" y="231" font-size="8" fill="var(--fig-text)">MQ 按单元隔离、缓存就近、分布式锁与 ID 生成要全局唯一</text>

      <rect x="6" y="246" width="328" height="22" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="260" font-size="8" fill="var(--fig-node-c)">验收标准：单元的写归属可验证 · 故障切换有演练 · 数据一致性有对账</text>

      <text x="6" y="276" font-size="7.5" fill="var(--fig-muted)">面试要点：主动指出「双向同步的冲突」并给出「单元化」这个更优解</text>
    </svg>
    <figcaption>异地多活分四层推进，数据层用「单元化」消除写冲突——这是主流可行方案</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
