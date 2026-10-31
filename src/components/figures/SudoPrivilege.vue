<script setup>
/**
 * sudo 的提权原理与配置风险（题 8646）。
 *
 * 核心洞察：用户本身没有特权，特权属于「带 SUID 位的 /usr/bin/sudo」这个二进制；
 * sudo 只是拿 sudoers 做一次「你能不能跑这条命令」的判定。
 * 因此配置的真正分界线不是「授不授权」，而是「被授权的程序能不能被用来逃逸出一个 shell」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 288" role="img" aria-label="sudo 提权链路：普通用户调用带 SUID 位的 sudo，读取 sudoers 授权规则，以 root 身份执行并写审计日志；下方标注授权编辑器等于送 root shell">
      <defs>
        <marker id="arrSudo" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-node-a)" />
        </marker>
      </defs>

      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">特权不在用户身上，在带 SUID 位的 sudo 二进制上</text>

      <!-- 提权链路 -->
      <rect x="6" y="20" width="116" height="52" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">普通用户</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">执行 sudo systemctl</text>
      <text x="14" y="59" font-size="7.5" fill="var(--fig-text)">输入的是自己的密码</text>

      <rect x="134" y="20" width="86" height="52" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="142" y="33" font-size="8" font-weight="700" fill="var(--fig-node-b)">SUID 生效</text>
      <text x="142" y="46" font-size="7.5" fill="var(--fig-text)">sudo 属主是 root</text>
      <text x="142" y="59" font-size="7.5" fill="var(--fig-text)">于是以 root 身份跑</text>

      <rect x="232" y="20" width="102" height="52" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="240" y="33" font-size="8" font-weight="700" fill="var(--fig-node-c)">读 /etc/sudoers</text>
      <text x="240" y="46" font-size="7.5" fill="var(--fig-text)">判定：此人 + 此命令</text>
      <text x="240" y="59" font-size="7.5" fill="var(--fig-text)">是否被允许</text>

      <path d="M124 46 L132 46" fill="none" stroke="var(--fig-node-a)" stroke-width="1.5" marker-end="url(#arrSudo)" />
      <path d="M222 46 L230 46" fill="none" stroke="var(--fig-node-a)" stroke-width="1.5" marker-end="url(#arrSudo)" />

      <rect x="6" y="78" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="90" font-size="8" font-weight="700" fill="var(--fig-node-d)">以目标用户（默认 root）执行命令</text>
      <text x="14" y="102" font-size="7.5" fill="var(--fig-text)">审计：每条写 /var/log/secure 或 auth.log，可回溯</text>

      <!-- 那句最常见的话 -->
      <rect x="6" y="114" width="328" height="22" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="129" font-size="7.5" fill="var(--fig-text)">sudo -l 看授权 · sudo -u app 换用户 · sudo -i 得 shell</text>

      <!-- 误配的坑：授权编辑器 = 给 shell -->
      <rect x="6" y="144" width="328" height="66" rx="5" fill="#e5484d" opacity=".12" />
      <text x="14" y="157" font-size="8.5" font-weight="700" fill="#e5484d">最贵的误配：授权可逃逸的程序 = root shell</text>
      <text x="14" y="170" font-size="7.5" fill="var(--fig-text)">alice ALL=(root) NOPASSWD: /usr/bin/vim</text>
      <text x="14" y="184" font-size="7.5" fill="var(--fig-text)">vim 里一条 :!bash 就是 root shell，vi 同理</text>
      <text x="14" y="198" font-size="7.5" fill="var(--fig-text)">路径写全防劫持，参数通配 * 可被 ;/bin/bash 逃逸</text>

      <!-- 规则格式 -->
      <rect x="6" y="216" width="328" height="32" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="228" font-size="8" font-weight="700" fill="var(--fig-node-c)">规则四段：用户 主机=(可切用户) 命令</text>
      <text x="14" y="240" font-size="7.5" fill="var(--fig-text)">永远用 visudo 编辑，片段放 /etc/sudoers.d/</text>

      <!-- 对比 su -->
      <text x="6" y="262" font-size="7.5" fill="var(--fig-text)">对比 su：要 root 密码、全有或全无；sudo 按命令授权</text>
      <text x="6" y="276" font-size="7.5" fill="var(--fig-muted)">所以生产规范是「用 sudo，别直接 su 到 root」</text>
    </svg>
    <figcaption>sudo 靠 SUID 位以 root 身份运行、再查 sudoers 授权；它只放大「被允许的那条命令」，所以别授权 vim/less/find 这类能拿到 shell 的程序</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
