<script setup>
/**
 * Prometheus 单机撑不住时的四条扩展路线（题 5010）。
 *
 * 核心洞察：四条路线对应「规模递增」的不同阶段，不是替代关系而是演进关系；
 * 大多数团队最终会走到「远程写 + 长期存储后端」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 278" role="img" aria-label="Prometheus 扩展的四条路线：联邦、远程写加后端、Thanos、分片，各自适用规模与代价">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">四条路线按规模递增，是「演进」不是「替代」</text>

      <!-- 路线 1 -->
      <rect x="6" y="20" width="328" height="44" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① 联邦 Federation</text>
      <text x="168" y="33" font-size="7.5" fill="var(--fig-text)">中等规模（多集群）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">下级 Prometheus 各自抓取，上级只拉聚合后的关键指标</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-node-c)">代价：配置复杂，可能数据有缺口（只汇总关键指标）</text>

      <!-- 路线 2 -->
      <rect x="6" y="68" width="328" height="48" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="81" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">② 远程写 + 长期存储后端（最主流）</text>
      <text x="236" y="81" font-size="7.5" fill="var(--fig-text)">大规模</text>
      <text x="14" y="94" font-size="7.5" fill="var(--fig-text)">remote_write 到 VictoriaMetrics / Mimir / Thanos 存储</text>
      <text x="14" y="106" font-size="7.5" fill="var(--fig-node-c)">代价：要部署与运维后端；注意 remote write 队列积压会丢样本</text>

      <!-- 路线 3 -->
      <rect x="6" y="120" width="328" height="44" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="133" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">③ Thanos（Sidecar / Receiver）</text>
      <text x="196" y="133" font-size="7.5" fill="var(--fig-text)">大 + 需跨集群查询</text>
      <text x="14" y="146" font-size="7.5" fill="var(--fig-text)">把各实例的块上传对象存储，统一查询层做全局视图</text>
      <text x="14" y="158" font-size="7.5" fill="var(--fig-node-c)">代价：查询链路变长，架构组件多</text>

      <!-- 路线 4 -->
      <rect x="6" y="168" width="328" height="44" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="181" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">④ 水平分片（按 job / 租户拆分）</text>
      <text x="220" y="181" font-size="7.5" fill="var(--fig-text)">超大（数千 target）</text>
      <text x="14" y="194" font-size="7.5" fill="var(--fig-text)">多个 Prometheus 各抓一部分目标，避免单实例内存/CPU 打满</text>
      <text x="14" y="206" font-size="7.5" fill="var(--fig-node-c)">代价：需要自行汇总查询（通常与 ②/③ 组合）</text>

      <!-- 选择依据 -->
      <rect x="6" y="220" width="328" height="40" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="233" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">先判断「瓶颈在哪」再选路线</text>
      <text x="14" y="245" font-size="7.5" fill="var(--fig-text)">抓取目标太多 → 分片；保留期太长 → 远程写；跨集群查询 → Thanos</text>

      <text x="6" y="270" font-size="7.5" fill="var(--fig-muted)">别一上来就上 Thanos：先看是不是「基数爆炸」或「抓取目标过多」这类更简单的问题</text>
    </svg>
    <figcaption>Prometheus 扩展四条路线：联邦（多集群）、远程写（最常见）、Thanos（全局查询）、分片（超大），按瓶颈选</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
