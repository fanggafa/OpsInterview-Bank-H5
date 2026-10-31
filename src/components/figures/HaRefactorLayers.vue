<script setup>
/**
 * 单机部署改造成高可用（题 72）。
 *
 * 核心洞察：高可用不是「加一台机器」，而是逐层消除单点 ——
 * 入口、应用、数据、依赖，每一层都要问「这台挂了还有人接住吗」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 260" role="img" aria-label="单机到高可用：入口层 LB 双活、应用层多副本、数据层主从加切换、依赖层去单点，以及改造顺序">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">高可用 = 逐层消除单点；每一层都问「它挂了谁接住」</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① 入口层：DNS + 多入口</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">LB 至少两台（或云上多可用区）；单条 DNS A 记录本身就是单点</text>

      <rect x="6" y="54" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="67" font-size="8" font-weight="700" fill="var(--fig-node-b)">② 应用层：多副本 + 去会话粘性</text>
      <text x="14" y="79" font-size="7.5" fill="var(--fig-text)">至少 2 实例；会话放外部（Redis）否则扩容后要重新登录</text>

      <rect x="6" y="88" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="14" y="101" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ 数据层：主从 + 自动切换（最硬的骨头）</text>
      <text x="14" y="113" font-size="7.5" fill="var(--fig-text)">主从复制（注意 RPO）+ 健康检查 + 故障切换（注意脑裂与仲裁）</text>

      <rect x="6" y="122" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="135" font-size="8" font-weight="700" fill="var(--fig-node-d)">④ 依赖层：去单点</text>
      <text x="14" y="147" font-size="7.5" fill="var(--fig-text)">缓存/文件存储/MQ 也可能是单点；文件别放本地磁盘（多副本读不到）</text>

      <!-- 顺序 -->
      <rect x="6" y="156" width="328" height="46" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="169" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">改造顺序（按影响面与成本）</text>
      <text x="14" y="182" font-size="7.5" fill="var(--fig-text)">先做「无状态化 + 应用多副本」（成本低收益大）→ 再 LB 双活 → 最后数据层</text>
      <text x="14" y="194" font-size="7.5" fill="var(--fig-text)">数据层改造要单独演练，不能和生产高峰叠加</text>

      <rect x="6" y="206" width="328" height="34" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="219" font-size="8" font-weight="700" fill="#e5484d">最容易忽略的两点</text>
      <text x="14" y="231" font-size="7.5" fill="var(--fig-text)">① 发布流程本身是单点（手工发一台）② 没有演练就等于没有高可用</text>

      <text x="6" y="250" font-size="7.5" fill="var(--fig-muted)">验收：随机杀一台节点，业务无感才算达标；RTO/RPO 要有实测数字</text>
    </svg>
    <figcaption>逐层去单点：入口多机、应用多副本去会话粘性、数据主从加自动切换、依赖去单点；先无状态化再动数据层</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
