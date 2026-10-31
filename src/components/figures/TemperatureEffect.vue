<script setup>
/**
 * Temperature 参数对采样分布的影响（题 5809）。
 *
 * 核心洞察：温度只是在 softmax 之前缩放 logits —— 低温度把概率差放大
 * （几乎总选最高分，输出稳定可复现），高温度把概率差抹平（更发散也更容易编）。
 * 它改变的是「怎么挑词」，不是「模型会多少」，所以调温度涨不了能力上限。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 258" role="img" aria-label="温度对概率分布的影响：低温分布尖锐几乎总选最高概率，高温分布平坦更发散，但两者都不改变模型能力上限">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">温度 = softmax 前缩放 logits：只改「怎么挑」，不改「会多少」</text>

      <!-- 低温分布 -->
      <rect x="6" y="20" width="160" height="100" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="13" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">T=0.2 低温｜几乎总选最高</text>
      <text x="12" y="49" font-size="7.5" fill="var(--fig-muted)">A</text>
      <rect x="30" y="42" width="114" height="7" rx="2" fill="var(--fig-node-a)" opacity=".75" />
      <text x="12" y="67" font-size="7.5" fill="var(--fig-muted)">B</text>
      <rect x="30" y="60" width="6" height="7" rx="2" fill="var(--fig-node-a)" opacity=".5" />
      <text x="12" y="85" font-size="7.5" fill="var(--fig-muted)">C</text>
      <rect x="30" y="78" width="3" height="7" rx="2" fill="var(--fig-node-a)" opacity=".4" />
      <text x="12" y="103" font-size="7.5" fill="var(--fig-muted)">D</text>
      <rect x="30" y="96" width="2" height="7" rx="1" fill="var(--fig-node-a)" opacity=".3" />

      <!-- 高温分布 -->
      <rect x="174" y="20" width="160" height="100" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="181" y="33" font-size="8" font-weight="700" fill="var(--fig-node-b)">T=1.5 高温｜明显分散</text>
      <text x="180" y="49" font-size="7.5" fill="var(--fig-muted)">A</text>
      <rect x="198" y="42" width="42" height="7" rx="2" fill="var(--fig-node-b)" opacity=".75" />
      <text x="180" y="67" font-size="7.5" fill="var(--fig-muted)">B</text>
      <rect x="198" y="60" width="35" height="7" rx="2" fill="var(--fig-node-b)" opacity=".7" />
      <text x="180" y="85" font-size="7.5" fill="var(--fig-muted)">C</text>
      <rect x="198" y="78" width="27" height="7" rx="2" fill="var(--fig-node-b)" opacity=".65" />
      <text x="180" y="103" font-size="7.5" fill="var(--fig-muted)">D</text>
      <rect x="198" y="96" width="20" height="7" rx="2" fill="var(--fig-node-b)" opacity=".6" />

      <text x="14" y="134" font-size="7.5" fill="var(--fig-text)">低温：放大差距 → 稳定、可复现，适合事实 / 代码 / 分类</text>
      <text x="14" y="146" font-size="7.5" fill="var(--fig-text)">高温：抹平差距 → 发散、有创意，也更容易凭空编造</text>

      <!-- 关键纠正 -->
      <rect x="6" y="154" width="328" height="50" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="167" font-size="8.5" font-weight="700" fill="#e5484d">关键：温度不改能力上限</text>
      <text x="14" y="180" font-size="7.5" fill="var(--fig-text)">尖峰还是那个尖峰：调高温度不会让模型「知道更多」</text>
      <text x="14" y="192" font-size="7.5" fill="var(--fig-text)">它只影响从这串分布里挑哪个词，模型本身没有重新训练</text>

      <rect x="6" y="212" width="328" height="28" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="225" font-size="8" font-weight="700" fill="var(--fig-node-d)">经验取值</text>
      <text x="14" y="237" font-size="7.5" fill="var(--fig-text)">事实 / 代码 0~0.3；头脑风暴 0.7~1；别指望调温度涨能力</text>

      <text x="6" y="250" font-size="7.5" fill="var(--fig-muted)">想让它更懂：换更强模型或给足材料，而不是拧温度旋钮</text>
    </svg>
    <figcaption>温度只缩放 logits：低温把概率差放大到几乎必选最高（稳但死板），高温抹平差距（活但易编）；两者都不改变模型能力上限</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
