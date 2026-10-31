<script setup>
/**
 * Agent 与普通模型调用的区别（题 5803）。
 *
 * 核心洞察：普通调用是「一问一答」，Agent 是把模型放进一个循环里，
 * 让它自己决定下一步调什么工具 —— 差别在「谁来决定动作」，不在模型本身。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 258" role="img" aria-label="单轮问答与 Agent ReAct 循环对比：思考、行动、观察、再思考">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">普通调用一问一答；Agent 把模型放进循环里反复决策</text>

      <rect x="6" y="22" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="35" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">普通模型调用（单轮）</text>
      <text x="14" y="47" font-size="7.5" fill="var(--fig-text)">输入 prompt → 一次前向 → 输出文本 → 结束</text>
      <text x="14" y="59" font-size="7.5" fill="var(--fig-text)">能做什么、能看什么，全由调用方在 prompt 里定死</text>

      <rect x="6" y="76" width="328" height="18" rx="4" fill="var(--fig-node-a)" opacity=".16" />
      <text x="14" y="88" font-size="8" font-weight="700" fill="var(--fig-node-a)">Agent 的 ReAct 循环（多轮，直到收敛）</text>

      <rect x="6" y="98" width="328" height="24" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="113" font-size="7.5" fill="var(--fig-text)">① Thought 思考：缺什么信息？该调哪个工具？</text>

      <rect x="6" y="126" width="328" height="24" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="141" font-size="7.5" fill="var(--fig-text)">② Action 行动：真的去查库 / 跑命令 / 调 API</text>

      <rect x="6" y="154" width="328" height="24" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="169" font-size="7.5" fill="var(--fig-text)">③ Observation 观察：把工具真实返回塞回上下文</text>

      <rect x="6" y="182" width="328" height="24" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="197" font-size="7.5" fill="var(--fig-text)">④ 回到 ①：信息够了才输出最终答案</text>

      <rect x="6" y="212" width="328" height="32" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="225" font-size="7.5" fill="var(--fig-text)">行动带回的是环境真实反馈，不是模型的想象</text>
      <text x="14" y="237" font-size="7.5" fill="var(--fig-text)">所以要设最大轮数，防止死循环烧 token</text>

      <text x="6" y="248" font-size="7.5" fill="var(--fig-muted)">区别一句话：谁决定下一步 —— 人写死，还是模型自己判断</text>
    </svg>
    <figcaption>普通调用一次前向就结束；Agent 用 ReAct 循环「思考→行动→观察→再思考」，工具返回真实结果参与决策，因此要限最大轮数</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
