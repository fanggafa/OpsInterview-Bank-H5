<script setup>
/**
 * Python 并发与并行编程（题 5610）。
 *
 * 核心洞察：先判瓶颈 —— CPU 密集用多进程（绕 GIL）、I/O 密集用线程或协程；
 * 最常犯的错是「用多线程做 CPU 计算」和「协程里调同步阻塞库」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 240" role="img" aria-label="三种并发模型：线程适合 IO、进程适合 CPU、协程适合高并发 IO；以及四种常见错误">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">先判瓶颈，再选模型 —— 选错会「加了资源反而更慢」</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">多线程（threading）— I/O 密集</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">等 I/O 会释放 GIL → 线程有效；ThreadPoolExecutor 最常用</text>

      <rect x="6" y="58" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="71" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">多进程（multiprocessing）— CPU 密集</text>
      <text x="14" y="83" font-size="7.5" fill="var(--fig-text)">独立解释器绕开 GIL → 真并行；规模约等于 CPU 核数</text>

      <rect x="6" y="96" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="109" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">协程（asyncio）— 高并发 I/O</text>
      <text x="14" y="121" font-size="7.5" fill="var(--fig-text)">单线程内切换、开销极小；适合数千连接（爬虫/网关）</text>

      <!-- 错误 -->
      <rect x="6" y="138" width="328" height="52" rx="5" fill="#e5484d" opacity=".12" />
      <text x="14" y="151" font-size="8.5" font-weight="700" fill="#e5484d">四个最常见的错</text>
      <text x="14" y="164" font-size="7.5" fill="var(--fig-text)">① 多线程做 CPU 计算 → 抢 GIL，比单线程还慢</text>
      <text x="14" y="176" font-size="7.5" fill="var(--fig-text)">② 协程里调同步库（requests/time.sleep）→ 阻塞整个事件循环</text>
      <text x="14" y="188" font-size="7.5" fill="var(--fig-text)">③ 线程开太多（~8MB 栈/线程）④ 多进程共享大对象 → 每进程一份</text>

      <rect x="6" y="198" width="328" height="28" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="211" font-size="8" font-weight="700" fill="var(--fig-node-d)">混合场景的标准做法</text>
      <text x="14" y="223" font-size="7.5" fill="var(--fig-text)">协程里做 CPU 密集 → loop.run_in_executor 丢给进程池</text>

      <text x="6" y="232" font-size="7.5" fill="var(--fig-muted)">口诀：CPU 密集 → 进程；I/O 密集 → 线程或协程</text>
    </svg>
    <figcaption>线程适 I/O（等 I/O 释放 GIL）、进程适 CPU（绕开 GIL）、协程适高并发 I/O；最常错在多线程做计算与协程里调同步库</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
