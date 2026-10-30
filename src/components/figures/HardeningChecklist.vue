<script setup>
/**
 * 公网 Linux 服务器加固清单（题 61）。
 *
 * 核心洞察：加固不是「改一个开关」，而是按「账号 → 网络 → 服务 → 审计」四层收敛暴露面；
 * 每层都有几件必做的事，缺一层就会被绕过。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 274" role="img" aria-label="公网 Linux 加固四层：账号与认证、网络与服务、内核与文件权限、审计与监控">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">加固是按四层收敛暴露面，不是改一个开关</text>

      <rect x="6" y="20" width="328" height="52" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① 账号与认证</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">禁 root 远程（PermitRootLogin no）· 禁密码改密钥 · 限制 AllowUsers</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">密码复杂度（PAM pwquality）· 登录失败锁定（faillock）· 清理空口令账号</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-node-c)">验证：sshd -T 看「实际生效值」（配置文件写了不等于生效）</text>

      <rect x="6" y="78" width="328" height="52" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="91" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">② 网络与服务</text>
      <text x="14" y="104" font-size="7.5" fill="var(--fig-text)">防火墙默认拒绝、只放行业务端口（云上还要看安全组）</text>
      <text x="14" y="116" font-size="7.5" fill="var(--fig-text)">关闭无用服务与端口（telnet/ftp/rsh）· 卸载无用软件包</text>
      <text x="14" y="128" font-size="7.5" fill="var(--fig-node-c)">验证：ss -lntp 看监听地址，0.0.0.0 上不该有数据库</text>

      <rect x="6" y="136" width="328" height="52" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="149" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">③ 内核与文件权限</text>
      <text x="14" y="162" font-size="7.5" fill="var(--fig-text)">及时打补丁（内核/OpenSSL/SSH 优先）· SELinux 保持 enforcing</text>
      <text x="14" y="174" font-size="7.5" fill="var(--fig-text)">敏感文件权限：/etc/shadow 600、/etc/sudoers 440、authorized_keys 600</text>
      <text x="14" y="186" font-size="7.5" fill="var(--fig-node-c)">验证：namei -l 逐级看目录权限（排查「文件权限对但打不开」）</text>

      <rect x="6" y="194" width="328" height="52" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="207" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">④ 审计与监控</text>
      <text x="14" y="220" font-size="7.5" fill="var(--fig-text)">auditd 监控关键文件与提权 · 日志集中到远端（本地被清还有副本）</text>
      <text x="14" y="232" font-size="7.5" fill="var(--fig-text)">爆破告警（lastb / 认证失败率）· 异常外联监控（出站比入站更常被忽略）</text>
      <text x="14" y="244" font-size="7.5" fill="var(--fig-node-c)">验证：无监控就等于「出事才发现」，这层最容易被跳过</text>

      <text x="6" y="266" font-size="7.5" fill="var(--fig-muted)">加分点：主动说「改端口只是降噪，不是安全；认证层才是关键」</text>
    </svg>
    <figcaption>加固分四层：账号认证、网络服务、内核权限、审计监控；每层都要有可验证的手段</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
