<script setup>
/**
 * Prompt Engineering 的结构与原则（题 5806）。
 *
 * 核心洞察：结构化提示词把「角色/任务/输入/约束/格式」五块分开写，
 * 模型不用猜你要什么；原则里最容易被忽略的是「给例子」和「说清边界」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 268" role="img" aria-label="结构化提示词骨架：角色、任务、输入、约束、输出格式，以及关键原则">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">好提示词 = 把模型要猜的东西，全都写清楚</text>

      <rect x="6" y="22" width="328" height="18" rx="4" fill="var(--fig-node-a)" opacity=".16" />
      <text x="14" y="34" font-size="8" font-weight="700" fill="var(--fig-node-a)">结构化骨架（五块，缺一块就多一分猜测）</text>

      <rect x="6" y="44" width="328" height="24" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="59" font-size="7.5" fill="var(--fig-text)">① 角色：你是谁（专家身份决定用词与判断口径）</text>

      <rect x="6" y="72" width="328" height="24" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="87" font-size="7.5" fill="var(--fig-text)">② 任务：要做什么，一件事一条，别堆成大杂烩</text>

      <rect x="6" y="100" width="328" height="24" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="115" font-size="7.5" fill="var(--fig-text)">③ 输入：把资料贴上，并标明这是待处理的数据</text>

      <rect x="6" y="128" width="328" height="24" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="143" font-size="7.5" fill="var(--fig-text)">④ 约束：边界与禁区，长度、范围、不许做什么</text>

      <rect x="6" y="156" width="328" height="24" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="171" font-size="7.5" fill="var(--fig-text)">⑤ 格式：要 JSON 还是列表，给个样例最省事</text>

      <rect x="6" y="184" width="328" height="16" rx="4" fill="var(--fig-node-b)" opacity=".16" />
      <text x="14" y="196" font-size="8" font-weight="700" fill="var(--fig-node-b)">四条硬原则</text>

      <rect x="6" y="204" width="328" height="48" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="216" font-size="7.5" fill="var(--fig-text)">其一：给例子（few-shot）比形容词管用得多</text>
      <text x="14" y="228" font-size="7.5" fill="var(--fig-text)">其二：说清「不知道就说不知道」，不许硬编</text>
      <text x="14" y="240" font-size="7.5" fill="var(--fig-text)">其三：一步一件事，复杂任务拆成多轮</text>

      <text x="6" y="258" font-size="7.5" fill="var(--fig-muted)">其四：别用「写得专业点」这类要求，换成可检查的标准</text>
    </svg>
    <figcaption>结构化提示词把角色、任务、输入、约束、输出格式五块分开写；原则是给例子、说清不知道的边界、拆步执行、用可检验的标准替代空泛形容词</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
