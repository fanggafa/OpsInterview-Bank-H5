<script setup>
/**
 * PV 的生命周期状态（题 4742）。
 *
 * 核心洞察：四个状态由「绑定/释放」驱动，而 Released 之后去哪，
 * 取决于回收策略（Retain 保留 / Delete 删除 / Recycle 清空）。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 244" role="img" aria-label="PV 生命周期四状态 Available、Bound、Released、Failed，以及三种回收策略">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">四状态由「绑定 / 释放」驱动，Released 之后去哪看回收策略</text>

      <rect x="6" y="22" width="150" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="35" font-size="8" font-weight="700" fill="var(--fig-node-a)">Available</text>
      <text x="14" y="47" font-size="7.5" fill="var(--fig-text)">已就绪，等待被 PVC 绑定</text>

      <rect x="184" y="22" width="150" height="30" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="192" y="35" font-size="8" font-weight="700" fill="var(--fig-node-b)">Bound</text>
      <text x="192" y="47" font-size="7.5" fill="var(--fig-text)">被某个 PVC 独占绑定</text>

      <rect x="6" y="60" width="150" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="73" font-size="8" font-weight="700" fill="var(--fig-node-c)">Released</text>
      <text x="14" y="85" font-size="7.5" fill="var(--fig-text)">PVC 已删，等待回收处理</text>

      <rect x="184" y="60" width="150" height="30" rx="4" fill="#e5484d" opacity=".12" />
      <text x="192" y="73" font-size="8" font-weight="700" fill="#e5484d">Failed</text>
      <text x="192" y="85" font-size="7.5" fill="var(--fig-text)">自动回收失败，需人工介入</text>

      <!-- 流转 -->
      <rect x="6" y="98" width="328" height="28" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="110" font-size="7.5" fill="var(--fig-text)">流转：Available →绑定→ Bound →删 PVC→ Released</text>
      <text x="14" y="122" font-size="7.5" fill="var(--fig-text)">Released 之后：回收成功回 Available，回收失败转 Failed</text>

      <!-- 回收策略 -->
      <rect x="6" y="130" width="328" height="46" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="143" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">三种回收策略决定「释放后去哪」</text>
      <text x="14" y="156" font-size="7.5" fill="var(--fig-text)">Retain 保留数据、回到 Available（重要数据，需人工清理）</text>
      <text x="14" y="168" font-size="7.5" fill="var(--fig-text)">Delete 删 PV 与底层数据（动态供给默认，适合临时卷）</text>

      <rect x="6" y="184" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="197" font-size="8" font-weight="700" fill="var(--fig-node-b)">排查命令</text>
      <text x="14" y="209" font-size="7.5" fill="var(--fig-text)">get pv（STATUS 列）· describe pv（看 Claim 与回收策略）· get pvc</text>

      <text x="6" y="228" font-size="7.5" fill="var(--fig-muted)">PVC 显示 Lost = 它绑定的 PV 已不存在（通常 PV 被误删）</text>
    </svg>
    <figcaption>PV 四状态 Available/Bound/Released/Failed；Released 后按回收策略（Retain/Delete/Recycle）决定去向</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
