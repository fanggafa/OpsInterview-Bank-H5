<script setup>
/**
 * Ansible 的 template 与 copy（题 3219）。
 *
 * 核心洞察：copy 是「原样复制」，template 会先用 Jinja2 渲染；
 * 需要按主机注入变量时只能用 template，用 copy 会留下未替换的占位符。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 252" role="img" aria-label="copy 原样复制文件、template 先用 Jinja2 渲染再传输；需要按主机替换变量时必须用 template">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">差别只有一句：template 会先渲染，copy 不会</text>

      <rect x="6" y="20" width="160" height="72" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">copy</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">原样传输到目标机</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">支持 content/src、mode、owner</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">适合：二进制、脚本、静态文件</text>
      <text x="14" y="82" font-size="7.5" fill="var(--fig-node-c)">不会替换 {{ }} 变量</text>

      <rect x="174" y="20" width="160" height="72" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">template</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">先用 Jinja2 渲染再传</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">可用变量、循环、判断</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">适合：nginx/配置/环境文件</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-node-b)">能按主机注入差异值</text>

      <!-- 判断 -->
      <rect x="6" y="102" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="115" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">怎么选（两句话）</text>
      <text x="14" y="128" font-size="7.5" fill="var(--fig-text)">文件里有需要按机器/环境替换的占位符 → template</text>
      <text x="14" y="140" font-size="7.5" fill="var(--fig-text)">没有占位符（二进制、已生成的脚本） → copy</text>

      <!-- 坑 -->
      <rect x="6" y="156" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="169" font-size="8.5" font-weight="700" fill="#e5484d">两个常见坑</text>
      <text x="14" y="182" font-size="7.5" fill="var(--fig-text)">① 用 copy 发带 {{ }} 的配置 → 目标机留下未替换的占位符，服务起不来</text>
      <text x="14" y="194" font-size="7.5" fill="var(--fig-text)">② 用 template 发二进制 → 渲染可能破坏内容（编码/特殊字符）</text>

      <rect x="6" y="210" width="328" height="20" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="224" font-size="7.5" fill="var(--fig-text)">实用技巧：template 配 validate 参数（如 nginx -t），渲染错了不会替换线上文件</text>

      <text x="6" y="242" font-size="7.5" fill="var(--fig-muted)">性能：template 有渲染开销，大批量纯静态文件用 copy 更快（可用 synchronize）</text>
    </svg>
    <figcaption>copy 原样传输不改内容，template 先经 Jinja2 渲染；有占位符必须用 template，二进制/静态文件用 copy</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
