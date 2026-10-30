<script setup>
/**
 * 主从延迟从 0.1s 涨到 30s 的处置图。
 *
 * 对应题 5402。核心洞察：**先止血（读回主库），再定位**——
 * 用户看到「数据不对」比「系统慢」严重得多；定位靠「SQL 线程卡在哪」分流。
 *
 * 画布 340 宽，文字须控制在列内（npm run check:figures 校验）。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 274" role="img" aria-label="主从延迟处置：先止血让读走主库，再看 Seconds_Behind_Master 与 SQL 线程状态定位五类原因">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">读从库拿到旧数据 → 用户投诉，优先级高于「系统变慢」</text>

      <!-- 止血 -->
      <rect x="6" y="20" width="328" height="44" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="33" font-size="9" font-weight="700" fill="#e5484d">① 先止血（10 分钟内）</text>
      <text x="14" y="45" font-size="8" fill="var(--fig-text)">读请求强制走主库 / 关掉「读从库」开关（最有效，代价是主库压力升）</text>
      <text x="14" y="57" font-size="8" fill="var(--fig-text)">暂停依赖从库的批处理与报表；前端加「数据可能延迟」提示</text>

      <!-- Step 2 判断 -->
      <rect x="6" y="70" width="328" height="34" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="83" font-size="9" font-weight="700" fill="var(--fig-node-a)">② 看两个字段判断「卡在哪个阶段」</text>
      <text x="14" y="95" font-size="8" fill="var(--fig-text)">Seconds_Behind_Master（延迟秒）· Slave_SQL_Running_State（线程在做什么）</text>

      <!-- 五个原因 -->
      <text x="6" y="120" font-size="9.5" font-weight="700" fill="var(--fig-text)">③ 按「特征」分流到五类原因</text>

      <text x="10" y="136" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">卡在一条大 SQL</text>
      <text x="106" y="136" font-size="8" fill="var(--fig-text)">→ 大事务：等它跑完，或停同步后跳过</text>

      <text x="10" y="152" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">从库 CPU / IO 打满</text>
      <text x="106" y="152" font-size="8" fill="var(--fig-text)">→ 从库资源不足：扩容、加索引</text>

      <text x="10" y="168" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">主库写入突增</text>
      <text x="106" y="168" font-size="8" fill="var(--fig-text)">→ 主库 QPS 高：限流、批量拆小</text>

      <text x="10" y="184" font-size="8.5" font-weight="700" fill="#e5484d">无主键表的 UPDATE</text>
      <text x="106" y="184" font-size="8" fill="var(--fig-text)">→ 从库要全表扫（根本问题：加主键）</text>

      <text x="10" y="200" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">从库在做备份 / 报表</text>
      <text x="106" y="200" font-size="8" fill="var(--fig-text)">→ 从库负载被抢：分离报表与备份窗口</text>

      <!-- 根因 -->
      <rect x="6" y="212" width="328" height="30" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="225" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">长期治理（不是只救这一次）</text>
      <text x="14" y="237" font-size="8" fill="var(--fig-text)">拆大事务 · 开并行复制 · 从库按角色分离 · 加主键与索引 · 延迟监控告警</text>

      <text x="6" y="258" font-size="8" fill="var(--fig-muted)">无主键表最隐蔽：主库更新一行，从库可能要扫全表 → 延迟只在从库显现</text>
      <text x="6" y="270" font-size="8" fill="var(--fig-muted)">面试要点：先说「读回主库止血」，再说根因分类</text>
    </svg>
    <figcaption>主从延迟：止血靠「读回主库」，定位靠「SQL 线程卡在哪」，治理靠「拆事务+并行复制+加主键」</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
