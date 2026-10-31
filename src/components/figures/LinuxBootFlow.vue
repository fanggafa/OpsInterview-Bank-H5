<script setup>
/**
 * Linux 开机流程六步，及 6 vs 7 的 init 差异（题 8630）。
 *
 * 核心洞察：开机是一条严格的链——固件 → GRUB → 内核 → initramfs → init → 登录，
 * 每个阶段都负责把「下一阶段需要的东西」准备好；所以排障不是猜原因，而是看它「停在哪一环」。
 * 换 CentOS 7 唯一变的是第 5 环：串行脚本换成按依赖图并行的 systemd。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 274" role="img" aria-label="Linux 开机六步竖向流程：固件、GRUB、内核、initramfs、init系统、登录，并标注 CentOS 6 与 7 在 init 环节的差异">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">排障不是猜原因，而是看它停在哪一环</text>

      <!-- 竖向阶段轴 -->
      <line x1="22" y1="24" x2="22" y2="234" stroke="var(--fig-node-a)" stroke-width="1.2" stroke-dasharray="4 3" opacity=".7" />

      <!-- ① 固件 -->
      <circle cx="22" cy="40" r="7" fill="var(--fig-node-a)" opacity=".18" />
      <text x="22" y="43" font-size="7" text-anchor="middle" fill="var(--fig-node-a)">1</text>
      <rect x="36" y="24" width="298" height="32" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="42" y="36" font-size="8" font-weight="700" fill="var(--fig-node-a)">固件 BIOS/UEFI</text>
      <text x="42" y="48" font-size="7.5" fill="var(--fig-text)">加电自检，按启动顺序找引导设备（硬盘/PXE）</text>

      <!-- ② GRUB -->
      <circle cx="22" cy="72" r="7" fill="var(--fig-node-b)" opacity=".18" />
      <text x="22" y="75" font-size="7" text-anchor="middle" fill="var(--fig-node-b)">2</text>
      <rect x="36" y="56" width="298" height="32" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="42" y="68" font-size="8" font-weight="700" fill="var(--fig-node-b)">引导程序 GRUB</text>
      <text x="42" y="80" font-size="7.5" fill="var(--fig-text)">读菜单配置，把内核与 initramfs 载入内存</text>

      <!-- ③ 内核 -->
      <circle cx="22" cy="104" r="7" fill="var(--fig-node-c)" opacity=".18" />
      <text x="22" y="107" font-size="7" text-anchor="middle" fill="var(--fig-node-c)">3</text>
      <rect x="36" y="88" width="298" height="32" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="42" y="100" font-size="8" font-weight="700" fill="var(--fig-node-c)">内核</text>
      <text x="42" y="112" font-size="7.5" fill="var(--fig-text)">初始化硬件、挂载 initramfs，由它接管后续启动</text>

      <!-- ④ initramfs -->
      <circle cx="22" cy="136" r="7" fill="var(--fig-node-d)" opacity=".18" />
      <text x="22" y="139" font-size="7" text-anchor="middle" fill="var(--fig-node-d)">4</text>
      <rect x="36" y="120" width="298" height="32" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="42" y="132" font-size="8" font-weight="700" fill="var(--fig-node-d)">initramfs 临时根</text>
      <text x="42" y="144" font-size="7.5" fill="var(--fig-text)">带上真正挂载 / 要用的驱动（RAID/LVM/加密）</text>

      <!-- ⑤ init 系统 -->
      <circle cx="22" cy="181" r="7" fill="var(--fig-node-a)" opacity=".18" />
      <text x="22" y="184" font-size="7" text-anchor="middle" fill="var(--fig-node-a)">5</text>
      <rect x="36" y="152" width="298" height="58" rx="5" fill="var(--fig-node-a)" opacity=".12" stroke="var(--fig-node-a)" stroke-width=".8" stroke-dasharray="3 2" />
      <text x="42" y="164" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">init 系统（PID 1）</text>
      <text x="42" y="177" font-size="7.5" fill="var(--fig-text)">挂载根文件系统、启动服务、设置网络</text>
      <rect x="42" y="183" width="130" height="21" rx="3" fill="var(--fig-node-b)" opacity=".12" />
      <text x="48" y="197" font-size="7" fill="var(--fig-node-b)">6：SysV 串行跑脚本（慢）</text>
      <rect x="180" y="183" width="146" height="21" rx="3" fill="var(--fig-node-c)" opacity=".12" />
      <text x="186" y="197" font-size="7" fill="var(--fig-node-c)">7：systemd 按依赖图并行（快）</text>

      <!-- ⑥ 登录 -->
      <circle cx="22" cy="226" r="7" fill="var(--fig-node-b)" opacity=".18" />
      <text x="22" y="229" font-size="7" text-anchor="middle" fill="var(--fig-node-b)">6</text>
      <rect x="36" y="210" width="298" height="32" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="42" y="222" font-size="8" font-weight="700" fill="var(--fig-node-b)">用户登录</text>
      <text x="42" y="234" font-size="7.5" fill="var(--fig-text)">getty/sshd 就绪，等待输入账号密码</text>

      <text x="6" y="266" font-size="7.5" fill="var(--fig-muted)">换发行版只改第5环：service/chkconfig → systemctl</text>
    </svg>
    <figcaption>开机六环：固件 → GRUB → 内核 → initramfs → init 系统 → 登录；能走到 init 说明前四环都过了，再查服务依赖</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
