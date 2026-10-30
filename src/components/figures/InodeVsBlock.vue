<script setup>
/**
 * inode 与 data block 是两个独立上限（题 4002）。
 *
 * 核心洞察：文件系统同时受「inode 数量」与「数据块数量」两个约束，
 * 任意一个用满都会报 `No space left on device` —— 但现象完全不同，
 * 所以 `df -h` 与 `df -i` 必须一起看。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 262" role="img" aria-label="inode 与数据块是文件系统的两个独立上限，各自用满都报 No space left，需要 df -h 与 df -i 一起看">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">文件系统有两个独立「名额」，任一用满都报 No space left on device</text>

      <!-- 两个桶 -->
      <rect x="6" y="20" width="160" height="88" rx="6" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="35" font-size="9" font-weight="700" fill="var(--fig-node-a)">① inode（索引节点）</text>
      <text x="14" y="50" font-size="7.5" fill="var(--fig-text)">每个文件一条，存元数据：</text>
      <text x="14" y="62" font-size="7.5" fill="var(--fig-text)">权限 / 属主 / 大小 / 时间戳 / 块指针</text>
      <text x="14" y="76" font-size="7.5" font-weight="700" fill="#e5484d">不存文件名（文件名在目录项）</text>
      <text x="14" y="90" font-size="7.5" fill="var(--fig-node-c)">用满 → 无法创建新文件</text>
      <text x="14" y="102" font-size="7.5" fill="var(--fig-node-c)">但已有文件还能正常写</text>

      <rect x="174" y="20" width="160" height="88" rx="6" fill="var(--fig-node-b)" opacity=".1" />
      <text x="182" y="35" font-size="9" font-weight="700" fill="var(--fig-node-b)">② data block（数据块）</text>
      <text x="182" y="50" font-size="7.5" fill="var(--fig-text)">文件内容真正存放的地方</text>
      <text x="182" y="62" font-size="7.5" fill="var(--fig-text)">inode 里只存「块指针」</text>
      <text x="182" y="76" font-size="7.5" fill="var(--fig-node-c)">用满 → 真的没空间了</text>
      <text x="182" y="90" font-size="7.5" fill="var(--fig-node-c)">连已有文件也写不进</text>
      <text x="182" y="102" font-size="7.5" fill="var(--fig-text)">这是通常理解的「磁盘满」</text>

      <!-- 关键现象 -->
      <rect x="6" y="116" width="328" height="34" rx="5" fill="#e5484d" opacity=".12" />
      <text x="14" y="129" font-size="8.5" font-weight="700" fill="#e5484d">经典现象：df -h 还有空间，但写入报 No space left</text>
      <text x="14" y="142" font-size="8" fill="var(--fig-text)">原因就是 inode 用满 —— 大量小文件是头号元凶</text>

      <!-- 排查 -->
      <text x="6" y="168" font-size="9.5" font-weight="700" fill="var(--fig-text)">排查与定位</text>
      <rect x="6" y="176" width="328" height="46" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="189" font-size="8" font-weight="700" fill="var(--fig-node-c)">两个命令必须一起看</text>
      <text x="14" y="202" font-size="7.5" fill="var(--fig-text)">df -h 看块使用率　·　df -i 看 inode 使用率（IUse% 到 100% 即元凶）</text>
      <text x="14" y="215" font-size="7.5" fill="var(--fig-text)">找小文件：du -sh 逐层下钻，或 find 按目录统计文件数</text>

      <!-- 治理 -->
      <rect x="6" y="228" width="328" height="28" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="241" font-size="8" font-weight="700" fill="var(--fig-node-a)">治理</text>
      <text x="52" y="241" font-size="7.5" fill="var(--fig-text)">清理小文件 / 大目录单独分区 / 用 XFS（动态 inode）而非固定值</text>
      <text x="14" y="252" font-size="7.5" fill="var(--fig-node-c)">监控：inode 使用率要单独告警，只盯块空间会漏</text>
    </svg>
    <figcaption>块空间与 inode 是两个独立上限：df -h 有空间却写不进，几乎都是 inode 用满</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
