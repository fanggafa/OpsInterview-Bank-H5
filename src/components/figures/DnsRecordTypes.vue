<script setup>
/**
 * DNS 常用记录类型对照图（彩色版）。
 * 每种记录类型配一个专属色，帮助靠颜色记忆。
 */
const ROWS = [
  { type: 'A', color: 'var(--fig-node-a)', desc: '域名 → IPv4 地址', use: '最常用，网站解析' },
  { type: 'AAAA', color: 'var(--fig-node-b)', desc: '域名 → IPv6 地址', use: 'IPv6 双栈' },
  { type: 'CNAME', color: 'var(--fig-node-c)', desc: '别名 → 另一个域名', use: 'CDN、多域名指向' },
  { type: 'MX', color: 'var(--fig-node-d)', desc: '邮件服务器，带优先级', use: '邮件收发' },
  { type: 'NS', color: 'var(--fig-node-a)', desc: '该域由哪些 DNS 负责', use: '域名托管、子域委派' },
  { type: 'TXT', color: 'var(--fig-node-b)', desc: '文本记录', use: '域名验证、SPF' },
]
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 208" role="img" aria-label="DNS 常用记录类型对照">
      <!-- 表头 -->
      <rect x="8" y="6" width="50" height="26" rx="6" fill="var(--fig-node-a)" opacity=".12" />
      <rect x="62" y="6" width="118" height="26" rx="6" fill="var(--fig-stroke)" opacity=".22" />
      <rect x="184" y="6" width="148" height="26" rx="6" fill="var(--fig-stroke)" opacity=".22" />
      <g font-size="10.5" fill="var(--fig-text)" font-weight="700">
        <text x="33" y="23" text-anchor="middle">类型</text>
        <text x="121" y="23" text-anchor="middle">作用</text>
        <text x="258" y="23" text-anchor="middle">典型用途</text>
      </g>

      <!-- 数据行：每行左侧色条标出类型 -->
      <g v-for="(r, i) in ROWS" :key="r.type">
        <rect
          x="8"
          :y="40 + i * 28"
          width="322"
          height="24"
          rx="5"
          :fill="r.color"
          :opacity="i % 2 === 0 ? '.07' : '.03'"
        />
        <!-- 色点：放在最左，与类型名拉开距离 -->
        <circle cx="20" :cy="52 + i * 28" r="4" :fill="r.color" />
        <!-- 类型名左对齐（不是居中），避免长单词压到色点上 -->
        <text
          x="32"
          :y="56 + i * 28"
          font-size="10.5"
          font-weight="700"
          :fill="r.color"
        >
          {{ r.type }}
        </text>
        <text x="78" :y="56 + i * 28" font-size="10" fill="var(--fig-text)" opacity=".9">
          {{ r.desc }}
        </text>
        <text x="196" :y="56 + i * 28" font-size="9.5" fill="var(--fig-muted)">
          {{ r.use }}
        </text>
      </g>
    </svg>
    <figcaption>记忆点：A/AAAA 是「地址」，CNAME 是「别名」，MX 是「邮件」，NS 是「谁负责」</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
