<script setup>
/**
 * AI 应用「变慢」的分维度排查（题 5832）。
 *
 * 核心洞察：先把一次请求拆成网络 / 检索 / 推理三段，量出占比；
 * 再用 TTFT（等多久才出第一个字）与 tokens/s（出字后吐得多快）两个指标分流根因 ——
 * 前者指向排队与 prompt 太长，后者指向算力与显存。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 214" role="img" aria-label="AI 应用变慢拆成网络、检索、推理三段，并用 TTFT 与 tokens/s 分别定位根因">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">先把「慢」拆成三段耗时，别一上来就怀疑模型</text>

      <rect x="6" y="22" width="106" height="40" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="34" font-size="8" font-weight="700" fill="var(--fig-node-a)">① 网络/网关</text>
      <text x="14" y="47" font-size="7.5" fill="var(--fig-text)">DNS/TLS 握手</text>
      <text x="14" y="59" font-size="7.5" fill="var(--fig-text)">回源与网关排队</text>

      <rect x="117" y="22" width="106" height="40" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="125" y="34" font-size="8" font-weight="700" fill="var(--fig-node-b)">② 检索 RAG</text>
      <text x="125" y="47" font-size="7.5" fill="var(--fig-text)">向量检索 + 重排</text>
      <text x="125" y="59" font-size="7.5" fill="var(--fig-text)">最容易漏掉</text>

      <rect x="228" y="22" width="106" height="40" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="236" y="34" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ 模型推理</text>
      <text x="236" y="47" font-size="7.5" fill="var(--fig-text)">排队 + 逐步吐字</text>
      <text x="236" y="59" font-size="7.5" fill="var(--fig-text)">看并发与显存</text>

      <rect x="6" y="70" width="328" height="62" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="83" font-size="8" font-weight="700" fill="var(--fig-node-d)">两个指标分别指向不同根因 —— 先问用户是哪种「慢」</text>
      <text x="14" y="97" font-size="7.5" fill="var(--fig-text)">TTFT 高（等很久才出第一个字）→ 并发打满、prompt 太长、冷启动</text>
      <text x="14" y="110" font-size="7.5" fill="var(--fig-text)">tokens/s 低（出字后越吐越慢）→ 显存换页、量化降级、batch 互挤</text>
      <text x="14" y="124" font-size="7.5" fill="var(--fig-text)">两段都慢 → 总并发超过卡的上限，先看 GPU 利用率与队列长度</text>

      <rect x="6" y="140" width="328" height="42" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="153" font-size="7.5" fill="var(--fig-node-a)">怎么量：网关 access log 拿总耗时，应用埋点记首 token 与末 token</text>
      <text x="14" y="166" font-size="7.5" fill="var(--fig-text)">拆出三段再谈优化：哪一段占比最大，就先把钱和改动投在那一段</text>
      <text x="14" y="178" font-size="7.5" fill="var(--fig-muted)">没量占比就动手，多半是在优化自己刚猜的那一段</text>

      <text x="6" y="200" font-size="7.5" fill="var(--fig-muted)">变慢 ≠ 模型变笨：多数是并发、上下文或检索变重了</text>
    </svg>
    <figcaption>变慢先拆网络 / 检索 / 推理三段量占比；TTFT 高查排队与 prompt 长度，tokens/s 低查算力与显存</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
