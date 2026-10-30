<script setup>
/**
 * GitLab 自建性能排查的组件分层（题 2810）。
 *
 * 核心洞察：GitLab 是「Rails + PostgreSQL + Redis + Sidekiq + Gitaly」的大杂烩，
 * 慢要先定位「哪个组件」，而不是笼统地说「GitLab 慢」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 262" role="img" aria-label="自建 GitLab 的组件分层排查：Rails、PostgreSQL、Redis、Sidekiq、Gitaly 各自的慢法">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">先定位「哪个组件慢」，而不是笼统地说 GitLab 慢</text>

      <rect x="6" y="20" width="328" height="20" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="34" font-size="7.5" font-weight="700" fill="var(--fig-node-a)">第一步：gitlab-ctl status / gitlab-ctl tail（看哪个组件在报警）</text>

      <rect x="6" y="46" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="59" font-size="8" font-weight="700" fill="var(--fig-node-b)">Rails（Web/API）</text>
      <text x="14" y="72" font-size="7.5" fill="var(--fig-text)">慢在 Puma worker 打满、内存不足、或某个接口 N+1 查询</text>

      <rect x="6" y="84" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="97" font-size="8" font-weight="700" fill="var(--fig-node-c)">PostgreSQL</text>
      <text x="14" y="110" font-size="7.5" fill="var(--fig-text)">慢在慢查询、连接数打满、autovacuum 跟不上、磁盘 IO 打满</text>

      <rect x="6" y="122" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="135" font-size="8" font-weight="700" fill="var(--fig-node-d)">Redis（缓存 + 队列）</text>
      <text x="14" y="148" font-size="7.5" fill="var(--fig-text)">慢在内存满触发淘汰、或大 key 阻塞单线程</text>

      <rect x="6" y="160" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="173" font-size="8" font-weight="700" fill="var(--fig-node-a)">Sidekiq（后台任务）</text>
      <text x="14" y="186" font-size="7.5" fill="var(--fig-text)">队列积压 → 表现为「提交流水线/合并请求后很久没反应」</text>

      <rect x="6" y="198" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="211" font-size="8" font-weight="700" fill="var(--fig-node-b)">Gitaly（Git 仓库访问）</text>
      <text x="14" y="224" font-size="7.5" fill="var(--fig-text)">慢在磁盘 IO、大仓库克隆/fetch、或 Gitaly 进程资源不足</text>

      <text x="6" y="246" font-size="7.5" fill="var(--fig-muted)">排查要点：先看「哪类操作慢」（打开页面 / 提交代码 / 跑流水线），再对到上面对应组件</text>
      <text x="6" y="258" font-size="7.5" fill="var(--fig-muted)">常见误判：把所有慢都归因于「服务器不够」，实际常是某个组件的单点瓶颈</text>
    </svg>
    <figcaption>GitLab 慢要按组件定位：Rails、PostgreSQL、Redis、Sidekiq、Gitaly，各自有典型慢法</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
