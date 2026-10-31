<script setup>
/**
 * OSI 七层模型（题 9631）。
 *
 * 核心洞察：七层是「一层解决一个问题」的堆叠——每层只认自己的关键标识
 * （应用认域名、传输认端口、网络认 IP、链路认 MAC、物理传比特），
 * 所以交换机天然落在 2 层、路由器落在 3 层。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 300" role="img" aria-label="OSI 七层从上到下堆叠：应用层、表示层、会话层、传输层、网络层、数据链路层、物理层，每层标注作用、典型协议与本层认的标识，底部标出交换机在第 2 层、路由器在第 3 层">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">一层解决一个问题：上层只管调用下层，每层认自己的标识</text>

      <text x="10" y="26" font-size="7" fill="var(--fig-muted)">层</text>
      <text x="76" y="26" font-size="7" fill="var(--fig-muted)">作用　/　典型协议与本层认的标识</text>

      <!-- 7 应用层 -->
      <rect x="4" y="32" width="332" height="30" rx="4" fill="var(--fig-node-a)" opacity=".14" />
      <text x="10" y="44" font-size="7.5" font-weight="700" fill="var(--fig-node-a)">7</text>
      <text x="26" y="44" font-size="8" font-weight="700" fill="var(--fig-node-a)">应用层</text>
      <text x="76" y="44" font-size="7.5" fill="var(--fig-text)">为程序提供网络服务，直接面向用户</text>
      <text x="76" y="56" font-size="7.5" fill="var(--fig-node-a)">HTTP / DNS / SSH / FTP　认域名</text>

      <!-- 6 表示层 -->
      <rect x="4" y="64" width="332" height="30" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <text x="10" y="76" font-size="7.5" font-weight="700" fill="var(--fig-node-b)">6</text>
      <text x="26" y="76" font-size="8" font-weight="700" fill="var(--fig-node-b)">表示层</text>
      <text x="76" y="76" font-size="7.5" fill="var(--fig-text)">编码解码、加密、压缩（格式统一）</text>
      <text x="76" y="88" font-size="7.5" fill="var(--fig-node-b)">TLS / JPEG / ASCII　认字符集</text>

      <!-- 5 会话层 -->
      <rect x="4" y="96" width="332" height="30" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="10" y="108" font-size="7.5" font-weight="700" fill="var(--fig-node-c)">5</text>
      <text x="26" y="108" font-size="8" font-weight="700" fill="var(--fig-node-c)">会话层</text>
      <text x="76" y="108" font-size="7.5" fill="var(--fig-text)">建立、维护、结束一次会话</text>
      <text x="76" y="120" font-size="7.5" fill="var(--fig-node-c)">RPC / 会话管理　认会话 ID</text>

      <!-- 4 传输层 -->
      <rect x="4" y="128" width="332" height="30" rx="4" fill="var(--fig-node-d)" opacity=".14" />
      <text x="10" y="140" font-size="7.5" font-weight="700" fill="var(--fig-node-d)">4</text>
      <text x="26" y="140" font-size="8" font-weight="700" fill="var(--fig-node-d)">传输层</text>
      <text x="76" y="140" font-size="7.5" font-weight="700" fill="var(--fig-text)">端到端传输、可靠性与流量控制</text>
      <text x="76" y="152" font-size="7.5" font-weight="700" fill="var(--fig-node-d)">TCP / UDP　认端口（进程级）</text>

      <!-- 3 网络层 -->
      <rect x="4" y="160" width="332" height="30" rx="4" fill="var(--fig-node-a)" opacity=".14" />
      <text x="10" y="172" font-size="7.5" font-weight="700" fill="var(--fig-node-a)">3</text>
      <text x="26" y="172" font-size="8" font-weight="700" fill="var(--fig-node-a)">网络层</text>
      <text x="76" y="172" font-size="7.5" font-weight="700" fill="var(--fig-text)">寻址与路由——跨网络找路</text>
      <text x="76" y="184" font-size="7.5" font-weight="700" fill="var(--fig-node-a)">IP / ICMP　认 IP 地址（全局）</text>

      <!-- 2 链路层 -->
      <rect x="4" y="192" width="332" height="30" rx="4" fill="var(--fig-node-b)" opacity=".14" />
      <text x="10" y="204" font-size="7.5" font-weight="700" fill="var(--fig-node-b)">2</text>
      <text x="26" y="204" font-size="8" font-weight="700" fill="var(--fig-node-b)">数据链路</text>
      <text x="76" y="204" font-size="7.5" fill="var(--fig-text)">同一链路上的帧传输、差错校验</text>
      <text x="76" y="216" font-size="7.5" fill="var(--fig-node-b)">Ethernet / ARP　认 MAC（一跳内）</text>

      <!-- 1 物理层 -->
      <rect x="4" y="224" width="332" height="30" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="10" y="236" font-size="7.5" font-weight="700" fill="var(--fig-node-c)">1</text>
      <text x="26" y="236" font-size="8" font-weight="700" fill="var(--fig-node-c)">物理层</text>
      <text x="76" y="236" font-size="7.5" fill="var(--fig-text)">比特流传输、电气与机械特性</text>
      <text x="76" y="248" font-size="7.5" fill="var(--fig-node-c)">网线 / 光纤 / 集线器　认电平</text>

      <!-- 设备定位 -->
      <rect x="4" y="262" width="162" height="28" rx="4" fill="var(--fig-node-b)" opacity=".16" />
      <text x="12" y="274" font-size="8" font-weight="700" fill="var(--fig-node-b)">交换机 = L2</text>
      <text x="12" y="285" font-size="7.5" fill="var(--fig-text)">按 MAC 转发，不看 IP</text>

      <rect x="172" y="262" width="164" height="28" rx="4" fill="var(--fig-node-a)" opacity=".16" />
      <text x="180" y="274" font-size="8" font-weight="700" fill="var(--fig-node-a)">路由器 = L3</text>
      <text x="180" y="285" font-size="7.5" fill="var(--fig-text)">按 IP 找下一跳，改 MAC</text>
    </svg>
    <figcaption>七层从上到下：应用→表示→会话→传输→网络→链路→物理；每层认自己的标识，交换机在 L2、路由器在 L3</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
