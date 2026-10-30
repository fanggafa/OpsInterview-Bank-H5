<script setup>
/**
 * 「资源都不高但请求超时」的排查决策树。
 *
 * 对应题 67。核心洞察：CPU/内存/磁盘/网络都不饱和却超时，
 * 瓶颈一定在「等待」而不是「计算」——所以要顺着「等谁」往下走。
 *
 * 排版注意：画布固定 340 宽，说明文字必须自己控制在列宽内
 * （见 docs/figure-text-rules.md，npm run check:figures 会校验）。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 268" role="img" aria-label="资源不饱和却超时的排查决策树，按线程池、锁、下游、队列、GC 五个方向分流">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">CPU/内存/磁盘/网络都不高，但请求超时</text>

      <!-- 结论 -->
      <rect x="6" y="20" width="328" height="26" rx="6" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="37" font-size="9" font-weight="700" fill="var(--fig-node-a)">瓶颈在「等待」，不在「计算」</text>
      <text x="150" y="37" font-size="8" fill="var(--fig-muted)">→ 顺着「等谁」往下查</text>

      <!-- 五个方向 -->
      <text x="6" y="62" font-size="9.5" font-weight="700" fill="var(--fig-text)">① 线程池 / 连接池耗尽</text>
      <text x="6" y="74" font-size="8" fill="var(--fig-text)">表现：线程都在 getConnection / take 上排队</text>
      <text x="6" y="86" font-size="8" fill="var(--fig-node-c)">命令：jstack 看阻塞点 · pool active/idle · wait_time</text>

      <text x="6" y="104" font-size="9.5" font-weight="700" fill="var(--fig-text)">② 锁竞争</text>
      <text x="6" y="116" font-size="8" fill="var(--fig-text)">表现：大量 BLOCKED，且集中在同一把锁</text>
      <text x="6" y="128" font-size="8" fill="var(--fig-node-c)">命令：jstack -l · arthas thread -b（找阻塞源头）</text>

      <text x="6" y="146" font-size="9.5" font-weight="700" fill="var(--fig-text)">③ 下游依赖慢</text>
      <text x="6" y="158" font-size="8" fill="var(--fig-text)">表现：本服务耗时要等 DB / Redis / 三方 API</text>
      <text x="6" y="170" font-size="8" fill="var(--fig-node-c)">命令：慢查询日志 · Redis SLOWLOG · 链路追踪看 span</text>

      <text x="6" y="188" font-size="9.5" font-weight="700" fill="var(--fig-text)">④ 队列积压 / 本地队列满</text>
      <text x="6" y="200" font-size="8" fill="var(--fig-text)">表现：消费 LAG 增长，或请求被本地队列拒绝</text>
      <text x="6" y="212" font-size="8" fill="var(--fig-node-c)">命令：consumer-groups --describe · 线程池队列长度</text>

      <text x="6" y="230" font-size="9.5" font-weight="700" fill="var(--fig-text)">⑤ GC 停顿（最容易被漏）</text>
      <text x="6" y="242" font-size="8" fill="var(--fig-text)">表现：周期性抖动，CPU 不高但请求被「冻住」</text>
      <text x="6" y="254" font-size="8" fill="var(--fig-node-c)">命令：jstat -gcutil · -Xlog:gc* 看单次停顿是否超过目标</text>
    </svg>
    <figcaption>资源不饱和却超时 = 有人在等；按「线程池 → 锁 → 下游 → 队列 → GC」五步找那个等待点</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
