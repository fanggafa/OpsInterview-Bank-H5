<script setup>
/**
 * JVM 内存泄漏的排查（题 1807）。
 *
 * 核心洞察：先确认「是真泄漏」还是「堆太小/缓存大」，再用堆转储定位持有链；
 * 最难的是「谁在引用它」—— 这次要回答的就是定位路径。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 258" role="img" aria-label="JVM 泄漏排查四步：确认泄漏、看 GC 与堆趋势、dump 堆、分析支配树与引用链">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">FGC 后老年代仍持续增长 → 才是泄漏；定位靠堆 dump，不是靠猜</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① 确认：Full GC 后内存是否回落</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">不回落且持续上升 = 泄漏；回落 = 只是堆偏小或缓存多</text>

      <rect x="6" y="54" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="67" font-size="8" font-weight="700" fill="var(--fig-node-b)">② 观察：GC 日志与堆趋势</text>
      <text x="14" y="79" font-size="7.5" fill="var(--fig-text)">jstat -gcutil &lt;pid&gt; 1000：看 O 区占比与 FGC 频率</text>

      <rect x="6" y="88" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="101" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ 取证：堆转储（关键一步）</text>
      <text x="14" y="113" font-size="7.5" fill="var(--fig-text)">jmap -dump:live,format=b,file=heap.hprof &lt;pid&gt;（live 只保留存活对象）</text>

      <rect x="6" y="122" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="135" font-size="8" font-weight="700" fill="var(--fig-node-d)">④ 分析：MAT / VisualVM 看支配树</text>
      <text x="14" y="147" font-size="7.5" fill="var(--fig-text)">先看「哪个对象占内存最多」，再看「谁引用它不放」（GC Root 路径）</text>

      <!-- 常见泄漏源 -->
      <rect x="6" y="158" width="328" height="50" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="171" font-size="8.5" font-weight="700" fill="#e5484d">Java 最常见的五个泄漏源</text>
      <text x="14" y="184" font-size="7.5" fill="var(--fig-text)">① 静态集合/缓存无上限　② ThreadLocal 未 remove　③ 监听器注册未注销</text>
      <text x="14" y="196" font-size="7.5" fill="var(--fig-text)">④ 连接/流未关闭　⑤ 大对象在长生命周期集合中累积</text>

      <rect x="6" y="214" width="328" height="20" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="228" font-size="7.5" fill="var(--fig-text)">线上注意：dump 会 STW（大堆可能停顿数秒），优先在低峰或从副本抓</text>

      <text x="6" y="248" font-size="7.5" fill="var(--fig-muted)">替代手段：jcmd &lt;pid&gt; GC.heap_info 先快速看分区大小，再决定是否要 dump</text>
    </svg>
    <figcaption>先确认 FGC 后是否回落，再用 jstat 看趋势、jmap 抓 dump（live），最后在 MAT 里顺着引用链找持有者</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
