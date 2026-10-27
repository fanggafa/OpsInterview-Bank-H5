<script setup>
/**
 * iptables 数据包流向图（彩色版）。
 * 每条链一个颜色：PREROUTING 蓝、FORWARD 紫、INPUT 青、OUTPUT 橙、POSTROUTING 绿。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 214" role="img" aria-label="iptables 数据包流经的五条链">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-muted)" />
        </marker>
      </defs>

      <g font-size="10.5" fill="var(--fig-text)">
        <!-- 数据包入口 -->
        <rect x="6" y="88" width="44" height="28" rx="8" fill="var(--fig-node-a)" opacity=".18" />
        <text x="28" y="106" text-anchor="middle" font-weight="700" fill="var(--fig-node-a)">数据包</text>

        <!-- 连线 -->
        <path d="M50 102 L74 102" stroke="var(--fig-muted)" stroke-width="1.6" marker-end="url(#arrow)" />
        <path d="M144 102 L166 102" stroke="var(--fig-muted)" stroke-width="1.6" marker-end="url(#arrow)" />

        <!-- PREROUTING 蓝 -->
        <rect x="74" y="82" width="70" height="40" rx="8" fill="var(--fig-node-a)" opacity=".14" />
        <rect x="74" y="82" width="70" height="40" rx="8" fill="none" stroke="var(--fig-node-a)" stroke-width="1.6" />
        <text x="109" y="99" text-anchor="middle" font-weight="700" fill="var(--fig-node-a)">PREROUTING</text>
        <text x="109" y="113" text-anchor="middle" font-size="9" fill="var(--fig-muted)">改目标地址 DNAT</text>

        <!-- 路由判断 -->
        <circle cx="184" cy="102" r="15" fill="var(--fig-node-d)" opacity=".18" />
        <circle cx="184" cy="102" r="15" fill="none" stroke="var(--fig-node-d)" stroke-width="1.5" />
        <text x="184" y="105" text-anchor="middle" font-size="9" font-weight="700" fill="var(--fig-node-d)">路由</text>
        <text x="184" y="136" text-anchor="middle" font-size="9" fill="var(--fig-muted)">是否给本机</text>

        <!-- 上：FORWARD 紫 -->
        <path d="M198 92 C216 92, 216 56, 232 56" stroke="var(--fig-muted)" stroke-width="1.6" fill="none" marker-end="url(#arrow)" />
        <rect x="232" y="36" width="76" height="42" rx="8" fill="var(--fig-node-b)" opacity=".14" />
        <rect x="232" y="36" width="76" height="42" rx="8" fill="none" stroke="var(--fig-node-b)" stroke-width="1.6" />
        <text x="270" y="54" text-anchor="middle" font-weight="700" fill="var(--fig-node-b)">FORWARD</text>
        <text x="270" y="68" text-anchor="middle" font-size="9" fill="var(--fig-muted)">转发（做网关时）</text>

        <!-- 下：INPUT 青 -->
        <path d="M198 112 C216 112, 216 152, 232 152" stroke="var(--fig-muted)" stroke-width="1.6" fill="none" marker-end="url(#arrow)" />
        <rect x="232" y="131" width="76" height="42" rx="8" fill="var(--fig-node-c)" opacity=".14" />
        <rect x="232" y="131" width="76" height="42" rx="8" fill="none" stroke="var(--fig-node-c)" stroke-width="1.6" />
        <text x="270" y="149" text-anchor="middle" font-weight="700" fill="var(--fig-node-c)">INPUT</text>
        <text x="270" y="163" text-anchor="middle" font-size="9" fill="var(--fig-muted)">进入本机进程</text>

        <!-- POSTROUTING 绿 -->
        <path d="M270 78 L270 188" stroke="var(--fig-muted)" stroke-width="1.4" fill="none" stroke-dasharray="4 3" marker-end="url(#arrow)" />
        <rect x="222" y="188" width="96" height="22" rx="8" fill="var(--fig-node-c)" opacity=".2" />
        <text x="270" y="203" text-anchor="middle" font-size="9.5" font-weight="700" fill="var(--fig-node-c)">
          POSTROUTING（SNAT）
        </text>

        <!-- OUTPUT 橙（虚线，表示本机主动发出） -->
        <rect x="74" y="152" width="70" height="36" rx="8" fill="var(--fig-node-d)" opacity=".1" stroke="var(--fig-node-d)" stroke-width="1.3" stroke-dasharray="4 3" />
        <text x="109" y="168" text-anchor="middle" font-size="9.5" font-weight="700" fill="var(--fig-node-d)">OUTPUT</text>
        <text x="109" y="181" text-anchor="middle" font-size="8.5" fill="var(--fig-muted)">本机进程发出</text>
      </g>
    </svg>
    <figcaption>
      记忆：进来先 PREROUTING，出去最后 POSTROUTING；给本机走 INPUT，转发走 FORWARD，自己发出的走 OUTPUT
    </figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
