<script setup>
/**
 * TCP 四次挥手与 TIME_WAIT 的 2MSL 等待（题 17）。
 *
 * 核心洞察：TIME_WAIT 存在的两个理由 ——
 * 保证最后一个 ACK 能重传（否则对方卡在 LAST_ACK），
 * 以及让旧连接的延迟包在网络中消亡（避免污染新连接）。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 278" role="img" aria-label="TCP 四次挥手与 TIME_WAIT：确认收到、FIN/ACK、FIN/ACK、ACK，主动关闭方等待 2MSL 的两个原因">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">TIME_WAIT 等 2MSL 有两个理由：保 ACK 重传 + 让旧包消亡</text>

      <!-- 四次挥手 -->
      <text x="6" y="32" font-size="9" font-weight="700" fill="var(--fig-text)">四次挥手（主动关闭方视角）</text>

      <rect x="6" y="40" width="328" height="22" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="55" font-size="7.5" fill="var(--fig-text)">① 主动方发 FIN → 进入 FIN_WAIT_1（我不再发数据了）</text>

      <rect x="6" y="66" width="328" height="22" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="81" font-size="7.5" fill="var(--fig-text)">② 对方回 ACK → 主动方进入 FIN_WAIT_2（对方还有数据可发）</text>

      <rect x="6" y="92" width="328" height="22" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="107" font-size="7.5" fill="var(--fig-text)">③ 对方也发 FIN → 主动方进入 TIME_WAIT（回 ACK 后）</text>

      <rect x="6" y="118" width="328" height="22" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="133" font-size="7.5" fill="var(--fig-text)">④ 主动方回最后一个 ACK → 双方连接关闭</text>

      <!-- 为什么等 2MSL -->
      <rect x="6" y="148" width="328" height="52" rx="5" fill="#e5484d" opacity=".12" />
      <text x="14" y="161" font-size="8.5" font-weight="700" fill="#e5484d">为什么必须等 2MSL（不是「随便等等」）</text>
      <text x="14" y="174" font-size="7.5" fill="var(--fig-text)">① 若最后一个 ACK 丢了，对方会重传 FIN → 我方还能再回 ACK</text>
      <text x="14" y="186" font-size="7.5" fill="var(--fig-text)">② 让本次连接的「延迟/重复报文」在网络中消亡，避免污染新连接</text>
      <text x="14" y="198" font-size="7.5" fill="var(--fig-node-c)">2MSL ≈ 一来一回的最大生存时间（通常 60s 左右）</text>

      <!-- 运维含义 -->
      <rect x="6" y="208" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="221" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">运维含义</text>
      <text x="14" y="234" font-size="7.5" fill="var(--fig-text)">服务端大量 TIME_WAIT → 短连接过多（用连接池/长连接）；端口可能耗尽</text>
      <text x="14" y="246" font-size="7.5" fill="var(--fig-text)">看：ss -tan state time-wait | wc -l；调：tcp_tw_reuse（谨慎）</text>

      <text x="6" y="266" font-size="7.5" fill="var(--fig-muted)">易混点：TIME_WAIT 出现在「主动关闭方」，所以服务端短连接场景才多</text>
    </svg>
    <figcaption>TIME_WAIT 是为了让最后一个 ACK 可重传、并让旧报文消亡；服务端 TIME_WAIT 多通常意味着短连接过多</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
