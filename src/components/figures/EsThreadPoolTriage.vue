<script setup>
/**
 * ES bulk 拒绝 / 写入变慢的线程池分流（题 3005）。
 *
 * 核心洞察：`rejected execution` 要先看「拒绝的是哪个线程池」——
 * write / search / bulk / management 对应完全不同的瓶颈，处理方向也不同。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 284" role="img" aria-label="ES 拒绝的线程池分流：write 写入猛、search 查询猛、bulk 并发高、management 元数据操作，各自的排查与优化方向">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">先看「拒绝的是哪个线程池」——不同线程池对应完全不同的瓶颈</text>

      <rect x="6" y="20" width="328" height="20" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="34" font-size="7.5" fill="var(--fig-text)">GET _cat/thread_pool?v&amp;h=node_name,name,active,queue,rejected</text>

      <rect x="6" y="46" width="328" height="34" rx="4" fill="#e5484d" opacity=".09" />
      <text x="14" y="59" font-size="8" font-weight="700" fill="#e5484d">write</text>
      <text x="66" y="59" font-size="7.5" fill="var(--fig-text)">写入太猛：分片/节点跟不上（最常见）</text>
      <text x="14" y="72" font-size="7.5" fill="var(--fig-node-c)">→ 加分片/加节点 · 降刷新频率 · 调 bulk 批大小</text>

      <rect x="6" y="84" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".09" />
      <text x="14" y="97" font-size="8" font-weight="700" fill="var(--fig-node-b)">search</text>
      <text x="66" y="97" font-size="7.5" fill="var(--fig-text)">查询太猛：大查询、深分页、重聚合</text>
      <text x="14" y="110" font-size="7.5" fill="var(--fig-node-c)">→ 限制并发 · 优化查询 · 用 search_after 替代深分页</text>

      <rect x="6" y="122" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".09" />
      <text x="14" y="135" font-size="8" font-weight="700" fill="var(--fig-node-c)">bulk</text>
      <text x="66" y="135" font-size="7.5" fill="var(--fig-text)">批量请求并发过高（客户端一次发太多）</text>
      <text x="14" y="148" font-size="7.5" fill="var(--fig-node-c)">→ 客户端限并发 · 减小批大小 · 失败退避重试</text>

      <rect x="6" y="160" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".09" />
      <text x="14" y="173" font-size="8" font-weight="700" fill="var(--fig-node-d)">management</text>
      <text x="100" y="173" font-size="7.5" fill="var(--fig-text)">元数据操作（建索引、_cat、快照）过多</text>
      <text x="14" y="186" font-size="7.5" fill="var(--fig-node-c)">→ 减少频繁 _cat 调用 · 索引管理避开高峰</text>

      <rect x="6" y="200" width="328" height="40" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="213" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">三个「先自救」的动作</text>
      <text x="14" y="225" font-size="7.5" fill="var(--fig-text)">① 客户端降并发 + 退避重试（被拒时死命重试会雪崩）</text>
      <text x="14" y="236" font-size="7.5" fill="var(--fig-text)">② 调 index.refresh_interval（如 30s）减少段合并压力</text>

      <rect x="6" y="246" width="328" height="20" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="259" font-size="7.5" fill="var(--fig-node-c)">③ 检查分片数：单分片建议 10~50GB，分片过小反而放大开销</text>

      <text x="6" y="276" font-size="7.5" fill="var(--fig-muted)">易混点：被拒 ≠ 丢数据，bulk 响应逐行有 status，要检查并重试失败项</text>
    </svg>
    <figcaption>ES 拒绝先按线程池分流：write 看分片与刷新、search 看查询、bulk 看客户端并发、management 看元数据操作</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
