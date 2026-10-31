<script setup>
/**
 * NAT 工作原理（题 9629）。
 *
 * 核心洞察：NAT 的全部魔法就是「改写包头 + 记一张表」——
 * 出向改源地址（SNAT/PAT），回包按目的端口查表还原；
 * 所有内网机器共用同一个公网 IP，靠端口区分身份，所以表满就是连接建不起来。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 292" role="img" aria-label="NAT 工作流：内网主机发出后经 NAT 设备改写源地址为公网 IP 与端口并记下映射表，发往公网；回包到达时按目的端口查表还原成内网地址；下方并列 SNAT、DNAT、PAT 三种类型">
      <defs>
        <marker id="arrNat" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-node-a)" />
        </marker>
        <marker id="arrNatB" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fig-node-b)" />
        </marker>
      </defs>

      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">NAT = 改包头里的地址/端口，让内网机器共用一个公网 IP</text>

      <!-- 出向 -->
      <text x="6" y="28" font-size="8" font-weight="700" fill="var(--fig-node-a)">① 出向：改「源」地址（SNAT / PAT）</text>

      <rect x="4" y="34" width="92" height="48" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="12" y="48" font-size="8" font-weight="700" fill="var(--fig-node-c)">内网主机</text>
      <text x="12" y="60" font-size="7.5" fill="var(--fig-text)">192.168.1.10:5000</text>
      <text x="12" y="72" font-size="7" fill="var(--fig-muted)">发起访问 8.8.8.8:53</text>

      <path d="M98 58 H120" stroke="var(--fig-node-a)" stroke-width="1.4" marker-end="url(#arrNat)" />

      <rect x="124" y="34" width="96" height="48" rx="5" fill="var(--fig-node-a)" opacity=".14" />
      <rect x="124" y="34" width="96" height="48" rx="5" fill="none" stroke="var(--fig-node-a)" stroke-width="1.2" />
      <text x="132" y="48" font-size="8" font-weight="700" fill="var(--fig-node-a)">NAT 设备</text>
      <text x="132" y="60" font-size="7.5" fill="var(--fig-text)">改写源地址/端口</text>
      <text x="132" y="72" font-size="7.5" fill="var(--fig-node-a)">→ 203.0.113.5:6000</text>

      <path d="M222 58 H244" stroke="var(--fig-node-a)" stroke-width="1.4" marker-end="url(#arrNat)" />

      <rect x="248" y="34" width="88" height="48" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="256" y="48" font-size="8" font-weight="700" fill="var(--fig-node-c)">公网服务器</text>
      <text x="256" y="60" font-size="7.5" fill="var(--fig-text)">8.8.8.8:53</text>
      <text x="256" y="72" font-size="7" fill="var(--fig-muted)">只见公网源 IP</text>

      <!-- 映射表 -->
      <rect x="4" y="90" width="332" height="58" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="12" y="104" font-size="8" font-weight="700" fill="var(--fig-node-c)">NAT 记下的映射表（用端口区分是哪台内网机器）</text>
      <text x="12" y="118" font-size="7.5" fill="var(--fig-text)">203.0.113.5:6000  ↔  192.168.1.10:5000</text>
      <text x="12" y="130" font-size="7.5" fill="var(--fig-node-c)">回包按「目的端口 6000」查到这一行，还原成内网地址</text>
      <text x="12" y="142" font-size="7" fill="var(--fig-muted)">同一公网 IP 下所有内网主机，全靠端口区分身份</text>

      <!-- 回向 -->
      <text x="6" y="158" font-size="8" font-weight="700" fill="var(--fig-node-b)">② 回向：查表还原再交付</text>

      <rect x="4" y="164" width="104" height="46" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="12" y="178" font-size="8" font-weight="700" fill="var(--fig-node-c)">公网回包</text>
      <text x="12" y="190" font-size="7.5" fill="var(--fig-text)">目的 203.0.113.5</text>
      <text x="12" y="202" font-size="7.5" fill="var(--fig-muted)">目的端口 6000</text>

      <path d="M110 187 H128" stroke="var(--fig-node-b)" stroke-width="1.4" marker-end="url(#arrNatB)" />

      <rect x="132" y="164" width="92" height="46" rx="5" fill="var(--fig-node-b)" opacity=".14" />
      <rect x="132" y="164" width="92" height="46" rx="5" fill="none" stroke="var(--fig-node-b)" stroke-width="1.2" />
      <text x="140" y="178" font-size="8" font-weight="700" fill="var(--fig-node-b)">NAT 查表</text>
      <text x="140" y="190" font-size="7.5" fill="var(--fig-text)">按目的端口</text>
      <text x="140" y="202" font-size="7.5" fill="var(--fig-text)">还原源地址</text>

      <path d="M226 187 H240" stroke="var(--fig-node-b)" stroke-width="1.4" marker-end="url(#arrNatB)" />

      <rect x="244" y="164" width="92" height="46" rx="5" fill="var(--fig-node-c)" opacity=".12" />
      <text x="252" y="178" font-size="8" font-weight="700" fill="var(--fig-node-c)">内网收到</text>
      <text x="252" y="190" font-size="7.5" fill="var(--fig-text)">192.168.1.10:5000</text>
      <text x="252" y="202" font-size="7" fill="var(--fig-muted)">不知道做过 NAT</text>

      <!-- 三种类型 -->
      <text x="6" y="220" font-size="8" font-weight="700" fill="var(--fig-node-d)">③ 三种类型：改「源」还是改「目的」</text>

      <rect x="4" y="226" width="107" height="48" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="12" y="240" font-size="8" font-weight="700" fill="var(--fig-node-a)">SNAT</text>
      <text x="12" y="252" font-size="7.5" fill="var(--fig-text)">改源 IP/端口</text>
      <text x="12" y="264" font-size="7.5" fill="var(--fig-text)">内网出网，最常见</text>

      <rect x="116" y="226" width="107" height="48" rx="5" fill="var(--fig-node-b)" opacity=".12" />
      <text x="124" y="240" font-size="8" font-weight="700" fill="var(--fig-node-b)">DNAT</text>
      <text x="124" y="252" font-size="7.5" fill="var(--fig-text)">改目的 IP/端口</text>
      <text x="124" y="264" font-size="7.5" fill="var(--fig-text)">端口映射，外部进内网</text>

      <rect x="228" y="226" width="108" height="48" rx="5" fill="var(--fig-node-d)" opacity=".12" />
      <text x="236" y="240" font-size="8" font-weight="700" fill="var(--fig-node-d)">PAT / NAPT</text>
      <text x="236" y="252" font-size="7.5" fill="var(--fig-text)">IP 与端口同时改</text>
      <text x="236" y="264" font-size="7.5" fill="var(--fig-text)">多对一，靠端口区分</text>

      <text x="6" y="284" font-size="7.5" fill="#e5484d">坑：NAT 表有上限，连接数暴涨会耗尽 → 新连接建不起来</text>
    </svg>
    <figcaption>NAT 靠「改包头 + 记映射表」工作：出向 SNAT 改源地址，回包按目的端口查表还原；表满则新连接失败</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
