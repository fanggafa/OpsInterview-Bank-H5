<script setup>
/**
 * rsync 增量同步原理与 --delete / --link-dest（题 2405）。
 *
 * 核心洞察：rsync 默认按「大小 + 时间戳」判断差异（不是逐字节比对）；
 * --link-dest 用硬链接做「快照式备份」，同一份未变文件只占一份空间。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 250" role="img" aria-label="rsync 增量判断依据、--delete 的镜像删除语义、--link-dest 用硬链接节省空间的快照式备份">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">默认按「大小 + 时间戳」判断差异，不是逐字节比对</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">增量判断依据</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">大小或 mtime 变化才传输；加 -c 改为校验和比对（更准但读全量）</text>

      <rect x="6" y="58" width="328" height="34" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="71" font-size="8" font-weight="700" fill="#e5484d">--delete 的语义</text>
      <text x="14" y="84" font-size="7.5" fill="var(--fig-text)">让目标与源「完全一致」→ 目标里多出来的文件会被删除（镜像同步）</text>

      <rect x="6" y="96" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="109" font-size="8" font-weight="700" fill="var(--fig-node-c)">--link-dest（快照式备份）</text>
      <text x="14" y="122" font-size="7.5" fill="var(--fig-text)">未变化的文件用硬链接指向上一次备份 → 只占一份空间</text>

      <!-- 危险与安全 -->
      <rect x="6" y="134" width="328" height="48" rx="5" fill="#e5484d" opacity=".12" />
      <text x="14" y="147" font-size="8.5" font-weight="700" fill="#e5484d">--delete 的三个典型事故</text>
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)">① 源与目标写反 ② 源路径末尾斜杠造成语义差异</text>
      <text x="14" y="172" font-size="7.5" fill="var(--fig-text)">③ NFS/网络盘没挂上导致源为空 → 目标被清空</text>

      <rect x="6" y="186" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="199" font-size="8" font-weight="700" fill="var(--fig-node-a)">安全习惯</text>
      <text x="14" y="212" font-size="7.5" fill="var(--fig-text)">先 -n（dry-run）看清会删什么 · --max-delete=N 限速 · 加挂载检查</text>

      <text x="6" y="244" font-size="7.5" fill="var(--fig-muted)">易混点：--delete 是「让目标等于源」，不是「清理源里的多余文件」</text>
    </svg>
    <figcaption>rsync 按大小+mtime 判断增量；--delete 让目标与源完全一致（也最容易误删）；--link-dest 用硬链接省空间</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
