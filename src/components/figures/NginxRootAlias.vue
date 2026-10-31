<script setup>
/**
 * Nginx 的 root 与 alias（题 1422）。
 *
 * 核心洞察：root 会把「URI 整段」拼到目录后，alias 则替换掉 location 匹配的那一段；
 * 配错 root/alias 的典型症状是 404 且路径里多出/少一层目录。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 262" role="img" aria-label="root 把完整 URI 拼到目录后，alias 替换 location 匹配段；举例说明路径差异与常见 404">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">root 是「拼接」，alias 是「替换」——差别就在这里</text>

      <rect x="6" y="20" width="328" height="46" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">root：目录 + 完整 URI</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">location /static/ { root /data/www; }</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">请求 /static/a.png → 实际读 /data/www/static/a.png（多了一层 static）</text>

      <rect x="6" y="72" width="328" height="46" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="85" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">alias：替换掉 location 前缀</text>
      <text x="14" y="98" font-size="7.5" fill="var(--fig-text)">location /static/ { alias /data/www/static/; }</text>
      <text x="14" y="110" font-size="7.5" fill="var(--fig-text)">请求 /static/a.png → 实际读 /data/www/static/a.png（不带 location 段）</text>

      <!-- 常见错误 -->
      <rect x="6" y="128" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="141" font-size="8.5" font-weight="700" fill="#e5484d">两个最常见的 404 原因</text>
      <text x="14" y="154" font-size="7.5" fill="var(--fig-text)">① 该用 alias 却用了 root → 路径多一层，文件找不到</text>
      <text x="14" y="166" font-size="7.5" fill="var(--fig-text)">② alias 结尾漏了斜杠 → 请求 /static/a.png 被拼成 /data/www/statica.png</text>

      <rect x="6" y="184" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="197" font-size="8" font-weight="700" fill="var(--fig-node-c)">怎么快速判断</text>
      <text x="14" y="210" font-size="7.5" fill="var(--fig-text)">看 error.log 里「实际尝试打开的文件路径」，一眼就能看出多/少了哪一层</text>

      <rect x="6" y="226" width="328" height="20" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="240" font-size="7.5" fill="var(--fig-text)">经验：location 用普通前缀时优先 alias；用正则时用 root 更直观</text>

      <text x="6" y="258" font-size="7.5" fill="var(--fig-muted)">注意：alias 在正则 location 里行为特殊（需捕获组），别混用</text>
    </svg>
    <figcaption>root 把完整 URI 拼到目录后（多一层），alias 替换掉 location 匹配段；漏写结尾斜杠也会导致路径粘连</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
