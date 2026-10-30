<script setup>
/**
 * iptables 的 policy 与规则 ACCEPT 的区别（题 1204）。
 *
 * 核心洞察：policy 是「链走完都没命中时」的兜底动作，
 * 规则 ACCEPT 是「命中即放行并停止遍历」；两者层级不同，
 * 混为一谈会出现「明明加了 ACCEPT 却还是不通过」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 280" role="img" aria-label="iptables 的 policy 是链结束后的兜底动作，规则命中即停止；以及清空规则后 policy 仍然生效">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">policy 是「走完链都没命中」时的兜底，规则 ACCEPT 是「命中即停」</text>

      <!-- 匹配流程 -->
      <text x="6" y="34" font-size="9" font-weight="700" fill="var(--fig-text)">包的匹配顺序</text>

      <rect x="6" y="42" width="328" height="24" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">包进入链 → 逐条规则匹配（按顺序）→ 命中 ACCEPT/DROP 即停止</text>

      <rect x="6" y="70" width="328" height="24" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="86" font-size="7.5" font-weight="700" fill="var(--fig-node-b)">全部规则都没命中 → 执行该链的 policy</text>

      <rect x="6" y="98" width="328" height="24" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="114" font-size="7.5" fill="var(--fig-text)">policy 只有 ACCEPT / DROP 两种（如 iptables -P INPUT DROP）</text>

      <!-- 关键差别 -->
      <rect x="6" y="130" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="143" font-size="8.5" font-weight="700" fill="#e5484d">最容易踩的坑</text>
      <text x="14" y="156" font-size="7.5" fill="var(--fig-text)">iptables -F 只清「规则」，policy 仍是 DROP → 清完立刻全部拒绝（锁死自己）</text>
      <text x="14" y="168" font-size="7.5" fill="var(--fig-node-c)">正确顺序：先 iptables -P ACCEPT，再 -F</text>

      <!-- 排查 -->
      <rect x="6" y="184" width="328" height="42" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="197" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">怎么查</text>
      <text x="14" y="210" font-size="7.5" fill="var(--fig-text)">iptables -L -nv --line-numbers：看每条的 pkts 计数与 policy 标记</text>
      <text x="14" y="222" font-size="7.5" fill="var(--fig-node-c)">pkts 为 0 说明该规则从未命中 → 多半是被前面某条拦掉了</text>

      <rect x="6" y="234" width="328" height="20" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="248" font-size="7.5" fill="var(--fig-text)">口诀：policy 是「都没命中怎么办」，规则是「命中就怎么办」</text>

      <text x="6" y="268" font-size="7.5" fill="var(--fig-muted)">加分点：主动提「-F 不清 policy」这个细节，能说明真的踩过坑</text>
    </svg>
    <figcaption>policy 是链走完都没命中的兜底动作；规则 ACCEPT 命中即停。清规则不清 policy 会立刻锁死自己</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
