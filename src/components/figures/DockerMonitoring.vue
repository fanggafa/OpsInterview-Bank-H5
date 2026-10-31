<script setup>
/**
 * Docker 容器的性能监控与优化（题 4768）。
 *
 * 核心洞察：容器是「进程」，所以宿主机工具同样适用；
 * 最容易搞错的是「容器内 free 看到的是宿主机内存」，limit 必须读 cgroup。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 240" role="img" aria-label="Docker 监控：docker stats、宿主机工具、cgroup 读 limit，以及四个优化方向">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">容器只是进程 —— 宿主机工具同样适用</text>

      <rect x="6" y="20" width="328" height="28" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="38" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">docker stats</tspan>　实时 CPU/内存/网络/磁盘（类似 top）</text>

      <rect x="6" y="52" width="328" height="28" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">宿主机工具</tspan>　top/htop、pidstat -u -t、iostat -x、docker inspect</text>

      <rect x="6" y="84" width="328" height="32" rx="4" fill="#e5484d" opacity=".12" />
      <text x="14" y="97" font-size="8" font-weight="700" fill="#e5484d">最容易搞错：容器内 free 看到的是宿主机内存</text>
      <text x="14" y="109" font-size="7.5" fill="var(--fig-text)">要看 limit 得读 cgroup（/sys/fs/cgroup/.../memory.max）或 docker stats</text>

      <rect x="6" y="122" width="328" height="50" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="135" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">四个优化方向</text>
      <text x="14" y="148" font-size="7.5" fill="var(--fig-text)">CPU 打满 → 找热点进程（pidstat/pstack）+ 限流</text>
      <text x="14" y="160" font-size="7.5" fill="var(--fig-text)">内存接近 limit → 调堆参数（MaxRAMPercentage）+ 修泄漏</text>
      <text x="14" y="172" font-size="7.5" fill="var(--fig-text)">IO 慢 → 查是否共享盘/存储驱动；网络慢 → 查 NAT 开销</text>

      <rect x="6" y="180" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="193" font-size="8" font-weight="700" fill="var(--fig-node-d)">两个容器特有的坑</text>
      <text x="14" y="205" font-size="7.5" fill="var(--fig-text)">① CPU limits 会导致 throttle（查 cpu.stat 的 throttled）</text>
      <text x="14" y="217" font-size="7.5" fill="var(--fig-text)">② --network host 可减少 NAT 开销，但牺牲隔离</text>

      <text x="6" y="232" font-size="7.5" fill="var(--fig-muted)">八成性能问题要回到宿主机层面查 —— 资源争抢发生在那里</text>
    </svg>
    <figcaption>docker stats 与宿主机工具都可用；容器内 free 不代表 limit（要读 cgroup）；优化方向按 CPU/内存/IO/网络分</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
