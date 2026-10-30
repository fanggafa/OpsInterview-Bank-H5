<script setup>
/**
 * 云的三层服务模型与运维关注点（题 3400）。
 *
 * 核心洞察：IaaS/PaaS/SaaS 的差别是「你负责哪一层」；
 * 越往 PaaS/SaaS，运维越从「管机器」转向「管配置与数据」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 250" role="img" aria-label="IaaS 管到操作系统、PaaS 只管应用与配置、SaaS 只管使用与数据，运维职责逐层收缩">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">差别在「谁负责哪一层」：越往上，运维越从管机器转向管配置与数据</text>

      <rect x="6" y="20" width="328" height="52" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">IaaS（基础设施即服务）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">厂商给虚机/网络/存储，你负责操作系统以上</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">运维关注：补丁、内核参数、磁盘、监控 agent、安全基线</text>
      <text x="14" y="70" font-size="7" fill="var(--fig-node-c)">自由度最高，也最费人力</text>

      <rect x="6" y="80" width="328" height="52" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="93" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">PaaS（平台即服务）</text>
      <text x="14" y="106" font-size="7.5" fill="var(--fig-text)">厂商管运行时与扩缩容，你负责应用代码与配置</text>
      <text x="14" y="118" font-size="7.5" fill="var(--fig-text)">运维关注：部署配置、环境变量、连接数、配额、日志接入</text>
      <text x="14" y="130" font-size="7" fill="var(--fig-node-c)">如 K8s 托管、托管数据库、函数计算</text>

      <rect x="6" y="140" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="153" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">SaaS（软件即服务）</text>
      <text x="14" y="166" font-size="7.5" fill="var(--fig-text)">厂商管一切，你负责账号、权限与数据</text>
      <text x="14" y="178" font-size="7" fill="var(--fig-node-c)">运维关注：SSO、审计、数据导出与合规</text>

      <rect x="6" y="194" width="328" height="30" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="207" font-size="8" font-weight="700" fill="#e5484d">常见误区</text>
      <text x="14" y="219" font-size="7.5" fill="var(--fig-text)">上了 PaaS 就以为「不用运维」——配置与容量仍然是你的责任</text>

      <text x="6" y="244" font-size="7.5" fill="var(--fig-muted)">判断方式：出事时「谁先被叫起来」基本就对应你负责的那一层</text>
    </svg>
    <figcaption>IaaS 管操作系统以上、PaaS 管应用与配置、SaaS 只管账号与数据；越往上运维重心越向配置与容量转移</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
