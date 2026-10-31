<script setup>
/**
 * 虚拟机网络不通的排查与虚拟网络模式（题 2615）。
 *
 * 核心洞察：VM 网络比物理机多一层「虚拟交换机」，
 * 所以排查要先确认「虚机接在哪个虚拟网络/端口组」，再逐层向上查。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 256" role="img" aria-label="虚拟网络三种模式：桥接、NAT、仅主机；排查从虚拟交换机与端口组开始逐层向上">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">多了一层虚拟交换机 —— 先确认 VM 接在哪个网络/端口组</text>

      <rect x="6" y="20" width="328" height="26" rx="4" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="36" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">桥接</tspan>　VM 直接对外，与宿主同网段；排查像物理机</text>

      <rect x="6" y="50" width="328" height="26" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="66" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">NAT</tspan>　经宿主转发；外部访问不通属正常，需端口映射</text>

      <rect x="6" y="80" width="328" height="26" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="96" font-size="7.5" fill="var(--fig-text)"><tspan font-weight="700">仅主机</tspan>　只与宿主通信，不连外网（隔离测试用）</text>

      <!-- 排查路径 -->
      <rect x="6" y="110" width="328" height="52" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="123" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">排查顺序（从近到远）</text>
      <text x="14" y="136" font-size="7.5" fill="var(--fig-text)">① VM 内：ip addr / ip route 是否有地址与默认路由</text>
      <text x="14" y="148" font-size="7.5" fill="var(--fig-text)">② 虚拟网络：网卡是否插上（connected）、端口组/安全组是否正确</text>
      <text x="14" y="160" font-size="7.5" fill="var(--fig-node-c)">③ 宿主：虚拟交换机、物理网卡、上行链路　④ 外部：路由/防火墙/NAT 映射</text>

      <rect x="6" y="176" width="328" height="32" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="189" font-size="8" font-weight="700" fill="#e5484d">最常见四个原因</text>
      <text x="14" y="201" font-size="7.5" fill="var(--fig-text)">网卡未连接 · 端口组加错交换机 · MAC/IP 冲突 · 上行链路全断</text>

      <rect x="6" y="214" width="328" height="20" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="228" font-size="7.5" fill="var(--fig-text)">工具：在宿主抓包看 VM 的包有没有出来，比在 VM 里猜更快</text>

      <text x="6" y="246" font-size="7.5" fill="var(--fig-muted)">提示：克隆 VM 常带来 MAC 冲突与重复 IP —— 先改地址再重启网络</text>
    </svg>
    <figcaption>桥接/NAT/仅主机三种模式的差异决定「外部不通是否正常」；排查从 VM 内地址一路向上到虚拟交换机与上行链路</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
