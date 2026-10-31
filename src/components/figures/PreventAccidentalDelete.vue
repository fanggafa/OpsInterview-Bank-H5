<script setup>
/**
 * 云上误删资源的防护（题 3409）。
 *
 * 核心洞察：误删无法靠「小心」避免，要靠「机制」——
 * 权限最小化、删除保护、回收站、变更审批，四层叠加才能把概率压到很低。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 248" role="img" aria-label="防误删四层：最小权限与职责分离、删除保护开关、回收站与备份、变更流程与二次确认">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">误删靠「机制」不靠「小心」—— 四层措施叠加</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① 最小权限 + 职责分离</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">日常账号无删除权限；删除需要单独角色或临时提权（JIT）</text>

      <rect x="6" y="54" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="67" font-size="8" font-weight="700" fill="var(--fig-node-b)">② 删除保护开关</text>
      <text x="14" y="79" font-size="7.5" fill="var(--fig-text)">云厂商的「删除保护 / 终止保护」；数据库的删除保护、只读锁</text>

      <rect x="6" y="88" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="101" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ 回收站与备份</text>
      <text x="14" y="113" font-size="7.5" fill="var(--fig-text)">对象存储的版本控制与回收站；数据库的 PITR、快照保留</text>

      <rect x="6" y="122" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="135" font-size="8" font-weight="700" fill="var(--fig-node-d)">④ 变更流程 + 二次确认</text>
      <text x="14" y="147" font-size="7.5" fill="var(--fig-text)">高危操作需审批、双人复核；脚本删除加交互确认与 dry-run</text>

      <!-- 最有效 -->
      <rect x="6" y="160" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="173" font-size="8.5" font-weight="700" fill="#e5484d">实测最有效的两条</text>
      <text x="14" y="186" font-size="7.5" fill="var(--fig-text)">① 给生产资源全部打开「删除保护」（能挡住 90% 的手滑）</text>
      <text x="14" y="198" font-size="7.5" fill="var(--fig-text)">② 回收站/版本控制打开（删了还能恢复，比流程审批更实用）</text>

      <rect x="6" y="214" width="328" height="18" rx="3" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="227" font-size="7.5" fill="var(--fig-text)">另一类风险：命令行 rm -rf / 通配符误伤 —— 脚本里先 echo 再执行</text>

      <text x="6" y="240" font-size="7.5" fill="var(--fig-muted)">注意：备份与资源同账号同权限时，误删账号会一起丢 —— 要跨账号/异地</text>
    </svg>
    <figcaption>四层防护：最小权限与职责分离、删除保护开关、回收站与备份、变更流程二次确认；最实用是删除保护 + 回收站</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
