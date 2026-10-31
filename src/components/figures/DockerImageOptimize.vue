<script setup>
/**
 * Docker 镜像构建优化（题 4767）。
 *
 * 核心洞察：两个目标 —— 镜像更小、构建更快（缓存命中）；
 * 而「后一层删除不能缩小前一层」是最容易犯的错，清理必须与安装在同一条 RUN 里。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 246" role="img" aria-label="镜像优化两目标：更小与更快，多阶段构建、alpine、同层清理、缓存顺序">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">两个目标：镜像更小、构建更快（缓存命中）</text>

      <rect x="6" y="20" width="328" height="40" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">让镜像更小</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">多阶段构建（编译工具不进最终镜像）· alpine/distroless 基础镜像</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">.dockerignore 排除 node_modules/.git；只 COPY 必要文件</text>

      <rect x="6" y="66" width="328" height="40" rx="5" fill="#e5484d" opacity=".12" />
      <text x="14" y="79" font-size="8.5" font-weight="700" fill="#e5484d">最关键的一条：清理必须与安装同层</text>
      <text x="14" y="92" font-size="7.5" fill="var(--fig-text)">每条 RUN 是一层，后一层删除不能缩小前一层</text>
      <text x="14" y="104" font-size="7.5" fill="var(--fig-text)">所以写成 RUN apt-get install ... &amp;&amp; rm -rf /var/lib/apt/lists/*</text>

      <rect x="6" y="112" width="328" height="46" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="125" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">让构建更快（缓存顺序）</text>
      <text x="14" y="138" font-size="7.5" fill="var(--fig-text)">变化少的放前面：先 COPY package.json → RUN npm ci → 最后 COPY 代码</text>
      <text x="14" y="150" font-size="7.5" fill="var(--fig-text)">这样改代码只让最后一层失效，依赖层仍命中缓存</text>
      <text x="14" y="162" font-size="7" fill="var(--fig-node-c)">BuildKit 的 --mount=type=cache 还能复用包管理器缓存</text>

      <rect x="6" y="168" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="181" font-size="8" font-weight="700" fill="var(--fig-node-c)">其他手段</text>
      <text x="14" y="193" font-size="7.5" fill="var(--fig-text)">固定基础镜像 digest（可复现）· buildx 跨平台 · 分层推送只推变化层</text>

      <rect x="6" y="210" width="328" height="18" rx="3" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="223" font-size="7.5" fill="var(--fig-text)">验证：docker history &lt;image&gt; 看哪一层最大</text>

      <text x="6" y="238" font-size="7.5" fill="var(--fig-muted)">提醒：层数少 ≠ 体积小，关键是每层不留垃圾</text>
    </svg>
    <figcaption>变小靠多阶段构建与 alpine；变快靠缓存顺序（先依赖后代码）；清理必须与安装在同一条 RUN，否则无效</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
