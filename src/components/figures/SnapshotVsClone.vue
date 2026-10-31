<script setup>
/**
 * 快照与克隆（题 2417）。
 *
 * 核心洞察：快照是「某个时刻的只读镜像」，依赖原卷（原卷坏了快照也可能坏）；
 * 克隆是「独立的完整副本」，与原卷无依赖但占空间、耗时长。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 248" role="img" aria-label="快照依赖原卷、瞬时创建但非独立备份；克隆是独立完整副本，占空间但可独立使用">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">快照「依赖原卷」，克隆「完全独立」—— 别把快照当备份</text>

      <rect x="6" y="20" width="160" height="82" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">快照 Snapshot</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">瞬时创建（秒级）、占空间小</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">写时复制（COW）增量保存</text>
      <text x="14" y="70" font-size="7.5" fill="#e5484d">依赖原卷：原卷损坏快照可能一起坏</text>
      <text x="14" y="82" font-size="7.5" fill="#e5484d">不改数据时几乎不占空间</text>
      <text x="14" y="94" font-size="7" fill="var(--fig-node-c)">适合：回滚变更、临时保护</text>

      <rect x="174" y="20" width="160" height="82" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">克隆 Clone</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">创建较慢、占完整空间</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">完全独立，与原卷无关联</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-node-b)">原卷损坏不影响克隆</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-text)">可直接挂载/启动使用</text>
      <text x="182" y="94" font-size="7" fill="var(--fig-node-c)">适合：测试环境、独立副本</text>

      <!-- 关键结论 -->
      <rect x="6" y="112" width="328" height="48" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="125" font-size="8.5" font-weight="700" fill="#e5484d">最重要的一条：快照不是备份</text>
      <text x="14" y="138" font-size="7.5" fill="var(--fig-text)">快照与原卷在同一存储上 → 存储整体故障时两者一起丢</text>
      <text x="14" y="150" font-size="7.5" fill="var(--fig-text)">快照也不防误删：删原卷会连带快照（除非先克隆/导出）</text>

      <rect x="6" y="168" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="181" font-size="8" font-weight="700" fill="var(--fig-node-c)">正确用法</text>
      <text x="14" y="193" font-size="7.5" fill="var(--fig-text)">变更前打快照（快速回滚）· 备份要克隆或导出到**不同存储/异地**</text>

      <rect x="6" y="210" width="328" height="20" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="224" font-size="7.5" fill="var(--fig-text)">注意：快照链越长回滚越慢（要合并增量），定期整理</text>

      <text x="6" y="240" font-size="7.5" fill="var(--fig-muted)">判断：这份副本「原卷坏了我还能用吗」？不能就不是备份</text>
    </svg>
    <figcaption>快照瞬时创建但依赖原卷（不是备份），克隆独立完整但占空间耗时；变更前打快照，备份要克隆/导出到异地</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
