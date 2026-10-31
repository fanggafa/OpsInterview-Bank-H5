<script setup>
/**
 * 零停机做依赖升级（如 MySQL 5.7 → 8.0）（题 4832）。
 *
 * 核心洞察：「零停机」不靠一次切换，靠「兼容中间态 + 灰度」——
 * 先让代码兼容新旧两版，再迁移数据，最后切换，每一步都可回退。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 264" role="img" aria-label="零停机依赖升级四阶段：双兼容、数据迁移、灰度切换、回退预案">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">核心不是「切得快」，而是「每一步都能停、都能回」</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① 先做「双兼容」，别先升级</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">让应用代码同时兼容新旧两版（驱动、SQL 语法、认证插件等差异）</text>

      <rect x="6" y="58" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="71" font-size="8" font-weight="700" fill="var(--fig-node-b)">② 数据先于版本迁移</text>
      <text x="14" y="84" font-size="7.5" fill="var(--fig-text)">字符集/排序规则、索引、分区等要提前按新版本要求调整好</text>

      <rect x="6" y="96" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="109" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ 灰度切换（不是一次性切）</text>
      <text x="14" y="122" font-size="7.5" fill="var(--fig-text)">先切从库/少量读流量 → 观察 → 再切写入 → 最后切主</text>

      <rect x="6" y="134" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="147" font-size="8" font-weight="700" fill="var(--fig-node-d)">④ 回退预案（必须提前演练）</text>
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)">新版本写入的数据旧版本可能读不了 → 回退窗口很短，要提前想清楚</text>

      <!-- 关键风险 -->
      <rect x="6" y="176" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="189" font-size="8.5" font-weight="700" fill="#e5484d">三个最容易翻车的点</text>
      <text x="14" y="202" font-size="7.5" fill="var(--fig-text)">① 字符集/排序规则不一致 → 查询变慢或结果错　② 驱动版本不匹配 → 连接失败</text>
      <text x="14" y="214" font-size="7.5" fill="var(--fig-text)">③ 旧代码连新版本（如认证插件变更）→ 大量连接报错</text>

      <rect x="6" y="228" width="328" height="16" rx="3" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="240" font-size="7.5" fill="var(--fig-text)">分级发布：先在预发全流程演练一次，记录耗时与风险点</text>

      <text x="6" y="254" font-size="7.5" fill="var(--fig-muted)">验收：切换过程中业务无 5xx；回退一次能在可接受时间内完成</text>
    </svg>
    <figcaption>零停机升级四阶段：代码双兼容、数据先迁移、灰度切从库到主、回退预案；最容易翻车在字符集、驱动、认证插件</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
