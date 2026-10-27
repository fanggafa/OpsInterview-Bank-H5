<script setup>
/** Nginx proxy_pass 路径拼接规则图 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 200" role="img" aria-label="Nginx proxy_pass 带斜杠与不带斜杠的路径差异">
      <g fill="currentColor" font-size="10.5">
        <text x="8" y="14" font-size="10" opacity=".7">核心：proxy_pass 后面带不带斜杠，转发的 URI 完全不同</text>

        <!-- 情况 A：不带斜杠 -->
        <rect x="8" y="26" width="160" height="70" rx="6" fill="none" stroke="currentColor" stroke-width="1.3" opacity=".7" />
        <text x="16" y="43" font-size="10" font-weight="700">A. 不带尾部斜杠</text>
        <text x="16" y="60" font-size="9.5" opacity=".9" v-pre>location /api/ {</text>
        <text x="26" y="74" font-size="9.5" opacity=".9" v-pre>proxy_pass http://up;</text>
        <text x="16" y="88" font-size="9.5" opacity=".9" v-pre>}</text>

        <text x="178" y="46" font-size="9.5" opacity=".8">请求 /api/user</text>
        <path d="M178 52 L204 52" stroke="currentColor" stroke-width="1.2" opacity=".5" />
        <text x="208" y="56" font-size="10" font-weight="600" fill="currentColor">→ /api/user</text>
        <text x="208" y="70" font-size="9" opacity=".7">完整路径原样透传</text>
        <text x="208" y="84" font-size="9" opacity=".7">（不带前缀时保留 location 的路径）</text>

        <!-- 情况 B：带斜杠 -->
        <rect x="8" y="110" width="160" height="70" rx="6" fill="none" stroke="currentColor" stroke-width="1.3" opacity=".7" />
        <text x="16" y="127" font-size="10" font-weight="700">B. 带尾部斜杠</text>
        <text x="16" y="144" font-size="9.5" opacity=".9" v-pre>location /api/ {</text>
        <text x="26" y="158" font-size="9.5" opacity=".9" v-pre>proxy_pass http://up/;</text>
        <text x="16" y="172" font-size="9.5" opacity=".9" v-pre>}</text>

        <text x="178" y="130" font-size="9.5" opacity=".8">请求 /api/user</text>
        <path d="M178 136 L204 136" stroke="currentColor" stroke-width="1.2" opacity=".5" />
        <text x="208" y="140" font-size="10" font-weight="600" fill="currentColor">→ /user</text>
        <text x="208" y="154" font-size="9" opacity=".7">把 /api/ 替换成 /，前缀被剥掉</text>
        <text x="208" y="168" font-size="9" opacity=".7">（后端不需要 /api 前缀时用这个）</text>
      </g>
    </svg>
    <figcaption>口诀：带斜杠 = 截断前缀，不带斜杠 = 原样透传。写错一个斜杠就 404</figcaption>
  </figure>
</template>

<style scoped>
.fig {
  margin: 10px 0 2px;
  padding: 8px 6px 6px;
  border-radius: var(--radius-sm);
  background: var(--c-card);
  border: 1px solid var(--c-border);
}
.fig svg {
  display: block;
  width: 100%;
  height: auto;
  color: var(--c-text-2);
}
.fig figcaption {
  margin-top: 4px;
  font-size: 11px;
  line-height: 1.5;
  color: var(--c-text-3);
  text-align: center;
}
</style>
