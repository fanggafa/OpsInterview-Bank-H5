<script setup>
/**
 * LoRA 的结构与便宜的原因（题 5813）。
 *
 * 核心洞察：冻结原权重 W，只在旁边挂一条低秩旁路 ΔW = B×A。
 * 需要训的参数只有 r×(d+d) 级别，而不是 d×d —— 所以显存和算力都省；
 * 而 ΔW 可以随时摘掉或换一套，于是同一份底座能并行带多个 LoRA。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 258" role="img" aria-label="LoRA 结构：冻结原权重 W，旁路低秩分解 ΔW = B 乘 A，只需训练极少量参数，多套 LoRA 可并行复用同一底座">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">冻结 W + 旁挂低秩 ΔW = B×A，只训一小撮参数</text>

      <!-- 原权重 -->
      <rect x="6" y="22" width="104" height="76" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="36" font-size="8" font-weight="700" fill="var(--fig-node-a)">原权重 W（冻结）</text>
      <text x="14" y="50" font-size="7.5" fill="var(--fig-text)">d×d 全部参数</text>
      <text x="14" y="62" font-size="7.5" fill="var(--fig-text)">梯度不更新</text>
      <text x="14" y="74" font-size="7.5" fill="var(--fig-muted)">省掉优化器状态</text>
      <text x="14" y="86" font-size="7.5" fill="var(--fig-muted)">显存大头就在这里</text>

      <text x="114" y="64" font-size="9" fill="var(--fig-muted)">+</text>

      <!-- 旁路 -->
      <rect x="126" y="32" width="58" height="24" rx="4" fill="var(--fig-node-c)" opacity=".14" />
      <text x="133" y="42" font-size="8" font-weight="700" fill="var(--fig-node-c)">A　d×r</text>
      <text x="133" y="52" font-size="7.5" fill="var(--fig-text)">降维投影</text>

      <text x="188" y="48" font-size="8" fill="var(--fig-muted)">×</text>

      <rect x="198" y="32" width="58" height="24" rx="4" fill="var(--fig-node-d)" opacity=".14" />
      <text x="205" y="42" font-size="8" font-weight="700" fill="var(--fig-node-d)">B　r×d</text>
      <text x="205" y="52" font-size="7.5" fill="var(--fig-text)">升维回原形</text>

      <text x="258" y="48" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">= ΔW</text>
      <text x="126" y="66" font-size="7.5" fill="var(--fig-text)">r 取 8~64，参数只占原模型的 0.1%~1%</text>
      <text x="126" y="78" font-size="7.5" fill="var(--fig-muted)">推理时还能把 ΔW 并回 W，不增延迟</text>
      <text x="126" y="90" font-size="7.5" fill="var(--fig-muted)">只训这一小撮 → 省显存 + 省算力</text>

      <!-- 为什么便宜 -->
      <rect x="6" y="104" width="328" height="44" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="117" font-size="8" font-weight="700" fill="var(--fig-node-b)">为什么便宜</text>
      <text x="14" y="129" font-size="7.5" fill="var(--fig-text)">① 冻结 W：不存梯度、不存优化器状态（显存最大项）</text>
      <text x="14" y="141" font-size="7.5" fill="var(--fig-text)">② 低秩：训练参数量从 d×d 降到 r×(d+d) 量级</text>

      <rect x="6" y="154" width="328" height="32" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="167" font-size="8" font-weight="700" fill="var(--fig-node-c)">为什么能多套并行</text>
      <text x="14" y="179" font-size="7.5" fill="var(--fig-text)">每套 LoRA 只是一个小文件，底座共享：切换=换文件</text>

      <rect x="6" y="196" width="328" height="42" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="209" font-size="8.5" font-weight="700" fill="#e5484d">别搞混：LoRA 不是新模型</text>
      <text x="14" y="222" font-size="7.5" fill="var(--fig-text)">单套 LoRA 的能力仍受底座约束，它只调「表达习惯」</text>
      <text x="14" y="234" font-size="7.5" fill="var(--fig-muted)">缺知识靠 RAG，缺能力靠更强底座，别指望 LoRA 变强</text>

      <text x="6" y="250" font-size="7.5" fill="var(--fig-muted)">便宜不是魔法：省的是「重训整个模型」那部分开销</text>
    </svg>
    <figcaption>W 冻结不动，只在旁路上训低秩 A/B 构成 ΔW=B×A（参数量从 d×d 降到 r×d 量级），故省显存、还能一个底座挂多套 LoRA</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
