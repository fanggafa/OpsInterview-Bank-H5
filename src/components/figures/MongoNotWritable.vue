<script setup>
/**
 * MongoDB 报 NotWritablePrimary 的排查（题 2028）。
 *
 * 核心洞察：这个报错意味着「你连的节点不是主节点」——
 * 要么主节点切换了，要么客户端连了错的节点，要么多数派不满足无法选出主。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 254" role="img" aria-label="NotWritablePrimary 的三类原因：主节点已切换、客户端连错节点、无法选出主（多数派不足）">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">含义：你连的节点「不是主」——先分清是切换了、连错了、还是选不出</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① 主节点已经切换（最常见）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">原主降级（抖动/压力/手动切换）→ 应用仍连旧地址</text>

      <rect x="6" y="58" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="71" font-size="8" font-weight="700" fill="var(--fig-node-b)">② 客户端连了从节点</text>
      <text x="14" y="84" font-size="7.5" fill="var(--fig-text)">没开 readPreference 却直连 secondary；或连接串固定写了某一台的 IP</text>

      <rect x="6" y="96" width="328" height="38" rx="4" fill="#e5484d" opacity=".12" />
      <text x="14" y="109" font-size="8" font-weight="700" fill="#e5484d">③ 选不出主：多数派不足</text>
      <text x="14" y="122" font-size="7.5" fill="var(--fig-text)">存活节点 &lt; 多数派成员数（3 节点挂 2 台）→ 全部变只读，无法写入</text>
      <text x="14" y="132" font-size="7" fill="var(--fig-node-c)">这是「设计如此」的保护，不是 bug；恢复要靠重启故障节点</text>

      <!-- 排查 -->
      <rect x="6" y="142" width="328" height="50" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="155" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">排查动作（按顺序）</text>
      <text x="14" y="168" font-size="7.5" fill="var(--fig-text)">① rs.status() 看谁是 PRIMARY、各成员 stateStr 与 optime</text>
      <text x="14" y="180" font-size="7.5" fill="var(--fig-text)">② 看 mongod 日志里的选举记录　③ 确认应用连接串是 replicaSet 写法</text>

      <rect x="6" y="200" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="213" font-size="8" font-weight="700" fill="var(--fig-node-d)">正确的连接方式</text>
      <text x="14" y="225" font-size="7.5" fill="var(--fig-text)">连接串带 replicaSet 参数 + 列出全部成员 → 驱动自动发现主节点</text>

      <text x="6" y="244" font-size="7.5" fill="var(--fig-muted)">治本：3 节点部署在「不同故障域」（不同机柜/可用区），否则一起挂</text>
    </svg>
    <figcaption>三类原因：主已切换（应用连旧地址）、客户端连从节点、多数派不足选不出主；用 rs.status 看 stateStr 与连接串写法</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
