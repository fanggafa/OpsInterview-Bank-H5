<script setup>
/**
 * CMS 与 G1 的区别（题 1806）。
 *
 * 核心洞察：CMS 是「分代 + 标记清除」（碎片多、停顿不可预测），
 * G1 是「分区 + 可预测停顿模型」—— 这才是 JDK 9 后默认 G1 的原因。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 246" role="img" aria-label="CMS 分代标记清除易碎片化、停顿不可控；G1 分区化并可设定目标停顿时间">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">CMS 管「低停顿」但碎片与不可控，G1 管「可控停顿」—— 后者才适合大堆</text>

      <rect x="6" y="20" width="160" height="88" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">CMS（JDK 8 常用）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">分代 + 标记清除</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">并发收集，停顿短</text>
      <text x="14" y="70" font-size="7.5" fill="#e5484d">标记清除不整理 → 碎片化</text>
      <text x="14" y="82" font-size="7.5" fill="#e5484d">碎片多了退化为 Full GC（长停顿）</text>
      <text x="14" y="94" font-size="7.5" fill="#e5484d">浮动垃圾、并发模式失败</text>
      <text x="14" y="106" font-size="7" fill="var(--fig-node-c)">JDK 14 起已废弃</text>

      <rect x="174" y="20" width="160" height="88" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">G1（JDK 9+ 默认）</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">分 Region（不按物理分代）</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">复制整理 → 无碎片问题</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">可设 -XX:MaxGCPauseMillis 目标</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-text)">按「回收价值」优先清理垃圾多的区</text>
      <text x="182" y="94" font-size="7.5" fill="var(--fig-node-b)">大堆（数 GB~数十 GB）更稳</text>
      <text x="182" y="106" font-size="7" fill="var(--fig-node-c)">代价：单次停顿可能略长但可预测</text>

      <!-- 为什么换 G1 -->
      <rect x="6" y="118" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="131" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">JDK 9 之后推荐 G1 的三个理由</text>
      <text x="14" y="144" font-size="7.5" fill="var(--fig-text)">① 停顿可预测：能按目标停顿时间做取舍，而不是「碰运气」</text>
      <text x="14" y="156" font-size="7.5" fill="var(--fig-text)">② 无碎片问题：复制整理，不会像 CMS 那样退化成长停顿</text>

      <rect x="6" y="170" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="183" font-size="8" font-weight="700" fill="var(--fig-node-d)">三个理由中的第三条</text>
      <text x="14" y="195" font-size="7.5" fill="var(--fig-text)">③ 大堆更友好：Region 机制让几十 GB 堆也能控制停顿</text>

      <rect x="6" y="212" width="328" height="20" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="226" font-size="7.5" fill="var(--fig-text)">注意：小堆（&lt; 4GB）且追求极低停顿，有时仍会用 Parallel/ZGC，看场景</text>

      <text x="6" y="242" font-size="7.5" fill="var(--fig-muted)">选型：低延迟要求极高 → ZGC；吞吐优先 → Parallel；通用 → G1</text>
    </svg>
    <figcaption>CMS 标记清除会产生碎片并退化为长 Full GC，JDK 14 已废弃；G1 分区复制整理、可设停顿目标，大堆更稳</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
