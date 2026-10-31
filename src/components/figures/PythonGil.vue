<script setup>
/**
 * GIL 与多线程/多进程的取舍（题 5602）。
 *
 * 核心洞察：GIL 让「同一时刻只有一个线程跑字节码」，
 * 但 I/O 等待时会主动释放 —— 所以线程在 I/O 密集依然有效，只在 CPU 密集失效。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 256" role="img" aria-label="GIL 保证单线程执行字节码；I/O 等待时会释放，所以线程对 I/O 密集有效，对 CPU 密集无效，需用多进程">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">GIL：同一时刻只有一个线程执行字节码，但等 I/O 时会释放</text>

      <rect x="6" y="20" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="36" font-size="7.5" fill="var(--fig-text)">为什么存在：CPython 用引用计数管内存，计数器要原子 → 一把大锁最省事</text>

      <rect x="6" y="50" width="160" height="66" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="63" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">I/O 密集 → 线程有效 ✓</text>
      <text x="14" y="76" font-size="7.5" fill="var(--fig-text)">等网络/磁盘时释放 GIL</text>
      <text x="14" y="88" font-size="7.5" fill="var(--fig-text)">其他线程可继续跑</text>
      <text x="14" y="100" font-size="7.5" fill="var(--fig-text)">Web 服务、爬虫、DB 调用</text>
      <text x="14" y="112" font-size="7" fill="var(--fig-node-c)">线程池规模可远大于核数</text>

      <rect x="174" y="50" width="160" height="66" rx="5" fill="#e5484d" opacity=".12" />
      <text x="182" y="63" font-size="8.5" font-weight="700" fill="#e5484d">CPU 密集 → 线程无效 ✗</text>
      <text x="182" y="76" font-size="7.5" fill="var(--fig-text)">线程互相抢同一把锁</text>
      <text x="182" y="88" font-size="7.5" fill="var(--fig-text)">还多出上下文切换开销</text>
      <text x="182" y="100" font-size="7.5" fill="var(--fig-text)">压缩、加解密、图像处理</text>
      <text x="182" y="112" font-size="7" fill="#e5484d">加线程可能反而更慢</text>

      <!-- 三种绕开 -->
      <rect x="6" y="126" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="139" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">三种绕开方式</text>
      <text x="14" y="152" font-size="7.5" fill="var(--fig-text)">① multiprocessing / ProcessPoolExecutor：真并行，代价是 IPC 与内存翻倍</text>
      <text x="14" y="164" font-size="7.5" fill="var(--fig-text)">② asyncio：单线程协程，适合海量 I/O；③ NumPy/Cython 内部已释放 GIL</text>

      <rect x="6" y="180" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="193" font-size="8" font-weight="700" fill="var(--fig-node-d)">选型口诀</text>
      <text x="14" y="205" font-size="7.5" fill="var(--fig-text)">I/O 密集 → 线程或协程；CPU 密集 → 多进程（规模≈核数）或换语言</text>

      <rect x="6" y="218" width="328" height="20" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="232" font-size="7.5" fill="var(--fig-text)">排查：py-spy dump 看线程是否都在抢 GIL；pidstat -u -t 看是否只用一核</text>

      <text x="6" y="246" font-size="7.5" fill="var(--fig-muted)">注意：Python 3.13+ 有实验性 no-GIL 构建，但生态兼容仍需时间</text>
    </svg>
    <figcaption>GIL 只在 CPU 密集时致命：I/O 等待会释放；绕开靠多进程、asyncio 或把热点交给 C 扩展</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
