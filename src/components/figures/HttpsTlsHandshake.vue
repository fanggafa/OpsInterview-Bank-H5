<script setup>
/**
 * HTTP 与 HTTPS 的区别与 TLS 握手（题 102）。
 *
 * 核心洞察：HTTPS = HTTP + TLS，解决「窃听、篡改、冒充」三件事；
 * 握手阶段用非对称（交换密钥），之后用对称（快），这是性能与安全的分工。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 264" role="img" aria-label="HTTPS 相比 HTTP 解决窃听篡改冒充三件事；TLS 握手用非对称交换密钥，之后用对称加密传输">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">HTTPS = HTTP + TLS：解决窃听、篡改、冒充</text>

      <rect x="6" y="20" width="328" height="20" rx="4" fill="var(--fig-node-a)" opacity=".14" />
      <text x="14" y="34" font-size="7.5" fill="var(--fig-node-a)">HTTPS = HTTP（明文） + TLS（加密/完整性/身份）</text>

      <!-- TLS 握手 -->
      <text x="6" y="58" font-size="9" font-weight="700" fill="var(--fig-text)">TLS 握手（简化，1.2）</text>

      <rect x="6" y="66" width="328" height="24" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="82" font-size="7.5" fill="var(--fig-text)">① Client Hello：支持的版本 / 套件 / 随机数</text>

      <rect x="6" y="94" width="328" height="24" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="110" font-size="7.5" fill="var(--fig-text)">② Server Hello + 证书：选出套件、发证书（含公钥与链）</text>

      <rect x="6" y="122" width="328" height="24" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="138" font-size="7.5" fill="var(--fig-text)">③ 客户端校验证书：CA 是否受信 · 域名匹配 · 有效期 · 吊销</text>

      <rect x="6" y="150" width="328" height="24" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="166" font-size="7.5" fill="var(--fig-text)">④ 密钥交换：ECDHE 协商 / 客户端用公钥加密预主密钥</text>

      <rect x="6" y="178" width="328" height="24" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="194" font-size="7.5" fill="var(--fig-text)">⑤ 双方派生会话密钥 → 之后用对称加密通信</text>

      <rect x="6" y="206" width="328" height="24" rx="4" fill="var(--fig-node-c)" opacity=".14" />
      <text x="14" y="222" font-size="7.5" fill="var(--fig-node-c)">关键：非对称只用于握手，业务数据用对称（快得多）</text>

      <text x="6" y="244" font-size="7.5" fill="var(--fig-muted)">TLS 1.3：握手压到 1-RTT，去掉 RSA 交换，只留 AEAD 套件</text>
      <text x="6" y="256" font-size="7.5" fill="var(--fig-muted)">排查：curl -vI / openssl s_client 看证书链与握手</text>
    </svg>
    <figcaption>HTTPS 用 TLS 解决窃听/篡改/冒充；握手用非对称交换密钥、之后用对称传输，这是性能与安全的分工</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
