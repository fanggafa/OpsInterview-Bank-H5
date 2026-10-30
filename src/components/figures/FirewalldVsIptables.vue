<script setup>
/**
 * firewalld 与 iptables 的关系（题 1209）。
 *
 * 核心洞察：两者都是 netfilter 的前端，底层同一套规则 ——
 * 这正是「同时用会互相覆盖」的原因；firewalld 的 zone 是对规则的抽象分组。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 276" role="img" aria-label="firewalld 与 iptables 都是 netfilter 前端，同时启用会互相覆盖；zone 是对规则的抽象分组">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">两者都是 netfilter 的前端，底层同一套规则 —— 所以会互相覆盖</text>

      <!-- 层次 -->
      <rect x="6" y="20" width="160" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="39" font-size="8" font-weight="700" fill="var(--fig-node-a)">firewalld</text>

      <rect x="174" y="20" width="160" height="30" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="182" y="39" font-size="8" font-weight="700" fill="var(--fig-node-b)">iptables / nftables</text>

      <text x="168" y="64" font-size="8" fill="var(--fig-muted)">↓</text>

      <rect x="6" y="70" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".14" />
      <text x="14" y="87" font-size="8" font-weight="700" fill="var(--fig-node-c)">netfilter（内核）—— 同一套规则集</text>

      <!-- 关键差别 -->
      <rect x="6" y="106" width="328" height="52" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="119" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">差别在「抽象层次」</text>
      <text x="14" y="132" font-size="7.5" fill="var(--fig-text)">iptables：直接写表/链/规则（立即生效，一次性）</text>
      <text x="14" y="144" font-size="7.5" fill="var(--fig-text)">firewalld：用 zone + service 声明，支持 runtime/permanent 两态</text>

      <!-- zone -->
      <rect x="6" y="166" width="328" height="46" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="179" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">zone 是干什么的</text>
      <text x="14" y="192" font-size="7.5" fill="var(--fig-text)">按「网络接口/来源」划入不同信任等级（public / internal / dmz / drop）</text>
      <text x="14" y="204" font-size="7.5" fill="var(--fig-text)">每个 zone 有自己的规则集 → 网卡切换 zone 就等于换一套规则</text>

      <!-- 共存风险 -->
      <rect x="6" y="222" width="328" height="28" rx="4" fill="#e5484d" opacity=".12" />
      <text x="14" y="235" font-size="8" font-weight="700" fill="#e5484d">同时使用的后果</text>
      <text x="14" y="247" font-size="7.5" fill="var(--fig-text)">谁最后写谁生效；firewalld --reload 会覆盖手工 iptables 规则</text>

      <text x="6" y="268" font-size="7.5" fill="var(--fig-muted)">建议：一台机器只选一套；用 iptables 就先 stop + disable firewalld</text>
    </svg>
    <figcaption>两者共用 netfilter 规则集，firewalld 只是更高层抽象（zone 按信任等级分组）；同时启用会互相覆盖</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
