<script setup>
/**
 * LVS 三种模式（题 2616）。
 *
 * 核心洞察：区别只有两句话 —— 请求包改哪一层、回包走不走 LB。
 * DR 只改二层 MAC、TUN 再套一层 IP 头，两种回包都直达客户端；
 * 只有 NAT 要改三层 IP，于是回包也得回到 LB 改回来，LB 因此成了双向瓶颈。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 372" role="img" aria-label="LVS 的 DR、NAT、TUN 三种模式对比：请求包改哪一层、响应包是否经过 LB">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">三条路径看两点：请求改什么、回包绕不绕 LB</text>

      <defs>
        <marker id="mReq" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-node-a)" />
        </marker>
        <marker id="mBack" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-node-c)" />
        </marker>
        <marker id="mBad" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#e5484d" />
        </marker>
      </defs>

      <!-- ============ DR ============ -->
      <rect x="6" y="20" width="328" height="92" rx="6" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="34" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">DR · 只改二层 MAC（生产首选）</text>

      <rect x="10" y="42" width="54" height="24" rx="3" fill="none" stroke="var(--fig-stroke)" stroke-width="1.1" />
      <text x="37" y="50" text-anchor="middle" font-size="8" font-weight="700" fill="var(--fig-text)">客户端</text>
      <text x="37" y="62" text-anchor="middle" font-size="7" fill="var(--fig-muted)">公网</text>

      <rect x="92" y="42" width="64" height="24" rx="3" fill="var(--fig-node-a)" opacity=".3" />
      <text x="124" y="50" text-anchor="middle" font-size="8" font-weight="700" fill="var(--fig-node-a)">LB</text>
      <text x="124" y="62" text-anchor="middle" font-size="7" fill="var(--fig-node-a)">改 MAC</text>

      <rect x="250" y="42" width="72" height="24" rx="3" fill="none" stroke="var(--fig-stroke)" stroke-width="1.1" />
      <text x="286" y="50" text-anchor="middle" font-size="8" font-weight="700" fill="var(--fig-text)">后端 RS</text>
      <text x="286" y="62" text-anchor="middle" font-size="7" fill="var(--fig-muted)">VIP 绑 lo</text>

      <path d="M66 54 L88 54" stroke="var(--fig-node-a)" stroke-width="1.5" marker-end="url(#mReq)" />
      <path d="M158 54 L244 54" stroke="var(--fig-node-a)" stroke-width="1.5" marker-end="url(#mReq)" />
      <path d="M286 68 L286 80 L40 80 L40 68" fill="none" stroke="var(--fig-node-c)" stroke-width="1.5" stroke-dasharray="3 2" marker-end="url(#mBack)" />
      <text x="166" y="74" font-size="7" fill="var(--fig-node-c)">回包直达，不经 LB</text>

      <text x="14" y="92" font-size="7.5" fill="var(--fig-text)">IP 头完全不变，LB 只担入向流量，吞吐最高</text>
      <text x="14" y="104" font-size="7" fill="#e5484d">前提：LB 与 RS 必须在同一二层网络</text>

      <!-- ============ NAT ============ -->
      <rect x="6" y="120" width="328" height="92" rx="6" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="134" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">NAT · 只改三层 IP（进出都过 LB）</text>

      <rect x="10" y="142" width="54" height="24" rx="3" fill="none" stroke="var(--fig-stroke)" stroke-width="1.1" />
      <text x="37" y="150" text-anchor="middle" font-size="8" font-weight="700" fill="var(--fig-text)">客户端</text>
      <text x="37" y="162" text-anchor="middle" font-size="7" fill="var(--fig-muted)">公网</text>

      <rect x="92" y="142" width="64" height="24" rx="3" fill="var(--fig-node-d)" opacity=".3" />
      <text x="124" y="150" text-anchor="middle" font-size="8" font-weight="700" fill="var(--fig-node-d)">LB</text>
      <text x="124" y="162" text-anchor="middle" font-size="7" fill="var(--fig-node-d)">改目的 IP</text>

      <rect x="250" y="142" width="72" height="24" rx="3" fill="none" stroke="var(--fig-stroke)" stroke-width="1.1" />
      <text x="286" y="150" text-anchor="middle" font-size="8" font-weight="700" fill="var(--fig-text)">后端 RS</text>
      <text x="286" y="162" text-anchor="middle" font-size="7" fill="var(--fig-muted)">无需 VIP</text>

      <path d="M66 154 L88 154" stroke="var(--fig-node-a)" stroke-width="1.5" marker-end="url(#mReq)" />
      <path d="M158 154 L244 154" stroke="var(--fig-node-a)" stroke-width="1.5" marker-end="url(#mReq)" />
      <path d="M286 168 L286 180 L124 180 L124 168" fill="none" stroke="#e5484d" stroke-width="1.4" marker-end="url(#mBad)" />
      <path d="M100 168 L100 180 L40 180 L40 168" fill="none" stroke="#e5484d" stroke-width="1.4" marker-end="url(#mBad)" />
      <text x="150" y="173" font-size="7" fill="#e5484d">回包必先回 LB 改写</text>

      <text x="14" y="192" font-size="7.5" fill="var(--fig-text)">双向流量都压 LB，它成了瓶颈，也因此能跨网段</text>
      <text x="14" y="204" font-size="7" fill="var(--fig-muted)">配置最简单，适合后端不在同一二层的小规模场景</text>

      <!-- ============ TUN ============ -->
      <rect x="6" y="220" width="328" height="92" rx="6" fill="var(--fig-node-b)" opacity=".12" />
      <text x="14" y="234" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">TUN · 外面再套一层 IP 头（可跨机房）</text>

      <rect x="10" y="242" width="54" height="24" rx="3" fill="none" stroke="var(--fig-stroke)" stroke-width="1.1" />
      <text x="37" y="250" text-anchor="middle" font-size="8" font-weight="700" fill="var(--fig-text)">客户端</text>
      <text x="37" y="262" text-anchor="middle" font-size="7" fill="var(--fig-muted)">公网</text>

      <rect x="92" y="242" width="64" height="24" rx="3" fill="var(--fig-node-b)" opacity=".3" />
      <text x="124" y="250" text-anchor="middle" font-size="8" font-weight="700" fill="var(--fig-node-b)">LB</text>
      <text x="124" y="262" text-anchor="middle" font-size="7" fill="var(--fig-node-b)">封装 IP 头</text>

      <rect x="250" y="242" width="72" height="24" rx="3" fill="none" stroke="var(--fig-stroke)" stroke-width="1.1" />
      <text x="286" y="250" text-anchor="middle" font-size="8" font-weight="700" fill="var(--fig-text)">后端 RS</text>
      <text x="286" y="262" text-anchor="middle" font-size="7" fill="var(--fig-muted)">解封装</text>

      <path d="M66 254 L88 254" stroke="var(--fig-node-a)" stroke-width="1.5" marker-end="url(#mReq)" />
      <path d="M158 254 L244 254" stroke="var(--fig-node-b)" stroke-width="1.5" marker-end="url(#mReq)" />
      <path d="M286 268 L286 282 L40 282 L40 268" fill="none" stroke="var(--fig-node-c)" stroke-width="1.5" stroke-dasharray="3 2" marker-end="url(#mBack)" />
      <text x="174" y="272" font-size="7" fill="var(--fig-node-c)">回包直达，可跨机房</text>

      <text x="14" y="294" font-size="7.5" fill="var(--fig-text)">回包不经 LB，性能居中，代价是多一层封装开销</text>
      <text x="14" y="306" font-size="7" fill="var(--fig-muted)">存在的唯一理由：后端能跨机房、跨网段部署</text>

      <!-- 结论 -->
      <rect x="6" y="322" width="328" height="44" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="335" font-size="8.5" font-weight="700" fill="#e5484d">选型与坑：DR 的后端也配了 VIP，必须抑制 ARP</text>
      <text x="14" y="348" font-size="7.5" fill="var(--fig-text)">同机房要性能用 DR；跨网段用 NAT；跨机房用 TUN</text>
      <text x="14" y="360" font-size="7" fill="var(--fig-muted)">不抑制 ARP，客户端会绕过 LB 直接找到 RS</text>
    </svg>
    <figcaption>DR 改 MAC、TUN 加一层 IP 头，回包都直达客户端；只有 NAT 改 IP，所以回包也得回 LB —— 它是瓶颈，也是唯一能跨网段的</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
