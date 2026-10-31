<script setup>
/**
 * systemd 服务启动失败的排查与 Restart=/Type=（题 4122）。
 *
 * 核心洞察：「启动失败」要先看 exit code 与失败阶段；
 * Type= 决定 systemd 如何判断「启动成功」，配错会误判（比如后台进程导致反复重启）。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 260" role="img" aria-label="systemd 启动失败排查顺序，以及 Type= 五种类型与 Restart= 策略">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">先看 journalctl 的失败原因，再确认 Type= 是否让 systemd 「误判」</text>

      <rect x="6" y="20" width="328" height="28" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="38" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">①</tspan> systemctl status 名称 → 看 exit code 与 Active 状态</text>

      <rect x="6" y="52" width="328" height="28" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">②</tspan> journalctl -u 名称 -n 50 → 看应用自身报错（最有效）</text>

      <rect x="6" y="84" width="328" height="28" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="102" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">③</tspan> 手动跑 ExecStart 的命令 → 排除 systemd 环境差异</text>

      <rect x="6" y="116" width="328" height="28" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="134" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">④</tspan> 查环境：Environment / EnvironmentFile / WorkingDirectory / 权限</text>

      <!-- Type -->
      <rect x="6" y="152" width="328" height="52" rx="5" fill="#e5484d" opacity=".12" />
      <text x="14" y="165" font-size="8.5" font-weight="700" fill="#e5484d">Type= 决定 systemd 怎么判定「启动成功」</text>
      <text x="14" y="178" font-size="7.5" fill="var(--fig-text)">simple（默认）：ExecStart 一起来就算成功　forking：等父进程退出</text>
      <text x="14" y="190" font-size="7.5" fill="var(--fig-text)">notify：应用主动通知（最准，需代码支持）　oneshot：跑完就退出　idle</text>
      <text x="14" y="202" font-size="7" fill="var(--fig-node-c)">配错后果：simple + 后台化的程序 → 误判立即退出 → 无限重启</text>

      <rect x="6" y="212" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="225" font-size="8" font-weight="700" fill="var(--fig-node-a)">Restart= 常用三档</text>
      <text x="14" y="237" font-size="7.5" fill="var(--fig-text)">no（默认）· on-failure（非 0 退出才重启）· always（总重启）</text>

      <text x="6" y="252" font-size="7.5" fill="var(--fig-muted)">注意：Restart=always 会让「配置错误」变成无限重启，配合 StartLimitIntervalSec 限流</text>
    </svg>
    <figcaption>排查顺序：status 看退出码、journalctl 看应用报错、手动跑命令、查环境变量；Type= 配错会让 simple 服务被误判反复重启</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
