<script setup>
/**
 * curl 排障的四个信息层次（题 4412）。
 *
 * 核心洞察：curl 的输出天然按「DNS → TCP → TLS → HTTP → 内容」分层，
 * 每一层对应不同的排查问题；关键是知道该加哪个参数看哪一层。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 278" role="img" aria-label="curl 排障的四个层次：-v 看握手与请求头、--trace 看完整字节流、-w 量化耗时、-I 只看响应头">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">curl 输出天然分层：DNS → TCP → TLS → HTTP → 内容</text>

      <!-- 各层与对应问题 -->
      <text x="6" y="32" font-size="9.5" font-weight="700" fill="var(--fig-text)">各层能问出什么问题</text>

      <rect x="6" y="40" width="328" height="22" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="54" font-size="7.5" fill="var(--fig-text)">DNS 解析：域名解析到哪个 IP（Trying ...）→ 解析错就会连错服务</text>

      <rect x="6" y="66" width="328" height="22" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="80" font-size="7.5" fill="var(--fig-text)">TCP 建连：Connected to ... → 卡在这里说明网络/端口不通</text>

      <rect x="6" y="92" width="328" height="22" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="106" font-size="7.5" fill="var(--fig-text)">TLS 握手：证书、协议版本、套件 → 失败多为证书/时间/SNI 问题</text>

      <rect x="6" y="118" width="328" height="22" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="132" font-size="7.5" fill="var(--fig-text)">HTTP 交互：请求头、状态码、响应头 → 判断谁拒绝、是否走代理</text>

      <!-- 四个参数 -->
      <text x="6" y="158" font-size="9.5" font-weight="700" fill="var(--fig-text)">四个常用参数分别看什么</text>

      <rect x="6" y="166" width="328" height="46" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="178" font-size="8" font-weight="700" fill="var(--fig-node-a)">-v（verbose）</text>
      <text x="96" y="178" font-size="7.5" fill="var(--fig-text)">看握手与请求头：`&gt;` 是发出的请求、`&lt;` 是收到的响应</text>
      <text x="14" y="191" font-size="7.5" fill="var(--fig-text)">最常用：确认请求的 Host / Header / 是否被代理改写</text>
      <text x="14" y="203" font-size="7.5" fill="var(--fig-node-c)">curl -v https://api.example.com/health</text>

      <rect x="6" y="216" width="328" height="22" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="230" font-size="7.5" fill="var(--fig-text)">-I 只看响应头（HEAD 请求）→ 快速验证状态码、缓存头、Server 标识</text>

      <rect x="6" y="242" width="328" height="22" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="256" font-size="7.5" fill="var(--fig-text)">-w 格式化输出各阶段耗时（DNS/连接/TLS/TTFB）→ 量化慢在哪一段</text>

      <text x="6" y="272" font-size="7.5" fill="var(--fig-muted)">进阶：--trace 看完整字节流，适合排查协议级怪问题（编码、分块、HTTP/2）</text>
    </svg>
    <figcaption>curl 按 DNS→TCP→TLS→HTTP 分层输出：卡在哪一层就是哪一层的故障；-w 能把耗时量化到各阶段</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
