<script setup>
/**
 * 容器与虚拟机的隔离层次对比图。
 * 用「层次堆叠」直观说明：容器共享内核、VM 自带内核——
 * 这决定了启动速度、密度与隔离强度的全部差异。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 238" role="img" aria-label="虚拟机与容器在隔离层次上的差异：VM 自带内核，容器共享宿主内核">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">两者的分界线在「有没有自己的内核」</text>

      <!-- VM 侧 -->
      <text x="6" y="30" font-size="9.5" font-weight="700" fill="var(--fig-node-a)">虚拟机</text>

      <rect x="6" y="36" width="150" height="18" rx="3" fill="var(--fig-node-a)" opacity=".85" />
      <text x="81" y="49" text-anchor="middle" font-size="8.5" fill="#fff" font-weight="600">App A</text>
      <rect x="6" y="58" width="150" height="18" rx="3" fill="var(--fig-node-b)" opacity=".8" />
      <text x="81" y="71" text-anchor="middle" font-size="8.5" fill="#fff" font-weight="600">Guest OS（完整系统 + 内核）</text>
      <rect x="6" y="80" width="150" height="18" rx="3" fill="var(--fig-node-d)" opacity=".8" />
      <text x="81" y="93" text-anchor="middle" font-size="8.5" fill="#fff" font-weight="600">Hypervisor（KVM/Xen）</text>
      <rect x="6" y="102" width="150" height="18" rx="3" fill="var(--fig-node-c)" opacity=".8" />
      <text x="81" y="115" text-anchor="middle" font-size="8.5" fill="#fff" font-weight="600">Host OS + 硬件</text>

      <text x="6" y="134" font-size="8" fill="var(--fig-node-d)">✗ 启动 30s-分钟级</text>
      <text x="6" y="146" font-size="8" fill="var(--fig-node-d)">✗ 每台吃几百 MB-数 GB</text>
      <text x="6" y="158" font-size="8" fill="var(--fig-node-c)">✓ 隔离强（独立内核，可跑不同 OS）</text>

      <!-- 容器侧 -->
      <text x="176" y="30" font-size="9.5" font-weight="700" fill="var(--fig-node-c)">容器</text>

      <rect x="176" y="36" width="150" height="18" rx="3" fill="var(--fig-node-c)" opacity=".85" />
      <text x="251" y="49" text-anchor="middle" font-size="8.5" fill="#fff" font-weight="600">App A（镜像含依赖）</text>
      <rect x="176" y="58" width="150" height="18" rx="3" fill="var(--fig-node-c)" opacity=".6" />
      <text x="251" y="71" text-anchor="middle" font-size="8.5" fill="#fff" font-weight="600">App B</text>
      <rect x="176" y="80" width="150" height="18" rx="3" fill="#e5484d" opacity=".14" />
      <rect x="176" y="80" width="150" height="18" rx="3" fill="none" stroke="#e5484d" stroke-width="1.3" stroke-dasharray="3 2" />
      <text x="251" y="93" text-anchor="middle" font-size="8" fill="#e5484d" font-weight="700">没有 Guest OS</text>
      <rect x="176" y="102" width="150" height="18" rx="3" fill="var(--fig-node-b)" opacity=".8" />
      <text x="251" y="115" text-anchor="middle" font-size="8.5" fill="#fff" font-weight="600">容器运行时 + Host 内核（共享）</text>

      <text x="176" y="134" font-size="8" fill="var(--fig-node-c)">✓ 启动秒级甚至毫秒级</text>
      <text x="176" y="146" font-size="8" fill="var(--fig-node-c)">✓ 密度高（一台跑几十上百个）</text>
      <text x="176" y="158" font-size="8" fill="#e5484d">✗ 隔离弱（共享内核，逃逸风险更高）</text>

      <!-- 结论 -->
      <rect x="6" y="170" width="328" height="52" rx="7" fill="var(--fig-node-b)" opacity=".09" />
      <rect x="6" y="170" width="328" height="52" rx="7" fill="none" stroke="var(--fig-node-b)" stroke-width="1.2" />
      <text x="16" y="186" font-size="9" font-weight="700" fill="var(--fig-node-b)">所以：不能简单说「容器更好」</text>
      <text x="16" y="200" font-size="8.5" fill="var(--fig-text)">无状态 Web 服务 → 容器（快、密度高、弹性好）</text>
      <text x="16" y="213" font-size="8.5" fill="var(--fig-text)">强隔离/多租户/不同内核/GPU 独占 → 虚拟机（甚至裸金属）</text>
      <text x="16" y="227" font-size="7.5" fill="var(--fig-muted)">推理/数据库等重负载：越来越多用「容器编排 + 独占节点」折中</text>
    </svg>
    <figcaption>容器不是「更轻的虚拟机」，而是「共享内核的进程隔离」——安全边界不同</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
