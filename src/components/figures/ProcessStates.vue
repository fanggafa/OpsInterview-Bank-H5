<script setup>
/**
 * Linux 进程状态 R/S/D/T/Z（题 4000）。
 *
 * 核心洞察：`D` 状态（不可中断睡眠）最危险 —— 它不响应信号、kill 不掉，
 * 是「负载高但 CPU 空闲」的典型元凶；而 `Z` 僵尸耗尽 PID，处理对象是父进程。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 258" role="img" aria-label="Linux 进程状态：R 运行、S 可中断睡眠、D 不可中断睡眠、T 停止、Z 僵尸，以及各自的处置方式">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">daily 排查最常看 S 与 D；D 状态 kill 不掉，是最容易被误判的一种</text>

      <rect x="6" y="20" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="36" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700" fill="var(--fig-node-a)">R</tspan>　运行/可运行（在跑或在 runqueue 排队）；持续多说明 CPU 争抢</text>

      <rect x="6" y="50" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="66" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700" fill="var(--fig-node-b)">S</tspan>　可中断睡眠（等 I/O 或事件，最常见）；能被信号唤醒</text>

      <rect x="6" y="80" width="328" height="30" rx="4" fill="#e5484d" opacity=".12" />
      <text x="14" y="93" font-size="7.5" font-weight="700" fill="#e5484d">D　不可中断睡眠（重点）</text>
      <text x="14" y="105" font-size="7.5" fill="var(--fig-text)">卡在内核 I/O（磁盘/NFS）中，**不响应任何信号** → kill -9 也无效</text>

      <rect x="6" y="114" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="130" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700" fill="var(--fig-node-c)">T</tspan>　暂停/被跟踪（收到了 SIGSTOP 或调试中）；用 SIGCONT 恢复</text>

      <rect x="6" y="144" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="157" font-size="7.5" font-weight="700" fill="var(--fig-node-d)">Z　僵尸</text>
      <text x="14" y="169" font-size="7.5" fill="var(--fig-text)">已退出但父进程没 wait()；只占 PID，处理对象是父进程而不是它自己</text>

      <!-- 排查 -->
      <rect x="6" y="178" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="191" font-size="8" font-weight="700" fill="var(--fig-node-a)">查看与定位</text>
      <text x="14" y="203" font-size="7.5" fill="var(--fig-text)">ps -eo pid,ppid,stat,wchan,cmd | awk '$3 ~ /D/'　（wchan 看卡在哪个内核函数）</text>

      <rect x="6" y="216" width="328" height="20" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="230" font-size="7.5" fill="var(--fig-text)">D 状态无法直接 kill；要解决 I/O 源头（慢盘、不可达的 NFS）或重启主机</text>

      <text x="6" y="248" font-size="7.5" fill="var(--fig-muted)">相关：load average 高但 CPU 空闲 → 通常就是 D 状态进程堆积</text>
    </svg>
    <figcaption>D 状态卡在内核 I/O、连 kill -9 都无效，是「负载高而 CPU 空闲」的元凶；Z 的处理对象是父进程</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
