<script setup>
/** Nginx location 匹配优先级图 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 230" role="img" aria-label="Nginx location 匹配优先级顺序">
      <g fill="currentColor" font-size="10.5">
        <text x="8" y="14" font-size="10" opacity=".7">从高到低依次尝试，命中即停（除 ^~ 与 = 的例外规则）</text>

        <!-- 1 = 精确 -->
        <rect x="8" y="24" width="30" height="24" rx="4" fill="currentColor" opacity=".9" />
        <text x="23" y="41" text-anchor="middle" fill="var(--c-card)" font-weight="700">1</text>
        <text x="46" y="40" font-weight="700">= 精确匹配</text>
        <text x="150" y="40" opacity=".8">location = /api { }</text>
        <text x="300" y="40" font-size="9" opacity=".6">命中即终止</text>

        <!-- 2 ^~ -->
        <rect x="8" y="54" width="30" height="24" rx="4" fill="currentColor" opacity=".75" />
        <text x="23" y="71" text-anchor="middle" fill="var(--c-card)" font-weight="700">2</text>
        <text x="46" y="70" font-weight="600">^~ 前缀匹配（不再查正则）</text>
        <text x="150" y="70" opacity=".8">location ^~ /static/</text>
        <text x="300" y="70" font-size="9" opacity=".6">跳过正则</text>

        <!-- 3 正则 -->
        <rect x="8" y="84" width="30" height="24" rx="4" fill="currentColor" opacity=".6" />
        <text x="23" y="101" text-anchor="middle" fill="var(--c-card)" font-weight="700">3</text>
        <text x="46" y="100" font-weight="600">~ / ~* 正则匹配</text>
        <text x="150" y="100" opacity=".8">location ~ \.php$</text>
        <text x="300" y="100" font-size="9" opacity=".6">按书写顺序第一个</text>

        <!-- 4 普通前缀 -->
        <rect x="8" y="114" width="30" height="24" rx="4" fill="currentColor" opacity=".45" />
        <text x="23" y="131" text-anchor="middle" fill="var(--c-card)" font-weight="700">4</text>
        <text x="46" y="130" font-weight="600">普通前缀匹配</text>
        <text x="150" y="130" opacity=".8">location /api/</text>
        <text x="300" y="130" font-size="9" opacity=".6">取最长前缀</text>

        <!-- 5 / -->
        <rect x="8" y="144" width="30" height="24" rx="4" fill="currentColor" opacity=".3" />
        <text x="23" y="161" text-anchor="middle" fill="var(--c-text)" font-weight="700">5</text>
        <text x="46" y="160" font-weight="600">location / （兜底）</text>
        <text x="150" y="160" opacity=".8">所有未命中的请求</text>
        <text x="300" y="160" font-size="9" opacity=".6">最后兜底</text>

        <!-- 关键提示 -->
        <rect x="8" y="180" width="324" height="42" rx="6" fill="currentColor" opacity=".1" />
        <text x="18" y="197" font-size="10" font-weight="600">顺序记牢（从高到低）：</text>
        <text x="18" y="213" font-size="10.5" opacity=".85">= → ^~ → 正则(~ / ~*) → 普通前缀 → /</text>
      </g>
    </svg>
    <figcaption>^~ 的意义：命中前缀后就不再尝试正则（性能优先）；= 用于追求极致精确</figcaption>
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
