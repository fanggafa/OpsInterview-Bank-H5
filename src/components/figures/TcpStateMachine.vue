<script setup>
/**
 * TCP 状态转换图（题 9633）：11 个状态，但运维真正要盯的只有 5 个。
 *
 * 核心洞察：左右两列不是两条时间线，而是同一次连接在两端的状态 ——
 * 建立阶段两端只差一格（SYN_SENT 对 SYN_RECEIVED），断开阶段却分成两份，
 * 所以「TIME_WAIT 在主动关闭方、CLOSE_WAIT 在被动关闭方」是坐标系问题，不是巧合。
 *
 * 两个高频考点：TIME_WAIT 是保护机制（保最后一个 ACK 能送到 + 让旧报文消散），
 * 堆积只会耗尽本地端口；而 CLOSE_WAIT 堆积永远是应用没调 close() 的代码 bug，
 * 调 tcp_* 内核参数一点用都没有，只能改代码。
 */
</script>

<template>
  <figure class="fig">
    <svg
      viewBox="0 0 340 320"
      role="img"
      aria-label="TCP 状态转换图：左列是客户端（主动关闭方）依次经过 CLOSED、SYN_SENT、ESTABLISHED、FIN_WAIT_1、FIN_WAIT_2、TIME_WAIT 回到 CLOSED；右列是服务端（被动关闭方）依次经过 LISTEN、SYN_RECEIVED、ESTABLISHED、CLOSE_WAIT、LAST_ACK 到 CLOSED，箭头旁标注每步收发的报文；底部说明 TIME_WAIT 为何必须等、以及 CLOSE_WAIT 堆积是应用没调 close() 的代码 bug"
    >
      <defs>
        <marker id="arrSmA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-node-a)" />
        </marker>
        <marker id="arrSmB" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-node-b)" />
        </marker>
        <marker id="arrSmD" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-node-d)" />
        </marker>
      </defs>

      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">TCP 状态机：11 个状态里，运维真正要盯的只有 5 个</text>

      <text x="6" y="26" font-size="8" font-weight="700" fill="var(--fig-node-a)">客户端：发起连接 / 主动关闭</text>
      <text x="334" y="26" font-size="8" font-weight="700" text-anchor="end" fill="var(--fig-node-c)">服务端：接受连接 / 被动关闭</text>

      <!-- ===== 左列：客户端（主动关闭方）===== -->
      <!-- CLOSED -->
      <rect x="6" y="34" width="76" height="16" rx="8" fill="var(--fig-stroke)" opacity=".18" />
      <text x="44" y="44.5" font-size="7.5" font-weight="700" text-anchor="middle" fill="var(--fig-muted)">CLOSED</text>
      <text x="88" y="44.5" font-size="7.5" fill="var(--fig-muted)">未连接</text>

      <!-- CLOSED → SYN_SENT -->
      <path d="M44 50 V65" stroke="var(--fig-node-a)" stroke-width="1.4" fill="none" marker-end="url(#arrSmA)" />
      <text x="50" y="58" font-size="7.5" fill="var(--fig-node-a)">主动发 SYN</text>

      <!-- SYN_SENT -->
      <rect x="6" y="66" width="76" height="16" rx="8" fill="var(--fig-node-a)" opacity=".14" />
      <text x="44" y="76.5" font-size="7.5" font-weight="700" text-anchor="middle" fill="var(--fig-node-a)">SYN_SENT</text>
      <text x="88" y="76.5" font-size="7.5" fill="var(--fig-text)">已发 SYN 待回</text>

      <!-- SYN_SENT → ESTABLISHED -->
      <path d="M44 82 V97" stroke="var(--fig-node-a)" stroke-width="1.4" fill="none" marker-end="url(#arrSmA)" />
      <text x="50" y="90" font-size="7.5" fill="var(--fig-node-a)">收 SYN+ACK，回 ACK</text>

      <!-- ESTABLISHED -->
      <rect x="6" y="98" width="76" height="16" rx="8" fill="var(--fig-node-c)" opacity=".14" />
      <text x="44" y="108.5" font-size="7.5" font-weight="700" text-anchor="middle" fill="var(--fig-node-c)">ESTABLISHED ★</text>
      <text x="88" y="108.5" font-size="7.5" fill="var(--fig-text)">握手完成，可收发数据</text>

      <!-- ESTABLISHED → FIN_WAIT_1 -->
      <path d="M44 114 V129" stroke="var(--fig-node-b)" stroke-width="1.4" fill="none" marker-end="url(#arrSmB)" />
      <text x="50" y="122" font-size="7.5" fill="var(--fig-node-b)">主动关闭：发 FIN</text>

      <!-- FIN_WAIT_1 -->
      <rect x="6" y="130" width="76" height="16" rx="8" fill="var(--fig-node-b)" opacity=".14" />
      <text x="44" y="140.5" font-size="7.5" font-weight="700" text-anchor="middle" fill="var(--fig-node-b)">FIN_WAIT_1</text>
      <text x="88" y="140.5" font-size="7.5" fill="var(--fig-text)">等对方 ACK</text>

      <!-- FIN_WAIT_1 → FIN_WAIT_2 -->
      <path d="M44 146 V161" stroke="var(--fig-node-b)" stroke-width="1.4" fill="none" marker-end="url(#arrSmB)" />
      <text x="50" y="154" font-size="7.5" fill="var(--fig-node-b)">收对方 ACK</text>

      <!-- FIN_WAIT_2 -->
      <rect x="6" y="162" width="76" height="16" rx="8" fill="var(--fig-node-b)" opacity=".14" />
      <text x="44" y="172.5" font-size="7.5" font-weight="700" text-anchor="middle" fill="var(--fig-node-b)">FIN_WAIT_2</text>
      <text x="88" y="172.5" font-size="7.5" fill="var(--fig-text)">等对方也发 FIN</text>

      <!-- FIN_WAIT_2 → TIME_WAIT -->
      <path d="M44 178 V193" stroke="var(--fig-node-b)" stroke-width="1.4" fill="none" marker-end="url(#arrSmB)" />
      <text x="50" y="186" font-size="7.5" fill="var(--fig-node-b)">收对方 FIN，回 ACK</text>

      <!-- TIME_WAIT -->
      <rect x="6" y="194" width="76" height="16" rx="8" fill="var(--fig-node-b)" opacity=".14" />
      <text x="44" y="204.5" font-size="7.5" font-weight="700" text-anchor="middle" fill="var(--fig-node-b)">TIME_WAIT ★</text>
      <text x="88" y="204.5" font-size="7.5" fill="var(--fig-text)">等 2MSL ≈60s</text>

      <!-- TIME_WAIT → CLOSED -->
      <path d="M44 210 V225" stroke="var(--fig-node-d)" stroke-width="1.4" fill="none" marker-end="url(#arrSmD)" />
      <text x="50" y="218" font-size="7.5" fill="var(--fig-node-d)">等满 2MSL 才释放</text>

      <!-- CLOSED（终态）-->
      <rect x="6" y="226" width="76" height="16" rx="8" fill="var(--fig-stroke)" opacity=".18" />
      <text x="44" y="236.5" font-size="7.5" font-weight="700" text-anchor="middle" fill="var(--fig-muted)">CLOSED</text>
      <text x="88" y="236.5" font-size="7.5" fill="var(--fig-muted)">彻底释放</text>

      <!-- ===== 右列：服务端（被动关闭方）===== -->
      <!-- LISTEN -->
      <rect x="258" y="34" width="76" height="16" rx="8" fill="var(--fig-node-a)" opacity=".14" />
      <text x="296" y="44.5" font-size="7.5" font-weight="700" text-anchor="middle" fill="var(--fig-node-a)">LISTEN ★</text>
      <text x="250" y="44.5" font-size="7.5" fill="var(--fig-text)" text-anchor="end">端口在等服务</text>

      <!-- LISTEN → SYN_RECEIVED -->
      <path d="M296 50 V65" stroke="var(--fig-node-a)" stroke-width="1.4" fill="none" marker-end="url(#arrSmA)" />
      <text x="290" y="58" font-size="7.5" fill="var(--fig-node-a)" text-anchor="end">收 SYN，回 SYN+ACK</text>

      <!-- SYN_RECEIVED -->
      <rect x="258" y="66" width="76" height="16" rx="8" fill="var(--fig-node-a)" opacity=".14" />
      <text x="296" y="76.5" font-size="7.5" font-weight="700" text-anchor="middle" fill="var(--fig-node-a)">SYN_RECEIVED ★</text>
      <text x="250" y="76.5" font-size="7.5" fill="var(--fig-text)" text-anchor="end">半连接队列</text>

      <!-- SYN_RECEIVED → ESTABLISHED -->
      <path d="M296 82 V97" stroke="var(--fig-node-a)" stroke-width="1.4" fill="none" marker-end="url(#arrSmA)" />
      <text x="290" y="90" font-size="7.5" fill="var(--fig-node-a)" text-anchor="end">收 ACK</text>

      <!-- ESTABLISHED -->
      <rect x="258" y="98" width="76" height="16" rx="8" fill="var(--fig-node-c)" opacity=".14" />
      <text x="296" y="108.5" font-size="7.5" font-weight="700" text-anchor="middle" fill="var(--fig-node-c)">ESTABLISHED ★</text>
      <text x="250" y="108.5" font-size="7.5" fill="var(--fig-text)" text-anchor="end">数量 ≈ 当前并发</text>

      <!-- ESTABLISHED → CLOSE_WAIT -->
      <path d="M296 114 V129" stroke="var(--fig-node-d)" stroke-width="1.4" fill="none" marker-end="url(#arrSmD)" />
      <text x="290" y="122" font-size="7.5" fill="var(--fig-node-d)" text-anchor="end">收 FIN，回 ACK</text>

      <!-- CLOSE_WAIT -->
      <rect x="258" y="130" width="76" height="16" rx="8" fill="#e5484d" opacity=".14" />
      <text x="296" y="140.5" font-size="7.5" font-weight="700" text-anchor="middle" fill="#e5484d">CLOSE_WAIT ★</text>
      <text x="250" y="140.5" font-size="7.5" fill="#e5484d" text-anchor="end">等应用 close()</text>

      <!-- CLOSE_WAIT → LAST_ACK -->
      <path d="M296 146 V161" stroke="var(--fig-node-d)" stroke-width="1.4" fill="none" marker-end="url(#arrSmD)" />
      <text x="290" y="154" font-size="7.5" fill="var(--fig-node-d)" text-anchor="end">应用 close()，发 FIN</text>

      <!-- LAST_ACK -->
      <rect x="258" y="162" width="76" height="16" rx="8" fill="var(--fig-node-d)" opacity=".14" />
      <text x="296" y="172.5" font-size="7.5" font-weight="700" text-anchor="middle" fill="var(--fig-node-d)">LAST_ACK</text>
      <text x="250" y="172.5" font-size="7.5" fill="var(--fig-text)" text-anchor="end">已发 FIN 等 ACK</text>

      <!-- LAST_ACK → CLOSED -->
      <path d="M296 178 V193" stroke="var(--fig-node-d)" stroke-width="1.4" fill="none" marker-end="url(#arrSmD)" />
      <text x="290" y="186" font-size="7.5" fill="var(--fig-node-d)" text-anchor="end">收 ACK 后关闭</text>

      <!-- CLOSED（被动方终态）-->
      <rect x="258" y="194" width="76" height="16" rx="8" fill="var(--fig-stroke)" opacity=".18" />
      <text x="296" y="204.5" font-size="7.5" font-weight="700" text-anchor="middle" fill="var(--fig-muted)">CLOSED</text>
      <text x="250" y="204.5" font-size="7.5" fill="var(--fig-muted)" text-anchor="end">被动方已关完</text>

      <!-- ===== 底部：两个运维高频点 ===== -->
      <rect x="6" y="252" width="160" height="54" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="12" y="265" font-size="8" font-weight="700" fill="var(--fig-node-b)">TIME_WAIT 为什么必须存在</text>
      <text x="12" y="277" font-size="7.5" fill="var(--fig-text)">1) 保最后一个 ACK 能送到</text>
      <text x="12" y="288" font-size="7.5" fill="var(--fig-text)">2) 让旧连接的报文消散</text>
      <text x="12" y="299" font-size="7.5" fill="var(--fig-node-b)">堆积后果：耗尽本地端口</text>

      <rect x="174" y="252" width="160" height="54" rx="5" fill="#e5484d" opacity=".12" />
      <text x="180" y="265" font-size="8" font-weight="700" fill="#e5484d">CLOSE_WAIT 堆积 = 应用 bug</text>
      <text x="180" y="277" font-size="7.5" fill="var(--fig-text)">应用没调 close()，socket 一直挂</text>
      <text x="180" y="288" font-size="7.5" fill="var(--fig-text)">调内核参数完全没用，必须改代码</text>
      <text x="180" y="299" font-size="7.5" fill="#e5484d">根因：连接没关 / 异常路径漏关</text>

      <text x="6" y="315" font-size="7.5" fill="var(--fig-muted)">★ = 运维最高频的 5 个状态；只背 11 个名字就算没答</text>
    </svg>
    <figcaption>建立阶段两端只差一格（SYN_SENT 对 SYN_RECEIVED）；TIME_WAIT 在主动关闭方（保 ACK 送达 + 旧报文消散，堆积会耗尽端口），CLOSE_WAIT 在被动关闭方，堆积就是应用没调 close() 的代码 bug</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
