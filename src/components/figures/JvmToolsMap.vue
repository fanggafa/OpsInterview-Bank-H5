<script setup>
/**
 * JVM 常用排查工具各自看什么（题 1819）。
 *
 * 核心洞察：工具按「症状」选 —— CPU 高看线程栈，内存高看堆，
 * 卡顿看 GC 与 safepoint，进程整体状态看 jcmd。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 256" role="img" aria-label="JVM 排查工具按症状选择：jstack 看线程、jmap 看堆、jstat 看 GC、jcmd 综合、arthas 在线诊断">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">按症状选工具：CPU 高 → jstack；内存高 → jmap；GC 频繁 → jstat</text>

      <rect x="6" y="20" width="328" height="28" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="38" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">jstack</tspan>　线程栈：死锁、卡住的线程、CPU 高的热点方法</text>

      <rect x="6" y="52" width="328" height="28" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">jmap</tspan>　堆快照与直方图：哪个类的对象最多、堆转储</text>

      <rect x="6" y="84" width="328" height="28" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="102" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">jstat</tspan>　GC 统计：各区占用与回收频率（-gcutil 最常用）</text>

      <rect x="6" y="116" width="328" height="28" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="134" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">jcmd</tspan>　综合入口：GC.heap_info、VM.flags、thread.print 等</text>

      <rect x="6" y="148" width="328" height="28" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="166" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">arthas</tspan>　在线诊断：实时看方法耗时、watch 参数、trace 调用链</text>

      <!-- 症状对照 -->
      <rect x="6" y="184" width="328" height="34" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="197" font-size="8" font-weight="700" fill="#e5484d">最容易搞混的两组</text>
      <text x="14" y="209" font-size="7.5" fill="var(--fig-text)">jmap 看「对象占用」；jstat 看「回收行为」—— 一个静态一个动态</text>

      <rect x="6" y="226" width="328" height="16" rx="3" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="238" font-size="7.5" fill="var(--fig-c-text)">CPU 高先用 top -Hp 找线程号，再把线程号转 16 进制在 jstack 里搜索</text>

      <text x="6" y="248" font-size="7.5" fill="var(--fig-muted)">注意：jmap -dump 与 jstack 都有 STW 成本，生产低峰执行</text>
    </svg>
    <figcaption>按症状选工具：jstack 线程、jmap 堆对象、jstat GC 行为、jcmd 综合入口、arthas 在线诊断；jmap 静态 jstat 动态</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
