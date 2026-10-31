<script setup>
/**
 * 文件描述符与进程数等资源限制的层级（题 4024）。
 *
 * 核心洞察：限制有「系统级 → 服务级 → 会话级 → 进程级」多层，
 * 改错一层等于没改（最常见是改了 limits.conf 但 systemd 服务不生效）。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 252" role="img" aria-label="资源限制四层：系统级 sysctl、systemd 服务级、PAM/limits.conf 会话级、进程自设 ulimit">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">限制是多层的，改错一层就等于没改 —— 尤以 systemd 服务最常见</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① 系统级上限：fs.file-max / pid_max</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">整机天花板；用 sysctl -w 或 /etc/sysctl.conf 持久化</text>

      <rect x="6" y="54" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="67" font-size="8" font-weight="700" fill="var(--fig-node-b)">② systemd 服务级：LimitNOFILE=</text>
      <text x="14" y="79" font-size="7.5" fill="var(--fig-text)">服务启动时由 systemd 设定 → 改 limits.conf 对它**无效**</text>

      <rect x="6" y="88" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="101" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ 会话级：/etc/security/limits.conf</text>
      <text x="14" y="113" font-size="7.5" fill="var(--fig-text)">只对「登录会话」生效（经 PAM），需重新登录才应用</text>

      <rect x="6" y="122" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="135" font-size="8" font-weight="700" fill="var(--fig-node-d)">④ 进程级：ulimit（仅当前 shell）</text>
      <text x="14" y="147" font-size="7.5" fill="var(--fig-text)">ulimit -n 只能调小或不超过软限制；硬限制要 root 才能放宽</text>

      <!-- 排查 -->
      <rect x="6" y="158" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="171" font-size="8.5" font-weight="700" fill="#e5484d">为什么改了 limits.conf 还报 Too many open files</text>
      <text x="14" y="184" font-size="7.5" fill="var(--fig-text)">因为服务由 systemd 启动 → 读的是 systemd 的 LimitNOFILE，不是 limits.conf</text>
      <text x="14" y="196" font-size="7.5" fill="var(--fig-text)">修法：service 文件里配 LimitNOFILE，再 daemon-reload 并重启服务</text>

      <rect x="6" y="210" width="328" height="20" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="224" font-size="7.5" fill="var(--fig-text)">查验：cat /proc/&lt;pid&gt;/limits 看「进程实际生效的限制」最准</text>

      <text x="6" y="242" font-size="7.5" fill="var(--fig-muted)">注意：根因常在应用泄漏 fd（没 close），调大上限只是掩盖问题</text>
    </svg>
    <figcaption>限制分四层：sysctl 天花板、systemd LimitNOFILE、limits.conf 会话、ulimit 进程；服务由 systemd 启动时改 limits.conf 无效</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
