<script setup>
/**
 * 日志平台「查不到历史日志」（题 3031）。
 *
 * 核心洞察：多半不是「丢了」而是「被按策略删了」——
 * ILM 到期删除、保留期太短、或索引/别名写错导致数据没进你查的那些索引。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 248" role="img" aria-label="查不到历史日志的四类原因：ILM 已删除、保留期设置、索引或别名写错、查询范围与分片未分配">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">多数不是「丢了」，而是「按策略删了」或「写进了别的索引」</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="#e5484d" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="#e5484d">① ILM 到期已删除（最常见）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">delete 阶段把索引删了 → 数据真的没了，只能看保留期是否合理</text>

      <rect x="6" y="58" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="71" font-size="8" font-weight="700" fill="var(--fig-node-a)">② 保留期 / 分片设置不当</text>
      <text x="14" y="84" font-size="7.5" fill="var(--fig-text)">按「时间」保留但写入时间错（服务器时区/时钟不同步）→ 提前被删</text>

      <rect x="6" y="96" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="109" font-size="8" font-weight="700" fill="var(--fig-node-b)">③ 索引名 / 别名写错</text>
      <text x="14" y="122" font-size="7.5" fill="var(--fig-text)">写入了 logstash-2024 但查的是 app-* → 查不到但数据还在</text>

      <rect x="6" y="134" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="147" font-size="8" font-weight="700" fill="var(--fig-node-c)">④ 查询时间范围与分片状态</text>
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)">Kibana 默认只查最近 15 分钟；分片 unassigned 时数据查不到</text>

      <!-- 排查 -->
      <rect x="6" y="174" width="328" height="46" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="187" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">排查顺序</text>
      <text x="14" y="200" font-size="7.5" fill="var(--fig-text)">① GET _cat/indices 看还有哪些索引、时间范围　② 看 ILM 策略的 min_age</text>
      <text x="14" y="212" font-size="7.5" fill="var(--fig-text)">③ 用 curl 直接查 ES（排除 Kibana 的时间过滤）　④ GET _cat/shards 看是否 unassigned</text>

      <rect x="6" y="226" width="328" height="20" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="240" font-size="7.5" fill="var(--fig-text)">长期方案：保留期按合规要求定；关键日志另做冷存储/对象存储归档</text>
    </svg>
    <figcaption>查不到历史日志多为 ILM 已删、保留期与时区错、索引别名写错、Kibana 时间范围；先看 _cat/indices 还剩什么</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
