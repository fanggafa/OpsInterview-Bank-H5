<script setup>
/**
 * df 与 lsblk 的区别（题 4129）。
 *
 * 核心洞察：df 看「文件系统层的剩余空间」，lsblk 看「块设备层的层级结构」；
 * du 看「哪个目录占的」。三者视角完全不同。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 234" role="img" aria-label="df 看文件系统剩余、lsblk 看块设备层级、du 看目录占用">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">三个命令视角不同：还剩多少 / 长什么样 / 谁占的</text>

      <rect x="6" y="20" width="328" height="42" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">df —— 文件系统层（已挂载）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">回答「还剩多少空间」「哪个挂载点满了」</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">未挂载的分区不出现；df -i 看 inode 是否耗尽</text>

      <rect x="6" y="70" width="328" height="42" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="83" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">lsblk —— 块设备层（层级树）</text>
      <text x="14" y="96" font-size="7.5" fill="var(--fig-text)">回答「有哪些盘/分区/LVM/RAID」</text>
      <text x="14" y="108" font-size="7.5" fill="var(--fig-text)">能看到 disk → part → lvm → MOUNTPOINT 层级</text>

      <rect x="6" y="120" width="328" height="30" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="133" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">du —— 目录树</text>
      <text x="14" y="145" font-size="7.5" fill="var(--fig-text)">回答「哪个目录占了多少」</text>

      <!-- 场景对照 -->
      <rect x="6" y="158" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="171" font-size="8" font-weight="700" fill="var(--fig-node-d)">场景 → 用哪个</text>
      <text x="14" y="183" font-size="7.5" fill="var(--fig-text)">磁盘满了 → df · 新盘没挂上 → lsblk · 谁占的 → du</text>

      <rect x="6" y="198" width="328" height="28" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="216" font-size="7.5" fill="var(--fig-text)">df 显示满但 du 加起来不满 → 有已删除但被进程占用的文件</text>

      <text x="6" y="226" font-size="7.5" fill="var(--fig-muted)">这种「删了但没释放」最常见于日志：进程还在写已被删的 fd</text>
    </svg>
    <figcaption>df 看文件系统剩余（df -i 看 inode）、lsblk 看设备层级、du 看目录占用；df 满而 du 不满说明有被进程占用的已删文件</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
