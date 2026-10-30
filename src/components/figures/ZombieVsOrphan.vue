<script setup>
/**
 * 僵尸进程 vs 孤儿进程的对比图（题 4001）。
 *
 * 核心洞察：两者都源于「父进程没了」，但方向相反——
 * 僵尸是「子死了父不收尸」，孤儿是「父死了子还活着」，处理方式完全不同。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 250" role="img" aria-label="僵尸进程与孤儿进程对比：僵尸是子进程退出父进程未回收，孤儿是父进程先退出子进程被 init 收养">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">两者都源于「父子关系断了」，但方向相反</text>

      <!-- 僵尸 -->
      <rect x="6" y="20" width="160" height="120" rx="6" fill="#e5484d" opacity=".1" />
      <text x="14" y="35" font-size="9.5" font-weight="700" fill="#e5484d">僵尸 Zombie (Z)</text>
      <text x="14" y="52" font-size="8" fill="var(--fig-text)">子进程已退出</text>
      <text x="14" y="65" font-size="8" fill="var(--fig-text)">父进程没调 wait() 回收</text>
      <text x="14" y="82" font-size="8" fill="var(--fig-node-c)">占用：只占 PID 表项</text>
      <text x="14" y="95" font-size="8" fill="var(--fig-node-c)">不占 CPU / 内存</text>
      <text x="14" y="112" font-size="8" font-weight="700" fill="#e5484d">危害：耗尽 PID</text>
      <text x="14" y="128" font-size="7.5" fill="var(--fig-text)">kill 无效（它已经死了）</text>

      <!-- 孤儿 -->
      <rect x="174" y="20" width="160" height="120" rx="6" fill="var(--fig-node-b)" opacity=".1" />
      <text x="182" y="35" font-size="9.5" font-weight="700" fill="var(--fig-node-b)">孤儿 Orphan</text>
      <text x="182" y="52" font-size="8" fill="var(--fig-text)">父进程先退出</text>
      <text x="182" y="65" font-size="8" fill="var(--fig-text)">子进程还活着</text>
      <text x="182" y="82" font-size="8" fill="var(--fig-node-c)">占用：正常占资源</text>
      <text x="182" y="95" font-size="8" fill="var(--fig-node-c)">被 init(1) 收养</text>
      <text x="182" y="112" font-size="8" font-weight="700" fill="var(--fig-node-b)">危害：一般无害</text>
      <text x="182" y="128" font-size="7.5" fill="var(--fig-text)">退出时由 init 负责收尸</text>

      <!-- 处理 -->
      <text x="6" y="162" font-size="9.5" font-weight="700" fill="var(--fig-text)">怎么处理</text>
      <rect x="6" y="170" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="182" font-size="8" font-weight="700" fill="var(--fig-node-a)">僵尸：根治在父进程</text>
      <text x="96" y="182" font-size="7.5" fill="var(--fig-text)">wait()/waitpid() 或处理 SIGCHLD；应急可杀父进程让 init 接管</text>
      <text x="14" y="194" font-size="7.5" fill="var(--fig-node-c)">排查：ps -eo stat | grep -c Z；看 PPid 找父进程</text>

      <rect x="6" y="206" width="328" height="22" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="220" font-size="7.5" fill="var(--fig-text)">孤儿：通常无需处理；若要清理，按正常进程方式 kill</text>

      <text x="6" y="244" font-size="7.5" fill="var(--fig-muted)">记忆法：僵尸「死而不葬」，孤儿「活着但没爹」</text>
    </svg>
    <figcaption>僵尸是子进程已死、父进程未收尸（会耗尽 PID）；孤儿是父进程先死、被 init 收养（一般无害）</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
