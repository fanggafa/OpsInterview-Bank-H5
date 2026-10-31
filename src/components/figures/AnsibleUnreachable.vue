<script setup>
/**
 * Ansible 执行报 UNREACHABLE（题 3223）。
 *
 * 核心洞察：UNREACHABLE 是「连不上/连上但不能跑 Python」，
 * 与「任务失败（FAILED）」是两回事 —— 先按连接链排查。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 240" role="img" aria-label="Ansible UNREACHABLE 排查：网络与端口、认证、Python 解释器、权限提权">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">UNREACHABLE =「连不上」或「连上但跑不了 Python」，不是任务逻辑错</text>

      <rect x="6" y="20" width="328" height="28" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="38" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">①</tspan> 网络与端口：ping / nc 测通断，确认 22 端口可达</text>

      <rect x="6" y="52" width="328" height="28" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">②</tspan> 认证：密钥是否正确、用户名、sudo 密码、known_hosts 变化</text>

      <rect x="6" y="84" width="328" height="28" rx="4" fill="#e5484d" opacity=".12" />
      <text x="14" y="102" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">③</tspan> Python 缺失或路径异常（最常被忽略）：目标机没有 python3 或版本太低</text>

      <rect x="6" y="116" width="328" height="28" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="134" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">④</tspan> 提权失败（become）：sudo 未装/密码不对/用户不在 sudoers</text>

      <!-- 关键区分 -->
      <rect x="6" y="148" width="328" height="46" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="161" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">先分清 UNREACHABLE 与 FAILED</text>
      <text x="14" y="174" font-size="7.5" fill="var(--fig-text)">UNREACHABLE：连接/解释器层面的问题（还没开始执行业务逻辑）</text>
      <text x="14" y="186" font-size="7.5" fill="var(--fig-text)">FAILED：连接成功但任务返回非 0（命令错、权限、参数错）</text>

      <rect x="6" y="198" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="211" font-size="8" font-weight="700" fill="var(--fig-node-a)">最快的定位方式</text>
      <text x="14" y="223" font-size="7.5" fill="var(--fig-text)">ansible -i 主机 -m ping -vvv：-vvv 会打印实际执行的 SSH 命令与错误</text>

      <text x="6" y="230" font-size="7.5" fill="var(--fig-muted)">常见解法：装 python3 或用 raw 模块先引导、ansible_python_interpreter 指定路径</text>
    </svg>
    <figcaption>UNREACHABLE 是连接/解释器层问题，区别于任务 FAILED；顺序查网络端口、认证、Python 缺失、become 提权，用 -vvv 看真实命令</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
