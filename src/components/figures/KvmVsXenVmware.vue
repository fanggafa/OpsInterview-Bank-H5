<script setup>
/**
 * KVM 架构与 Xen / VMware 的本质区别（题 2600）。
 *
 * 核心洞察：KVM 是「内核模块」，复用 Linux 内核做调度与内存管理；
 * Xen 是「独立 Hypervisor 在下面」，VMware 是「Type-1 商业 Hypervisor」。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 256" role="img" aria-label="KVM 由 QEMU 用户态加 KVM 内核模块复用 Linux 内核；Xen 是独立 Hypervisor；VMware 是商业 Type-1">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">关键差别：谁在最底层、谁复用谁的内核能力</text>

      <rect x="6" y="20" width="328" height="60" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">KVM（Type-1 但架构特殊）</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">用户态：QEMU（模拟设备、处理 IO）↔ ioctl</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">内核态：KVM 模块（用 VT-x/AMD-V 执行客户机代码）</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-node-c)">复用 Linux 内核的调度/内存/驱动，不重复造轮子</text>

      <rect x="6" y="86" width="328" height="46" rx="5" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="99" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">Xen（独立 Hypervisor）</text>
      <text x="14" y="112" font-size="7.5" fill="var(--fig-text)">Hypervisor 直接跑在硬件之上，Dom0 是特权虚拟机</text>
      <text x="14" y="124" font-size="7.5" fill="var(--fig-node-c)">优势：更小攻击面；代价：驱动要适配（部分走 Dom0）</text>

      <rect x="6" y="138" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="151" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">VMware ESXi（商业 Type-1）</text>
      <text x="14" y="164" font-size="7.5" fill="var(--fig-text)">自研内核承担虚拟化，配套 vCenter 管理与 vMotion</text>
      <text x="14" y="176" font-size="7.5" fill="var(--fig-node-c)">优势：生态与管理能力；代价：授权成本</text>

      <!-- 选择 -->
      <rect x="6" y="190" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="203" font-size="8" font-weight="700" fill="var(--fig-node-d)">运维视角的选择</text>
      <text x="14" y="215" font-size="7.5" fill="var(--fig-text)">要开源与生态 → KVM；要极简攻击面 → Xen；要成熟管理 → VMware</text>

      <text x="6" y="240" font-size="7.5" fill="var(--fig-muted)">排查提示：KVM 上「虚拟机慢」先看宿主 /proc/interrupts、CPU steal、以及是否超分过度</text>
      <text x="6" y="252" font-size="7.5" fill="var(--fig-muted)">口诀：KVM 的「Hypervisor」是你已经在跑的 Linux 内核</text>
    </svg>
    <figcaption>KVM 用 QEMU + 内核模块复用 Linux 内核能力；Xen 是独立 Hypervisor；VMware 是商业 Type-1</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
