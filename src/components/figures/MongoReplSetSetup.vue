<script setup>
/**
 * 从零搭建生产可用的 MongoDB 副本集（题 2033）。
 *
 * 核心洞察：副本集的关键不是「装三个 mongod」，而是
 * 「keyfile/认证、不同故障域、正确的初始化与验证」这几步。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 234" role="img" aria-label="MongoDB 副本集搭建六步：准备工作、配置、认证、初始化、验证、监控">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">关键不在装三个进程，而在「认证 + 故障域 + 验证」</text>

      <rect x="6" y="20" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="36" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">① 准备</tspan>　3 台不同故障域的主机（别在同一台/同一机柜）；关 THP、调 ulimit</text>

      <rect x="6" y="50" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="66" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">② 配置</tspan>　mongod.conf：replication.replSetName、bindIp、dbPath、缓存大小</text>

      <rect x="6" y="84" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="100" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">③ 认证</tspan>　keyFile（节点间认证）+ 开启 authorization；先生成 keyFile 再启动</text>

      <rect x="6" y="116" width="328" height="26" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="132" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">④ 初始化</tspan>　rs.initiate() 在一台上执行，成员用副本集内部地址</text>

      <rect x="6" y="148" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="164" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">⑤ 验证</tspan>　rs.status() 看 PRIMARY/SECONDARY；写读测试；模拟 kill 主节点看切换</text>

      <rect x="6" y="180" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="196" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">⑥ 监控与备份</tspan>　监控复制延迟/oplog 窗口；备份用 mongodump 或快照</text>

      <!-- 易错 -->
      <rect x="6" y="212" width="328" height="18" rx="3" fill="#e5484d" opacity=".1" />
      <text x="14" y="225" font-size="7.5" fill="var(--fig-text)">最高频的错：忘开认证（裸奔）、keyFile 权限不对导致启动失败、arbiter 被当数据节点</text>
    </svg>
    <figcaption>六步：3 台异故障域主机、mongod.conf 配副本集、keyFile 认证、rs.initiate、验证主从与切换、监控延迟与备份</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
