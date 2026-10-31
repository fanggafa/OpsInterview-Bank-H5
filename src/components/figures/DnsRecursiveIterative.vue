<script setup>
/**
 * DNS 的递归查询与迭代查询（题 1005）。
 *
 * 核心洞察：递归是「客户端只问一次，服务器替你把活干完」，
 * 迭代是「服务器只告诉你下一步去问谁」—— 谁承担工作量是关键差别。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 244" role="img" aria-label="递归查询由服务器代劳完成全部解析，迭代查询由客户端逐级去问">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">核心差别：递归是「服务器替你跑腿」，迭代是「告诉你下一步问谁」</text>

      <rect x="6" y="20" width="160" height="86" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">递归查询</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">客户端只发出一次请求</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">服务器负责问到底</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">直接返回最终结果</text>
      <text x="14" y="82" font-size="7.5" fill="var(--fig-text)">典型：客户端 → 本地递归服务器</text>
      <text x="14" y="94" font-size="7" fill="var(--fig-node-c)">服务器负担重，但客户端简单</text>
      <text x="14" y="104" font-size="7" fill="var(--fig-node-c)">dig 默认就是递归（+rec）</text>

      <rect x="174" y="20" width="160" height="86" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">迭代查询</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">服务器只返回「下一步」</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">请求方逐级继续去问</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">典型：本地服务器 → 根 → 权威</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-text)">每级只知道自己那一段</text>
      <text x="182" y="94" font-size="7" fill="var(--fig-node-c)">服务器负担轻，请求方做更多</text>
      <text x="182" y="104" font-size="7" fill="var(--fig-node-c)">权威服务器之间基本用迭代</text>

      <!-- 解析链路 -->
      <rect x="6" y="116" width="328" height="50" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="129" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">一次完整解析的实际组合</text>
      <text x="14" y="142" font-size="7.5" fill="var(--fig-text)">客户端 → 本地递归服务器：递归（一次问完）</text>
      <text x="14" y="154" font-size="7.5" fill="var(--fig-text)">本地服务器 → 根/顶级/权威：迭代（逐级拿到下一步地址）</text>
      <text x="14" y="166" font-size="7" fill="var(--fig-node-c)">所以「递归」与「迭代」不是互斥，而是分工</text>

      <rect x="6" y="174" width="328" height="34" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="187" font-size="8" font-weight="700" fill="#e5484d">常见误解</text>
      <text x="14" y="199" font-size="7.5" fill="var(--fig-text)">「客户端也做迭代」—— 一般不会，客户端配置的只是递归服务器地址</text>

      <text x="6" y="234" font-size="7.5" fill="var(--fig-muted)">排查用：dig +trace 可看「逐级迭代」的完整过程，定位哪一级不响应</text>
    </svg>
    <figcaption>递归由服务器代劳、客户端只问一次；迭代是服务器只给下一步地址；实际解析是分工组合，dig +trace 可看迭代过程</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
