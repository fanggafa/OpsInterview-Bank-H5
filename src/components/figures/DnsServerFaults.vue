<script setup>
/**
 * DNS 服务端（Bind）常见故障排查（题 1024）。
 *
 * 核心洞察：解析故障无非「服务没起、配置错、上游不通、缓存污染」四类，
 * 客户端侧现象常表现为超时、NXDOMAIN 或解析到错地址。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 238" role="img" aria-label="DNS 服务端故障四类：服务未启动、配置错误、上游不通、缓存与 TTL 问题">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">四类故障对应四种客户端现象 —— 先看现象就缩小了范围</text>

      <rect x="6" y="20" width="328" height="30" rx="4" fill="#e5484d" opacity=".12" />
      <text x="14" y="33" font-size="8" font-weight="700" fill="#e5484d">① 服务未启动 / 端口不通</text>
      <text x="14" y="45" font-size="7.5" fill="var(--fig-text)">现象：客户端全部超时；ss -lunp | grep 53 确认监听</text>

      <rect x="6" y="54" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="67" font-size="8" font-weight="700" fill="var(--fig-node-a)">② 配置错误（named.conf / zone 文件）</text>
      <text x="14" y="79" font-size="7.5" fill="var(--fig-text)">现象：SERVFAIL 或特定域名解析失败；named-checkconf / named-checkzone 校验</text>

      <rect x="6" y="88" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="101" font-size="8" font-weight="700" fill="var(--fig-node-b)">③ 上游不通 / 转发配置错</text>
      <text x="14" y="113" font-size="7.5" fill="var(--fig-text)">现象：能连上但解析不出；dig 指定上游测通断，看 forwarders 设置</text>

      <rect x="6" y="122" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="135" font-size="8" font-weight="700" fill="var(--fig-node-c)">④ 缓存与 TTL 问题</text>
      <text x="14" y="147" font-size="7.5" fill="var(--fig-text)">现象：改了记录但某些地方还是旧值 → TTL 还没过期或中间有缓存</text>

      <!-- 排查 -->
      <rect x="6" y="160" width="328" height="50" rx="5" fill="var(--fig-node-d)" opacity=".1" />
      <text x="14" y="173" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">排查顺序（从服务端到客户端）</text>
      <text x="14" y="186" font-size="7.5" fill="var(--fig-text)">① 本机 dig 直连（dig @127.0.0.1 域名）—— 排除网络因素</text>
      <text x="14" y="198" font-size="7.5" fill="var(--fig-text)">② 看日志（Bind 的 query-errors / 系统 syslog）　③ dig +trace 看哪一级断</text>
      <text x="14" y="210" font-size="7" fill="var(--fig-node-c)">④ 对比「其他递归服务器」是否同样失败 → 判断是本地还是上游</text>

      <rect x="6" y="218" width="328" height="18" rx="3" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="231" font-size="7.5" fill="var(--fig-text)">注意：DNSSEC 验证失败也会表现成 SERVFAIL，排查时别漏这项</text>
    </svg>
    <figcaption>四类故障：服务未起、配置错、上游不通、缓存/TTL；先看客户端现象（超时/SERVFAIL/NXDOMAIN）再按服务端到客户端查</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
