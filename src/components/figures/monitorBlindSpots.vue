<script setup>
/**
 * 「指标都正常但用户投诉很多」的盲区图。
 *
 * 对应题 5442。核心洞察：监控看的是「系统内部」，用户感受的是「端到端」；
 * 四个典型盲区 + 用 RUM 补上用户视角。
 *
 * 画布 340 宽，文字须控制在列内（npm run check:figures 校验）。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 286" role="img" aria-label="监控盲区：只看平均值、只看服务端、只看有响应、只看核心接口，以及用 RUM 补用户视角">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">监控看的是「系统内部」，用户感受的是「端到端」——中间有四个盲区</text>

      <text x="6" y="32" font-size="9.5" font-weight="700" fill="var(--fig-text)">① 四个典型盲区</text>

      <rect x="6" y="40" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="52" font-size="8" font-weight="700" fill="var(--fig-node-a)">只看平均值</text>
      <text x="88" y="52" font-size="7.5" fill="var(--fig-text)">P50 漂亮，P99 可能已爆（长尾才是用户痛点）</text>
      <text x="14" y="64" font-size="7" fill="var(--fig-node-c)">→ 必须看 P95/P99，不只均值</text>

      <rect x="6" y="74" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="86" font-size="8" font-weight="700" fill="var(--fig-node-b)">只看服务端</text>
      <text x="88" y="86" font-size="7.5" fill="var(--fig-text)">服务端 200ms，客户端实际 3 秒（网络/渲染/CDN）</text>
      <text x="14" y="98" font-size="7" fill="var(--fig-node-c)">→ 需前端埋点测「端到端」时间</text>

      <rect x="6" y="108" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="120" font-size="8" font-weight="700" fill="var(--fig-node-c)">只看「有响应」</text>
      <text x="88" y="120" font-size="7.5" fill="var(--fig-text)">HTTP 200 但内容错（业务错误码、空数据）</text>
      <text x="14" y="132" font-size="7" fill="var(--fig-node-c)">→ 监控业务成功率，不只看 HTTP 码</text>

      <rect x="6" y="142" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="154" font-size="8" font-weight="700" fill="var(--fig-node-d)">只看核心接口</text>
      <text x="88" y="154" font-size="7.5" fill="var(--fig-text)">支付回调、短信、三方对接挂了，主指标无波动</text>
      <text x="14" y="166" font-size="7" fill="var(--fig-node-c)">→ 按「用户旅程」而非「接口列表」覆盖</text>

      <text x="6" y="190" font-size="9.5" font-weight="700" fill="var(--fig-text)">② 补上用户视角的三件事</text>

      <rect x="6" y="198" width="328" height="20" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="212" font-size="7.5" fill="var(--fig-text)">RUM 真实用户监控：前端上报页面加载、接口耗时、JS 错误</text>

      <rect x="6" y="222" width="328" height="20" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="236" font-size="7.5" fill="var(--fig-text)">合成拨测：从多地模拟「登录 → 下单 → 支付」全流程</text>

      <rect x="6" y="246" width="328" height="20" rx="4" fill="var(--fig-node-a)" opacity=".08" />
      <text x="14" y="260" font-size="7.5" fill="var(--fig-text)">业务漏斗：加购 → 下单 → 支付的成功率与转化率</text>

      <text x="6" y="282" font-size="7.5" fill="var(--fig-muted)">判断标准：用户能感知的问题，监控必须能先于用户发现</text>
    </svg>
    <figcaption>指标正常不等于用户体验正常：补齐 P99、端到端、业务成功率与用户旅程的监控</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
