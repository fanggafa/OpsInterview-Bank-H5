<script setup>
/**
 * 一套「能真正用上」的备份方案的要素（题 2404）。
 *
 * 核心洞察：备份方案不是「跑个脚本」，而是「范围 + 频率 + 保留 + 验证」四要素；
 * 缺任何一个，出事时都会发现备份不可用。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 266" role="img" aria-label="备份方案四要素：备份范围、频率对应 RPO、保留期覆盖发现延迟、定期恢复演练验证">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">四要素缺一不可：范围 / 频率 / 保留 / 验证</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="var(--fig-node-a)">① 范围：什么必须备</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">数据 + 配置 + 证书密钥 + 用户权限（只备数据，恢复后跑不起来）</text>

      <rect x="6" y="58" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="71" font-size="8" font-weight="700" fill="var(--fig-node-b)">② 频率：对应 RPO</text>
      <text x="14" y="84" font-size="7.5" fill="var(--fig-text)">能接受丢 1 小时 → 每小时增量；核心交易用连续归档（binlog）</text>

      <rect x="6" y="96" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="109" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ 保留：覆盖「最晚被发现」</text>
      <text x="14" y="122" font-size="7.5" fill="var(--fig-text)">误删/勒索常几周后才被发现 → 至少 30 天，勒索场景 60~90 天</text>

      <rect x="6" y="134" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="147" font-size="8" font-weight="700" fill="var(--fig-node-d)">④ 验证：恢复演练</text>
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)">「备份成功」≠「能恢复」；必须定期真恢复并记录耗时（RTO）</text>

      <!-- 加固 -->
      <rect x="6" y="176" width="328" height="46" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="189" font-size="8.5" font-weight="700" fill="#e5484d">防勒索的两条硬要求</text>
      <text x="14" y="202" font-size="7.5" fill="var(--fig-text)">① 备份账号只写不删（防被一起加密/删除）</text>
      <text x="14" y="214" font-size="7.5" fill="var(--fig-text)">② 至少一份不可变/离线副本（对象锁、磁带、异地）</text>

      <rect x="6" y="230" width="328" height="20" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="244" font-size="7.5" fill="var(--fig-node-c)">量化指标：记录 RPO/RTO 实测值，写进 SLA 与预案</text>

      <text x="6" y="258" font-size="7.5" fill="var(--fig-muted)">自查：最近一次成功恢复是什么时候？耗多久？—— 答不出来就是没有备份</text>
    </svg>
    <figcaption>备份方案四要素：范围（含配置与密钥）、频率（对应 RPO）、保留（覆盖发现延迟）、验证（真恢复过）</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
