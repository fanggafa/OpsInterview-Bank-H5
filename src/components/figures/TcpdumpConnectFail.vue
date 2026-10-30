<script setup>
/**
 * 用 tcpdump 定位「客户端连不上服务端」（题 19）。
 *
 * 核心洞察：抓包的价值在于「判断包走到了哪一步」——
 * 有 SYN 无 SYN-ACK、有 SYN-ACK 但客户端没收到、直接 RST，各自指向完全不同的原因。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 274" role="img" aria-label="tcpdump 抓包判断连接失败：只发 SYN 被丢弃、SYN-ACK 未回客户端、直接 RST、三次握手完成但应用无响应">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">抓包的价值：判断包走到了哪一步 —— 不同现象指向不同原因</text>

      <rect x="6" y="20" width="328" height="18" rx="3" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="7.5" fill="var(--fig-node-a)">tcpdump -i any -nn 'host &lt;对端IP&gt; and port &lt;端口&gt;'</text>

      <rect x="6" y="42" width="328" height="44" rx="4" fill="#e5484d" opacity=".1" />
      <text x="14" y="55" font-size="8" font-weight="700" fill="#e5484d">① 只有 SYN，没有 SYN-ACK</text>
      <text x="14" y="68" font-size="7.5" fill="var(--fig-text)">包没到服务端，或被中间设备丢弃 → 防火墙/安全组/路由问题</text>
      <text x="14" y="80" font-size="7.5" fill="var(--fig-node-c)">对端抓包确认「有没有收到」是最直接的判定</text>

      <rect x="6" y="90" width="328" height="44" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="103" font-size="8" font-weight="700" fill="var(--fig-node-b)">② 有 SYN-ACK，但客户端没收到</text>
      <text x="14" y="116" font-size="7.5" fill="var(--fig-text)">回程被拦（安全组出方向、NAT 回包路径）→ 常见于云环境</text>
      <text x="14" y="128" font-size="7.5" fill="var(--fig-node-c)">表现：客户端超时，服务端日志显示「连接被关闭」</text>

      <rect x="6" y="138" width="328" height="34" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="151" font-size="8" font-weight="700" fill="var(--fig-node-c)">③ 直接 RST</text>
      <text x="14" y="164" font-size="7.5" fill="var(--fig-text)">对端明确拒绝：端口没监听 / 应用主动关闭 / 连接数满（见 82 题）</text>

      <rect x="6" y="176" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="189" font-size="8" font-weight="700" fill="var(--fig-node-d)">④ 三次握手完成，但没有应用响应</text>
      <text x="14" y="202" font-size="7.5" fill="var(--fig-text)">网络没问题，是应用卡住 / 处理慢 / 返回空（看应用日志与线程栈）</text>

      <rect x="6" y="218" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="231" font-size="8" font-weight="700" fill="var(--fig-node-a)">抓包要点</text>
      <text x="14" y="244" font-size="7.5" fill="var(--fig-text)">两端同时抓（才知是否丢在中间）· 用 -w 存文件供 Wireshark 分析</text>

      <text x="6" y="262" font-size="7.5" fill="var(--fig-muted)">提示：先看 seq/ack 与标志位；syn 重传间隔逐渐加大是「无响应」的典型特征</text>
    </svg>
    <figcaption>只有 SYN 是被丢弃、有 SYN-ACK 但客户端没收到是回程被拦、直接 RST 是明确拒绝、握手成功无响应是应用问题</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
