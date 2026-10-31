<script setup>
/**
 * Dockerfile 的 COPY 与 ADD（题 4636）。
 *
 * 核心洞察：ADD 多了「自动解压」与「远程 URL」两个额外行为，
 * 正因为这些行为「不透明」，官方建议默认用 COPY。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 240" role="img" aria-label="COPY 只复制，ADD 还会自动解压与支持远程 URL，因此默认推荐 COPY">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">ADD 多两个「隐式行为」—— 正因为不透明，默认该用 COPY</text>

      <rect x="6" y="20" width="160" height="88" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">COPY</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">只做一件事：复制文件</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">行为可预测、无隐式效果</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">支持 --chown、多阶段复制</text>
      <text x="14" y="82" font-size="7.5" fill="var(--fig-text)">缓存友好</text>
      <text x="14" y="94" font-size="7" fill="var(--fig-node-c)">默认推荐用它</text>

      <rect x="174" y="20" width="160" height="88" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">ADD</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">复制 + 两个额外行为</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">① 自动解压（tar/zip 类）</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">② 支持远程 URL</text>
      <text x="182" y="82" font-size="7.5" fill="#e5484d">行为不透明，易出意外</text>
      <text x="182" y="94" font-size="7" fill="#e5484d">远程 URL 还不会带权限信息</text>

      <!-- 为什么 -->
      <rect x="6" y="116" width="328" height="48" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="129" font-size="8.5" font-weight="700" fill="#e5484d">ADD 的两个坑</text>
      <text x="14" y="142" font-size="7.5" fill="var(--fig-text)">① 想把压缩包放进去却「被解压了」—— 结果目录结构和预期不符</text>
      <text x="14" y="154" font-size="7.5" fill="var(--fig-text)">② 用远程 URL 下载：无法校验、缓存失效、构建速度受网络影响</text>
      <text x="14" y="166" font-size="7" fill="var(--fig-node-c)">远程文件更推荐：RUN curl + chmod，能校验也能在一步内处理</text>

      <rect x="6" y="176" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="189" font-size="8" font-weight="700" fill="var(--fig-node-c)">什么时候确实该用 ADD</text>
      <text x="14" y="201" font-size="7.5" fill="var(--fig-text)">需要「本地 tar 自动解压到目标目录」且不想多写一步时（少而明确）</text>

      <text x="6" y="230" font-size="7.5" fill="var(--fig-muted)">规范建议：Dockerfile 里几乎只用 COPY，ADD 只在明确需要解压时用</text>
    </svg>
    <figcaption>COPY 只复制、行为可预测；ADD 会自动解压并支持远程 URL，正因不透明而容易出错，默认应使用 COPY</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
