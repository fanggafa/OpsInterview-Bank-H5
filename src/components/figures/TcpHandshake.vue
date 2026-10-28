<script setup>
/**
 * TCP 三次握手 / 四次挥手图。
 * 重点是两个「容易被忽略但排障关键」的点：
 * 半连接队列（SYN 洪泛）与 TIME_WAIT（为什么是 2MSL）。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 278" role="img" aria-label="TCP 三次握手与四次挥手，标注半连接队列与 TIME_WAIT">
      <defs>
        <marker id="arrTcp" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-node-a)" />
        </marker>
        <marker id="arrTcp2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-node-b)" />
        </marker>
      </defs>

      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">左边是建连（3 次），右边是断连（4 次）</text>

      <!-- 建立连接 -->
      <text x="6" y="30" font-size="9.5" font-weight="700" fill="var(--fig-node-a)">三次握手（为什么是 3 次）</text>
      <text x="42" y="46" font-size="8.5" fill="var(--fig-text)">Client</text>
      <text x="112" y="46" font-size="8.5" fill="var(--fig-text)">Server</text>

      <path d="M56 54 L108 66" stroke="var(--fig-node-a)" stroke-width="1.5" marker-end="url(#arrTcp)" />
      <text x="60" y="62" font-size="7.5" fill="var(--fig-node-a)">SYN</text>

      <path d="M108 74 L56 86" stroke="var(--fig-node-b)" stroke-width="1.5" marker-end="url(#arrTcp2)" />
      <text x="62" y="82" font-size="7.5" fill="var(--fig-node-b)">SYN+ACK</text>

      <path d="M56 94 L108 106" stroke="var(--fig-node-a)" stroke-width="1.5" marker-end="url(#arrTcp)" />
      <text x="60" y="102" font-size="7.5" fill="var(--fig-node-a)">ACK</text>

      <text x="6" y="122" font-size="8" fill="var(--fig-muted)">两次不够（无法确认「服务端的接收能力」），四次多余</text>
      <text x="6" y="134" font-size="8" fill="var(--fig-node-d)">服务器收到 SYN 但未完成握手 → 进「半连接队列」（SYN queue）</text>
      <text x="6" y="146" font-size="8" fill="var(--fig-muted)">队列打满 → 新连接被丢 → 表现为「偶发连不上」，要调 tcp_max_syn_backlog</text>

      <!-- 断开连接 -->
      <text x="6" y="168" font-size="9.5" font-weight="700" fill="var(--fig-node-b)">四次挥手（为什么是 4 次）</text>
      <text x="42" y="184" font-size="8.5" fill="var(--fig-text)">Client</text>
      <text x="112" y="184" font-size="8.5" fill="var(--fig-text)">Server</text>

      <path d="M56 192 L108 202" stroke="var(--fig-node-a)" stroke-width="1.4" marker-end="url(#arrTcp)" />
      <text x="58" y="199" font-size="7.5" fill="var(--fig-node-a)">FIN</text>

      <path d="M108 210 L56 218" stroke="var(--fig-node-b)" stroke-width="1.4" marker-end="url(#arrTcp2)" />
      <text x="62" y="216" font-size="7.5" fill="var(--fig-node-b)">ACK</text>

      <text x="118" y="196" font-size="8" fill="var(--fig-text)">服务端此时可能还有数据要发 →</text>
      <text x="118" y="208" font-size="8" fill="var(--fig-text)">所以 ACK 与 FIN 分开（这是第 4 次的原因）</text>
      <text x="118" y="220" font-size="8" fill="var(--fig-node-d)">主动关闭方最后进 TIME_WAIT，等 2MSL（≈60s）</text>
      <text x="118" y="232" font-size="8" fill="var(--fig-node-d)">目的：让最后的 ACK 能重传 +</text>
      <text x="118" y="244" font-size="8" fill="var(--fig-muted)">让旧连接的残留包在网络中消亡</text>
      <text x="118" y="256" font-size="8" fill="var(--fig-node-c)">TIME_WAIT 大量堆积（短连接场景）→</text>
      <text x="118" y="268" font-size="8" fill="var(--fig-node-c)">调 tw_reuse / 用长连接 / 加端口范围</text>
    </svg>
    <figcaption>握手 3 次确立双向可达，挥手 4 次因为「半关闭」——TIME_WAIT 不是故障，是保护</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
