<script setup>
/**
 * 为什么部署大模型要 GPU（题 5818）。
 *
 * 核心洞察：CPU 是「少数很聪明的核」，GPU 是「几千个不太聪明的核」。
 * 而大模型推理恰好是同一个乘加运算重复上亿次（矩阵乘法），
 * 并且每吐一个 token 都要把权重重新读一遍（吃显存带宽）——
 * 这两件事都指向「海量并行 + 高带宽」，正是 GPU 的长处。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 229" role="img" aria-label="CPU 少核强单核与 GPU 数千核并行的对比，以及矩阵乘法、显存带宽两个需求">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">不是 GPU 更聪明，是大模型要求「多核同时算 + 高带宽」</text>

      <rect x="6" y="22" width="158" height="62" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="35" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">CPU：8~64 个大核</text>
      <text x="14" y="48" font-size="7.5" fill="var(--fig-text)">高频、缓存大、单线程极强</text>
      <text x="14" y="60" font-size="7.5" fill="var(--fig-text)">擅长分支判断与串行逻辑</text>
      <text x="14" y="72" font-size="7.5" fill="var(--fig-text)">跑操作系统、调度、前后处理</text>

      <rect x="172" y="22" width="162" height="62" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="180" y="35" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">GPU：数千个小核</text>
      <text x="180" y="48" font-size="7.5" fill="var(--fig-text)">单核弱、频率低，但核海量</text>
      <text x="180" y="60" font-size="7.5" fill="var(--fig-text)">同样的运算让几千线程同时做</text>
      <text x="180" y="72" font-size="7.5" fill="var(--fig-text)">显存带宽是内存的十倍以上</text>

      <rect x="6" y="90" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="103" font-size="8" font-weight="700" fill="var(--fig-node-b)">需求一：矩阵乘法 —— 同一个乘加重复上亿次</text>
      <text x="14" y="116" font-size="7.5" fill="var(--fig-text)">token 向量 × 上亿权重，元素互不依赖，天生适合并行吞掉</text>

      <rect x="6" y="128" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="141" font-size="8" font-weight="700" fill="var(--fig-node-d)">需求二：显存带宽 —— 每吐一个字都要重读权重</text>
      <text x="14" y="154" font-size="7.5" fill="var(--fig-text)">算得快也没用，搬不动数据；CPU 内存通道几下就打满了</text>

      <rect x="6" y="170" width="328" height="36" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="183" font-size="7.5" fill="var(--fig-node-a)">分工：CPU 做调度与前后处理，GPU 做矩阵计算，一起才跑得动</text>
      <text x="14" y="196" font-size="7.5" fill="var(--fig-text)">用 CPU 跑同一模型：慢几十倍到上百倍，只够做玩具级演示</text>

      <text x="6" y="220" font-size="7.5" fill="var(--fig-muted)">所以「要 GPU」= 要并行算力 + 要高带宽，两样 CPU 都给不了</text>
    </svg>
    <figcaption>CPU 少核强单核擅长串行，GPU 数千核适合同构并行；大模型需要矩阵乘法（并行）与显存带宽（搬权重），缺了 GPU 会慢几十倍</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
