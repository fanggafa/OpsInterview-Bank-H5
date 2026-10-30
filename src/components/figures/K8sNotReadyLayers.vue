<script setup>
/**
 * K8s 节点 NotReady 的四层排查（题 4607）。
 *
 * 核心洞察：NotReady 是「kubelet 上报心跳异常」的结果，
 * 根因要从节点 → kubelet → 容器运行时 → 网络四层往下查。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 268" role="img" aria-label="NotReady 排查四层：节点资源压力、kubelet 状态、容器运行时、网络与 apiserver 连通">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">NotReady 是结果不是原因，按「节点→kubelet→运行时→网络」四层查</text>

      <!-- 第 1 层 -->
      <rect x="6" y="20" width="328" height="42" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">① 节点本身：资源压力与硬件</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">kubectl describe node &lt;node&gt; | tail -30　看 Conditions 与 Events</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-node-c)">MemoryPressure / DiskPressure / PIDPressure / 磁盘满 / 硬件告警</text>

      <!-- 第 2 层 -->
      <rect x="6" y="66" width="328" height="42" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="79" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">② kubelet 进程状态</text>
      <text x="14" y="92" font-size="7.5" fill="var(--fig-text)">systemctl status kubelet　·　journalctl -u kubelet -n 100 --no-pager</text>
      <text x="14" y="104" font-size="7.5" fill="var(--fig-node-c)">常见：配置错、证书过期、无法连 apiserver、cgroup 驱动不匹配</text>

      <!-- 第 3 层 -->
      <rect x="6" y="112" width="328" height="42" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="125" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">③ 容器运行时</text>
      <text x="14" y="138" font-size="7.5" fill="var(--fig-text)">systemctl status containerd / docker　·　crictl ps / crictl info</text>
      <text x="14" y="150" font-size="7.5" fill="var(--fig-node-c)">常见：运行时崩溃、磁盘写满、pause 镜像拉不到</text>

      <!-- 第 4 层 -->
      <rect x="6" y="158" width="328" height="42" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="171" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">④ 网络与 apiserver 连通</text>
      <text x="14" y="184" font-size="7.5" fill="var(--fig-text)">kubelet 需要能连上 apiserver：curl -k https://&lt;api&gt;:6443/healthz</text>
      <text x="14" y="196" font-size="7.5" fill="var(--fig-node-c)">常见：安全组拦、DNS 解析失败、节点时间不同步导致证书校验失败</text>

      <!-- 收尾 -->
      <rect x="6" y="206" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="219" font-size="8" font-weight="700" fill="var(--fig-node-c)">恢复后</text>
      <text x="66" y="219" font-size="7.5" fill="var(--fig-text)">节点 Ready 但 Pod 未重建 → 检查污点（NoSchedule）与调度状态</text>
      <text x="14" y="231" font-size="7.5" fill="var(--fig-node-c)">排查完记得确认「该节点上的 Pod 是否已重新调度」</text>

      <text x="6" y="252" font-size="7.5" fill="var(--fig-muted)">最省时间的顺序：先 journalctl -u kubelet（它通常直接告诉你原因）</text>
      <text x="6" y="264" font-size="7.5" fill="var(--fig-muted)">易混点：节点 NotReady ≠ Pod 有问题，先修节点再看 Pod</text>
    </svg>
    <figcaption>NotReady 按「节点资源 → kubelet → 容器运行时 → 网络」四层排查，journalctl -u kubelet 通常最快出答案</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
