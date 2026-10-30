<script setup>
/**
 * 「内存持续上涨直至 OOM」的定位决策图。
 *
 * 对应题 71。核心洞察：先用「GC 后能否回落」区分**泄漏**与**缓存/大对象**，
 * 再按语言选工具；泄漏看引用链，缓存看容量与淘汰策略。
 *
 * 画布 340 宽，文字须控制在列内（npm run check:figures 校验）。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 280" role="img" aria-label="内存持续上涨的定位：先用 GC 后能否回落区分泄漏与缓存，再按语言选工具，最后看引用链或淘汰策略">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">第一步不是抓 dump，而是先分清「泄漏」还是「缓存/大对象」</text>

      <!-- 两分支判据 -->
      <rect x="6" y="20" width="160" height="52" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="#e5484d">真泄漏</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">只涨不跌，重启才回落</text>
      <text x="14" y="56" font-size="7.5" fill="var(--fig-text)">GC 后基线仍持续上升</text>
      <text x="14" y="67" font-size="7.5" fill="var(--fig-node-c)">→ 查引用链（谁没松手）</text>

      <rect x="174" y="20" width="160" height="52" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">缓存 / 大对象</text>
      <text x="182" y="45" font-size="7.5" fill="var(--fig-text)">随业务量波动，GC 能回落</text>
      <text x="182" y="56" font-size="7.5" fill="var(--fig-text)">但基线偏高、峰值很高</text>
      <text x="182" y="67" font-size="7.5" fill="var(--fig-node-c)">→ 查容量与淘汰策略</text>

      <!-- 工具 -->
      <text x="6" y="90" font-size="9.5" font-weight="700" fill="var(--fig-text)">按语言选工具（看「增长的是哪类对象」）</text>

      <text x="10" y="106" font-size="8" font-weight="700" fill="var(--fig-node-a)">Java</text>
      <text x="56" y="106" font-size="8" fill="var(--fig-text)">jstat -gcutil 看老年代 → jmap -dump → MAT 支配树 + Path to GC Roots</text>

      <text x="10" y="120" font-size="8" font-weight="700" fill="var(--fig-node-a)">Go</text>
      <text x="56" y="120" font-size="8" fill="var(--fig-text)">pprof heap 两次采样对比（看 inuse_space 增长的对象）</text>

      <text x="10" y="134" font-size="8" font-weight="700" fill="var(--fig-node-a)">Python</text>
      <text x="56" y="134" font-size="8" fill="var(--fig-text)">tracemalloc 快照对比 / objgraph 找引用</text>

      <text x="10" y="148" font-size="8" font-weight="700" fill="var(--fig-node-a)">Node.js</text>
      <text x="56" y="148" font-size="8" fill="var(--fig-text)">--inspect + 两次 heap snapshot 对比</text>

      <text x="10" y="162" font-size="8" font-weight="700" fill="var(--fig-node-a)">通用</text>
      <text x="56" y="162" font-size="8" fill="var(--fig-text)">pmap -x / smaps 看是哪类内存；cgroup memory.stat 区分容器视角</text>

      <!-- 常见根因 -->
      <rect x="6" y="170" width="328" height="56" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="183" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">常见根因（按出现频率）</text>
      <text x="14" y="195" font-size="7.5" fill="var(--fig-text)">集合/Map 只增不删（缓存无淘汰、监听器未注销、ThreadLocal 未清理）</text>
      <text x="14" y="206" font-size="7.5" fill="var(--fig-text)">大对象缓存无上限 · 连接/文件句柄未释放（间接持有 buffer）</text>
      <text x="14" y="218" font-size="7.5" fill="var(--fig-text)">堆外内存（DirectBuffer / glibc malloc 碎片）→ 堆正常但 RSS 涨</text>

      <rect x="6" y="232" width="328" height="34" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="245" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">关键区分：堆 vs 堆外</text>
      <text x="14" y="257" font-size="7.5" fill="var(--fig-text)">堆 dump 看着正常但 RSS 一直涨 → 查 DirectBuffer、线程栈、mmap、malloc 碎片</text>

      <text x="6" y="272" font-size="7.5" fill="var(--fig-muted)">「重启就好」不能算修复：重启只是把症状推后，必须找到持有者</text>
    </svg>
    <figcaption>内存上涨先分「泄漏 vs 缓存」，再按语言抓证据；堆正常但 RSS 涨要查堆外</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
