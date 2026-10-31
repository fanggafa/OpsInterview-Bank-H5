<script setup>
/**
 * sh / bash / dash / zsh 的区别与 shebang（题 4226）。
 *
 * 核心洞察：很多系统上 `sh` 其实是 dash（更快但更简陋），
 * 所以脚本必须显式写 `#!/bin/bash` 才能用 bash 扩展语法。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 252" role="img" aria-label="sh 在多数发行版是 dash 且功能更少，bash 功能全，zsh 交互强；shebang 决定用哪个解释器">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">Linux 上 sh 往往等于 dash —— 脚本必须显式写 shebang 才能用 bash 语法</text>

      <rect x="6" y="20" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="36" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">sh</tspan>　POSIX 规范入口；在 Debian/Ubuntu 上常指向 dash（启动更快、功能更少）</text>

      <rect x="6" y="50" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="66" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">bash</tspan>　功能全：[[ ]]、数组、关联数组、\${var//x/y}、进程替换</text>

      <rect x="6" y="80" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="96" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">dash</tspan>　极小极快，POSIX 子集；适合启动脚本与容器</text>

      <rect x="6" y="110" width="328" height="26" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="126" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">zsh</tspan>　交互体验强（补全/主题/插件），但脚本兼容性依赖配置</text>

      <!-- shebang -->
      <rect x="6" y="144" width="328" height="50" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="157" font-size="8.5" font-weight="700" fill="#e5484d">shebang 决定用哪个解释器</text>
      <text x="14" y="170" font-size="7.5" fill="var(--fig-text)">写 #!/bin/sh 却用 [[ ]] 或数组 → 在某些系统上报语法错误（本机却不报）</text>
      <text x="14" y="182" font-size="7.5" fill="var(--fig-text)">写 #!/bin/bash 才能安全使用 bash 扩展；要可移植就只写 POSIX 子集</text>
      <text x="14" y="194" font-size="7" fill="var(--fig-node-c)">也可用 #!/usr/bin/env bash 来适配不同前缀的系统</text>

      <rect x="6" y="204" width="328" height="28" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="221" font-size="7.5" fill="var(--fig-text)">排查：ls -l /bin/sh 看它是指向哪个；用 sh -x 跑一遍可暴露不兼容语法</text>

      <text x="6" y="242" font-size="7.5" fill="var(--fig-muted)">容器里更常见：基础镜像用 dash 或 busybox sh，很多 bash 语法直接不可用</text>
    </svg>
    <figcaption>sh 在常见发行版指向 dash，功能更少但更快；bash 功能全、zsh 交互强；shebang 写错会导致「本机正常、别处报错」</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
