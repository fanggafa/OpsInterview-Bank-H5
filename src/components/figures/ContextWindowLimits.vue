<script setup>
/**
 * 上下文窗口是什么、受哪些限制（题 5810）。
 *
 * 核心洞察：窗口是一个「共享预算」，system 提示、历史对话、本次问题、
 * 预留输出这四块都从同一份额度里扣 —— 不是每样各有各的额度。
 * 窗口上限由四股力量一起決定：费用、显存、注意力衰减、延迟。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 268" role="img" aria-label="上下文窗口由系统提示、历史对话、本次问题、预留输出共享；上限受费用、显存、注意力衰减、延迟四重限制">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">窗口 = 一次对话里模型能「看得见」的全部 token</text>

      <!-- 共享预算条 -->
      <rect x="6" y="20" width="328" height="40" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="32" font-size="8" font-weight="700" fill="var(--fig-node-a)">同一份额度，四块一起扣</text>
      <rect x="14" y="38" width="68" height="12" rx="2" fill="var(--fig-node-a)" opacity=".6" />
      <text x="16" y="47.5" font-size="7.5" fill="var(--fig-text)">system</text>
      <rect x="84" y="38" width="110" height="12" rx="2" fill="var(--fig-node-b)" opacity=".55" />
      <text x="87" y="47.5" font-size="7.5" fill="var(--fig-text)">历史对话</text>
      <rect x="196" y="38" width="60" height="12" rx="2" fill="var(--fig-node-c)" opacity=".55" />
      <text x="199" y="47.5" font-size="7.5" fill="var(--fig-text)">本次问题</text>
      <rect x="258" y="38" width="68" height="12" rx="2" fill="var(--fig-node-d)" opacity=".55" />
      <text x="261" y="47.5" font-size="7.5" fill="var(--fig-text)">预留输出</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">超了会截断 / 报错；历史越长，留给回答的空间越小</text>

      <!-- 四限制 -->
      <rect x="6" y="68" width="160" height="44" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="13" y="80" font-size="8" font-weight="700" fill="var(--fig-node-a)">限制① 费用</text>
      <text x="13" y="92" font-size="7.5" fill="var(--fig-text)">token 越多越贵，每轮都重发历史</text>
      <text x="13" y="103" font-size="7.5" fill="var(--fig-muted)">长上下文 = 每轮都付费读一遍</text>

      <rect x="174" y="68" width="160" height="44" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="181" y="80" font-size="8" font-weight="700" fill="var(--fig-node-b)">限制② 显存</text>
      <text x="181" y="92" font-size="7.5" fill="var(--fig-text)">注意力矩阵随长度平方增长</text>
      <text x="181" y="103" font-size="7.5" fill="var(--fig-muted)">KV cache 吃显存，有硬上限</text>

      <rect x="6" y="118" width="160" height="44" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="13" y="130" font-size="8" font-weight="700" fill="var(--fig-node-c)">限制③ 注意力衰减</text>
      <text x="13" y="142" font-size="7.5" fill="var(--fig-text)">中段信息最容易被忽略</text>
      <text x="13" y="153" font-size="7.5" fill="var(--fig-muted)">「塞满窗口」不等于「全都读到」</text>

      <rect x="174" y="118" width="160" height="44" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="181" y="130" font-size="8" font-weight="700" fill="var(--fig-node-d)">限制④ 延迟</text>
      <text x="181" y="142" font-size="7.5" fill="var(--fig-text)">输入越长，首字越慢</text>
      <text x="181" y="153" font-size="7.5" fill="var(--fig-muted)">交互场景下体验先崩</text>

      <rect x="6" y="170" width="328" height="42" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="183" font-size="8.5" font-weight="700" fill="#e5484d">常见误区</text>
      <text x="14" y="195" font-size="7.5" fill="var(--fig-text)">窗口大 ≠ 能塞：塞到有效上限前，先过了「注意力」这一关</text>
      <text x="14" y="206" font-size="7.5" fill="var(--fig-text)">正确做法：摘要素、检索相关片段，而不是把原文全贴进去</text>

      <rect x="6" y="220" width="328" height="28" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="233" font-size="8" font-weight="700" fill="var(--fig-node-a)">一句话</text>
      <text x="14" y="245" font-size="7.5" fill="var(--fig-text)">窗口是预算表，四块共享；四个限制彼此制约</text>

      <text x="6" y="258" font-size="7.5" fill="var(--fig-muted)">预算表要会算：历史占得多，回答空间就少</text>
    </svg>
    <figcaption>窗口是 system、历史、问题、输出共享的一份预算；上限由费用、显存、注意力衰减、延迟共同决定，塞满不等于读全</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
