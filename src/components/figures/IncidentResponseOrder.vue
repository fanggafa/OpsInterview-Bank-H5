<script setup>
/**
 * 主机入侵的应急响应顺序（题 62）。
 *
 * 核心洞察：顺序是「隔离止损 → 取证 → 清除 → 加固」，
 * 最忌「急着重启或 kill」—— 那会毁掉全部内存证据。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 272" role="img" aria-label="入侵应急四步：隔离止损、取证、清除与加固，强调不要急着重启或 kill 丢失证据">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">顺序是「隔离 → 取证 → 清除 → 加固」，最忌关机或直接 kill</text>

      <rect x="6" y="20" width="328" height="40" rx="5" fill="#e5484d" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="#e5484d">① 隔离止损（最先做）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">从安全组/防火墙切断出向（尤其 4444/5555 等非常用端口与境外 IP）</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-node-c)">保留入向以便取证；必要时整机下线但保留磁盘快照</text>

      <rect x="6" y="66" width="328" height="66" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="79" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">② 初步取证（尽量不改动现场）</text>
      <text x="14" y="92" font-size="7.5" fill="var(--fig-text)">ps auxf：可疑进程与父进程链（web 进程下挂 bash 是典型信号）</text>
      <text x="14" y="104" font-size="7.5" fill="var(--fig-text)">ss -antp：异常外联与监听端口</text>
      <text x="14" y="116" font-size="7.5" fill="var(--fig-text)">ls -l /proc/&lt;pid&gt;/exe：进程真实可执行文件（防同名伪装）</text>
      <text x="14" y="128" font-size="7.5" fill="var(--fig-node-c)">内存优先：需要深度取证先抓内存镜像，再考虑重启</text>

      <rect x="6" y="138" width="328" height="46" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="151" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">③ 排查持久化（否则清了还会回来）</text>
      <text x="14" y="164" font-size="7.5" fill="var(--fig-text)">crontab · systemd · /etc/rc.local · profile · authorized_keys · /etc/passwd</text>
      <text x="14" y="176" font-size="7.5" fill="var(--fig-node-c)">/tmp、/dev/shm 的可执行文件是常见落地位置</text>

      <rect x="6" y="190" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="203" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">④ 清除 + 轮换凭据 + 排查入口</text>
      <text x="14" y="216" font-size="7.5" fill="var(--fig-text)">删恶意文件与持久化项、删未知账号与公钥</text>
      <text x="14" y="228" font-size="7.5" fill="var(--fig-text)">轮换该机上的密钥/密码（大概率已泄露）· 查清入口再收工</text>

      <text x="6" y="254" font-size="7.5" fill="var(--fig-muted)">反模式：直接 reboot（丢内存）· 直接 kill 可疑进程（丢现场且可能被 cron 拉起）</text>
      <text x="6" y="266" font-size="7.5" fill="var(--fig-muted)">全程记录时间线与每一步操作：后面复盘与取证都依赖它</text>
    </svg>
    <figcaption>先隔离止损，再取证；取证包括进程/连接/持久化项；最后清除、轮换凭据、查清入口</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
