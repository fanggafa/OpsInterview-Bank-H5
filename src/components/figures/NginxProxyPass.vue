<script setup>
/**
 * Nginx proxy_pass 路径拼接规则图（彩色版）。
 * 情况 A（不带斜杠）用蓝，情况 B（带斜杠）用橙，形成强对比。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 206" role="img" aria-label="Nginx proxy_pass 带斜杠与不带斜杠的路径差异">
      <defs>
        <marker id="arrA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-node-a)" />
        </marker>
        <marker id="arrD" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-node-d)" />
        </marker>
      </defs>

      <text x="8" y="14" font-size="10" fill="var(--fig-muted)">核心：proxy_pass 后面带不带斜杠，转发的 URI 完全不同</text>

      <!-- 情况 A：不带斜杠（蓝） -->
      <rect x="8" y="24" width="158" height="72" rx="8" fill="var(--fig-node-a)" opacity=".08" />
      <rect x="8" y="24" width="158" height="72" rx="8" fill="none" stroke="var(--fig-node-a)" stroke-width="1.5" />
      <text x="16" y="41" font-size="10" font-weight="700" fill="var(--fig-node-a)">A. 不带尾部斜杠</text>
      <text x="18" y="58" font-size="9.5" fill="var(--fig-text)" v-pre>location /api/ {</text>
      <text x="30" y="72" font-size="9.5" fill="var(--fig-text)" v-pre>proxy_pass http://up;</text>
      <text x="18" y="86" font-size="9.5" fill="var(--fig-text)" v-pre>}</text>

      <text x="176" y="52" font-size="9.5" fill="var(--fig-text)">请求 /api/user</text>
      <path d="M176 58 L200 58" stroke="var(--fig-node-a)" stroke-width="1.6" marker-end="url(#arrA)" />
      <text x="206" y="62" font-size="10.5" font-weight="700" fill="var(--fig-node-a)">→ /api/user</text>
      <text x="206" y="76" font-size="9" fill="var(--fig-muted)">完整路径原样透传</text>
      <text x="206" y="89" font-size="9" fill="var(--fig-muted)">（保留 location 的路径）</text>

      <!-- 情况 B：带斜杠（橙） -->
      <rect x="8" y="110" width="158" height="72" rx="8" fill="var(--fig-node-d)" opacity=".1" />
      <rect x="8" y="110" width="158" height="72" rx="8" fill="none" stroke="var(--fig-node-d)" stroke-width="1.5" />
      <text x="16" y="127" font-size="10" font-weight="700" fill="var(--fig-node-d)">B. 带尾部斜杠</text>
      <text x="18" y="144" font-size="9.5" fill="var(--fig-text)" v-pre>location /api/ {</text>
      <text x="30" y="158" font-size="9.5" fill="var(--fig-text)" v-pre>proxy_pass http://up/;</text>
      <text x="18" y="172" font-size="9.5" fill="var(--fig-text)" v-pre>}</text>

      <text x="176" y="138" font-size="9.5" fill="var(--fig-text)">请求 /api/user</text>
      <path d="M176 144 L200 144" stroke="var(--fig-node-d)" stroke-width="1.6" marker-end="url(#arrD)" />
      <text x="206" y="148" font-size="10.5" font-weight="700" fill="var(--fig-node-d)">→ /user</text>
      <text x="206" y="162" font-size="9" fill="var(--fig-muted)">/api/ 被替换成 /，前缀剥掉</text>
      <text x="206" y="175" font-size="9" fill="var(--fig-muted)">（后端不需要 /api 前缀时用）</text>

      <!-- 结论 -->
      <rect x="8" y="190" width="324" height="12" rx="4" fill="var(--fig-node-c)" opacity=".16" />
      <text x="16" y="199" font-size="9.5" font-weight="600" fill="var(--fig-node-c)">
        口诀：带斜杠 = 截断前缀，不带斜杠 = 原样透传
      </text>
    </svg>
    <figcaption>写错一个斜杠就 404，排查时对比浏览器请求路径与后端 access log 的路径</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
