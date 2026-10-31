<script setup>
/**
 * 幻觉的成因与缓解（题 5805）。
 *
 * 核心洞察：模型训练目标是「下一个 token 概率最高」，而不是「说真话」，
 * 所以编得流利是它的默认行为；缓解手段要按「能不能真给它事实」排序。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 270" role="img" aria-label="幻觉的成因与按有效性排序的缓解手段">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">幻觉：流畅地编，是训练目标决定的，不是偶发 bug</text>

      <rect x="6" y="22" width="328" height="52" rx="5" fill="#e5484d" opacity=".12" />
      <text x="14" y="35" font-size="8.5" font-weight="700" fill="#e5484d">成因：它优化的是「像不像人话」，不是「对不对」</text>
      <text x="14" y="47" font-size="7.5" fill="var(--fig-text)">训练目标是最大化下一个 token 概率，编一个也流畅</text>
      <text x="14" y="59" font-size="7.5" fill="var(--fig-text)">知识有截止日期；训练里没人要求它「不确定就说不知道」</text>
      <text x="14" y="71" font-size="7.5" fill="var(--fig-text)">分布外或细节问题，只能靠猜细节来补全句式</text>

      <rect x="6" y="82" width="328" height="18" rx="4" fill="var(--fig-node-a)" opacity=".16" />
      <text x="14" y="94" font-size="8" font-weight="700" fill="var(--fig-node-a)">缓解手段（按有效性从高到低）</text>

      <rect x="6" y="104" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".14" />
      <text x="14" y="116" font-size="7.5" fill="var(--fig-text)">① 给资料：RAG / 引用原文，把外部事实放进上下文</text>
      <text x="14" y="128" font-size="7.5" fill="var(--fig-muted)">最有效 —— 它答得出，是因为真的看到了依据</text>

      <rect x="6" y="140" width="328" height="24" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="155" font-size="7.5" fill="var(--fig-text)">② 让它带引用、可核对；没有出处就标为未知</text>

      <rect x="6" y="170" width="328" height="24" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="185" font-size="7.5" fill="var(--fig-text)">③ 降温 + 放宽约束：temperature 调低、明确说不确定</text>

      <rect x="6" y="200" width="328" height="24" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="215" font-size="7.5" fill="var(--fig-text)">④ 事后校验：工具跑一遍、正则/规则再查、人工兜底</text>

      <rect x="6" y="230" width="328" height="24" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="243" font-size="7.5" fill="var(--fig-text)">⑤ 降低期望：它会错，关键结论必须人来复核</text>

      <text x="6" y="258" font-size="7.5" fill="var(--fig-muted)">顺序别搞反：先给事实，再谈提示词技巧</text>
    </svg>
    <figcaption>幻觉源于「优化流畅而非真值」，加上知识截止与分布外猜补；缓解优先级是先给外部事实（RAG＋引用），再降温、加校验、人工复核</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
