<script setup>
/**
 * Linux 误删文件恢复的原理（题 4127）。
 *
 * 核心洞察：rm 只是「断开目录项 + 把 inode/数据块标记为空闲」，数据还在，
 * 直到被新写入覆盖 —— 所以能不能救回来，取决于「有没有被覆盖」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 248" role="img" aria-label="删除只标记 inode 与数据块为空闲，数据仍在；被覆盖后无法恢复">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">删除 ≠ 抹除数据，只是「标记为空闲」</text>

      <rect x="6" y="20" width="328" height="42" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">rm 实际做了三件事</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">① 删目录项（名字不见了）② inode 链接计数归零 → 标记空闲</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">③ 数据块标记为「可复用」—— **但内容没有被清零**</text>

      <rect x="6" y="70" width="328" height="42" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="83" font-size="8.5" font-weight="700" fill="#e5484d">能不能救回来，只看一件事：有没有被覆盖</text>
      <text x="14" y="96" font-size="7.5" fill="var(--fig-text)">立刻停止写入（最好 remount 只读）→ 数据块还在 → 有希望</text>
      <text x="14" y="108" font-size="7.5" fill="var(--fig-text)">继续写文件/跑日志 → 数据块被复用 → 基本救不回来</text>

      <!-- 正确步骤 -->
      <text x="6" y="128" font-size="9" font-weight="700" fill="var(--fig-text)">正确的抢救顺序</text>

      <rect x="6" y="136" width="328" height="22" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="151" font-size="7.5" fill="var(--fig-text)">① 立即 remount,ro（或停机拔盘）—— 停止一切写入</text>

      <rect x="6" y="162" width="328" height="22" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="177" font-size="7.5" fill="var(--fig-text)">② dd 做整盘镜像，在镜像上操作（避免二次破坏）</text>

      <rect x="6" y="188" width="328" height="22" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="203" font-size="7.5" fill="var(--fig-text)">③ extundelete / ext4magic 扫描恢复，校验内容完整性</text>

      <rect x="6" y="214" width="328" height="18" rx="3" fill="#e5484d" opacity=".1" />
      <text x="14" y="227" font-size="7.5" fill="var(--fig-text)">三个限制：SSD 的 TRIM 会真抹数据 · XFS 工具支持差 · 覆盖后无解</text>

      <text x="6" y="240" font-size="7.5" fill="var(--fig-muted)">结论：恢复成功率很低，生产上依赖备份远比依赖恢复靠谱</text>
    </svg>
    <figcaption>rm 只标记 inode 与数据块空闲、不清零内容；能否恢复取决于是否被覆盖，抢救要立刻停写并做镜像</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
