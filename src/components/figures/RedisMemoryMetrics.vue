<script setup>
/**
 * Redis used_memory 与 used_memory_rss 的区别（题 3807）。
 *
 * 核心洞察：一个是「Redis 自己算的逻辑占用」，一个是「操作系统看到的物理占用」；
 * 两者差很多通常意味着「碎片」或「内存被换出」，而不是「Redis 算错了」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 272" role="img" aria-label="Redis 的 used_memory 是逻辑内存、used_memory_rss 是物理内存，差异来自分配器碎片与 swap">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">一个看「Redis 自己算的」，一个看「操作系统看到的」</text>

      <!-- 两个指标 -->
      <rect x="6" y="20" width="160" height="58" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">used_memory</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">Redis 自己统计的逻辑内存</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">= 数据 + 内部结构 + 缓冲</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-node-c)">分配器请求的字节数</text>

      <rect x="174" y="20" width="160" height="58" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">used_memory_rss</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">操作系统看到的物理内存</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">进程实际占用的物理页</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-node-c)">含碎片与共享库</text>

      <!-- 正常情况 -->
      <rect x="6" y="86" width="328" height="24" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="102" font-size="8" font-weight="700" fill="var(--fig-node-c)">正常：rss 略大于 used_memory（分配器开销与碎片）</text>

      <!-- 比值判断 -->
      <text x="6" y="128" font-size="9" font-weight="700" fill="var(--fig-text)">用 mem_fragmentation_ratio（= rss / used_memory）判断</text>

      <rect x="6" y="136" width="328" height="24" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="152" font-size="7.5" fill="var(--fig-text)">1.0 ~ 1.5：健康　·　略高说明有碎片，可考虑 activedefrag</text>

      <rect x="6" y="164" width="328" height="24" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="180" font-size="7.5" fill="var(--fig-text)">&gt; 1.5：碎片偏多（频繁增删大 key、分配器不回收）</text>

      <rect x="6" y="192" width="328" height="30" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="205" font-size="7.5" font-weight="700" fill="#e5484d">&lt; 1（危险信号）</text>
      <text x="14" y="217" font-size="7.5" fill="var(--fig-text)">说明部分内存被 swap 换到磁盘 → 性能会断崖式下降</text>

      <!-- 处理 -->
      <rect x="6" y="228" width="328" height="30" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="241" font-size="8" font-weight="700" fill="var(--fig-node-c)">怎么处理</text>
      <text x="70" y="241" font-size="7.5" fill="var(--fig-text)">碎片：activedefrag / 重启重建 · swap：关 swap 或加内存</text>
      <text x="14" y="253" font-size="7.5" fill="var(--fig-node-c)">监控：两个指标都要采，只盯 used_memory 会漏掉碎片与 swap</text>

      <text x="6" y="264" font-size="7.5" fill="var(--fig-muted)">排查提示：used_memory 降了但 rss 没降，是分配器没归还 —— 属于正常现象</text>
    </svg>
    <figcaption>used_memory 是逻辑占用、rss 是物理占用；比值 &gt;1.5 是碎片、&lt;1 是被 swap，后者更危险</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
