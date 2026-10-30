<script setup>
/**
 * SELinux 三种模式与「莫名被拒」的排查（题 4032）。
 *
 * 核心洞察：SELinux 是「强制访问控制」，在常规权限之上再加一层标签校验 ——
 * 所以「权限都对但还是被拒」时，它是最常见的背锅者；排查靠 audit 日志而不是猜。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 246" role="img" aria-label="SELinux 三种模式 enforcing、permissive、disabled；排查被拒要看 audit 日志并生成策略">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">它在 rwx 之外再加一层「标签」校验，所以权限对也可能被拒</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="#e5484d">enforcing —— 强制执行</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">违规操作被拒绝并记入 audit 日志（生产通常用这个）</text>

      <rect x="6" y="54" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="67" font-size="8" font-weight="700" fill="var(--fig-node-b)">permissive —— 只记录不拦截</text>
      <text x="14" y="79" font-size="7.5" fill="var(--fig-text)">违规仍会执行，但写日志；**排障时临时切它来验证**</text>

      <rect x="6" y="88" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="104" font-size="7.5" fill="var(--fig-text)">disabled —— 完全关闭（需重启或改 grub 参数；不建议生产关闭）</text>

      <!-- 排查 -->
      <rect x="6" y="118" width="328" height="52" rx="5" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="131" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">「莫名被拒」的排查顺序</text>
      <text x="14" y="144" font-size="7.5" fill="var(--fig-text)">① getenforce 看是否 enforcing ② 查 audit 日志：ausearch -m AVC -ts recent</text>
      <text x="14" y="156" font-size="7.5" fill="var(--fig-text)">③ 用 audit2why / audit2allow 看原因与修复建议</text>
      <text x="14" y="168" font-size="7.5" fill="var(--fig-node-c)">④ 改标签（chcon/semanage fcontext）或用 setsebool 开对应布尔值</text>

      <rect x="6" y="186" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="199" font-size="8" font-weight="700" fill="var(--fig-node-a)">最常见的四类触发</text>
      <text x="14" y="211" font-size="7.5" fill="var(--fig-text)">文件标签错（拷贝文件丢了 context）· 监听非标准端口 · 脚本被 deny · 目录权限</text>

      <rect x="6" y="218" width="328" height="20" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="232" font-size="7.5" fill="var(--fig-text)">反模式：一出问题就 setenforce 0 —— 治标不治本且削弱安全</text>

      <text x="6" y="242" font-size="7.5" fill="var(--fig-muted)">定位：ls -Z 看文件 context；restorecon -Rv 恢复默认标签（拷贝文件后常用）</text>
    </svg>
    <figcaption>enforcing 拒绝并记日志、permissive 只记不拦（排障用）、disabled 关闭；被拒先查 ausearch 的 AVC 记录再看 audit2why</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
