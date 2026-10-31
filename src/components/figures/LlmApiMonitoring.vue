<script setup>
/**
 * 大模型 API 服务的健康监控（题 5821）。
 *
 * 核心洞察：普通 API 的「HTTP 200 + 延迟正常」对 LLM 不够用 ——
 * 它 200 也可能答非所问。所以要分三层：基础可用性照顾住，
 * AI 特有的 token / TTFT / 上下文分布解释「为什么慢、为什么贵」，
 * 质量层才回答「用户到底有没有得到有用的答案」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 252" role="img" aria-label="大模型 API 健康监控三层指标：基础可用性、AI 特有指标、质量层">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">三层指标：先证明「活着」，再证明「不亏」，最后证明「有用」</text>

      <rect x="6" y="22" width="328" height="50" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="35" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① 基础可用性层（普通 API 也在看的那套）</text>
      <text x="14" y="48" font-size="7.5" fill="var(--fig-text)">状态码分布 · 5xx/429 比例 · P95 端到端延迟 · 超时与重试次数</text>
      <text x="14" y="61" font-size="7.5" fill="var(--fig-text)">探活别只 ping 端口：发一条 5 token 的最小请求才能真打穿链路</text>

      <rect x="6" y="78" width="328" height="50" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="91" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">② AI 特有层（普通 API 没有，也最容易被漏掉）</text>
      <text x="14" y="104" font-size="7.5" fill="var(--fig-text)">输入/输出 token 与费用 · TTFT · tokens/s · 上下文长度分布</text>
      <text x="14" y="117" font-size="7.5" fill="var(--fig-text)">上游限流命中 · 截断比例（撞到 max_tokens 的请求占比）</text>

      <rect x="6" y="134" width="328" height="50" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="147" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">③ 质量层（200 也答非所问，只能这层发现）</text>
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)">结构化输出解析失败率 · 拒答率 · 固定问题集的抽检分数</text>
      <text x="14" y="173" font-size="7.5" fill="var(--fig-text)">与基线答案的漂移对比：换了模型或 prompt 后结果有没有变差</text>

      <rect x="6" y="190" width="328" height="42" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="203" font-size="8" font-weight="700" fill="#e5484d">只看 ① 的典型误判</text>
      <text x="14" y="216" font-size="7.5" fill="var(--fig-text)">全部 200、延迟也正常，但输出被截断/乱码/答不上来 —— 线上却「全绿」</text>
      <text x="14" y="228" font-size="7.5" fill="var(--fig-text)">所以三层要一起看：可用性负责止血，②③ 负责解释贵与差</text>

      <text x="6" y="242" font-size="7.5" fill="var(--fig-muted)">告警分派：① 给值班、② 给成本与容量、③ 给效果负责人</text>
    </svg>
    <figcaption>三层：基础可用性（状态码/延迟/探活）；AI 特有（token、TTFT、tokens/s、上下文分布、截断）；质量层（解析失败率、拒答率、抽检与漂移）</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
