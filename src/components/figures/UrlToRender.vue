<script setup>
/**
 * 从输入 URL 到页面展示的完整链路（题 18）。
 *
 * 核心洞察：这条链路串起了 DNS、TCP、TLS、HTTP、渲染，
 * 每一段都是独立的排查点 —— 也是最能把零散知识串起来的一道题。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 288" role="img" aria-label="从输入 URL 到页面展示：DNS 解析、TCP 建连、TLS 握手、发送请求、服务端处理、返回响应、浏览器渲染">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">这条链路串起 DNS、TCP、TLS、HTTP、渲染 —— 每段都是独立排查点</text>

      <rect x="6" y="20" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="36" font-size="7.5" fill="var(--fig-text)">① DNS 解析：浏览器缓存 → 系统缓存 → 本地 DNS → 权威（域名 → IP）</text>

      <rect x="6" y="50" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="66" font-size="7.5" fill="var(--fig-text)">② TCP 建连：三次握手（同 IP 同端口可复用连接池）</text>

      <rect x="6" y="80" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="96" font-size="7.5" fill="var(--fig-text)">③ TLS 握手：证书校验、协商套件、派生会话密钥（HTTPS 才有）</text>

      <rect x="6" y="110" width="328" height="26" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="126" font-size="7.5" fill="var(--fig-text)">④ 发送 HTTP 请求：方法/路径/请求头/Cookie（可能经代理、CDN）</text>

      <rect x="6" y="140" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="156" font-size="7.5" fill="var(--fig-text)">⑤ 服务端处理：负载均衡 → 应用 → 缓存/DB → 生成响应</text>

      <rect x="6" y="170" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="186" font-size="7.5" fill="var(--fig-text)">⑥ 返回响应：状态码/响应头/压缩（Content-Encoding）/缓存头</text>

      <rect x="6" y="200" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="216" font-size="7.5" fill="var(--fig-text)">⑦ 浏览器渲染：解析 HTML → 构建 DOM → 加载资源 → 布局 → 绘制</text>

      <!-- 排查映射 -->
      <rect x="6" y="234" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="247" font-size="8" font-weight="700" fill="var(--fig-node-d)">每段对应一个排查手段</text>
      <text x="14" y="259" font-size="7.5" fill="var(--fig-text)">dig / nc / openssl s_client / curl -w 各阶段耗时 / 浏览器 DevTools</text>

      <text x="6" y="280" font-size="7.5" fill="var(--fig-muted)">加分点：主动说「这一步在哪儿慢，用什么命令测」比背流程更加分</text>
    </svg>
    <figcaption>DNS → TCP → TLS → HTTP → 服务端 → 响应 → 渲染；每段都有对应的排查工具，这才是这道题的价值</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
