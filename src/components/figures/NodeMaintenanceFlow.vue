<script setup>
/**
 * cordon / drain / delete node 的区别与节点维护流程（题 4621）。
 *
 * 核心洞察：cordon 只是「不再调度新 Pod」，drain 会「驱逐现有 Pod」，
 * delete 才是移除节点对象；维护必须先 cordon + drain，直接 delete 会让 Pod 悬空。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 250" role="img" aria-label="cordon 停止调度、drain 驱逐现有 Pod、delete 移除节点；正确维护流程是 cordon 后再 drain">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">cordon 只「不调度新的」，drain 才「赶走现有的」，delete 是删对象</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">cordon（标记不可调度）</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">已有 Pod 不受影响；新 Pod 不再落在这台节点</text>

      <rect x="6" y="54" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="67" font-size="8" font-weight="700" fill="var(--fig-node-b)">drain（驱逐现有 Pod）</text>
      <text x="14" y="79" font-size="7.5" fill="var(--fig-text)">把 Pod 优雅迁走（先 cordon 再 drain）；可用 --ignore-daemonsets / --force</text>

      <rect x="6" y="92" width="328" height="34" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="105" font-size="8" font-weight="700" fill="#e5484d">delete node（删除节点对象）</text>
      <text x="14" y="117" font-size="7.5" fill="var(--fig-text)">只是从集群移除「记录」；不清 Pod 就删会让 Pod 悬空、卷无法释放</text>

      <!-- 正确流程 -->
      <rect x="6" y="134" width="328" height="52" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="147" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">正确的节点维护流程</text>
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)">① cordon（停止调度）→ ② drain（驱逐 Pod，观察业务）</text>
      <text x="14" y="172" font-size="7.5" fill="var(--fig-text)">→ ③ 维护/升级 → ④ uncordon（恢复调度）→ 验证 Pod 回暖</text>
      <text x="14" y="184" font-size="7" fill="var(--fig-node-c)">淘汰节点才在最后 delete node</text>

      <rect x="6" y="194" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="207" font-size="8" font-weight="700" fill="var(--fig-node-d)">drain 常见报错</text>
      <text x="14" y="219" font-size="7.5" fill="var(--fig-text)">有 DaemonSet / 有本地卷 / 有裸 Pod 时会拒绝 → 需评估再 --ignore 或 --force</text>

      <text x="6" y="244" font-size="7.5" fill="var(--fig-muted)">注意：drain 会让 Pod 重新调度到别的节点，要确认目标节点有足够资源</text>
    </svg>
    <figcaption>cordon 只停新调度、drain 驱逐现有 Pod、delete 只是删对象；维护顺序应是 cordon → drain → 维护 → uncordon</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
