<script setup>
/**
 * Linux 信号与优雅停机（题 4035）。
 *
 * 核心洞察：SIGTERM 可被捕获（用于优雅退出），SIGKILL 不可捕获（强制）——
 * 所以「先 TERM 等一会儿、再 KILL」才是正确停机姿势。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 246" role="img" aria-label="SIGTERM 可被捕获做优雅退出、SIGKILL 不可捕获、SIGHUP 重载配置，正确停机是先 TERM 再 KILL">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">TERM 可捕获（能优雅退出），KILL 不可捕获且不可忽略</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">SIGTERM（15）—— 默认终止，可捕获</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">进程可注册 handler 做「关连接、刷缓冲、删临时文件」再退出</text>

      <rect x="6" y="54" width="328" height="30" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="67" font-size="8" font-weight="700" fill="#e5484d">SIGKILL（9）—— 强制终止，不可捕获/不可忽略</text>
      <text x="14" y="79" font-size="7.5" fill="var(--fig-text)">进程没有任何机会清理：可能丢缓冲数据、留锁、留临时文件</text>

      <rect x="6" y="88" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="101" font-size="8" font-weight="700" fill="var(--fig-node-b)">SIGHUP（1）—— 常用于「重载配置」</text>
      <text x="14" y="113" font-size="7.5" fill="var(--fig-text)">传统守护进程收到它重读配置；终端断开会发给前台进程组</text>

      <rect x="6" y="122" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="138" font-size="7.5" fill="var(--fig-text)">SIGINT（2）—— Ctrl+C；SIGQUIT（3）—— 退出并留 core dump</text>

      <!-- 正确停机 -->
      <rect x="6" y="152" width="328" height="46" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="165" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">正确的停机姿势</text>
      <text x="14" y="178" font-size="7.5" fill="var(--fig-text)">① kill -TERM &lt;pid&gt;（或 systemctl stop）→ 等 10~30 秒</text>
      <text x="14" y="190" font-size="7.5" fill="var(--fig-text)">② 仍未退出再 kill -KILL；systemd 的 TimeoutStopSec 就是等这么久</text>

      <rect x="6" y="202" width="328" height="24" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="218" font-size="7.5" fill="var(--fig-text)">「kill 不掉」多半是 D 状态（不可中断 I/O）—— 信号对它无效</text>

      <text x="6" y="242" font-size="7.5" fill="var(--fig-muted)">补充：容器里 PID 1 需正确处理信号，否则 docker stop 超时后只会 KILL</text>
    </svg>
    <figcaption>TERM 可捕获做优雅退出、KILL 不能捕获（会丢缓冲与锁）、HUP 常表示重载；停机应先 TERM 等一段再 KILL</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
