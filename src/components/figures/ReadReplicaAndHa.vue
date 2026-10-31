<script setup>
/**
 * 只读实例与多可用区高可用能同时用吗（题 3421）。
 *
 * 核心洞察：两者不是互斥的 —— 多可用区管「主库的高可用」，
 * 只读实例管「查询分流」；要规划的是「只读实例放哪、是否也跨可用区」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 248" role="img" aria-label="多可用区主备保证高可用，只读实例用于查询分流，两者可组合但要规划位置与数量">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">两者互补：多可用区管「主库别挂」，只读实例管「查询别压主库」</text>

      <rect x="6" y="20" width="160" height="80" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">多可用区高可用</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">主库在主 AZ，备库在他 AZ</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">故障自动切换（RTO 分钟级）</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">解决：单 AZ 故障导致全停</text>
      <text x="14" y="82" font-size="7.5" fill="var(--fig-text)">代价：同步复制跨 AZ 有延迟</text>
      <text x="14" y="94" font-size="7" fill="var(--fig-node-c)">关注：切换是否丢数据（RPO）</text>

      <rect x="174" y="20" width="160" height="80" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">只读实例</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">从主库异步复制</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">专门承载查询/报表</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">解决：读压力压垮主库</text>
      <text x="182" y="82" font-size="7.5" fill="#e5484d">注意：有延迟，可能读到旧数据</text>
      <text x="182" y="94" font-size="7" fill="var(--fig-node-c)">关注：延迟与一致性要求</text>

      <!-- 组合规划 -->
      <rect x="6" y="110" width="328" height="50" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="123" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">组合时的三个规划点</text>
      <text x="14" y="136" font-size="7.5" fill="var(--fig-text)">① 只读实例是否也跨 AZ（单 AZ 全挂就不能分流了）</text>
      <text x="14" y="148" font-size="7.5" fill="var(--fig-text)">② 只读实例挂到「主库还是备库」—— 决定切换后是否还可用</text>
      <text x="14" y="160" font-size="7" fill="var(--fig-node-c)">③ 延迟容忍度：强一致读必须回主库，只读实例只做「可容忍延迟」查询</text>

      <rect x="6" y="172" width="328" height="34" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="185" font-size="8" font-weight="700" fill="#e5484d">最常见的误配</text>
      <text x="14" y="197" font-size="7.5" fill="var(--fig-text)">只读实例全部在主 AZ → 主 AZ 故障时「高可用切过去了但读能力没了」</text>

      <rect x="6" y="214" width="328" height="18" rx="3" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="227" font-size="7.5" fill="var(--fig-text)">实践：至少一个只读实例放在「非主 AZ」且随切换自动接上</text>

      <text x="6" y="240" font-size="7.5" fill="var(--fig-muted)">注意：读写分离要在应用层做（或中间件），数据库本身不会自动分流</text>
    </svg>
    <figcaption>多可用区保主库高可用、只读实例做查询分流，两者可组合；关键是只读实例也要跨可用区并考虑延迟一致性</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
