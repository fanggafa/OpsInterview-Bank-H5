<script setup>
/**
 * 「Redis 连接超时但服务端指标正常」的排查图。
 *
 * 对应题 5416。核心洞察：服务端 CPU/内存正常却连不上，
 * 问题通常在「连接路径」或「客户端侧」——要从「超时发生在哪一层」开始分流。
 *
 * 画布 340 宽，文字须控制在列内（npm run check:figures 校验）。
 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 340 262" role="img" aria-label="Redis 连接超时的排查：先确认超时发生在哪一层，再从连接数、慢命令、网络、客户端池、持久化五个方向排查">
      <text x="6" y="12" font-size="9.5" fill="var(--fig-muted)">服务端 CPU/内存正常，却连接超时 → 问题在「连接路径」或「客户端」</text>

      <rect x="6" y="20" width="328" height="30" rx="5" fill="var(--fig-node-a)" opacity=".1" />
      <text x="14" y="33" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">Step 1：先定位超时发生在哪一层</text>
      <text x="14" y="45" font-size="8" fill="var(--fig-text)">redis-cli ping 能通 → 服务端 OK，查客户端/网络　｜　也超时 → 服务端或链路</text>

      <text x="6" y="66" font-size="9.5" font-weight="700" fill="var(--fig-text)">五个方向（按发生概率排序）</text>

      <rect x="6" y="74" width="328" height="30" rx="4" fill="var(--fig-node-b)" opacity=".09" />
      <text x="14" y="86" font-size="8.5" font-weight="700" fill="var(--fig-node-b)">① 连接数打满（最常见）</text>
      <text x="14" y="98" font-size="8" fill="var(--fig-text)">connected_clients 接近 maxclients → 新连接被拒</text>

      <rect x="6" y="108" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".09" />
      <text x="14" y="120" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">② 慢命令阻塞单线程</text>
      <text x="14" y="132" font-size="8" fill="var(--fig-text)">KEYS / 大 zset / 大 hash 遍历 → 所有请求排队</text>

      <rect x="6" y="142" width="328" height="30" rx="4" fill="var(--fig-node-d)" opacity=".09" />
      <text x="14" y="154" font-size="8.5" font-weight="700" fill="var(--fig-node-d)">③ 网络层问题</text>
      <text x="14" y="166" font-size="8" fill="var(--fig-text)">安全组/连接跟踪表满、跨机房 RTT 抖动、丢包重传</text>

      <rect x="6" y="176" width="328" height="30" rx="4" fill="var(--fig-node-a)" opacity=".09" />
      <text x="14" y="188" font-size="8.5" font-weight="700" fill="var(--fig-node-a)">④ 客户端连接池配置不当</text>
      <text x="14" y="200" font-size="8" fill="var(--fig-text)">池太小排队；池太大把 Redis 打满；拿不到连接就「超时」</text>

      <rect x="6" y="210" width="328" height="30" rx="4" fill="var(--fig-node-c)" opacity=".09" />
      <text x="14" y="222" font-size="8.5" font-weight="700" fill="var(--fig-node-c)">⑤ 持久化 fork 卡顿</text>
      <text x="14" y="234" font-size="8" fill="var(--fig-text)">RDB/AOF 重写时 fork 阻塞，表现为周期性超时</text>

      <text x="6" y="256" font-size="8" fill="var(--fig-muted)">关键：看超时是「一直」还是「周期性」——周期性几乎都是 fork 或慢命令</text>
    </svg>
    <figcaption>Redis 超时要先分清「服务端慢」还是「连接路径断」，两侧排查手段完全不同</figcaption>
  </figure>
</template>

<style scoped>
@import './figure-base.css';
</style>
