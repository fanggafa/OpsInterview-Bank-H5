<script setup>
/**
 * 服务器 CPU 异常高、有陌生进程的应急响应（题 5204）。
 *
 * 核心洞察：顺序决定取证质量 —— 先隔离与取证，再清除；
 * 直接 kill 进程会毁掉现场，也可能被守护机制重新拉起。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 240" role="img" aria-label="CPU 异常与陌生进程的应急顺序：隔离、取证、查持久化、清除、复盘">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">顺序错了会毁证据 —— 且直接 kill 可能被守护进程拉起</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="#e5484d" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="#e5484d">① 隔离（分钟级，先止损）</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">切断出向连接（挖矿/木马常连 C2），保留入向便于取证</text>

      <rect x="6" y="54" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="67" font-size="8" font-weight="700" fill="var(--fig-node-a)">② 取证（重启即丢）</text>
      <text x="14" y="79" font-size="7.5" fill="var(--fig-text)">进程树、可执行文件路径、网络连接、登录会话、内存/日志外传</text>

      <rect x="6" y="88" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="101" font-size="8" font-weight="700" fill="var(--fig-node-b)">③ 查持久化与入口</text>
      <text x="14" y="113" font-size="7.5" fill="var(--fig-text)">crontab / systemd / profile / authorized_keys；怎么进来的决定清除范围</text>

      <rect x="6" y="122" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="135" font-size="8" font-weight="700" fill="var(--fig-node-c)">④ 清除 + 轮换凭据</text>
      <text x="14" y="147" font-size="7.5" fill="var(--fig-text)">杀进程、删文件、关后门；该机的密钥密码全部视为泄露</text>

      <rect x="6" y="156" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="169" font-size="8" font-weight="700" fill="var(--fig-node-d)">⑤ 复盘与加固</text>
      <text x="14" y="181" font-size="7.5" fill="var(--fig-text)">补监控规则、收紧网络策略、加基线扫描</text>

      <!-- 定位手段 -->
      <rect x="6" y="192" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="205" font-size="8" font-weight="700" fill="var(--fig-node-a)">定位陌生进程的三条命令</text>
      <text x="14" y="217" font-size="7.5" fill="var(--fig-text)">top -Hp 找线程 → ps 看进程路径与启动人 → lsof/ss 看它连了谁</text>

      <text x="6" y="230" font-size="7.5" fill="var(--fig-muted)">两个致命错误：直接 reboot（丢内存证据）；直接 kill（丢现场且可能被拉起）</text>
    </svg>
    <figcaption>五步：隔离止损、取证（重启即丢）、查持久化与入口、清除并轮换凭据、复盘加固；忌直接 reboot 或 kill</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
