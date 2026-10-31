<script setup>
/**
 * MongoDB 的 readConcern（题 2021）。
 *
 * 核心洞察：local 只读主节点已写入的部分，majority 保证「已多数确认」，
 * linearizable 再加「与所有已确认读一致」——代价是延迟与可用性。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 254" role="img" aria-label="readConcern 三级：local 读最新、majority 读多数已确认、linearizable 与已确认读一致，强度与代价递增">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">强度递增，代价也递增：local → majority → linearizable</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">local（默认）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">读当前节点已写入的数据；最快，但可能读到「还没同步到多数节点」的内容</text>

      <rect x="6" y="58" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="71" font-size="8" font-weight="700" fill="var(--fig-node-b)">majority（常用）</text>
      <text x="14" y="84" font-size="7.5" fill="var(--fig-text)">只返回「已被多数节点确认」的数据；故障切换后不会回滚已读到的结果</text>

      <rect x="6" y="96" width="328" height="38" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="109" font-size="8" font-weight="700" fill="var(--fig-node-c)">linearizable（最严）</text>
      <text x="14" y="122" font-size="7.5" fill="var(--fig-text)">保证读结果与所有「已确认写」的顺序一致；延迟最高，失败时可能直接报错</text>
      <text x="14" y="132" font-size="7" fill="var(--fig-node-c)">只用于极少数强一致场景（如分布式锁校验）</text>

      <!-- 配套 -->
      <rect x="6" y="142" width="328" height="50" rx="5" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="155" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">必须配套 writeConcern 才有意义</text>
      <text x="14" y="168" font-size="7.5" fill="var(--fig-text)">写用 w:"majority" 确认，读才用 majority；只调读不调写等于没用</text>
      <text x="14" y="180" font-size="7.5" fill="var(--fig-text)">代价：写入延迟上升（要等多数确认），吞吐下降</text>

      <rect x="6" y="200" width="328" height="34" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="213" font-size="8" font-weight="700" fill="#e5484d">常见误解</text>
      <text x="14" y="225" font-size="7.5" fill="var(--fig-text)">「用了 majority 就绝对不会读到旧数据」——只能保证不回滚，不等于最新</text>

      <text x="6" y="244" font-size="7.5" fill="var(--fig-muted)">选型：报表/列表用 local；交易/账务用 majority；linearizable 只在必要时用</text>
    </svg>
    <figcaption>local 最快但可能读到未达多数的写、majority 保证不回滚（需配套写确认）、linearizable 最严但延迟最高</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
