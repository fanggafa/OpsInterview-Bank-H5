<script setup>
/**
 * K8s 的 CronJob 与 Job（题 4623）。
 *
 * 核心洞察：Job 管「一次性任务跑完」，CronJob 是「按时间表创建 Job」，
 * 所以 CronJob 的坑大多来自「上一轮还没跑完」或「并发策略没设」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 240" role="img" aria-label="Job 是一次性任务，CronJob 按时间表创建 Job；CronJob 的并发策略与历史限制">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">CronJob 本质是「定时创建 Job」—— 坑都来自时间与并发</text>

      <rect x="6" y="20" width="160" height="70" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">Job</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">一次性任务，跑完即完成</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">backoffLimit 控制重试次数</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">completions / parallelism 控制批次</text>
      <text x="14" y="82" font-size="7" fill="var(--fig-node-c)">注意：不设 ttl 会一直留着</text>

      <rect x="174" y="20" width="160" height="70" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">CronJob</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">按 cron 表达式创建 Job</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">concurrencyPolicy 控制重叠</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">historyLimit 控制保留几轮</text>
      <text x="182" y="82" font-size="7" fill="var(--fig-node-c)">存在「上一轮未完成」的风险</text>

      <!-- 坑 -->
      <rect x="6" y="98" width="328" height="52" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="111" font-size="8.5" font-weight="700" fill="#e5484d">CronJob 最容易踩的四个坑</text>
      <text x="14" y="124" font-size="7.5" fill="var(--fig-text)">① 上一轮没跑完就跑下一轮（默认 Forbid 会跳过，Allow 会并发执行）</text>
      <text x="14" y="136" font-size="7.5" fill="var(--fig-text)">② 调度延迟：集群忙时可能晚几分钟才起　③ 时区：cron 用 UTC（别忘时区差）</text>
      <text x="14" y="148" font-size="7" fill="var(--fig-node-c)">④ 历史 Job 与 Pod 不清理 → 对象堆积（设 historyLimit 与 ttlSecondsAfterFinished）</text>

      <rect x="6" y="158" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="171" font-size="8" font-weight="700" fill="var(--fig-node-c)">并发策略三选</text>
      <text x="14" y="183" font-size="7.5" fill="var(--fig-text)">Forbid（跳过，默认）· Allow（允许并发，需任务本身幂等）· Replace（终止旧的再起新的）</text>

      <rect x="6" y="198" width="328" height="18" rx="3" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="211" font-size="7.5" fill="var(--fig-text)">实践：任务必须「幂等 + 加锁」，别依赖 K8s 保证只跑一次</text>

      <text x="6" y="230" font-size="7.5" fill="var(--fig-muted)">排查：kubectl get jobs --watch 看是否卡在未完成；describe 看失败原因</text>
    </svg>
    <figcaption>Job 跑完即完成、CronJob 按时建 Job；坑在上一轮未完成、调度延迟、UTC 时区、历史对象堆积，需配并发策略与 historyLimit</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
