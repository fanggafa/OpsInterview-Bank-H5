<script setup>
/**
 * Pod 亲和性 Affinity（题 4747）。
 *
 * 核心洞察：亲和性 = 用「规则」表达放置关系，而不是写死节点名；
 * 分「节点亲和 / Pod 亲和」两大类，各有「硬约束（不满足就 Pending）」与「软约束（尽量）」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 248" role="img" aria-label="亲和性两大类：节点亲和与 Pod 亲和反亲和，各有硬约束与软约束">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">用规则表达放置关系，而不是写死 nodeName</text>

      <rect x="6" y="20" width="160" height="70" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">节点亲和</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">Pod ↔ 节点</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">要求落在特定标签的节点</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">如 disk=ssd、机房标签</text>
      <text x="14" y="82" font-size="7" fill="var(--fig-node-c)">支持 In/NotIn/Exists 表达式</text>

      <rect x="174" y="20" width="160" height="70" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">Pod 亲和 / 反亲和</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">Pod ↔ 其他 Pod</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">亲和：聚在一起（省跨节点流量）</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">反亲和：分散开（避免同节点全挂）</text>
      <text x="182" y="82" font-size="7" fill="var(--fig-node-c)">常用 topologyKey: hostname</text>

      <!-- 硬软 -->
      <rect x="6" y="98" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="111" font-size="8.5" font-weight="700" fill="#e5484d">硬约束 vs 软约束（名字很长但含义简单）</text>
      <text x="14" y="124" font-size="7.5" fill="var(--fig-text)">required...：不满足就不调度 → Pod 会 Pending（硬）</text>
      <text x="14" y="136" font-size="7.5" fill="var(--fig-text)">preferred...：尽量满足，不满足也调度（软）</text>
      <text x="14" y="148" font-size="7" fill="var(--fig-node-c)">尾部 IgnoredDuringExecution = 只影响调度，运行后节点标签变了不驱逐</text>

      <rect x="6" y="154" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="167" font-size="8" font-weight="700" fill="var(--fig-node-c)">与 nodeSelector 的关系</text>
      <text x="14" y="179" font-size="7.5" fill="var(--fig-text)">nodeSelector 最简单（精确匹配，硬）；亲和性支持表达式与软约束</text>

      <rect x="6" y="196" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="209" font-size="8" font-weight="700" fill="var(--fig-node-d)">两个常见坑</text>
      <text x="14" y="221" font-size="7.5" fill="var(--fig-text)">硬亲和无匹配节点 → 永远 Pending；节点标签漏打 → 规则静默失效</text>

      <text x="6" y="240" font-size="7.5" fill="var(--fig-muted)">排查：describe pod 的 Events 会明确写「为什么不满足亲和性」</text>
    </svg>
    <figcaption>节点亲和（Pod↔节点）与 Pod 亲和/反亲和（Pod↔Pod）；required 是硬约束（不满足 Pending）、preferred 是软约束</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
