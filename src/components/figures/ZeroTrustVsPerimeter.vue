<script setup>
/**
 * 零信任与传统边界防护的区别（题 5218）。
 *
 * 核心洞察：传统模型「进来即信任」，零信任「永不信任、持续验证」；
 * 差别不在技术栈，而在「信任边界放在哪里」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 256" role="img" aria-label="传统边界防护进入内网即信任，零信任每次访问都验证身份设备与上下文">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">差别在「信任边界放哪」：一次验证 vs 每次验证</text>

      <rect x="6" y="20" width="160" height="76" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">传统边界防护</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">防火墙/VPN 划出「内网」</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">进入内网即被视为可信</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">内网横向移动几乎不受阻</text>
      <text x="14" y="82" font-size="7.5" fill="#e5484d">一旦边界被破，全线暴露</text>

      <rect x="174" y="20" width="160" height="76" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">零信任</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">默认不信任任何位置</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">每次访问都验证身份/设备</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">按应用授权，不是按网段</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-node-b)">单点失守不等于全网失守</text>

      <!-- 三要素 -->
      <rect x="6" y="106" width="328" height="50" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="119" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">零信任的三个支柱</text>
      <text x="14" y="132" font-size="7.5" fill="var(--fig-text)">① 身份（一人一账号、2FA、短期凭证）</text>
      <text x="14" y="144" font-size="7.5" fill="var(--fig-text)">② 设备（合规检查：补丁、加密、EDR 状态）　③ 上下文（时间、位置、行为异常）</text>

      <rect x="6" y="164" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="177" font-size="8" font-weight="700" fill="var(--fig-node-d)">常见实现</text>
      <text x="14" y="190" font-size="7.5" fill="var(--fig-text)">零信任网关（按应用授权）+ 设备准入 + 持续检测 + 最小权限</text>

      <rect x="6" y="206" width="328" height="24" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="222" font-size="7.5" fill="var(--fig-text)">误区：装了 VPN 或网关就叫零信任 —— 关键在「逐次验证 + 最小授权」</text>

      <text x="6" y="246" font-size="7.5" fill="var(--fig-muted)">过渡路线：VPN → 加 2FA/设备检查 → 细粒度网关按应用授权 → 持续验证</text>
    </svg>
    <figcaption>传统模型「进内网即信任」，零信任「每次访问都验证身份/设备/上下文」，单点失守不等于全网失守</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
