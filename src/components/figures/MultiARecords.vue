<script setup>
/**
 * 多 A 记录（同一域名多个 IP）的选择方式与隐患（题 1010）。
 *
 * 核心洞察：客户端「只用一个 IP」，且顺序由权威返回、可能被轮询；
 * 所以多 A 不是真正的负载均衡，坏点也不会被自动避开。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 262" role="img" aria-label="多 A 记录时客户端通常只用第一个 IP，可能做轮询，坏点不会被跳过，需要配合健康检查">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">客户端「只用一个 IP」——多 A 记录不是真正的负载均衡</text>

      <rect x="6" y="20" width="328" height="34" rx="4" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">常见选择方式</text>
      <text x="14" y="46" font-size="7.5" fill="var(--fig-text)">多数解析器只用「返回列表的第一个」；部分客户端会随机或轮询</text>

      <rect x="6" y="58" width="328" height="34" rx="4" fill="var(--fig-node-b)" opacity=".1" />
      <text x="14" y="71" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">轮询（Round Robin）</text>
      <text x="14" y="84" font-size="7.5" fill="var(--fig-text)">权威服务器每次换顺序返回 → 粗略分摊，但缓存会让效果打折</text>

      <!-- 隐患 -->
      <rect x="6" y="96" width="328" height="56" rx="5" fill="#e5484d" opacity=".1" />
      <text x="14" y="109" font-size="8.5" font-weight="700" fill="#e5484d">三个隐患</text>
      <text x="14" y="122" font-size="7.5" fill="var(--fig-text)">① 坏点不会被自动跳过：DNS 不知道后端是否健康</text>
      <text x="14" y="134" font-size="7.5" fill="var(--fig-text)">② TTL 内固定用一个 IP → 该 IP 故障时整段时间受影响</text>
      <text x="14" y="146" font-size="7.5" fill="var(--fig-text)">③ 客户端的 DNS 缓存 + 连接池复用 → 分摊严重不均</text>

      <!-- 正确做法 -->
      <rect x="6" y="160" width="328" height="56" rx="5" fill="var(--fig-node-c)" opacity=".1" />
      <text x="14" y="173" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">正确做法</text>
      <text x="14" y="186" font-size="7.5" fill="var(--fig-text)">多 A 只用于「简单冗余」，真正负载均衡交给 LB（SLB/LVS/Nginx）</text>
      <text x="14" y="198" font-size="7.5" fill="var(--fig-text)">LB 层做健康检查 → 坏点被摘除，客户端无感</text>
      <text x="14" y="210" font-size="7.5" fill="var(--fig-node-c)">若要 DNS 层调度，用更专业的 GSLB（带健康检查）而非裸多 A</text>

      <rect x="6" y="224" width="328" height="20" rx="4" fill="var(--fig-node-d)" opacity=".12" />
      <text x="14" y="238" font-size="7.5" fill="var(--fig-node-d)">排查提示：dig 多次看返回顺序是否变化；客户端行为要看具体实现</text>

      <text x="6" y="252" font-size="7.5" fill="var(--fig-muted)">易混点：多 A ≠ 负载均衡；它连「避开坏点」都做不到</text>
    </svg>
    <figcaption>多 A 记录只提供简单冗余：客户端通常只用一个 IP、坏点不会跳过；真正的均衡与健康检查要交给 LB</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
