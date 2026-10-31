<script setup>
/**
 * Nginx 常用命令与改配置的标准流程（题 1409）。
 *
 * 核心洞察：安全改配置的关键是「先校验再重载」，并且保留可回退的旧配置；
 * 直接 restart 或跳过 -t 是生产事故的常见起点。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 234" role="img" aria-label="Nginx 改配置标准流程：备份、编辑、nginx -t 校验、reload、观察日志">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">标准流程五步：备份 → 改 → 校验 → 重载 → 观察</text>

      <rect x="6" y="20" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="36" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">①</tspan> 备份现有配置（cp 带时间戳），保留可回退版本</text>

      <rect x="6" y="50" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="66" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">②</tspan> 编辑 → 保存（注意 include 的文件是否是你以为的那个）</text>

      <rect x="6" y="80" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="96" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">③</tspan> nginx -t 校验语法（不改线上任何东西，失败就修）</text>

      <rect x="6" y="110" width="328" height="26" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="126" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">④</tspan> nginx -s reload（或 systemctl reload）—— 平滑，不断连接</text>

      <rect x="6" y="140" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="156" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">⑤</tspan> 观察 error.log 与状态码，确认新配置真的生效</text>

      <!-- 常用命令 -->
      <rect x="6" y="174" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="187" font-size="8" font-weight="700" fill="var(--fig-node-b)">最常用的四条命令</text>
      <text x="14" y="199" font-size="7.5" fill="var(--fig-text)">nginx -t（校验）· -T（打印合并后配置）· -s reload · -s quit（优雅停）</text>

      <rect x="6" y="214" width="328" height="18" rx="3" fill="#e5484d" opacity=".1" />
      <text x="14" y="227" font-size="7.5" fill="var(--fig-text)">反模式：直接 restart（有中断）、跳过 -t（配置错就整站起不来）</text>
    </svg>
    <figcaption>五步：备份、编辑、nginx -t 校验、reload 平滑重载、观察日志；反模式是跳过 -t 或直接 restart</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
