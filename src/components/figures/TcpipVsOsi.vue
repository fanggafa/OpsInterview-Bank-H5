<script setup>
/**
 * TCP/IP 四层与 OSI 七层的对应（题 9632）。
 *
 * 核心洞察：不是两套并列的模型，而是同一个协议栈的两种切法——
 * TCP/IP 把没有独立协议的会话/表示层并进应用层（OSI 5~7），
 * 把数据链路与物理并成网络接口层（OSI 1~2），传输层与网络层则一一对应。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 292" role="img" aria-label="左侧 OSI 七层，右侧 TCP/IP 四层，用连线画出合并关系：OSI 5、6、7 合并为应用层，OSI 1、2 合并为网络接口层，传输层与网络层一一对应">
      <defs>
        <marker id="arrMerge" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-muted)" />
        </marker>
      </defs>

      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">同一套协议栈的两种切法：OSI 描述问题，TCP/IP 描述实现</text>

      <text x="6" y="26" font-size="7.5" font-weight="700" fill="var(--fig-node-a)">OSI 七层（理论模型）</text>
      <text x="206" y="26" font-size="7.5" font-weight="700" fill="var(--fig-node-b)">TCP/IP 四层（实际协议栈）</text>

      <!-- OSI 七层 -->
      <rect x="6" y="36" width="110" height="24" rx="3" fill="var(--fig-node-a)" opacity=".14" />
      <text x="12" y="48" font-size="8" font-weight="700" fill="var(--fig-node-a)">7 应用层</text>
      <text x="12" y="57" font-size="7" fill="var(--fig-muted)">面向用户</text>

      <rect x="6" y="62" width="110" height="24" rx="3" fill="var(--fig-node-a)" opacity=".11" />
      <text x="12" y="74" font-size="8" font-weight="700" fill="var(--fig-node-a)">6 表示层</text>
      <text x="12" y="83" font-size="7" fill="var(--fig-muted)">编码/加密</text>

      <rect x="6" y="88" width="110" height="24" rx="3" fill="var(--fig-node-a)" opacity=".08" />
      <text x="12" y="100" font-size="8" font-weight="700" fill="var(--fig-node-a)">5 会话层</text>
      <text x="12" y="109" font-size="7" fill="var(--fig-muted)">会话管理</text>

      <rect x="6" y="114" width="110" height="24" rx="3" fill="var(--fig-node-c)" opacity=".14" />
      <text x="12" y="126" font-size="8" font-weight="700" fill="var(--fig-node-c)">4 传输层</text>
      <text x="12" y="135" font-size="7" fill="var(--fig-muted)">端到端</text>

      <rect x="6" y="140" width="110" height="24" rx="3" fill="var(--fig-node-c)" opacity=".14" />
      <text x="12" y="152" font-size="8" font-weight="700" fill="var(--fig-node-c)">3 网络层</text>
      <text x="12" y="161" font-size="7" fill="var(--fig-muted)">寻址路由</text>

      <rect x="6" y="166" width="110" height="24" rx="3" fill="var(--fig-node-d)" opacity=".14" />
      <text x="12" y="178" font-size="8" font-weight="700" fill="var(--fig-node-d)">2 链路层</text>
      <text x="12" y="187" font-size="7" fill="var(--fig-muted)">同一链路</text>

      <rect x="6" y="192" width="110" height="24" rx="3" fill="var(--fig-node-d)" opacity=".11" />
      <text x="12" y="204" font-size="8" font-weight="700" fill="var(--fig-node-d)">1 物理层</text>
      <text x="12" y="213" font-size="7" fill="var(--fig-muted)">比特与电气</text>

      <!-- 合并连线：5~7 → 应用层 -->
      <path d="M116 48 H159 M116 74 H159 M116 100 H159 M159 46 V102" stroke="var(--fig-node-a)" stroke-width="1.2" fill="none" />
      <path d="M159 74 H202" stroke="var(--fig-muted)" stroke-width="1.4" fill="none" marker-end="url(#arrMerge)" />
      <text x="163" y="66" font-size="7" fill="var(--fig-node-a)">5~7 合并</text>

      <!-- 4 → 传输层（一一对应） -->
      <path d="M116 126 H202" stroke="var(--fig-muted)" stroke-width="1.4" fill="none" marker-end="url(#arrMerge)" />
      <text x="163" y="118" font-size="7" fill="var(--fig-muted)">4 对 4</text>

      <!-- 3 → 网络层（一一对应） -->
      <path d="M116 152 H202" stroke="var(--fig-muted)" stroke-width="1.4" fill="none" marker-end="url(#arrMerge)" />
      <text x="163" y="144" font-size="7" fill="var(--fig-muted)">3 对 3</text>

      <!-- 合并连线：1~2 → 网络接口层 -->
      <path d="M116 178 H159 M116 204 H159 M159 176 V206" stroke="var(--fig-node-d)" stroke-width="1.2" fill="none" />
      <path d="M159 191 H202" stroke="var(--fig-muted)" stroke-width="1.4" fill="none" marker-end="url(#arrMerge)" />
      <text x="163" y="183" font-size="7" fill="var(--fig-node-d)">1~2 合并</text>

      <!-- TCP/IP 应用层 -->
      <rect x="206" y="36" width="128" height="76" rx="4" fill="var(--fig-node-b)" opacity=".12" />
      <rect x="206" y="36" width="128" height="76" rx="4" fill="none" stroke="var(--fig-node-b)" stroke-width="1.1" />
      <text x="214" y="52" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">应用层</text>
      <text x="214" y="66" font-size="7.5" fill="var(--fig-text)">HTTP / DNS / SSH / FTP</text>
      <text x="214" y="78" font-size="7.5" fill="var(--fig-node-b)">含 OSI 的 5、6、7 层</text>
      <text x="214" y="90" font-size="7" fill="var(--fig-muted)">TLS 通常算表示层，也在此</text>

      <!-- TCP/IP 传输层 -->
      <rect x="206" y="114" width="128" height="24" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="214" y="129" font-size="8" font-weight="700" fill="var(--fig-node-c)">传输层</text>
      <text x="250" y="129" font-size="7.5" fill="var(--fig-text)">TCP / UDP</text>

      <!-- TCP/IP 网络层 -->
      <rect x="206" y="140" width="128" height="24" rx="4" fill="var(--fig-node-c)" opacity=".12" />
      <text x="214" y="155" font-size="8" font-weight="700" fill="var(--fig-node-c)">网络层</text>
      <text x="250" y="155" font-size="7.5" fill="var(--fig-text)">IP / ICMP</text>

      <!-- TCP/IP 网络接口层 -->
      <rect x="206" y="166" width="128" height="50" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="214" y="182" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">网络接口层</text>
      <text x="214" y="196" font-size="7.5" fill="var(--fig-text)">Ethernet / Wi-Fi</text>
      <text x="214" y="208" font-size="7.5" fill="var(--fig-node-d)">含 OSI 的 1、2 层</text>

      <!-- 为什么合并 -->
      <rect x="6" y="226" width="328" height="44" rx="5" fill="var(--fig-node-b)" opacity=".08" />
      <text x="14" y="240" font-size="8" font-weight="700" fill="var(--fig-node-b)">为什么要合并</text>
      <text x="80" y="240" font-size="7.5" fill="var(--fig-text)">会话层与表示层没有独立协议，直接并进应用层</text>
      <text x="14" y="253" font-size="7.5" fill="var(--fig-text)">OSI 是教学用的理论模型；TCP/IP 是实现里的协议栈</text>
      <text x="14" y="265" font-size="7.5" fill="var(--fig-node-c)">封装顺序：应用数据 → TCP 段 → IP 包 → MAC 帧 → 比特</text>

      <text x="6" y="284" font-size="7.5" fill="#e5484d">误记提醒：负载均衡说的「四层/七层」与模型分层不是一回事</text>
    </svg>
    <figcaption>OSI 7 层与 TCP/IP 4 层：5~7 并成应用层、1~2 并成网络接口层、4 与 3 一对一，合并的原因是会话与表示没有独立协议</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
