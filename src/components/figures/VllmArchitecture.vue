<script setup>
/**
 * vLLM 是什么、起什么作用（题 5820）。
 *
 * 核心洞察：推理慢不慢，瓶颈在 KV Cache 怎么管。
 * 朴素做法给每个请求预占「最大长度」的连续显存 → 大量浪费，只能静态凑 batch；
 * vLLM 用 PagedAttention 把 KV 切成固定大小的小块、按需分配（像操作系统分页），
 * 再叠上连续批处理，让显存和算力都尽量不闲着，吞吐因此数倍提升。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 250" role="img" aria-label="vLLM 用 PagedAttention 分页管理 KV Cache 与连续批处理，对比朴素推理的显存浪费">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">vLLM = 把 KV Cache 当内存分页管 + 请求像流水线一样进出</text>

      <rect x="6" y="22" width="328" height="52" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="35" font-size="8" font-weight="700" fill="#e5484d">朴素推理：两个浪费</text>
      <text x="14" y="48" font-size="7.5" fill="var(--fig-text)">① 按最大长度预占连续显存 → 实际只用了两三成，其余全闲着</text>
      <text x="14" y="61" font-size="7.5" fill="var(--fig-text)">② 静态 batch：整批等最慢那条结束才放新请求进来，GPU 常空转</text>

      <rect x="6" y="80" width="328" height="64" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="93" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">招式一：PagedAttention —— KV Cache 分页管理</text>
      <text x="14" y="106" font-size="7.5" fill="var(--fig-text)">KV 切成固定大小的 block，用到哪块才给哪块，不要求连续</text>
      <text x="14" y="119" font-size="7.5" fill="var(--fig-text)">碎片几乎消失；相同前缀还能共享 block（多轮对话省显存）</text>
      <text x="14" y="132" font-size="7.5" fill="var(--fig-text)">显存利用率从三四成拉到接近满，同样的卡能扛更多并发</text>

      <rect x="6" y="150" width="328" height="58" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="163" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">招式二：连续批处理（continuous batching）</text>
      <text x="14" y="176" font-size="7.5" fill="var(--fig-text)">每生成一步都重新组 batch：谁结束了谁退出，空位立刻补新请求</text>
      <text x="14" y="189" font-size="7.5" fill="var(--fig-text)">不再等最长的那条；长尾请求不再拖住所有人</text>
      <text x="14" y="202" font-size="7.5" fill="var(--fig-text)">短请求延迟明显下降，整体吞吐随并发线性抬升</text>

      <rect x="6" y="214" width="328" height="26" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="231" font-size="7.5" fill="var(--fig-node-d)">两者叠加，常见结果是同卡吞吐提升数倍，而单请求质量不变</text>
    </svg>
    <figcaption>vLLM 的两大机制：PagedAttention 把 KV Cache 分块按需分配（消碎片、可共享前缀），连续批处理让请求逐步进出 batch；对比朴素推理的预占浪费与静态等待</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
