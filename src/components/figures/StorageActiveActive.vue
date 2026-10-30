<script setup>
/**
 * 存储双活与主备的区别（题 2429）。
 *
 * 核心洞察：主备是「一套干活一套待命」（切换有停顿），
 * 双活是「两套同时承载」（无停顿但要求仲裁与双写一致性）。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 256" role="img" aria-label="存储主备是一主一待命切换有停顿，双活是两套同时承载无停顿需要仲裁与一致性保障">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">主备「一干一待」，双活「两套都干」——代价在仲裁与一致性</text>

      <rect x="6" y="20" width="160" height="70" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">主备（Active-Standby）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">主阵列承载业务</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">备阵列同步但不接流量</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">故障后需切换（有停顿）</text>
      <text x="14" y="82" font-size="7.5" fill="var(--fig-node-c)">简单、成本低；但切换时不长</text>

      <rect x="174" y="20" width="160" height="70" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">双活（Active-Active）</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">两阵列同时承载读写</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">故障时另一套继续服务</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">近乎无停顿</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-node-c)">代价：一致性、仲裁、链路要求高</text>

      <!-- 关键难点 -->
      <rect x="6" y="100" width="328" height="52" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="113" font-size="8.5" font-weight="700" fill="#e5484d">双活的三个难点</text>
      <text x="14" y="126" font-size="7.5" fill="var(--fig-text)">① 写冲突：两边同时写同一块数据 → 需要「同一时刻只有一个写者」或锁</text>
      <text x="14" y="138" font-size="7.5" fill="var(--fig-text)">② 脑裂：链路断了两边都以为自己是主 → 必须有仲裁（第三站点）</text>
      <text x="14" y="150" font-size="7.5" fill="var(--fig-text)">③ 链路质量：两机房间的延迟会直接放大到业务延迟</text>

      <rect x="6" y="162" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="175" font-size="8" font-weight="700" fill="var(--fig-node-c)">判断「是不是真双活」</text>
      <text x="14" y="188" font-size="7.5" fill="var(--fig-text)">问一句：拔掉一边的所有链路，业务还能「持续写」吗？不能就不是双活</text>

      <rect x="6" y="204" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="217" font-size="8" font-weight="700" fill="var(--fig-node-d)">实践建议</text>
      <text x="14" y="230" font-size="7.5" fill="var(--fig-text)">多数业务用「主备 + 快速切换」性价比更高；双活只给核心交易系统上</text>

      <text x="6" y="248" font-size="7.5" fill="var(--fig-muted)">注意：存储双活 ≠ 应用双活，应用层还需要处理「连哪一边」的问题</text>
    </svg>
    <figcaption>主备是一主一待、切换有停顿；双活是两套同时承载、近乎无停顿，代价是写冲突、脑裂与链路要求</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
