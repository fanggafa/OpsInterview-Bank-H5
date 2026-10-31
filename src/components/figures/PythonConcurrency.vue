<script setup>
/**
 * 进程/线程/协程三者的选择（题 5603）。
 *
 * 核心洞察：选择依据是「瓶颈在 CPU 还是 I/O」+「能接受多少隔离与开销」；
 * 常见误区是把协程当成万能药，却在里面调了同步阻塞函数。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 250" role="img" aria-label="进程真并行但开销大、线程受 GIL 限制适合 I/O、协程开销极小适合高并发 I/O，以及各自的坑">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">按「瓶颈在 CPU 还是 I/O」选，再权衡隔离性与开销</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">进程：真并行、隔离强、开销大</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">独立内存（数十 MB 起）→ CPU 密集首选，规模≈核数；多进程数据要 IPC</text>

      <rect x="6" y="58" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="71" font-size="8" font-weight="700" fill="var(--fig-node-b)">线程：共享内存、受 GIL 限制、开销中等</text>
      <text x="14" y="84" font-size="7.5" fill="var(--fig-text)">约 8MB 栈/线程 → I/O 密集且代码是同步的；共享数据要加锁</text>

      <rect x="6" y="96" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="109" font-size="8" font-weight="700" fill="var(--fig-node-c)">协程：单线程内切换、开销极小、并发高</text>
      <text x="14" y="122" font-size="7.5" fill="var(--fig-text)">KB 级开销 → 几千连接也扛得住；但**一个阻塞调用就会拖住整个事件循环**</text>

      <!-- 各自最大的坑 -->
      <rect x="6" y="134" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="147" font-size="8.5" font-weight="700" fill="#e5484d">三者各自最大的坑</text>
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)">进程：容器里大内存 fork 有风险（3.12+ 默认 forkserver 更稳）</text>
      <text x="14" y="172" font-size="7.5" fill="var(--fig-text)">线程：开太多会「无法创建线程」（栈大小受 ulimit 限制）</text>
      <text x="14" y="184" font-size="7" fill="var(--fig-node-c)">协程：在协程里用 requests / time.sleep → 全盘变慢（要用 aiohttp/asyncio.sleep）</text>

      <rect x="6" y="188" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="201" font-size="8" font-weight="700" fill="var(--fig-node-d)">混合场景怎么办</text>
      <text x="14" y="213" font-size="7.5" fill="var(--fig-text)">协程里把 CPU 密集丢给线程/进程池：await loop.run_in_executor(...)</text>

      <rect x="6" y="226" width="328" height="20" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="240" font-size="7.5" fill="var(--fig-text)">迁移经验：同步代码量大 → 先用线程池；新写的高并发服务 → 直接上 asyncio</text>
    </svg>
    <figcaption>进程真并行适合 CPU 密集、线程适合同步代码的 I/O 场景、协程适合高并发 I/O；各自的坑：fork/线程上限/阻塞事件循环</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
