<script setup>
/**
 * SFT 与 RLHF 的关系（题 5812）。
 *
 * 核心洞察：预训练教「会说话」，SFT 教「听懂指令照做」（模仿示范答案），
 * RLHF 教「符合人类偏好」（从排序里学奖励，再按奖励优化）。
 * 关键差别不在阶段先后，而在数据形态与优化目标：SFT 是「抄标准答案」，
 * RLHF 是「按打分权衡哪个更好」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 264" role="img" aria-label="训练三阶段：预训练学语言、SFT 模仿示范回答、RLHF 按人类偏好排序优化；两者数据形态与优化目标不同">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">从「会说话」到「听话」到「讨喜」：三段训练各修一种毛病</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="32" font-size="8" font-weight="700" fill="var(--fig-node-a)">① 预训练 Pre-training</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">海量无标注文本 → 预测下个词，学语言与世界知识</text>

      <text x="168" y="60" font-size="8" fill="var(--fig-muted)">↓</text>

      <rect x="6" y="64" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="76" font-size="8" font-weight="700" fill="var(--fig-node-b)">② SFT 监督微调</text>
      <text x="14" y="89" font-size="7.5" fill="var(--fig-text)">人工写的「问题 → 理想回答」示范，教它听懂指令</text>

      <text x="168" y="104" font-size="8" fill="var(--fig-muted)">↓</text>

      <rect x="6" y="108" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="120" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ RLHF 人类反馈强化学习</text>
      <text x="14" y="133" font-size="7.5" fill="var(--fig-text)">同一问题多个回答 → 人类排序 → 训奖励模型再优化</text>

      <!-- 差别 -->
      <rect x="6" y="150" width="328" height="16" rx="3" fill="var(--fig-node-d)" opacity=".16" />
      <text x="14" y="161" font-size="8" font-weight="700" fill="var(--fig-node-d)">两者的真差别：数据形态 + 优化目标</text>

      <rect x="6" y="170" width="160" height="58" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="13" y="182" font-size="8" font-weight="700" fill="var(--fig-node-b)">SFT：学「照做」</text>
      <text x="13" y="194" font-size="7.5" fill="var(--fig-text)">数据：人工示范对话</text>
      <text x="13" y="205" font-size="7.5" fill="var(--fig-text)">目标：模仿示范作答</text>
      <text x="13" y="216" font-size="7.5" fill="var(--fig-muted)">本质：教它照做</text>

      <rect x="174" y="170" width="160" height="58" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="181" y="182" font-size="8" font-weight="700" fill="var(--fig-node-c)">RLHF：学「讨喜」</text>
      <text x="181" y="194" font-size="7.5" fill="var(--fig-text)">数据：多回答+人工排序</text>
      <text x="181" y="205" font-size="7.5" fill="var(--fig-text)">目标：奖励模型+PPO</text>
      <text x="181" y="216" font-size="7.5" fill="var(--fig-muted)">本质：教它讨喜</text>

      <rect x="6" y="234" width="328" height="22" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="248" font-size="7.5" fill="var(--fig-text)">顺序：预训练 → SFT → RLHF；SFT 教格式，RLHF 教偏好</text>

      <text x="6" y="258" font-size="7.5" fill="var(--fig-muted)">没有 SFT 直接做 RLHF，几乎不可能收敛</text>
    </svg>
    <figcaption>预训练学语言、SFT 用「问题-理想回答」示范教它听话、RLHF 用多回答的人工排序训奖励再优化；前者抄答案，后者按偏好打分</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
