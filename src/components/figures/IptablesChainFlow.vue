<script setup>
/** iptables 数据包流向图：五链的经过顺序 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 210" role="img" aria-label="iptables 数据包流经的五条链">
      <g fill="currentColor" font-size="10.5">
        <!-- 入口 -->
        <rect x="6" y="86" width="46" height="30" rx="6" fill="currentColor" opacity=".14" />
        <text x="29" y="105" text-anchor="middle" font-weight="600">数据包</text>

        <!-- PREROUTING -->
        <path d="M52 101 L74 101" stroke="currentColor" stroke-width="1.4" fill="none" opacity=".5" />
        <rect x="74" y="82" width="70" height="38" rx="6" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".7" />
        <text x="109" y="99" text-anchor="middle" font-weight="600">PREROUTING</text>
        <text x="109" y="112" text-anchor="middle" font-size="9" opacity=".7">改目标地址（DNAT）</text>

        <!-- 路由判断 -->
        <path d="M144 101 L168 101" stroke="currentColor" stroke-width="1.4" fill="none" opacity=".5" />
        <circle cx="182" cy="101" r="14" fill="currentColor" opacity=".18" />
        <text x="182" y="104" text-anchor="middle" font-size="9" font-weight="600">路由</text>
        <text x="182" y="132" text-anchor="middle" font-size="9" opacity=".65">是否给本机</text>

        <!-- 上分支：转发 -->
        <path d="M196 95 C214 95, 214 56, 232 56" stroke="currentColor" stroke-width="1.4" fill="none" opacity=".5" />
        <rect x="232" y="36" width="76" height="40" rx="6" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".7" />
        <text x="270" y="54" text-anchor="middle" font-weight="600">FORWARD</text>
        <text x="270" y="67" text-anchor="middle" font-size="9" opacity=".7">转发（做网关时）</text>

        <!-- 下分支：本机 -->
        <path d="M196 108 C214 108, 214 150, 232 150" stroke="currentColor" stroke-width="1.4" fill="none" opacity=".5" />
        <rect x="232" y="130" width="76" height="40" rx="6" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".7" />
        <text x="270" y="148" text-anchor="middle" font-weight="600">INPUT</text>
        <text x="270" y="161" text-anchor="middle" font-size="9" opacity=".7">进入本机进程</text>

        <!-- POSTROUTING -->
        <path d="M270 76 L270 100" stroke="currentColor" stroke-width="1.4" fill="none" opacity=".5" />
        <path d="M270 170 L270 186" stroke="currentColor" stroke-width="1.4" fill="none" opacity=".5" />
        <rect x="226" y="186" width="88" height="20" rx="6" fill="currentColor" opacity=".12" />
        <text x="270" y="200" text-anchor="middle" font-size="9.5" font-weight="600">POSTROUTING（SNAT）</text>

        <!-- OUTPUT 小注 -->
        <rect x="74" y="150" width="70" height="34" rx="6" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 3" opacity=".5" />
        <text x="109" y="166" text-anchor="middle" font-size="9.5" opacity=".8">OUTPUT</text>
        <text x="109" y="178" text-anchor="middle" font-size="8.5" opacity=".6">本机进程发出</text>
      </g>
    </svg>
    <figcaption>
      记忆：进来的先 PREROUTING，出去的最后 POSTROUTING；给本机走 INPUT，转发走 FORWARD，
      本机自己发起的走 OUTPUT
    </figcaption>
  </figure>
</template>

<style scoped>
.fig {
  margin: 10px 0 2px;
  padding: 8px 6px 6px;
  border-radius: var(--radius-sm);
  background: var(--c-card);
  border: 1px solid var(--c-border);
}
.fig svg {
  display: block;
  width: 100%;
  height: auto;
  color: var(--c-text-2);
}
.fig figcaption {
  margin-top: 4px;
  font-size: 11px;
  line-height: 1.5;
  color: var(--c-text-3);
  text-align: center;
}
</style>
