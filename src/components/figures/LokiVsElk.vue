<script setup>
/**
 * Loki 与 ELK 的区别与选型（题 3019）。
 *
 * 核心洞察：ELK 全文索引（查得快但贵），Loki 只索引标签（省存储但查询靠扫描）；
 * 选哪个取决于「查询模式」与「预算」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 256" role="img" aria-label="ELK 全文索引查询快但存储贵，Loki 只索引标签省成本但查询靠扫描，按查询模式与预算选型">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">ELK 索引「内容」，Loki 只索引「标签」——代价与查询方式完全不同</text>

      <rect x="6" y="20" width="160" height="84" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">ELK / OpenSearch</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">全文倒排索引</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">任意关键字查询都快</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">支持聚合分析（可视化强）</text>
      <text x="14" y="82" font-size="7.5" fill="#e5484d">存储与 CPU 开销大</text>
      <text x="14" y="94" font-size="7.5" fill="var(--fig-node-c)">适合：复杂检索、审计、分析</text>

      <rect x="174" y="20" width="160" height="84" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">Loki</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">只索引标签（stream）</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">日志本体压缩存对象存储</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">按标签过滤后再扫描内容</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-node-c)">存储成本低、写入吞吐高</text>
      <text x="182" y="94" font-size="7.5" fill="var(--fig-node-c)">适合：按服务/实例看日志</text>

      <!-- 选型 -->
      <rect x="6" y="112" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="125" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">怎么选（按查询模式）</text>
      <text x="14" y="138" font-size="7.5" fill="var(--fig-text)">要「全文搜任意字符串 / 做聚合统计」→ ELK</text>
      <text x="14" y="150" font-size="7.5" fill="var(--fig-text)">要「按 pod/service 看日志、量大想省钱」→ Loki</text>

      <rect x="6" y="166" width="328" height="34" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="179" font-size="8" font-weight="700" fill="#e5484d">Loki 的两个前提</text>
      <text x="14" y="192" font-size="7.5" fill="var(--fig-text)">① 标签设计要好（标签爆炸会毁掉性能）② 查询要带标签，别裸扫</text>

      <rect x="6" y="208" width="328" height="24" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="224" font-size="7.5" fill="var(--fig-node-d)">两者都能与 Grafana 集成，也可以「ELK 做审计 + Loki 做排障」并用</text>

      <text x="6" y="248" font-size="7.5" fill="var(--fig-muted)">易混点：Loki 不是「便宜的 ELK」——它牺牲了全文检索能力</text>
    </svg>
    <figcaption>ELK 全文索引、查询快但贵；Loki 只索引标签、成本低但需按标签查；按查询模式与预算选，也可并存</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
