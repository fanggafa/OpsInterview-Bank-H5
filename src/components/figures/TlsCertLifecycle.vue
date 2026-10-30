<script setup>
/**
 * TLS 证书过期与自动续期链路（题 65）。
 *
 * 核心洞察：证书过期是「必然会发生」的故障，
 * 所以要做的不只是续期，而是「监控 + 自动续期 + 续期后重载」三件事。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 254" role="img" aria-label="证书管理三件事：提前监控到期时间、自动续期、续期后重载服务；以及常见失败原因">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">过期是必然事件 → 监控 + 自动续期 + 续期后重载，三件都要做</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① 监控到期时间（提前发现）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">openssl s_client / 脚本取 notAfter，到期前 30/7 天告警</text>

      <rect x="6" y="58" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="71" font-size="8" font-weight="700" fill="var(--fig-node-b)">② 自动续期</text>
      <text x="14" y="84" font-size="7.5" fill="var(--fig-text)">ACME 协议（如 certbot）自动签发；注意速率限制与验证方式</text>

      <rect x="6" y="96" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="109" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ 续期后必须重载</text>
      <text x="14" y="122" font-size="7.5" fill="var(--fig-text)">Nginx 需要 reload 才读新证书（restart 会中断服务）</text>

      <!-- 常见失败 -->
      <rect x="6" y="134" width="328" height="52" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="147" font-size="8.5" font-weight="700" fill="#e5484d">「续期成功但仍报过期」的四个原因</text>
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)">① 续了但没重载服务　② 续期写到另一个路径，配置指向旧的</text>
      <text x="14" y="172" font-size="7.5" fill="var(--fig-text)">③ 证书链不完整（只换叶子证书，没更新中间证书）　④ 多节点只续了一台</text>
      <text x="14" y="184" font-size="7.5" fill="var(--fig-node-c)">验证：openssl s_client 看实际下发的证书与链（不是看文件）</text>

      <rect x="6" y="192" width="328" height="44" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="205" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">排查路径</text>
      <text x="14" y="218" font-size="7.5" fill="var(--fig-text)">客户端报错 → openssl s_client -connect host:443 -servername host</text>
      <text x="14" y="230" font-size="7.5" fill="var(--fig-text)">看 verify 结果、有效期、是否 unwrap 了中间证书</text>

      <text x="6" y="250" font-size="7.5" fill="var(--fig-muted)">易混点：浏览器缓存/客户端时间不准也会报过期，先确认服务端证书本身</text>
    </svg>
    <figcaption>证书管理三件事：监控到期、自动续期、续期后重载；「续了还报过期」多是没重载或链不完整</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
