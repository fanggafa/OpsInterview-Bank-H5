<script setup>
/**
 * 五种「让程序后台/常驻」方式的区别（题 4233）。
 *
 * 核心洞察：& 只是放到后台、nohup 抗 SIGHUP、disown 移出作业表、
 * setsid 脱离会话、systemd 才是「真正的服务管理」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 258" role="img" aria-label="&amp; 放后台、nohup 抗挂断、disown 移出作业、setsid 脱离会话、systemd 托管服务">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">从「临时跑」到「真正的服务」，可靠性逐级提升</text>

      <rect x="6" y="20" width="328" height="28" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="38" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">&amp;</tspan>　放后台，但终端断开仍会被 SIGHUP 杀掉</text>

      <rect x="6" y="52" width="328" height="28" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">nohup</tspan>　忽略 SIGHUP，输出重定向到 nohup.out</text>

      <rect x="6" y="84" width="328" height="28" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="102" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">disown</tspan>　把已启动的作业移出作业表，不再随 shell 退出被杀</text>

      <rect x="6" y="116" width="328" height="28" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="134" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">setsid</tspan>　新建会话，完全脱离当前终端（适合 daemon 化）</text>

      <rect x="6" y="148" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="161" font-size="8" font-weight="700" fill="var(--fig-node-a)">systemd（推荐用于生产）</text>
      <text x="14" y="174" font-size="7.5" fill="var(--fig-text)">开机自启 · 崩溃自动重启 · 日志进 journald · 资源与依赖管理</text>

      <!-- 判断 -->
      <rect x="6" y="190" width="328" height="34" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="203" font-size="8" font-weight="700" fill="#e5484d">最容易踩的坑</text>
      <text x="14" y="216" font-size="7.5" fill="var(--fig-text)">只用 &amp; 就跑长任务 → 退出终端即被杀（很多人误以为是程序自己挂了）</text>

      <text x="6" y="240" font-size="7.5" fill="var(--fig-muted)">排查：程序「莫名退出」先看是否有 SIGHUP；systemd 服务看 journalctl -u 名称</text>
      <text x="6" y="252" font-size="7.5" fill="var(--fig-muted)">容器里 pid 1 语义不同：容器退出即全部停止，不适用这些技巧</text>
    </svg>
    <figcaption>&amp; 放后台但会被挂断杀掉、nohup 抗 SIGHUP、disown 移出作业表、setsid 脱离会话、systemd 才是生产级托管</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
