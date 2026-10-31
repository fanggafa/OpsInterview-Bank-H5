<script setup>
/**
 * RAG 的两条链路（题 5802）。
 *
 * 核心洞察：RAG = 离线建库 + 在线检索，本质是「把答案的原料先备好，
 * 生成时只许看这些原料」，所以它治的是知识时效与幻觉，不是模型能力。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 258" role="img" aria-label="RAG 离线链路：切分、向量化、入库；在线链路：问题、检索、拼上下文、生成">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">离线建库一次，在线每条问题都走一遍检索 → 生成</text>

      <rect x="6" y="22" width="328" height="18" rx="4" fill="var(--fig-node-a)" opacity=".16" />
      <text x="14" y="34" font-size="8" font-weight="700" fill="var(--fig-node-a)">离线链路（建索引，一次性 / 定期跑）</text>

      <rect x="6" y="44" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="61" font-size="7.5" fill="var(--fig-text)">① 切分 chunk：按段落/标题切，留重叠避免切断语义</text>

      <rect x="6" y="74" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="91" font-size="7.5" fill="var(--fig-text)">② 向量化 embedding：每块变成一串数字（向量）</text>

      <rect x="6" y="104" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="121" font-size="7.5" fill="var(--fig-text)">③ 入库：向量写进向量库，原文本一起存（待回填）</text>

      <rect x="6" y="134" width="328" height="18" rx="4" fill="var(--fig-node-d)" opacity=".16" />
      <text x="14" y="146" font-size="8" font-weight="700" fill="var(--fig-node-d)">在线链路（每条提问都走）</text>

      <rect x="6" y="156" width="328" height="24" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="171" font-size="7.5" fill="var(--fig-text)">① 问题向量化 → ② 检索 top-k 相似片段</text>

      <rect x="6" y="184" width="328" height="24" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="199" font-size="7.5" fill="var(--fig-text)">③ 拼上下文：命中的片段塞进 prompt</text>

      <rect x="6" y="210" width="328" height="24" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="225" font-size="7.5" fill="var(--fig-text)">④ 生成：模型只依据这些片段作答</text>

      <text x="6" y="248" font-size="7.5" fill="var(--fig-muted)">治的是「不知道新知识」；检索不到时它照样编，所以还得配引用</text>
    </svg>
    <figcaption>RAG 分离线与在线两条链路：离线把文档切块、向量化、入库；在线先检索相关片段再拼进上下文让模型生成，用外部知识压住幻觉</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
