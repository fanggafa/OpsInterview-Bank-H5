<script setup>
/**
 * Linux 从开机到登录的启动流程（题 4010）。
 *
 * 核心洞察：启动链是 BIOS/UEFI → bootloader → 内核 → initramfs → systemd →
 * target/服务；任何一环坏了都会表现为「起不来」，所以要按这个顺序定位。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 258" role="img" aria-label="Linux 启动流程：固件、bootloader、内核、initramfs、systemd、目标与服务，各环节故障如何表现">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">启动链是「固件 → bootloader → 内核 → initramfs → systemd → 服务」</text>

      <rect x="6" y="20" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="36" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">①</tspan> 固件 BIOS/UEFI：自检、选启动设备（坏了就「黑屏/找不到盘」）</text>

      <rect x="6" y="50" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="66" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">②</tspan> bootloader（GRUB）：加载内核与 initramfs（菜单卡住/报 grub&gt; 就是这环）</text>

      <rect x="6" y="80" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="96" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">③</tspan> 内核：初始化硬件、挂载 rootfs（panic 会停在「Kernel panic」）</text>

      <rect x="6" y="110" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="123" font-size="7.5" font-weight="700" fill="var(--fig-node-d)">④ initramfs（临时根文件系统）</text>
      <text x="14" y="135" font-size="7.5" fill="var(--fig-text)">加载根盘所需的驱动（RAID/LVM/加密）；缺驱动会 drop to shell</text>

      <rect x="6" y="144" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">⑤</tspan> systemd（PID 1）：按依赖并行启动各个 unit</text>

      <rect x="6" y="174" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="190" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">⑥</tspan> 默认 target（如 multi-user / graphical）→ 各服务 → 登录</text>

      <!-- 排查 -->
      <rect x="6" y="204" width="328" height="34" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="217" font-size="8" font-weight="700" fill="#e5484d">定位手段</text>
      <text x="14" y="229" font-size="7.5" fill="var(--fig-text)">systemd-analyze blame（哪个服务最慢）· journalctl -b -p err（本次启动的错误）</text>

      <text x="6" y="248" font-size="7.5" fill="var(--fig-muted)">关键：先看「卡在哪一环」——能到 systemd 就说明前四环都正常</text>
    </svg>
    <figcaption>启动六环：固件→GRUB→内核→initramfs→systemd→服务；能到 systemd 说明前四环正常，再查服务依赖</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
