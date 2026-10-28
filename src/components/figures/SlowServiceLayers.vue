<script setup>
/**
 * 「服务变慢」的四层分流排查图。
 * 场景题里最高频的一类：「资源正常但服务慢」——
 * 这张图把「资源 → 应用 → 依赖 → 链路」四层该看什么一次性列清。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 238" role="img" aria-label="服务变慢时按资源、应用、依赖、链路四层分流排查">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">先分层，再看每层用什么工具判断</text>

      <!-- ① 资源层 -->
      <rect x="6" y="20" width="328" height="42" rx="6" fill="var(--fig-node-a)" opacity=".1" />
      <rect x="6" y="20" width="328" height="42" rx="6" fill="none" stroke="var(--fig-node-a)" stroke-width="1.2" />
      <text x="14" y="36" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① 资源层：CPU / 内存 / 磁盘 / 网络</text>
      <text x="14" y="50" font-size="7.5" fill="var(--fig-text)">top 看 us/sy/wa/st 分摊；iostat -x 看 await 与 %util；vmstat 看 si/so（是否 swap）</text>
      <text x="14" y="60" font-size="7" fill="var(--fig-muted)">判断要点：利用率高不一定慢，**排队（饱和度）才是**</text>

      <!-- ② 应用层 -->
      <rect x="6" y="66" width="328" height="42" rx="6" fill="var(--fig-node-b)" opacity=".1" />
      <rect x="6" y="66" width="328" height="42" rx="6" fill="none" stroke="var(--fig-node-b)" stroke-width="1.2" />
      <text x="14" y="82" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">② 应用层：线程/连接池/GC/锁</text>
      <text x="14" y="96" font-size="7.5" fill="var(--fig-text)">jstack 看线程卡在哪；连接池 active 是否打满；GC 停顿时间；是否有锁竞争</text>
      <text x="14" y="106" font-size="7" fill="var(--fig-muted)">典型特征：CPU 不高但吞吐上不去 → 线程在「等」而不是在「算」</text>

      <!-- ③ 依赖层 -->
      <rect x="6" y="112" width="328" height="42" rx="6" fill="var(--fig-node-c)" opacity=".1" />
      <rect x="6" y="112" width="328" height="42" rx="6" fill="none" stroke="var(--fig-node-c)" stroke-width="1.2" />
      <text x="14" y="128" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">③ 依赖层：DB / 缓存 / 第三方接口</text>
      <text x="14" y="142" font-size="7.5" fill="var(--fig-text)">DB 慢查询与锁等待；Redis 命中率与延迟；第三方接口 P99 与错误率</text>
      <text x="14" y="152" font-size="7" fill="var(--fig-muted)">典型特征：自身指标都好，但请求耗时的绝大部分花在下游</text>

      <!-- ④ 链路层 -->
      <rect x="6" y="158" width="328" height="42" rx="6" fill="var(--fig-node-d)" opacity=".1" />
      <rect x="6" y="158" width="328" height="42" rx="6" fill="none" stroke="var(--fig-node-d)" stroke-width="1.2" />
      <text x="14" y="174" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">④ 链路层：网络 / LB / 跨可用区</text>
      <text x="14" y="188" font-size="7.5" fill="var(--fig-text)">跨 AZ 调用多 1-3ms；LB 超时与后端摘除；DNS/search 域重复解析；MTU 分片</text>
      <text x="14" y="198" font-size="7" fill="var(--fig-muted)">典型特征：单机压测很快，走完整链路就慢</text>

      <!-- 结论 -->
      <text x="6" y="216" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">判断口诀：先看「谁在等谁」——等 CPU、等锁、等下游，还是等网络</text>
      <text x="6" y="226" font-size="7.5" fill="var(--fig-muted)">没有链路追踪时，最有效的手段是「分段计时」：在代码里打点，看耗时落在哪一段</text>
    </svg>
    <figcaption>「服务慢」的答案永远在四层里的某一层；分层是为了不瞎猜</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
