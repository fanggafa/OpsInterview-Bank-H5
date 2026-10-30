<script setup>
/**
 * 虚拟机磁盘格式 raw / qcow2 / vmdk 的对比与选型（题 2608）。
 *
 * 核心洞察：raw 性能最好但不支持快照；qcow2 功能全（快照/压缩/稀疏）
 * 但多一层映射；选型取决于「性能 vs 灵活性」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 258" role="img" aria-label="raw、qcow2、vmdk 三种虚拟机磁盘格式在性能、快照、压缩、适用场景上的对比">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">取舍在「性能 vs 灵活性」：raw 最快但没快照，qcow2 功能全但多一层映射</text>

      <!-- raw -->
      <rect x="6" y="20" width="328" height="56" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">raw（裸格式）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">直接写块，性能最接近物理盘；不支持快照、压缩、稀疏分配</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">容量按预分配占满（不支持稀疏）→ 占用大</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-node-c)">适合：生产数据库、高性能场景（外部用 LVM/存储快照兜底）</text>

      <!-- qcow2 -->
      <rect x="6" y="84" width="328" height="56" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="97" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">qcow2（QEMU 原生，最常用）</text>
      <text x="14" y="110" font-size="7.5" fill="var(--fig-text)">支持快照、压缩、稀疏分配、加密；支持后备链（backing file）</text>
      <text x="14" y="122" font-size="7.5" fill="var(--fig-text)">代价：多一层「块映射」，随机写性能略低于 raw</text>
      <text x="14" y="134" font-size="7.5" fill="var(--fig-node-c)">适合：开发测试、需要快照/克隆的场景、桌面虚拟化</text>

      <!-- vmdk -->
      <rect x="6" y="148" width="328" height="56" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="161" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">vmdk（VMware 格式）</text>
      <text x="14" y="174" font-size="7.5" fill="var(--fig-text)">VMware 生态标准格式，支持快照与稀疏</text>
      <text x="14" y="186" font-size="7.5" fill="var(--fig-text)">跨平台兼容性取决于工具（可用 qemu-img 转换）</text>
      <text x="14" y="198" font-size="7.5" fill="var(--fig-node-c)">适合：VMware 环境、与外部团队交换镜像</text>

      <!-- 转换 -->
      <rect x="6" y="212" width="328" height="24" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="228" font-size="7.5" fill="var(--fig-text)">格式可互转：qemu-img convert -f qcow2 -O raw src.qcow2 dst.raw</text>

      <text x="6" y="250" font-size="7.5" fill="var(--fig-muted)">运维提示：qcow2 快照链过长会显著降性能，要定期合并（blockcommit）</text>
    </svg>
    <figcaption>raw 性能最好但不支持快照；qcow2 功能最全（快照/压缩/稀疏）；vmdk 是 VMware 生态格式</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
