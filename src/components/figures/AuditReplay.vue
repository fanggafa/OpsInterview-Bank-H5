<script setup>
/**
 * 「所有运维操作可审计可回放」的实现方案（题 5233）。
 *
 * 核心洞察：审计要覆盖「身份 + 操作 + 结果」三层，
 * 单靠 shell history 不可信；真正的回放需要堡垒机会话录制或内核级审计。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 250" role="img" aria-label="可审计可回放四层：身份、通道、记录、留存，以及 history 不可信的原因">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">审计=知道「谁、在何时、对哪台机器、做了什么」，回放=还能重演过程</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① 身份：一人一账号</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">共享账号 = 审计失效（无法归因到人）；接 LDAP/SSO，离职即失效</text>

      <rect x="6" y="54" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="67" font-size="8" font-weight="700" fill="var(--fig-node-b)">② 通道：统一入口</text>
      <text x="14" y="79" font-size="7.5" fill="var(--fig-text)">生产只允许堡垒机/零信任网关访问；直连就没法保证经过审计</text>

      <rect x="6" y="88" width="328" height="52" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="101" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">③ 记录：三层手段，越往下越可信</text>
      <text x="14" y="114" font-size="7.5" fill="var(--fig-text)">基础：命令审计（bash 的 PROMPT_COMMAND / auditd 记录 execve）</text>
      <text x="14" y="126" font-size="7.5" fill="var(--fig-text)">进阶：会话录屏（堡垒机回放）　更强：内核 auditd + 文件完整性（AIDE）</text>
      <text x="14" y="138" font-size="7" fill="#e5484d">注意：history 可被 `history -c` 清、`HISTFILE=/dev/null` 关，不可作为唯一证据</text>

      <rect x="6" y="146" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="159" font-size="8" font-weight="700" fill="var(--fig-node-d)">④ 留存：不可篡改</text>
      <text x="14" y="171" font-size="7.5" fill="var(--fig-text)">日志实时转发到远端只写平台；本地被清还有副本，且满足合规保留期</text>

      <rect x="6" y="184" width="328" height="34" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="197" font-size="8" font-weight="700" fill="#e5484d">最大难点</text>
      <text x="14" y="209" font-size="7.5" fill="var(--fig-text)">特权路径：root/DBA 账号在堡垒机外使用 → 记录缺失；必须一并收敛</text>

      <rect x="6" y="226" width="328" height="20" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="240" font-size="7.5" fill="var(--fig-text)">验收：随机抽一次线上操作，能否还原完整过程（含文件传输）</text>
    </svg>
    <figcaption>四层：一人一账号、统一通道、三层记录（命令/录屏/内核审计）、日志不可篡改；history 可被清除不能作唯一证据</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
