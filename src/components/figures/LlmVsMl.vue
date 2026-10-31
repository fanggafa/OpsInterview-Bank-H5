<script setup>
/**
 * 大语言模型与传统机器学习模型的区别（题 5800）。
 *
 * 核心洞察：LLM 本质是「下一个 token 预测器」，训练目标决定了它优化的是
 * 「像不像人话」而不是「对不对」；传统 ML 则是一个任务一个专用模型。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 262" role="img" aria-label="对比传统机器学习与 LLM：任务形态、输入、训练方式、输出确定性的差异">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">LLM = 下一个 token 预测器；传统 ML = 特定任务的模型</text>

      <rect x="6" y="22" width="328" height="50" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="35" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">传统机器学习（ML）</text>
      <text x="14" y="47" font-size="7.5" fill="var(--fig-text)">一个任务一个模型：分类 / 回归 / 排序各自训练</text>
      <text x="14" y="59" font-size="7.5" fill="var(--fig-text)">输入人工特征，输出标签或数值，可解释性强</text>

      <rect x="6" y="76" width="328" height="52" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="89" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">大语言模型（LLM）</text>
      <text x="14" y="101" font-size="7.5" fill="var(--fig-text)">本质：给前文，预测下一个 token 的概率分布</text>
      <text x="14" y="113" font-size="7.5" fill="var(--fig-text)">输入自然语言 token，一套模型能干所有任务</text>
      <text x="14" y="125" font-size="7.5" fill="var(--fig-text)">输出靠采样，同样问题两次可能不同答案</text>

      <rect x="6" y="132" width="328" height="70" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="145" font-size="8" font-weight="700" fill="var(--fig-node-c)">四个维度上的差别</text>
      <text x="14" y="157" font-size="7.5" fill="var(--fig-text)">任务：固定专用任务 ↔ 任意任务（zero-shot）</text>
      <text x="14" y="169" font-size="7.5" fill="var(--fig-text)">输入：结构化特征 ↔ 自然语言 token 序列</text>
      <text x="14" y="181" font-size="7.5" fill="var(--fig-text)">训练：人工标注监督 ↔ 海量文本自监督</text>
      <text x="14" y="193" font-size="7.5" fill="var(--fig-text)">输出：确定性结果 ↔ 概率采样（同问不同答）</text>

      <rect x="6" y="206" width="328" height="36" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="219" font-size="8" font-weight="700" fill="#e5484d">最关键的一句</text>
      <text x="14" y="231" font-size="7.5" fill="var(--fig-text)">ML 优化「拟合真值」，LLM 优化「像不像人话」</text>

      <text x="6" y="252" font-size="7.5" fill="var(--fig-muted)">记住：会流畅地编，是训练目标决定的</text>
    </svg>
    <figcaption>传统 ML 一个任务一个专用模型、输出确定；LLM 用同一套参数预测下一个 token，靠海量文本自监督训练，能通吃任务但输出是概率采样</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
