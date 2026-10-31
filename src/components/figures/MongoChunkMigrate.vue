<script setup>
/**
 * MongoDB 分片集群 chunk 迁移（题 2032）。
 *
 * 核心洞察：迁移是「balancer 发现分布不均 → 选 chunk → 复制数据 → 切换路由 → 删源」，
 * 风险在占用 IO/网络、以及迁移期间的写入与查询抖动。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 252" role="img" aria-label="chunk 迁移五步：均衡器选出 chunk、复制到目标、切换路由、删源；风险是 IO 网络占用与查询抖动">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">路线：均衡器发现不均 → 选 chunk → 复制 → 切路由 → 删源数据</text>

      <rect x="6" y="20" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="36" font-size="7.5" fill="var(--fig-text)">① balancer 检测分片间 chunk 数量差异超过阈值（默认迁移窗口内执行）</text>

      <rect x="6" y="50" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="66" font-size="7.5" fill="var(--fig-text)">② 选出要迁移的 chunk（通常挑数量最多分片上的）</text>

      <rect x="6" y="80" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="96" font-size="7.5" fill="var(--fig-text)">③ 把 chunk 内文档复制到目标分片（期间新写入会被跟进同步）</text>

      <rect x="6" y="110" width="328" height="26" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="126" font-size="7.5" fill="var(--fig-text)">④ 更新 config server 的路由元数据（切换点，毫秒级但影响读写）</text>

      <rect x="6" y="140" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="156" font-size="7.5" fill="var(--fig-text)">⑤ 删除源分片上的旧数据（释放空间）</text>

      <!-- 风险 -->
      <rect x="6" y="170" width="328" height="42" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="183" font-size="8.5" font-weight="700" fill="#e5484d">三个风险</text>
      <text x="14" y="196" font-size="7.5" fill="var(--fig-text)">① 占满磁盘/网络 IO → 影响在线读写　② 迁移中查询可能变慢或重试</text>
      <text x="14" y="208" font-size="7.5" fill="var(--fig-text)">③ 大 chunk 迁移慢，若目标磁盘不足会失败并重试</text>

      <rect x="6" y="216" width="328" height="20" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="230" font-size="7.5" fill="var(--fig-text)">控制手段：设迁移窗口、限速、观察 sh.status() 与日志</text>

      <text x="6" y="242" font-size="7.5" fill="var(--fig-muted)">预防：选好分片键（避免热点）+ 预先均衡，别等严重倾斜再补救</text>
    </svg>
    <figcaption>迁移五步由 balancer 驱动；风险是 IO 网络占用与查询抖动。用迁移窗口与限速控制，平时靠分片键避免倾斜</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
