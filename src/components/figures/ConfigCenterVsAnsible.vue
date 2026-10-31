<script setup>
/**
 * 配置中心与 Ansible 管配置的区别（题 3226）。
 *
 * 核心洞察：Ansible 是「推」——执行一次就结束，状态靠幂等重复；
 * 配置中心是「拉」——应用订阅变更、实时生效。两者解决的是不同问题。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 258" role="img" aria-label="Ansible 推送式配置与配置中心拉取式配置的区别：时效、生效方式、适用场景">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">Ansible 是「推一次就结束」，配置中心是「订阅后实时生效」</text>

      <rect x="6" y="20" width="160" height="76" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">Ansible（推送式）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">在控制端执行任务</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">改完就结束，无运行时感知</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">靠幂等 + 定期执行保一致</text>
      <text x="14" y="82" font-size="7.5" fill="var(--fig-node-c)">适合：系统配置、装机、部署</text>

      <rect x="174" y="20" width="160" height="76" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">配置中心（拉取式）</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">应用启动拉取 + 订阅变更</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">改完实时推送/热生效</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">有版本、灰度、回滚能力</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-node-c)">适合：业务开关、连接超时等</text>

      <!-- 关键差别 -->
      <rect x="6" y="104" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="117" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">关键差别：时效与「谁掌握状态」</text>
      <text x="14" y="130" font-size="7.5" fill="var(--fig-text)">Ansible：状态在目标机器上，要靠「再跑一次」收敛</text>
      <text x="14" y="142" font-size="7.5" fill="var(--fig-text)">配置中心：状态以中心为准，应用是「消费者」</text>

      <!-- 组合使用 -->
      <rect x="6" y="158" width="328" height="46" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="171" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">生产里通常是组合</text>
      <text x="14" y="184" font-size="7.5" fill="var(--fig-text)">Ansible：装机器、配系统参数、下发应用包</text>
      <text x="14" y="196" font-size="7.5" fill="var(--fig-text)">配置中心：业务参数、开关、限流阈值（需要不重启生效的）</text>

      <rect x="6" y="212" width="328" height="30" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="225" font-size="8" font-weight="700" fill="#e5484d">常见误判</text>
      <text x="14" y="237" font-size="7.5" fill="var(--fig-text)">「有 Ansible 就不用配置中心」——业务开关改一次要跑一遍 playbook</text>

      <text x="6" y="250" font-size="7.5" fill="var(--fig-muted)">判断标准：这份配置需要「运行时不重启就生效」吗？需要就归配置中心</text>
    </svg>
    <figcaption>Ansible 推送式、执行完即结束，靠幂等收敛；配置中心拉取式、可实时生效，有版本与灰度。生产两者组合使用</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
