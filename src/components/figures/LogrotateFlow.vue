<script setup>
/**
 * logrotate 的工作原理与配置写错的风险（题 4025）。
 *
 * 核心洞察：logrotate 靠「rename + 通知进程重开文件」来切割；
 * 配置写错会静默失效（日志无限增长）或误删正在写的日志。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 252" role="img" aria-label="logrotate 工作流程：按条件触发、重命名、通知进程重开；配置写错导致不切割或误删">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">切割靠「改名 + 让进程重开文件」—— 缺后者日志会写进旧文件</text>

      <rect x="6" y="20" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="36" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">①</tspan> 触发：由 cron/systemd timer 每日检查（不是常驻进程）</text>

      <rect x="6" y="50" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="66" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">②</tspan> 判断：按 size / daily / rotate N 等条件决定是否切割</text>

      <rect x="6" y="80" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="96" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">③</tspan> 执行：把 app.log 改名为 app.log.1，然后新建 app.log</text>

      <rect x="6" y="110" width="328" height="26" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="126" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">④</tspan> 关键：postrotate 通知进程「重开文件」（否则继续写旧句柄）</text>

      <!-- 配置写错的后果 -->
      <rect x="6" y="144" width="328" height="50" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="157" font-size="8.5" font-weight="700" fill="#e5484d">配置写错的三种后果</text>
      <text x="14" y="170" font-size="7.5" fill="var(--fig-text)">① 不切割：条件写错（如 size 单位/路径不匹配）→ 磁盘被日志吃满</text>
      <text x="14" y="182" font-size="7.5" fill="var(--fig-text)">② 误删：配置了 rotate 0 或通配符过宽 → 删掉正在写的日志</text>
      <text x="14" y="194" font-size="7" fill="var(--fig-node-c)">③ 报错但静默：logrotate 失败常有日志但没人看 → 悄悄不转了</text>

      <rect x="6" y="202" width="328" height="20" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="216" font-size="7.5" fill="var(--fig-text)">验证：logrotate -d /etc/logrotate.conf 是 dry-run，先跑它看会做什么</text>

      <text x="6" y="242" font-size="7.5" fill="var(--fig-muted)">注意：copytruncate 可免重开文件，但与「边写边拷」有丢日志窗口</text>
    </svg>
    <figcaption>logrotate 由定时触发、按条件改名切割，关键在 postrotate 通知进程重开；配错会静默不切割或误删在写日志</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
