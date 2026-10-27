<script setup>
/**
 * Nginx location 匹配优先级图（彩色版）。
 * 用「颜色由暖到冷」表达优先级由高到低，一眼看出顺序。
 */
const LEVELS = [
  { no: '1', mark: '=', label: '精确匹配', code: 'location = /api { }', note: '命中即终止', color: 'var(--fig-node-d)' },
  { no: '2', mark: '^~', label: '前缀匹配（不再查正则）', code: 'location ^~ /static/', note: '跳过正则', color: 'var(--fig-node-c)' },
  { no: '3', mark: '~ / ~*', label: '正则匹配', code: 'location ~ \\.php$', note: '按书写顺序第一个', color: 'var(--fig-node-a)' },
  { no: '4', mark: '前缀', label: '普通前缀匹配', code: 'location /api/', note: '取最长前缀', color: 'var(--fig-node-b)' },
  { no: '5', mark: '/', label: '兜底', code: '所有未命中的请求', note: '最后兜底', color: 'var(--fig-muted)' },
]
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 232" role="img" aria-label="Nginx location 匹配优先级顺序">
      <text x="8" y="14" font-size="10" fill="var(--fig-muted)">从高到低依次尝试，命中即停（^~ 与 = 除外规则）</text>

      <g v-for="(lv, i) in LEVELS" :key="lv.no">
        <!-- 左侧序号块：颜色表达优先级 -->
        <rect :x="8" :y="24 + i * 32" width="30" height="26" rx="7" :fill="lv.color" :opacity="i === 4 ? '.35' : '.95'" />
        <text
          :x="23"
          :y="41 + i * 32"
          text-anchor="middle"
          font-size="11"
          font-weight="700"
          :fill="i === 4 ? 'var(--fig-text)' : '#fff'"
        >
          {{ lv.no }}
        </text>

        <!-- 优先级条：长度递减，直观表示「越靠上越优先」 -->
        <rect :x="44" :y="24 + i * 32" :width="292 - i * 26" height="26" rx="6" :fill="lv.color" :opacity="i === 4 ? '.05' : '.08'" />

        <text :x="52" :y="41 + i * 32" font-size="10.5" font-weight="700" :fill="lv.color">
          {{ lv.mark }}
        </text>
        <text :x="104" :y="41 + i * 32" font-size="10" fill="var(--fig-text)">{{ lv.label }}</text>
        <text :x="248" :y="41 + i * 32" font-size="9" fill="var(--fig-muted)">{{ lv.note }}</text>
      </g>

      <!-- 结论条 -->
      <rect x="8" y="188" width="324" height="38" rx="8" fill="var(--fig-node-a)" opacity=".1" />
      <rect x="8" y="188" width="324" height="38" rx="8" fill="none" stroke="var(--fig-node-a)" stroke-width="1.2" opacity=".5" />
      <text x="18" y="204" font-size="10" font-weight="700" fill="var(--fig-node-a)">顺序记牢（从高到低）：</text>
      <text x="18" y="219" font-size="10.5" fill="var(--fig-text)">= → ^~ → 正则(~ / ~*) → 普通前缀 → /</text>
    </svg>
    <figcaption>^~ 的意义：命中前缀后就不再尝试正则（性能优先）；= 用于追求极致精确</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
