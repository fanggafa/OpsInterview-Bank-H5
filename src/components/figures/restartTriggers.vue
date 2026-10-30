<script setup>
/**
 * 「每天凌晨 3 点准时重启，但没人配重启任务」的分流图。
 *
 * 对应题 5412。核心洞察：「准时」说明有明确触发源；
 * 先分清「进程退出被拉起 / Pod 重建 / 整机重启」，三种形式排查方向完全不同。
 *
 * 画布 340 宽，文字须控制在列内（npm run check:figures 校验）。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 292" role="img" aria-label="准时重启的排查：先确认重启形式，再分进程退出、Pod 重建、整机重启三路，最后找触发源">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">「准时」= 有明确触发源；先分清重启的**形式**，再找触发者</text>

      <!-- Step 1 判形式 -->
      <rect x="6" y="20" width="328" height="30" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">Step 1：先看是哪种「重启」</text>
      <text x="14" y="45" font-size="8" fill="var(--fig-text)">uptime 是否清零（整机）· Pod restartCount（容器）· 进程启动时间（进程）</text>

      <!-- 三种形式 -->
      <text x="6" y="66" font-size="9.5" font-weight="700" fill="var(--fig-text)">Step 2：按形式分流</text>

      <rect x="6" y="74" width="328" height="58" rx="5" fill="#e5484d" opacity=".09" />
      <text x="14" y="87" font-size="8.5" font-weight="700" fill="#e5484d">A. 进程退出后被拉起（最常见）</text>
      <text x="14" y="99" font-size="7.5" fill="var(--fig-text)">看退出码：137=OOM/SIGKILL　143=SIGTERM　1=应用异常</text>
      <text x="14" y="111" font-size="7.5" fill="var(--fig-text)">systemctl status · dmesg -T | grep -i 'killed process'</text>
      <text x="14" y="123" font-size="7.5" fill="var(--fig-node-c)">谁拉起它：systemd Restart= / supervisor / 自定义脚本 / cron</text>

      <rect x="6" y="138" width="328" height="58" rx="5" fill="var(--fig-node-b)" opacity=".09" />
      <text x="14" y="151" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">B. K8s Pod 重建</text>
      <text x="14" y="163" font-size="7.5" fill="var(--fig-text)">kubectl describe pod 看 Last State：OOMKilled / 探针失败 / Evicted</text>
      <text x="14" y="175" font-size="7.5" fill="var(--fig-text)">kubectl get events 看触发时间点是否与「准时」吻合</text>
      <text x="14" y="187" font-size="7.5" fill="var(--fig-node-c)">重点：liveness 探针超时、内存 limit、节点压力驱逐</text>

      <rect x="6" y="202" width="328" height="58" rx="5" fill="var(--fig-node-c)" opacity=".09" />
      <text x="14" y="215" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">C. 整机重启（uptime 清零）</text>
      <text x="14" y="227" font-size="7.5" fill="var(--fig-text)">last reboot · journalctl --list-boots · /var/log/messages 重启前</text>
      <text x="14" y="239" font-size="7.5" fill="var(--fig-text)">查：内核 panic · 硬件告警（IPMI/ILO）· 电源/温度 · 云厂商维护</text>
      <text x="14" y="251" font-size="7.5" fill="var(--fig-node-c)">少见但存在：BIOS/带外管理定时重启、宿主机迁移</text>

      <rect x="6" y="264" width="328" height="24" rx="3" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="273" font-size="7.5" fill="var(--fig-node-d)">找触发源：crontab（含 /etc/cron.*、systemd timer）· 调度平台 · 云厂商自动任务</text>
      <text x="14" y="284" font-size="7.5" fill="var(--fig-node-d)">另一类：被「外部监控」重启（自愈脚本判断失败后执行 restart）</text>
    </svg>
    <figcaption>准时重启先判「形式」再找「触发者」：进程、Pod、整机三条路，命令完全不同</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
