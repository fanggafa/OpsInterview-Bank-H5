<script setup>
/**
 * iptables 规则顺序决定结果（题 1233）。
 *
 * 核心洞察：iptables 是「自上而下、首条匹配即生效」，
 * 所以「允许」写在「拒绝」之后就等于没写 —— 这是最常见的配置事故。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 248" role="img" aria-label="iptables 自上而下首条匹配即生效；允许规则若写在拒绝之后就被挡住">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">自上而下、首条匹配即生效 —— 顺序错了等于没写</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="#e5484d" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="#e5484d">错误顺序（允许在后面 = 永远不生效）</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">① -A INPUT -p tcp --dport 22 -j DROP　② -A INPUT -p tcp --dport 22 -j ACCEPT</text>

      <rect x="6" y="54" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="67" font-size="8" font-weight="700" fill="var(--fig-node-a)">正确顺序（先精细允许，再兜底拒绝）</text>
      <text x="14" y="79" font-size="7.5" fill="var(--fig-text)">① ACCEPT 特定来源/IP　② 最后一条 DROP/REJECT 兜底</text>

      <!-- 执行模型 -->
      <rect x="6" y="92" width="328" height="50" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="105" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">执行模型</text>
      <text x="14" y="118" font-size="7.5" fill="var(--fig-text)">包进入链后，从第一条规则开始逐条比对</text>
      <text x="14" y="130" font-size="7.5" fill="var(--fig-text)">一旦匹配（-j ACCEPT / DROP / REJECT）立即终止比对，不再看后面</text>

      <rect x="6" y="150" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="163" font-size="8" font-weight="700" fill="var(--fig-node-b)">插入位置的三条命令</text>
      <text x="14" y="175" font-size="7.5" fill="var(--fig-text)">-A 追加到末尾　·　-I 插到最前（默认）　·　-I 3 插到第 3 位</text>

      <rect x="6" y="192" width="328" height="34" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="205" font-size="8" font-weight="700" fill="#e5484d">规则一多最容易出的错</text>
      <text x="14" y="217" font-size="7.5" fill="var(--fig-text)">用 -A 加了允许规则，但前面早有一条宽泛的 DROP 兜底 → 新规则无效</text>

      <text x="6" y="238" font-size="7.5" fill="var(--fig-muted)">排查：iptables -L -n --line-numbers 看序号；用 -I 临时插到最前验证</text>
    </svg>
    <figcaption>iptables 逐条比对、首条匹配即终止；允许规则写在 DROP 之后就无效，应「先精细允许、最后兜底拒绝」</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
