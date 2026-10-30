<script setup>
/**
 * 不停服务排查可疑账号与异常登录（题 5205）。
 *
 * 核心洞察：排查可疑账号要看「账号本身 + 登录来源 + 登录时间」三维，
 * 全程只读，不改动生产；重点是找出「不该存在的东西」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 248" role="img" aria-label="可疑账号排查：账号清单、登录记录、公钥与计划任务、以及只读操作原则">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">排查原则：只读、不停服务、留证据；重点是找出「不该存在的东西」</text>

      <rect x="6" y="20" width="328" height="42" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① 账号清单：找「不该有」</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">awk -F: '$3==0{print}' /etc/passwd（UID=0 的「另一个 root」）</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-node-c)">空口令、无 shell 却异常的账号、近期新增的账号（看 /etc/passwd 修改时间）</text>

      <rect x="6" y="66" width="328" height="42" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="79" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">② 登录记录：找「不该来」</text>
      <text x="14" y="92" font-size="7.5" fill="var(--fig-text)">last / lastb（成功与失败）、/var/log/secure、journalctl -u sshd</text>
      <text x="14" y="104" font-size="7.5" fill="var(--fig-node-c)">重点：非常用来源 IP、非常用时段、登录后立刻执行命令的会话</text>

      <rect x="6" y="112" width="328" height="42" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="125" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">③ 持久化：找「不该留」</text>
      <text x="14" y="138" font-size="7.5" fill="var(--fig-text)">authorized_keys（陌生公钥）· crontab · systemd unit · profile 脚本</text>
      <text x="14" y="150" font-size="7.5" fill="var(--fig-node-c)">sudoers 里被放宽的授权；/etc/passwd 与 /etc/shadow 的异常权限</text>

      <rect x="6" y="158" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="171" font-size="8" font-weight="700" fill="var(--fig-node-d)">④ 正在发生的会话</text>
      <text x="14" y="183" font-size="7.5" fill="var(--fig-text)">w / who 看当前登录；ss -tnp 看是否有异常外联（可能在被操作中）</text>

      <rect x="6" y="192" width="328" height="34" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="205" font-size="8" font-weight="700" fill="#e5484d">两个必须遵守的原则</text>
      <text x="14" y="217" font-size="7.5" fill="var(--fig-text)">① 只读排查（不改配置、不重启）② 发现可疑先取证再处置，别直接删</text>

      <text x="6" y="244" font-size="7.5" fill="var(--fig-muted)">输出物：可疑账号/登录/持久化的「三张清单」，作为后续处置与复盘的依据</text>
    </svg>
    <figcaption>三层排查：账号清单（UID=0/空口令/新增）、登录记录（异常来源与时段）、持久化（公钥/cron/sudoers），全程只读</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
