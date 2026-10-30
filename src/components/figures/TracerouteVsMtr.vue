<script setup>
/**
 * traceroute 与 mtr 的区别，以及「全是星号」的原因（题 4414）。
 *
 * 核心洞察：mtr 是 traceroute 的「持续统计版」，能看到每跳丢包率；
 * 星号不代表丢包 —— 很多设备就是不回 ICMP/UDP 探测包。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 258" role="img" aria-label="traceroute 一次性路径、mtr 持续统计每跳丢包；星号可能只是设备不回探测包">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">mtr 是 traceroute 的「持续统计版」；星号 ≠ 丢包</text>

      <rect x="6" y="20" width="160" height="52" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">traceroute</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">一次性探路径（逐跳 TTL）</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">每跳测 3 次，给 RTT</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-node-c)">看「路径长什么样」</text>

      <rect x="174" y="20" width="160" height="52" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">mtr</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">持续探测并统计</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">每跳的丢包率 / 抖动</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-node-c)">定位「哪一跳开始变差」</text>

      <!-- 星号 -->
      <rect x="6" y="82" width="328" height="56" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="95" font-size="8.5" font-weight="700" fill="#e5484d">「全是星号（*）」的四个原因</text>
      <text x="14" y="108" font-size="7.5" fill="var(--fig-text)">① 中间设备不回应探测包（最常见，不代表故障）</text>
      <text x="14" y="120" font-size="7.5" fill="var(--fig-text)">② ICMP 被防火墙丢弃　③ 探测协议被限速（UDP/ICMP）</text>
      <text x="14" y="132" font-size="7.5" fill="var(--fig-text)">④ 目标不可达（最后几跳全星号才更像真问题）</text>

      <!-- 判读 -->
      <rect x="6" y="148" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="161" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">关键判读原则</text>
      <text x="14" y="174" font-size="7.5" fill="var(--fig-text)">中间跳丢包但后续跳正常 → 是那台设备不回探测，不是链路问题</text>
      <text x="14" y="186" font-size="7.5" fill="var(--fig-text)">从某跳开始「持续」丢包并延续到目标 → 那一段才是真问题</text>

      <rect x="6" y="204" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="217" font-size="8" font-weight="700" fill="var(--fig-node-d)">使用建议</text>
      <text x="14" y="230" font-size="7.5" fill="var(--fig-text)">用 mtr -rw 跑几十秒拿统计，而不是靠单次 traceroute 下结论</text>

      <text x="6" y="248" font-size="7.5" fill="var(--fig-muted)">补充：TCP/ICMP 模式可绕过部分 UDP 限速（traceroute -T / -I）</text>
    </svg>
    <figcaption>traceroute 看路径形状、mtr 持续统计丢包率；星号多为设备不回探测包，要看「是否延续到目标」</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
