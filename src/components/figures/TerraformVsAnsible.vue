<script setup>
/**
 * Terraform 与 Ansible 的区别与选型（题 3207）。
 *
 * 核心洞察：两者定位不同——Terraform 管「资源的存在与状态」（声明式、有 state），
 * Ansible 管「机器上做什么」（过程式/幂等任务）；实际生产中常配合使用。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 272" role="img" aria-label="Terraform 声明式管资源状态、Ansible 管机器配置任务，两者定位不同常配合使用">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">Terraform 管「资源存不存在」，Ansible 管「机器上做什么」</text>

      <rect x="6" y="20" width="160" height="86" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="34" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">Terraform</text>
      <text x="14" y="47" font-size="7.5" fill="var(--fig-text)">声明式：描述「最终状态」</text>
      <text x="14" y="59" font-size="7.5" fill="var(--fig-text)">有 state 记录已创建的资源</text>
      <text x="14" y="71" font-size="7.5" fill="var(--fig-text)">擅长：创建/销毁云资源、网络</text>
      <text x="14" y="83" font-size="7.5" fill="var(--fig-text)">不擅长：机器内部配置细节</text>
      <text x="14" y="97" font-size="7.5" fill="var(--fig-node-c)">关键：state 必须远程 + 加锁</text>

      <rect x="174" y="20" width="160" height="86" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="182" y="34" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">Ansible</text>
      <text x="182" y="47" font-size="7.5" fill="var(--fig-text)">任务式（幂等模块组合）</text>
      <text x="182" y="59" font-size="7.5" fill="var(--fig-text)">不需要 state（无 agent）</text>
      <text x="182" y="71" font-size="7.5" fill="var(--fig-text)">擅长：装包/改配置/跑命令</text>
      <text x="182" y="83" font-size="7.5" fill="var(--fig-text)">不擅长：管理资源生命周期</text>
      <text x="182" y="97" font-size="7.5" fill="var(--fig-node-c)">关键：幂等靠模块保证</text>

      <!-- 组合 -->
      <rect x="6" y="114" width="328" height="40" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="127" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">典型组合：Terraform 开资源 → Ansible 配机器</text>
      <text x="14" y="140" font-size="7.5" fill="var(--fig-text)">Terraform 创建 VM/网络/安全组 → Ansible 装软件、下发配置、启服务</text>
      <text x="14" y="151" font-size="7.5" fill="var(--fig-node-c)">容器时代：镜像构建（Dockerfile）+ K8s 编排，两者更多用于基础设施层</text>

      <!-- 选择 -->
      <rect x="6" y="162" width="328" height="46" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="175" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">怎么选</text>
      <text x="14" y="188" font-size="7.5" fill="var(--fig-text)">要「创建/删除资源、可回滚、有依赖图」→ Terraform</text>
      <text x="14" y="200" font-size="7.5" fill="var(--fig-text)">要「在已有机器上执行配置、临时批量操作」→ Ansible</text>

      <rect x="6" y="216" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="229" font-size="8" font-weight="700" fill="var(--fig-node-a)">易混点</text>
      <text x="14" y="242" font-size="7.5" fill="var(--fig-text)">Ansible 也有「幂等」，但它不管「资源该不该存在」；Terraform 也能跑命令但不建议</text>

      <text x="6" y="262" font-size="7.5" fill="var(--fig-muted)">本仓库实践：配置文件全部进 Git，靠 IaC 而非手工改，才能避免漂移</text>
    </svg>
    <figcaption>Terraform 声明式管资源生命周期、有 state；Ansible 管机器上的配置任务；生产常组合使用</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
