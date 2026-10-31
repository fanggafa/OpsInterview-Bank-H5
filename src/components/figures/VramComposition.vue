<script setup>
/**
 * 显存的组成与「不够用」的解法（题 5819）。
 *
 * 核心洞察：显存不是一块铁板 —— 权重是几乎固定的底仓，KV Cache 随上下文与并发
 * 线性上涨（这才是主战场），激活/临时缓冲随 batch 涨。
 * 解法按代价从低到高排：先动「少要一点」的免费开关，最后才谈换模型与加卡。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 220" role="img" aria-label="显存由权重、KV Cache、激活开销构成，六种解法按代价从低到高排序">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">显存 = 权重（底仓）+ KV Cache（主战场）+ 激活/临时</text>

      <rect x="6" y="22" width="328" height="58" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="34" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">先搞清三块各自怎么涨</text>
      <text x="14" y="47" font-size="7.5" fill="var(--fig-text)">权重：参数量 × 精度（FP16 约每 B 参数 2GB）—— 基本固定</text>
      <text x="14" y="59" font-size="7.5" fill="var(--fig-text)">KV Cache：随上下文长度 × 并发数线性涨 —— 最容易撑爆的一块</text>
      <text x="14" y="71" font-size="7.5" fill="var(--fig-text)">激活/临时：batch 与前向中间结果，batch 越大越吃紧</text>

      <rect x="6" y="88" width="328" height="96" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="101" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">六种解法，按代价从低到高</text>
      <text x="14" y="115" font-size="7.5" fill="var(--fig-text">① 砍上下文与输出：限 max_tokens、少塞无关文档 —— 零成本，先做</text>
      <text x="14" y="128" font-size="7.5" fill="var(--fig-text)">② 降并发：排队换稳定 —— 损失吞吐，不损失单请求质量</text>
      <text x="14" y="141" font-size="7.5" fill="var(--fig-text">③ 开量化 INT8/INT4：权重砍半到四分一 —— 精度略降，最常用</text>
      <text x="14" y="154" font-size="7.5" fill="var(--fig-text">④ 换分页引擎（PagedAttention/前缀共享）：消碎片、省重复</text>
      <text x="14" y="167" font-size="7.5" fill="var(--fig-text">⑤ 张量并行拆多卡：加卡分摊 —— 跨卡通信有损耗</text>
      <text x="14" y="180" font-size="7.5" fill="var(--fig-text">⑥ 换更小模型 / 蒸馏 —— 重新选型，代价最高</text>

      <text x="6" y="200" font-size="7.5" fill="var(--fig-muted)">顺序有讲究：先免费开关，再量化/换引擎，最后才加卡换模型</text>
      <text x="6" y="212" font-size="7.5" fill="var(--fig-muted)">OOM 先看 KV Cache：把并发与上下文压下来，往往立刻缓解</text>
    </svg>
    <figcaption>显存三块：权重（参数量×精度）基本固定，KV Cache 随上下文×并发线性增长，激活随 batch；解法按代价排序：砍上下文、降并发、量化、分页引擎、张量并行、换小模型</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
