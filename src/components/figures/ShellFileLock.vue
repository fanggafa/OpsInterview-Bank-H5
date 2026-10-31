<script setup>
/**
 * Shell 文件锁防并发执行（题 4224）。
 *
 * 核心洞察：手写锁易在「异常退出」时留下死锁；flock 靠文件描述符锁，
 * 进程消失时锁自动释放，所以更可靠。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 252" role="img" aria-label="flock 用文件描述符锁并在进程退出时自动释放，手写锁易因异常退出留死锁">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">关键差别：flock 随进程消失自动释放，手写锁容易留死锁</text>

      <rect x="6" y="20" width="160" height="84" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">flock（推荐）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">对文件描述符加锁</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">进程退出/被杀 → 锁自动释放</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">flock -n 锁文件 命令</text>
      <text x="14" y="82" font-size="7.5" fill="var(--fig-text)">-n 不等待（拿不到就退出）</text>
      <text x="14" y="94" font-size="7" fill="var(--fig-node-c)">可配合 -w 超时等待</text>

      <rect x="174" y="20" width="160" height="84" rx="5" fill="#e5484d" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="#e5484d">手写锁（易出错）</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">用 mkdir/ln 的原子性做锁</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">或写 pid 文件判断</text>
      <text x="182" y="70" font-size="7.5" fill="#e5484d">异常退出（kill -9）→ 锁残留</text>
      <text x="182" y="82" font-size="7.5" fill="#e5484d">需自己处理「陈旧锁」判断</text>
      <text x="182" y="94" font-size="7" fill="#e5484d">容易「看着有锁其实进程已死」</text>

      <!-- 用法 -->
      <rect x="6" y="114" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="127" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">典型写法</text>
      <text x="14" y="140" font-size="7.5" fill="var(--fig-text)">exec 9&gt;/var/lock/myscript.lock　flock -n 9 || exit 0</text>
      <text x="14" y="152" font-size="7.5" fill="var(--fig-text)">用 exec 把 fd 常驻整个脚本，脚本结束（任何方式）才释放</text>

      <rect x="6" y="170" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="183" font-size="8" font-weight="700" fill="var(--fig-node-d)">并发脚本场景</text>
      <text x="14" y="195" font-size="7.5" fill="var(--fig-text)">cron 任务重叠是最常见来源；加锁后第二次执行直接退出（不排队）</text>

      <rect x="6" y="212" width="328" height="20" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="226" font-size="7.5" fill="var(--fig-text)">排查：fuser /var/lock/x.lock 或 lsof 看谁还持有锁</text>

      <text x="6" y="242" font-size="7.5" fill="var(--fig-muted)">注意：网络文件系统（NFS）上的 flock 行为不可靠，别在共享盘上做锁</text>
    </svg>
    <figcaption>flock 对 fd 加锁、进程消失即释放；手写锁在 kill -9 后残留且要自己判断陈旧锁。常见来源是 cron 任务重叠</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
