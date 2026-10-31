<script setup>
/**
 * LVS + Keepalived 的主备与主主（题 1627）。
 *
 * 核心洞察：主备是「一台扛全部、一台待命」，主主是「两台都干活、互为备份」；
 * 主主要多考虑一个关键问题：VIP 漂移后如何避免「两边都以为自己该接流量」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 254" role="img" aria-label="主备模式一台承载一台待命，主主模式两台同时承载互为备份；主主需注意分片与脑裂">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">主备「用一半资源」，主主「全用上但要管好脑裂」</text>

      <rect x="6" y="20" width="160" height="80" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">主备（Active-Standby）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">一个 VIP 指向主节点</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">备机待命，接管时漂 VIP</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">资源利用率约 50%</text>
      <text x="14" y="82" font-size="7.5" fill="var(--fig-text)">配置简单、故障边界清晰</text>
      <text x="14" y="94" font-size="7" fill="var(--fig-node-c)">大多数场景的稳妥选择</text>

      <rect x="174" y="20" width="160" height="80" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">主主（Active-Active）</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">两台各自持有不同 VIP</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">同时承载，互为备份</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">资源利用率接近 100%</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-text)">某台挂了，VIP 漂到另一台</text>
      <text x="182" y="94" font-size="7" fill="#e5484d">风险：漂移后单台扛双倍流量</text>

      <!-- 主主注意事项 -->
      <rect x="6" y="110" width="328" height="50" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="123" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">主主要额外想清楚三件事</text>
      <text x="14" y="136" font-size="7.5" fill="var(--fig-text)">① 容量：一台挂了，另一台能不能扛住全部流量</text>
      <text x="14" y="148" font-size="7.5" fill="var(--fig-text)">② 脑裂：两台都以为自己该持有两个 VIP（靠心跳与仲裁防）</text>
      <text x="14" y="160" font-size="7" fill="var(--fig-node-c)">③ 会话/状态：如果业务有粘性会话，切过去可能失效</text>

      <rect x="6" y="176" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="189" font-size="8" font-weight="700" fill="var(--fig-node-d)">怎么选</text>
      <text x="14" y="201" font-size="7.5" fill="var(--fig-text)">优先主备（简单可靠）；资源紧张且能保证单台扛全量时才上主主</text>

      <rect x="6" y="216" width="328" height="20" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="230" font-size="7.5" fill="var(--fig-text)">验证：演练「杀掉一台」看 VIP 漂移时间与业务是否无感，别只看配置</text>

      <text x="6" y="244" font-size="7.5" fill="var(--fig-muted)">Keepalived 的同步：unicast 心跳比 multicast 更可控（避免组播被交换机丢弃）</text>
    </svg>
    <figcaption>主备用一半资源但简单可靠，主主全用上但需保证单台能扛全量与防脑裂；优先主备，演练漂移才算验证</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
