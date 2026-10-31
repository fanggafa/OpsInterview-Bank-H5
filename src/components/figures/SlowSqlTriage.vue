<script setup>
/**
 * 一条 SQL 执行很慢的完整定位流程（题 3720）。
 *
 * 核心洞察：慢不一定是缺索引 —— 也可能是统计信息过期、回表太多、
 * 锁等待、或排序/临时表落盘；要用 explain 与 profile 分阶段定位。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 258" role="img" aria-label="SQL 慢查询定位五步：确认现象、explain 看执行计划、profile 看耗时分布、常见原因、优化验证">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">先看执行计划，再看实际耗时分布 —— 别一上来就加索引</text>

      <rect x="6" y="20" width="328" height="28" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="38" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">①</tspan> 确认现象：每次都慢，还是偶发（偶发多为锁/资源竞争）</text>

      <rect x="6" y="52" width="328" height="28" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">②</tspan> EXPLAIN：看 type、key、rows、Extra（Using filesort/temporary 是信号）</text>

      <rect x="6" y="84" width="328" height="28" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="102" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">③</tspan> EXPLAIN ANALYZE / profiling：看「计划估算 vs 实际耗时」</text>

      <rect x="6" y="116" width="328" height="28" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="134" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">④</tspan> 看等待：有慢查询但 CPU 不高 → 可能是锁等待或 IO 等待</text>

      <!-- 常见原因 -->
      <rect x="6" y="150" width="328" height="50" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="163" font-size="8.5" font-weight="700" fill="#e5484d">五个高频原因（按出现频率）</text>
      <text x="14" y="176" font-size="7.5" fill="var(--fig-text)">① 缺合适索引 / 索引失效（函数、类型隐式转换、前导模糊）</text>
      <text x="14" y="188" font-size="7.5" fill="var(--fig-text)">② 回表太多　③ 统计信息过期导致选错计划　④ 大排序/临时表落盘　⑤ 锁等待</text>

      <rect x="6" y="206" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="219" font-size="8" font-weight="700" fill="var(--fig-node-a)">优化后必须验证</text>
      <text x="14" y="231" font-size="7.5" fill="var(--fig-text)">对比优化前后的 rows 与耗时；在**生产数据量级**下验证，别只在小表试</text>

      <text x="6" y="248" font-size="7.5" fill="var(--fig-muted)">注意：加索引会拖慢写入与占空间 —— 优化是权衡，不是「索引越多越好」</text>
    </svg>
    <figcaption>五步定位：确认是否偶发、EXPLAIN 看计划、看实际耗时分布、排查锁与IO等待、验证优化；原因多为索引失效与统计信息过期</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
