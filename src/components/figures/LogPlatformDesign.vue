<script setup>
/**
 * 从零搭一套日志平台（日写 100GB）（题 3035）。
 *
 * 核心洞察：日写 100GB 意味着「存储与索引」是主要成本与瓶颈，
 * 决策重点在采集方式、索引规划、保留策略与降级路径。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 268" role="img" aria-label="日写 100GB 日志平台的四个关键决策：采集、缓冲、索引与保留、成本降级">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">100GB/日 → 瓶颈在存储与索引，决策要围绕「怎么少花又够用」</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① 采集：Agent 而非应用直连</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">应用只写 stdout/文件，由 agent（Filebeat/Fluent Bit）采集与打标签</text>

      <rect x="6" y="58" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="71" font-size="8" font-weight="700" fill="var(--fig-node-b)">② 缓冲：必须有一层队列</text>
      <text x="14" y="84" font-size="7.5" fill="var(--fig-text)">Kafka/Redis 做缓冲，防止 ES 抖动时丢日志或把上游压垮</text>

      <rect x="6" y="96" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="109" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ 索引与保留：成本主战场</text>
      <text x="14" y="122" font-size="7.5" fill="var(--fig-text)">按天/按应用分索引 + ILM 分层（hot/warm/cold/delete）</text>

      <rect x="6" y="134" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="147" font-size="8" font-weight="700" fill="var(--fig-node-d)">④ 降级路径：不是所有日志都值得全索引</text>
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)">高频低价值日志可只存对象存储（需要时再查），或改用 Loki 只索引标签</text>

      <!-- 容量估算 -->
      <rect x="6" y="176" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="189" font-size="8.5" font-weight="700" fill="#e5484d">先算一笔账（决策依据）</text>
      <text x="14" y="202" font-size="7.5" fill="var(--fig-text)">100GB/日 × 30 天 ≈ 3TB 原始；ES 索引通常放大 1.5~3 倍</text>
      <text x="14" y="214" font-size="7.5" fill="var(--fig-text)">→ 内存、磁盘、分片数都要按这个量级规划，别按「先搭起来再说」</text>

      <rect x="6" y="228" width="328" height="20" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="242" font-size="7.5" fill="var(--fig-text)">关键指标：写入吞吐、索引延迟、查询 P99、存储日增</text>

      <text x="6" y="258" font-size="7.5" fill="var(--fig-muted)">验收：压测按峰值（不是日均）设计，留 2 倍余量应对大促/故障重放</text>
    </svg>
    <figcaption>100GB/日要围绕采集(agent)、缓冲(队列)、索引与保留(ILM)、降级路径四个决策；先算容量账再动手</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
