<script setup>
/**
 * TCP keepalive 与应用层心跳的区别（题 4424）。
 *
 * 核心洞察：二者目的不同 —— keepalive 探「链路是否还活着」（内核层），
 * 心跳探「应用是否还正常」（业务层）；探测间隔与判定也更可控。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 252" role="img" aria-label="TCP keepalive 由内核探测链路是否存活，应用层心跳探测业务是否正常，两者目的与可调性不同">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">keepalive 探「链路活着吗」，心跳探「应用正常吗」</text>

      <rect x="6" y="20" width="160" height="86" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">TCP keepalive</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">内核层，发空探测包</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">默认 7200s 才发第一次</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">能发现「链路断开/对端消失」</text>
      <text x="14" y="82" font-size="7.5" fill="var(--fig-text)">不能发现「进程卡住但连接还在」</text>
      <text x="14" y="94" font-size="7.5" fill="var(--fig-node-c)">参数：tcp_keepalive_time/intvl/probes</text>

      <rect x="174" y="20" width="160" height="86" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">应用层心跳</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">业务层，发带内容的请求</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">间隔可自定义（如 30s）</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">能发现「应用卡住/不响应」</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-text)">可携带鉴权、健康状态</text>
      <text x="182" y="94" font-size="7.5" fill="var(--fig-node-c)">代价：有一定流量与处理开销</text>

      <!-- 何时用哪个 -->
      <rect x="6" y="116" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="129" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">怎么选</text>
      <text x="14" y="142" font-size="7.5" fill="var(--fig-text)">要发现「连接被中间设备悄悄掐断」→ keepalive（如 NAT/LB 超时）</text>
      <text x="14" y="154" font-size="7.5" fill="var(--fig-text)">要发现「进程假死」→ 应用心跳；长连接业务通常两者都配</text>

      <rect x="6" y="170" width="328" height="40" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="183" font-size="8.5" font-weight="700" fill="#e5484d">实践要点</text>
      <text x="14" y="196" font-size="7.5" fill="var(--fig-text)">心跳间隔要小于「中间设备的空闲超时」（如 LB 默认 60s 断空闲连接）</text>
      <text x="14" y="208" font-size="7.5" fill="var(--fig-text)">否则连接被静默回收，表现为「偶发 first-write 失败」</text>

      <text x="6" y="228" font-size="7.5" fill="var(--fig-muted)">排查：ss -o 看 timer 状态；抓包看是否定期有探测包</text>
      <text x="6" y="240" font-size="7.5" fill="var(--fig-muted)">易混点：keepalive 不能替代心跳，两者探测的层次不同</text>
    </svg>
    <figcaption>keepalive 由内核探链路存活（能发现被掐断），心跳探应用正常（能发现假死）；长连接通常两者都配</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
