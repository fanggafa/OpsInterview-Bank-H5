<script setup>
/**
 * 网络连接数异常多（题 4009）。
 *
 * 核心洞察：TIME_WAIT 多通常是「短连接+主动关闭」的正常现象，
 * ESTABLISHED 异常多则可能是泄漏或攻击 —— 两者处置完全不同。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 252" role="img" aria-label="TIME_WAIT 多源于短连接主动关闭，ESTABLISHED 异常多可能是连接泄漏或攻击">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">先分清是哪种状态 —— TIME_WAIT 与 ESTABLISHED 的成因完全不同</text>

      <rect x="6" y="20" width="160" height="90" rx="5" fill="var(--fig-node-a)" opacity=".12" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">TIME_WAIT 大量</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">成因：短连接 + 主动关闭方</text>
      <text x="14" y="58" font-size="7.5" fill="var(--fig-text)">每个连接要等 2MSL 才释放</text>
      <text x="14" y="70" font-size="7.5" fill="var(--fig-text)">本身是「正常保护」不是 bug</text>
      <text x="14" y="82" font-size="7.5" fill="var(--fig-text)">风险：耗尽本地端口（约 28232）</text>
      <text x="14" y="94" font-size="7.5" fill="var(--fig-node-c)">解法：长连接/连接池、tcp_tw_reuse</text>
      <text x="14" y="106" font-size="7" fill="var(--fig-node-c)">别随意调短 2MSL</text>

      <rect x="174" y="20" width="160" height="90" rx="5" fill="#e5484d" opacity=".12" />
      <text x="182" y="33" font-size="8.5" font-weight="700" fill="#e5484d">ESTABLISHED 异常多</text>
      <text x="182" y="46" font-size="7.5" fill="var(--fig-text)">成因：连接泄漏/未关闭</text>
      <text x="182" y="58" font-size="7.5" fill="var(--fig-text)">或攻击（慢连接/资源耗尽）</text>
      <text x="182" y="70" font-size="7.5" fill="var(--fig-text)">风险：句柄/内存耗尽、服务不可用</text>
      <text x="182" y="82" font-size="7.5" fill="var(--fig-text)">排查：ss -tnp 看谁在连、连到哪</text>
      <text x="182" y="94" font-size="7" fill="#e5484d">这是真问题，必须查</text>
      <text x="182" y="106" font-size="7" fill="var(--fig-node-c)">看是否有单一来源 IP 大量连接</text>

      <!-- 排查命令 -->
      <rect x="6" y="120" width="328" height="46" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="133" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">排查命令</text>
      <text x="14" y="146" font-size="7.5" fill="var(--fig-text)">ss -s（按状态汇总）· ss -tn state time-wait | wc -l · ss -tnp 看进程</text>
      <text x="14" y="158" font-size="7.5" fill="var(--fig-text)">ss -tn dst &lt;ip&gt; 看某来源的连接数（判断是否攻击）</text>

      <rect x="6" y="174" width="328" height="34" rx="4" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="187" font-size="8" font-weight="700" fill="var(--fig-node-d)">常见根因</text>
      <text x="14" y="199" font-size="7.5" fill="var(--fig-text)">应用没用连接池（每次新建）· 代码忘 close · 客户端超时后不释放</text>

      <rect x="6" y="216" width="328" height="20" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="230" font-size="7.5" fill="var(--fig-text)">注意：容器里 ulimit nofile 限制低时，先报「无法打开文件」再谈连接数</text>

      <text x="6" y="242" font-size="7.5" fill="var(--fig-muted)">判断顺序：先 ss -s 看状态分布 → 再定位来源 → 最后看应用侧是否泄漏</text>
    </svg>
    <figcaption>TIME_WAIT 多来自短连接主动关闭（正常保护，风险是端口耗尽）；ESTABLISHED 异常多是泄漏或攻击，必须查来源</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
