<script setup>
/**
 * MySQL 主从复制三线程图。
 * 展示「主库 binlog dump → 从库 IO 线程写 relay log → SQL 线程重放」的完整链路，
 * 并标出「复制延迟」与「半同步」两个关键位置。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 216" role="img" aria-label="MySQL 主从复制的三个线程与两段日志">
      <defs>
        <marker id="arrRepl" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-node-a)" />
        </marker>
        <marker id="arrRepl2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-node-c)" />
        </marker>
      </defs>

      <!-- 主库 -->
      <rect x="6" y="20" width="118" height="86" rx="8" fill="var(--fig-node-a)" opacity=".08" />
      <rect x="6" y="20" width="118" height="86" rx="8" fill="none" stroke="var(--fig-node-a)" stroke-width="1.5" />
      <text x="16" y="36" font-size="10" font-weight="700" fill="var(--fig-node-a)">主库 Master</text>

      <rect x="16" y="44" width="96" height="20" rx="4" fill="var(--fig-node-a)" opacity=".86" />
      <text x="64" y="58" text-anchor="middle" font-size="9" fill="#fff" font-weight="600">binlog</text>
      <text x="16" y="76" font-size="8.5" fill="var(--fig-muted)">① 提交时写 binlog</text>

      <rect x="16" y="82" width="96" height="18" rx="4" fill="var(--fig-card)" stroke="var(--fig-node-a)" stroke-width="1.2" />
      <text x="64" y="94" text-anchor="middle" font-size="8.5" fill="var(--fig-node-a)" font-weight="600">dump 线程</text>

      <!-- 中间传递 -->
      <path d="M126 91 L188 91" stroke="var(--fig-node-a)" stroke-width="1.8" marker-end="url(#arrRepl)" />
      <text x="157" y="84" text-anchor="middle" font-size="8.5" fill="var(--fig-node-a)" font-weight="600">网络传输</text>
      <text x="157" y="104" text-anchor="middle" font-size="8" fill="var(--fig-muted)">半同步在此确认</text>

      <!-- 从库 -->
      <rect x="192" y="20" width="142" height="86" rx="8" fill="var(--fig-node-c)" opacity=".08" />
      <rect x="192" y="20" width="142" height="86" rx="8" fill="none" stroke="var(--fig-node-c)" stroke-width="1.5" />
      <text x="202" y="36" font-size="10" font-weight="700" fill="var(--fig-node-c)">从库 Slave</text>

      <rect x="202" y="44" width="58" height="20" rx="4" fill="var(--fig-node-c)" opacity=".86" />
      <text x="231" y="58" text-anchor="middle" font-size="8.5" fill="#fff" font-weight="600">IO 线程</text>

      <path d="M262 54 L280 54" stroke="var(--fig-node-c)" stroke-width="1.6" marker-end="url(#arrRepl2)" />

      <rect x="284" y="44" width="42" height="20" rx="4" fill="var(--fig-card)" stroke="var(--fig-node-c)" stroke-width="1.2" />
      <text x="305" y="57" text-anchor="middle" font-size="7.5" fill="var(--fig-node-c)" font-weight="600">relay log</text>

      <rect x="202" y="72" width="58" height="18" rx="4" fill="var(--fig-node-b)" opacity=".86" />
      <text x="231" y="84" text-anchor="middle" font-size="8.5" fill="#fff" font-weight="600">SQL 线程</text>
      <text x="266" y="84" font-size="8.5" fill="var(--fig-text)">③ 重放</text>

      <!-- 延迟说明 -->
      <rect x="6" y="116" width="328" height="42" rx="8" fill="var(--fig-node-d)" opacity=".1" />
      <rect x="6" y="116" width="328" height="42" rx="8" fill="none" stroke="var(--fig-node-d)" stroke-width="1.3" />
      <text x="16" y="132" font-size="9.5" font-weight="700" fill="var(--fig-node-d)">复制延迟 = ② 与 ③ 之间的时间差</text>
      <text x="16" y="148" font-size="8.5" fill="var(--fig-text)">Seconds_Behind_Master 大 → 大事务、单线程重放、从库资源不足、网络抖动</text>

      <!-- 关键配置 -->
      <g font-size="8.5">
        <text x="6" y="176" font-size="9.5" font-weight="700" fill="var(--fig-text)">半同步 vs 异步</text>
        <text x="6" y="192" fill="var(--fig-muted)">异步：主库写完即返回 → 主挂可能丢数据</text>
        <text x="6" y="204" fill="var(--fig-node-c)">半同步：至少一个从库 ACK → 丢数据风险大幅降低</text>
        <text x="6" y="216" fill="var(--fig-muted)">并行复制（MTS）：按库/组提交并行重放，降低延迟</text>
      </g>
    </svg>
    <figcaption>三个线程两段日志；排查延迟先看是「传不过来」还是「重放不完」</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
