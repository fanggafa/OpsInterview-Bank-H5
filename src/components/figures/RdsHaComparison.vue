<script setup>
/**
 * 云 RDS 多可用区 vs 自建主从（题 3410）。
 *
 * 核心洞察：托管 RDS 的多可用区是「自动切换、但你要为副本付钱」；
 * 自建主从更灵活但切换、监控、备份全靠自己 —— 差别在「谁负责故障处理」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 268" role="img" aria-label="云 RDS 多可用区与自建主从对比：自动切换与责任边界，以及两者的成本与可运维性差异">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">差别在「谁负责故障处理」：托管自动切换，自建全靠自己</text>

      <rect x="6" y="20" width="160" height="88" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="34" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">云 RDS 多可用区</text>
      <text x="14" y="47" font-size="7.5" fill="var(--fig-text)">主库 + 备库跨可用区</text>
      <text x="14" y="59" font-size="7.5" fill="var(--fig-text)">同步复制，主故障自动切换</text>
      <text x="14" y="72" font-size="7.5" fill="var(--fig-node-c)">切换通常几十秒~几分钟</text>
      <text x="14" y="86" font-size="7.5" fill="var(--fig-text)">你负责：业务连接重试</text>
      <text x="14" y="100" font-size="7.5" fill="var(--fig-node-d)">代价：为备库付钱、规格受限</text>

      <rect x="174" y="20" width="160" height="88" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="182" y="34" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">自建主从</text>
      <text x="182" y="47" font-size="7.5" fill="var(--fig-text)">自己搭主从与切换脚本</text>
      <text x="182" y="59" font-size="7.5" fill="var(--fig-text)">可选半同步/异步</text>
      <text x="182" y="72" font-size="7.5" fill="var(--fig-node-c)">切换速度取决于你的方案</text>
      <text x="182" y="86" font-size="7.5" fill="var(--fig-text)">你负责：切换、监控、备份、脑裂</text>
      <text x="182" y="100" font-size="7.5" fill="var(--fig-node-d)">优点：灵活、可控、成本更省</text>

      <!-- 关键差异 -->
      <rect x="6" y="116" width="328" height="52" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="129" font-size="8.5" font-weight="700" fill="#e5484d">最容易忽略的三件事</text>
      <text x="14" y="142" font-size="7.5" fill="var(--fig-text)">① 应用要能「切主后重连」——否则托管自动切换了你还是报错</text>
      <text x="14" y="154" font-size="7.5" fill="var(--fig-text)">② 自建方案必须防脑裂（VIP 漂移 + 双主写入会毁数据）</text>
      <text x="14" y="166" font-size="7.5" fill="#e5484d">③ 切换后的数据一致性要校验（异步复制有 RPO 缺口）</text>

      <!-- 选择 -->
      <rect x="6" y="176" width="328" height="34" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="189" font-size="8" font-weight="700" fill="var(--fig-node-c)">怎么选</text>
      <text x="14" y="202" font-size="7.5" fill="var(--fig-text)">团队小、要省心 → RDS 多可用区；有 DBA、要极致可控 → 自建</text>

      <rect x="6" y="218" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="231" font-size="8" font-weight="700" fill="var(--fig-node-d)">无论哪种都要做</text>
      <text x="14" y="244" font-size="7.5" fill="var(--fig-text)">故障切换演练（真切一次）+ 数据校验 + 连接层重试（这才是 RTO 达标的前提）</text>

      <text x="6" y="264" font-size="7.5" fill="var(--fig-muted)">加分点：强调「托管不负责你的应用重连逻辑」，这是最常见的认知错位</text>
    </svg>
    <figcaption>RDS 多可用区自动切换但要为副本付费；自建灵活但切换/备份/防脑裂全靠自己；两者都需要演练</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
