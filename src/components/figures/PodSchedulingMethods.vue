<script setup>
/**
 * 把 Pod 调度到指定节点的方法（题 4755）。
 *
 * 核心洞察：五种方法从「最简单」到「最灵活」，关键区别在
 * nodeName 绕过调度器（不做资源检查），其他方法都走正常调度流程。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 238" role="img" aria-label="五种调度到指定节点的方法：nodeName、nodeSelector、亲和性、污点容忍、反亲和">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">从最简单到最灵活，注意 nodeName 会绕过调度器</text>

      <rect x="6" y="22" width="328" height="30" rx="4" fill="#e5484d" opacity=".12" />
      <text x="14" y="35" font-size="8" font-weight="700" fill="#e5484d">① nodeName（写死节点名）</text>
      <text x="14" y="47" font-size="7.5" fill="var(--fig-text)">直接指定 spec.nodeName → 绕过调度器，不做资源检查</text>

      <rect x="6" y="56" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="69" font-size="8" font-weight="700" fill="var(--fig-node-a)">② nodeSelector（按标签精确匹配）</text>
      <text x="14" y="81" font-size="7.5" fill="var(--fig-text)">最简单可靠的硬约束：nodeSelector: { disktype: ssd }</text>

      <rect x="6" y="90" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="103" font-size="8" font-weight="700" fill="var(--fig-node-b)">③ 节点亲和性（支持表达式与软约束）</text>
      <text x="14" y="115" font-size="7.5" fill="var(--fig-text)">required/preferred + In/NotIn/Exists，比 nodeSelector 灵活</text>

      <rect x="6" y="124" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="137" font-size="8" font-weight="700" fill="var(--fig-node-c)">④ 污点容忍（节点只接受特定 Pod）</text>
      <text x="14" y="149" font-size="7.5" fill="var(--fig-text)">节点打 taint，Pod 加 toleration → 默认挡住其他 Pod</text>

      <rect x="6" y="158" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="171" font-size="8" font-weight="700" fill="var(--fig-node-d)">⑤ Pod 反亲和（让副本避开某节点）</text>
      <text x="14" y="183" font-size="7.5" fill="var(--fig-text)">podAntiAffinity + topologyKey 让同服务副本分散</text>

      <rect x="6" y="194" width="328" height="28" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="212" font-size="7.5" fill="var(--fig-text)">生产建议：用 nodeSelector/亲和性，别写 nodeName（节点下线就废）</text>

      <text x="6" y="230" font-size="7.5" fill="var(--fig-muted)">调不过去的常见原因：节点有污点、资源不足、标签写错、节点 NotReady</text>
    </svg>
    <figcaption>五种方法：nodeName（绕过调度器）、nodeSelector（精确匹配）、亲和性（表达式/软约束）、污点容忍、Pod 反亲和</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
